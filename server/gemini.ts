// Define message type locally since it's not in the shared schema
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: any;
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 10, // max requests per window
  tokens: new Map<string, { count: number; resetTime: number }>(),
};

// Rate limiter function
function checkRateLimit(): { allowed: boolean; resetTime?: Date } {
  const now = Date.now();
  const windowKey = Math.floor(now / RATE_LIMIT.windowMs).toString();

  let tokenBucket = RATE_LIMIT.tokens.get(windowKey);
  if (!tokenBucket) {
    tokenBucket = { count: 0, resetTime: now + RATE_LIMIT.windowMs };
    RATE_LIMIT.tokens.set(windowKey, tokenBucket);

    // Cleanup old entries
    Array.from(RATE_LIMIT.tokens.entries()).forEach(([key, value]) => {
      if (value.resetTime < now) {
        RATE_LIMIT.tokens.delete(key);
      }
    });
  }

  if (tokenBucket.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, resetTime: new Date(tokenBucket.resetTime) };
  }

  tokenBucket.count++;
  return { allowed: true };
}

// Credit card expert prompt
const CREDIT_CARD_EXPERT_PROMPT = `You are a concise credit card expert focusing on the Indian market. ALWAYS use tables for comparisons, never use bullet points or paragraphs for comparing features.

RESPONSE FORMAT RULES:
1. ALL comparisons MUST be in table format
2. NEVER use bullet points or paragraphs for comparisons
3. Use tables with the following structure:

### Basic Features
| Feature | Card 1 | Card 2 |
|---------|--------|--------|
| Annual Fee | ₹XXX | ₹YYY |
| Welcome Benefits | Detail | Detail |
| Income Required | ₹XXX | ₹YYY |

### Reward Rates
| Category | Card 1 | Card 2 |
|----------|--------|--------|
| General Spend | X% | Y% |
| Dining | X% | Y% |
| Travel | X% | Y% |
| Shopping | X% | Y% |

### Additional Benefits
| Benefit | Card 1 | Card 2 |
|---------|--------|--------|
| Lounge Access | Detail | Detail |
| Insurance | Detail | Detail |
| Offers | Detail | Detail |

### Best Suited For
| Use Case | Best Card | Reason |
|----------|-----------|---------|
| Overall | Name | Why |
| Rewards | Name | Why |
| Travel | Name | Why |
| Shopping | Name | Why |

IMPORTANT:
- Use ₹ symbol for all amounts
- Include actual numbers/percentages
- Present ALL comparisons in tables
- No bullet points or paragraphs for comparing features
- Add table headers for each comparison section
- Ensure proper markdown table formatting

Remember to:
- Keep Indian context central
- Use local examples
- Reference local regulations
- Consider Indian spending patterns`;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export async function generateResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  retryCount = 0,
): Promise<{ content: string; citations: string[] }> {
  try {
    // Debug message structure
    console.log(
      "Original message structure:",
      JSON.stringify(messages, null, 2),
    );

    // Validate message structure before proceeding
    if (!validateMessageStructure(messages)) {
      throw new Error(
        "Invalid message structure: After system messages, user and assistant roles must alternate",
      );
    }

    // Check rate limit before making API call
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Rate limit exceeded. Please try again after ${rateLimitCheck.resetTime?.toLocaleTimeString()}`,
      );
    }

    const modifiedMessages = messages.map((msg) => {
      if (msg.role === "user") {
        return {
          ...msg,
          content: `For Indian credit cards only: ${msg.content}`,
        };
      }
      return msg;
    });

    // Format messages for Gemini API
    const formattedMessages = modifiedMessages.map(msg => {
      return {
        role: msg.role === "system" ? "user" : msg.role, // Gemini uses "user" instead of "system"
        parts: [{ text: msg.content }]
      };
    });

    // Add system prompt if not present
    if (modifiedMessages[0]?.role !== "system") {
      formattedMessages.unshift({
        role: "user", // Gemini uses "user" for system prompts
        parts: [{ text: CREDIT_CARD_EXPERT_PROMPT }]
      });
    }

    // Log final message structure being sent to API
    console.log(
      "Sending to Gemini API:",
      JSON.stringify(
        {
          messages: formattedMessages,
          messagesCount: formattedMessages.length,
        },
        null,
        2,
      ),
    );

    console.log("Sending request to Gemini API...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const responseText = await response.text();
    console.log(`API Response Status: ${response.status}`);

    if (!response.ok) {
      console.error(
        `Gemini API error (${response.status}): ${responseText}`,
      );
      throw new Error(
        `Gemini API error (${response.status}): ${responseText}`,
      );
    }

    const data = JSON.parse(responseText) as GeminiResponse;
    console.log("Received response from Gemini API");

    // Extract content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response at this time.";

    return {
      content: content,
      citations: [], // Gemini doesn't provide citations in the same way as Perplexity
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);

    if (error.message.includes("Rate limit exceeded")) {
      throw error; // Don't retry rate limit errors
    }

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * (retryCount + 1)),
      ); // Exponential backoff
      return generateResponse(messages, retryCount + 1);
    }

    const errorMessage = error.message.includes("429")
      ? "Service is temporarily busy. Please try again in a few moments."
      : error.message.includes("401")
        ? "Authentication error. Please check your API key."
        : error.message.includes("5")
          ? "Service is experiencing issues. Please try again later."
          : "An unexpected error occurred. Please try again.";

    throw new Error(errorMessage);
  }
}

// Helper function to validate message structure
function validateMessageStructure(
  messages: { role: string; content: string }[],
): boolean {
  // If there are no messages, that's valid (system will add one)
  if (messages.length === 0) return true;

  // Filter out system messages
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  // No non-system messages is valid
  if (nonSystemMessages.length === 0) return true;

  // Check for alternating user/assistant pattern
  for (let i = 0; i < nonSystemMessages.length - 1; i++) {
    if (nonSystemMessages[i].role === nonSystemMessages[i + 1].role) {
      console.error(
        `Invalid message structure at index ${i}: ${nonSystemMessages[i].role} followed by ${nonSystemMessages[i + 1].role}`,
      );
      return false;
    }
  }

  // Make sure the last message is from user
  if (
    nonSystemMessages.length > 0 &&
    nonSystemMessages[nonSystemMessages.length - 1].role !== "user"
  ) {
    console.error("Last message must be from user");
    return false;
  }

  return true;
}