// Define message type locally since it's not exported from gemini.ts
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Rate limiting settings
const MAX_REQUESTS_PER_MINUTE = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const requestTimestamps: number[] = [];

// Helper function to improve table formatting - duplicated from gemini.ts
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
  const bestSuitedRegex = /(#+\s*Best Suited For.*?\n+)(?!\|)(.+?)(?=\n\n|$)/s;
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

    // Enhance table formatting using the same function from gemini.ts
    const enhancedContent = enhanceMarkdownTables(responseContent);
    
    return { 
      response: enhancedContent,
      citations: citations.length > 0 ? citations : undefined
    };
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    throw error;
  }
}