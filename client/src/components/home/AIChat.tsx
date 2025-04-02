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

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
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
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.response,
          citations: data.citations 
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
      
      <ScrollArea ref={scrollAreaRef} className="h-64 p-4 bg-gray-50">
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
            <div className={`p-3 rounded-lg shadow-sm max-w-md ${
              message.role === "user" 
                ? "bg-primary text-white" 
                : "bg-white text-gray-800"
            }`}>
              {message.role === "user" ? (
                <p>{message.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc pl-4">
                        {message.citations.map((citation, i) => (
                          <li key={i}>{citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by Gemini AI - Your financial data remains private
          </p>
        </form>
      </CardFooter>
    </Card>
  );
}
