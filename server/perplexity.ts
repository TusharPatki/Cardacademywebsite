// Define message type locally since it's not exported from gemini.ts
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Rate limiting settings
const MAX_REQUESTS_PER_MINUTE = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const requestTimestamps: number[] = [];

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    delta?: {
      content?: string;
    };
    finish_reason: string | null;
    message?: {
      role: string;
      content: string;
    };
  }[];
}

function checkRateLimit(): { allowed: boolean; resetTime?: Date } {
  const now = Date.now();
  // Remove timestamps older than the window
  while (
    requestTimestamps.length > 0 &&
    requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS
  ) {
    requestTimestamps.shift();
  }

  // Check if we're over the limit
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = requestTimestamps[0];
    const resetTime = new Date(oldestRequest + RATE_LIMIT_WINDOW_MS);
    return { allowed: false, resetTime };
  }

  // Add current timestamp
  requestTimestamps.push(now);
  return { allowed: true };
}

function validateMessageStructure(
  messages: Message[]
): { isValid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { isValid: false, error: "Messages must be an array" };
  }

  for (const message of messages) {
    if (!message.role || !message.content) {
      return {
        isValid: false,
        error: "Each message must have a role and content",
      };
    }

    if (!["user", "assistant", "system"].includes(message.role)) {
      return {
        isValid: false,
        error: "Message role must be 'user', 'assistant', or 'system'",
      };
    }
  }

  return { isValid: true };
}

export async function generateResponse(
  messages: Message[]
): Promise<{ response: string; citations?: string[] }> {
  // If no API key, throw an error
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error(
      "PERPLEXITY_API_KEY environment variable is not set. Please set it to use Perplexity API."
    );
  }

  // Check rate limit
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    const resetTimeString = rateLimit.resetTime?.toTimeString() || "soon";
    throw new Error(
      `Rate limit exceeded. Try again after ${resetTimeString}`
    );
  }

  // Validate messages
  const validation = validateMessageStructure(messages);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'pplx-70b-online',
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API returned error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as PerplexityResponse;
    
    // Extract content from the response
    const responseContent = data.choices[0]?.message?.content || '';
    
    // Simple citation extraction - this would need to be enhanced
    // based on how Perplexity returns citations in their responses
    const citations: string[] = [];
    const citationBlocks = responseContent.match(/\[(.*?)\]/g);
    
    if (citationBlocks) {
      const uniqueCitations = new Set<string>();
      
      citationBlocks.forEach(citation => {
        const trimmedCitation = citation.replace(/\[|\]/g, '').trim();
        if (trimmedCitation && !uniqueCitations.has(trimmedCitation)) {
          uniqueCitations.add(trimmedCitation);
        }
      });
      
      Array.from(uniqueCitations).forEach(citation => {
        citations.push(citation);
      });
    }

    return { 
      response: responseContent,
      citations: citations.length > 0 ? citations : undefined
    };
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
}