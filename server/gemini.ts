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
const CREDIT_CARD_EXPERT_PROMPT = `You are a concise credit card expert focusing on the Indian market. NEVER use tables for comparisons, always use bullet points, headings, and subheadings for organizing your responses.

RESPONSE FORMAT RULES:
1. NEVER use tables for comparisons
2. ALWAYS use bullet points and hierarchical headings for structured information
3. Use clear, hierarchical formatting with markdown headings:

## Basic Features 
For each card, include:
- Annual Fee: ₹XXX 
- Welcome Benefits: Details
- Income Required: ₹XXX

## Reward Rates
For each card, include:
- General Spend: X%
- Dining: X%
- Travel: X% 
- Shopping: X%

## Additional Benefits
For each card, include:
- Lounge Access: Details
- Insurance: Details
- Offers: Details

## Best Suited For
- Overall: Card name - Brief reason why
- Rewards: Card name - Brief reason why
- Travel: Card name - Brief reason why
- Shopping: Card name - Brief reason why

IMPORTANT:
- Use ₹ symbol for all amounts
- Include actual numbers/percentages
- Present ALL comparisons with clear headings and bullet points
- Use H2 (##) for main sections and H3 (###) for subsections
- Make sure to include specific details and numbers
- Create clear visual hierarchy with indentation of bullet points

Remember to:
- Keep Indian context central
- Use local examples
- Reference local regulations
- Consider Indian spending patterns`;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Helper function to improve table formatting 
function enhanceMarkdownTables(content: string): string {
  let enhanced = content;
  
  // Fix table formatting issues - better detection of tables
  const tableRegex = /### .*\n*(\|[^\n]+\|[^\n]*\n\|[-:\|\s]+\|[^\n]*\n(?:\|[^\n]+\|[^\n]*\n)+)/g;
  enhanced = enhanced.replace(tableRegex, (match) => {
    // Extract table title if present
    const titleMatch = match.match(/###\s*(.*?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Clean up table content
    const cleanedMatch = match
      .replace(/\n{2,}/g, '\n') // Remove extra newlines
      .replace(/\|\s*\-{3,}\s*\|/g, '| --- |') // Standardize divider rows
      .replace(/\|\s*\-{3,}\s*:/g, '| ---:') // Fix right-aligned columns
      .replace(/:\s*\-{3,}\s*\|/g, ':--- |') // Fix left-aligned columns
      .replace(/:\s*\-{3,}\s*:/g, ':---:') // Fix center-aligned columns
      .replace(/\| *([^|]*[^ ]) *\|/g, '| $1 |') // Clean up spacing inside cells
      .trim();
    
    return cleanedMatch;
  });
  // Handle "Best Suited For" tables which seem to have formatting issues
  const bestSuitedRegex = /(#+\s*Best Suited For.*?\n+)(?!\|)(.+?)(?=\n\n|$)/g;
  enhanced = enhanced.replace(bestSuitedRegex, (match, title, content) => {
    // Try to extract data from malformed tables with || or | patterns
    const rows = content.split(/\|\||(?:\n\|)/).filter((row: string) => row.trim());
    if (rows.length > 0) {
      let fixedTable = '| Use Case | Best Card | Reason |\n|----------|-----------|--------|\n';
      
      for (const row of rows) {
        // Extract data from row using regex
        const parts = row.split('|').filter((part: string) => part.trim());
        if (parts.length >= 3) {
          fixedTable += `| ${parts[0].trim()} | ${parts[1].trim()} | ${parts[2].trim()} |\n`;
        } else if (parts.length === 2) {
          fixedTable += `| ${parts[0].trim()} | ${parts[1].trim()} | - |\n`;
        }
      }
      
      return `${title}\n${fixedTable}\n`;
    }
    
    return match; // Return original if we can't fix it
  });
  
  // Fix headings without proper spacing and remove duplicate hashes
  enhanced = enhanced.replace(/#+\s*#*\s*([^\n]+)/g, (match, content) => {
    const hashCount = (match.match(/#/g) || []).length;
    return '#'.repeat(Math.min(hashCount, 3)) + ' ' + content.trim();
  });
  
  return enhanced;
}

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
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response at this time.";
    
    // Enhance table formatting before returning
    content = enhanceMarkdownTables(content);

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