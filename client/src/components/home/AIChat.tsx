import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { CircleUser, Bot, Maximize, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatResponse } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  provider?: "gemini" | "perplexity" | "error";
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your CardSavvy AI assistant. How can I help you find the perfect credit card today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Clean and format content for better display
  const enhanceMarkdown = (content: string): string => {
    let enhanced = content;

    // Fix table formatting issues - better detection of tables
    const tableRegex = /(?:###\s*.*)\n*(\|[^\n]+\|[^\n]*\n\|[-:\|\s]+\|[^\n]*\n(?:\|[^\n]+\|[^\n]*\n)+)/g;
    enhanced = enhanced.replace(tableRegex, (match) => {
      // Extract table title
      const titleMatch = match.match(/###\s*(.*?)\n/);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Extract table content
      const tableMatch = match.match(/(\|[^\n]+\|[^\n]*\n\|[-:\|\s]+\|[^\n]*\n(?:\|[^\n]+\|[^\n]*\n)+)/);
      let tableContent = tableMatch ? tableMatch[1] : '';

      // Clean up table content
      tableContent = tableContent
        .replace(/\n{2,}/g, '\n') // Remove extra newlines
        .replace(/\|\s*\-{3,}\s*\|/g, '| --- |') // Standardize divider rows
        .replace(/\|\s*\-{3,}\s*:/g, '| ---:') // Fix right-aligned columns
        .replace(/:\s*\-{3,}\s*\|/g, ':--- |') // Fix left-aligned columns
        .replace(/:\s*\-{3,}\s*:/g, ':---:') // Fix center-aligned columns
        .replace(/\| *([^|]*[^ ]) *\|/g, '| $1 |') // Clean up spacing inside cells
        .trim();

      // Rebuild formatted table with title
      return `### ${title}\n\n${tableContent}\n`;
    });

    // Handle "Best Suited For" tables which seem to have formatting issues
    const bestSuitedForRegex = /(?:##?\s*#?\s*Best Suited For[^\n]*\n+)(\|[^\n]+\|[^\n]*\n\|[-:\|\s]+\|[^\n]*\n)?(.+)/g;
    enhanced = enhanced.replace(bestSuitedForRegex, (match, tableDef, content) => {
      const title = '### Best Suited For';

      // If no proper table definition, try to format the content as a table
      if (!tableDef || !tableDef.includes('|')) {
        // Attempt to fix malformed table by extracting data
        const rows = content.split('||').filter((row: string) => row.trim());

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

          return `${title}\n\n${fixedTable}\n`;
        }
      }

      return match; // Return original if we can't fix it
    });

    // Fix heading formatting
    enhanced = enhanced.replace(/#{1,3}\s*#{1,3}\s*([^\n]+)/g, (match, content) => {
      const hashCount = (match.match(/#/g) || []).length;
      return `${'#'.repeat(Math.min(hashCount, 3))} ${content.trim()}`;
    });

    // Ensure proper spacing around list items
    enhanced = enhanced.replace(/\n-([^\n]+)/g, '\n- $1');

    return enhanced;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue("");

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", { message: userMessage });
      const data: ChatResponse = await response.json();

      // Add assistant response to chat with enhanced formatting
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: enhanceMarkdown(data.response),
          citations: data.citations,
          provider: data.provider
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-xl overflow-hidden w-full">
      <CardHeader className="bg-primary p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mr-3">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white">CardSavvy AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-primary-50"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </CardHeader>

      <ScrollArea ref={scrollAreaRef} className="h-96 p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start mb-4 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user" ? "bg-gray-300" : "bg-accent"
              }`}>
                {message.role === "user" ? (
                  <CircleUser className="h-4 w-4 text-gray-600" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg shadow-sm ${
              message.role === "user" 
                ? "bg-primary text-white max-w-md" 
                : "bg-white text-gray-800 max-w-[90%]"
            }`}>
              {message.role === "user" ? (
                <p>{message.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none overflow-x-auto prose-headings:mt-4 prose-headings:mb-2">
                  <ReactMarkdown
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="border-collapse border border-gray-300 w-full" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-gray-100" {...props} />
                      ),
                      tbody: ({ node, ...props }) => (
                        <tbody {...props} />
                      ),
                      tr: ({ node, ...props }) => (
                        <tr className="border-b border-gray-300" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-gray-300 px-4 py-2" {...props} />
                      ),
                      code: ({ children, className }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isMultiLine = String(children).includes('\n');

                        return isMultiLine ? (
                          <div className="my-4 p-4 bg-gray-100 rounded-md overflow-x-auto whitespace-pre">
                            <code className="text-sm font-mono text-gray-800">
                              {String(children).replace(/\n$/, '')}
                            </code>
                          </div>
                        ) : (
                          <code className={`${className || ''} px-1 py-0.5 bg-gray-100 rounded text-gray-800`}>
                            {children}
                          </code>
                        );
                      },
                      h1: ({ node, ...props }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="my-3 text-gray-700" {...props} />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>

                  <div className="mt-2 text-xs text-gray-500">
                    {message.provider && (
                      <div className="mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Powered by {message.provider === 'perplexity' ? 'Perplexity' : 'Gemini'}
                        </span>
                      </div>
                    )}

                    {message.citations && message.citations.length > 0 && (
                      <>
                        <p className="font-medium">Sources:</p>
                        <ul className="list-disc pl-4">
                          {message.citations.map((citation, i) => (
                            <li key={i}>{citation}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="p-3 rounded-lg shadow-sm bg-white text-gray-800 max-w-[90%]">
              <div className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex">
            <Input
              placeholder="Ask about credit cards..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 rounded-r-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-l-none"
            >
              {isLoading ? <Spinner size="sm" className="text-white" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by {messages.length > 0 && messages.some(m => m.provider === 'perplexity')
              ? 'Perplexity AI' 
              : 'Gemini AI'} - Your financial data remains private
          </p>
        </form>
      </CardFooter>
    </Card>
  );
}