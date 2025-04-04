import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, UploadIcon } from "lucide-react";
import { format } from "date-fns";
import { type Article } from "@/lib/types";

// Helper function to extract YouTube video ID from various URL formats or return the ID itself
const extractYoutubeVideoId = (urlOrId?: string): string => {
  if (!urlOrId) return '';
  
  // If it's already just an ID (no slashes or protocol)
  if (!urlOrId.includes('/') && !urlOrId.includes('http')) {
    return urlOrId;
  }
  
  try {
    // Handle YouTube URLs (various formats)
    const url = new URL(urlOrId);
    
    // Format: youtube.com/watch?v=VIDEO_ID
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v') || '';
    }
    
    // Format: youtube.com/embed/VIDEO_ID
    if (url.pathname.includes('/embed/')) {
      return url.pathname.split('/embed/')[1];
    }
    
    // Format: youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.substring(1);
    }
    
    // For search query URLs, return empty string
    if (url.pathname.includes('/results')) {
      return '';
    }
  } catch (e) {
    // If it's not a valid URL, return the input as is
    console.error('Error parsing YouTube URL:', e);
  }
  
  // Return the original value if we couldn't extract an ID
  return urlOrId;
};

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
}

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Form schema
  const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    slug: z.string().min(5, "Slug must be at least 5 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
    content: z.string().optional().or(z.literal("")),
    contentHtml: z.string().optional().or(z.literal("")),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters.").max(200, "Excerpt must be at most 200 characters."),
    imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    publishDate: z.string(),
    category: z.string().min(1, "Category is required"),
    youtubeVideoId: z.string().optional().or(z.literal("")),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: article ? {
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || "",
      publishDate: article.publishDate instanceof Date ? 
        format(new Date(article.publishDate), "yyyy-MM-dd") : 
        format(new Date(article.publishDate), "yyyy-MM-dd"),
      imageUrl: article.imageUrl || "",
      contentHtml: article.contentHtml || "",
      youtubeVideoId: article.youtubeVideoId || "",
      category: article.category
    } : {
      title: "",
      slug: "",
      content: "",
      contentHtml: "",
      excerpt: "",
      imageUrl: "",
      youtubeVideoId: "",
      publishDate: format(new Date(), "yyyy-MM-dd"),
      category: "News",
    },
  });

  // Function to handle HTML file imports
  const handleHtmlFileImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const text = await file.text();
      
      // Update the HTML content field
      form.setValue('contentHtml', text);
      
      // Try to extract a title from the HTML content if it's empty
      if (!form.getValues('title')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          form.setValue('title', titleMatch[1]);
          
          // Generate a slug from the title
          const slug = titleMatch[1]
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          form.setValue('slug', slug);
          
          // Try to extract a short excerpt from the content
          // Look for the first paragraph or content
          const contentMatch = text.match(/<p>(.*?)<\/p>/i);
          if (contentMatch && contentMatch[1]) {
            const excerpt = contentMatch[1]
              .replace(/<[^>]*>/g, '') // Remove any HTML tags
              .substring(0, 190); // Limit to 190 chars for the excerpt
            
            form.setValue('excerpt', excerpt);
          }
        }
      }
      
      toast({
        title: "HTML imported",
        description: "The HTML content has been imported successfully.",
      });
    } catch (error) {
      console.error("Error importing HTML file:", error);
      toast({
        title: "Import Error",
        description: "Failed to import the HTML file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    
    try {
      // Make sure content field has a value (required by database schema)
      // If contentHtml is available, use a summary, otherwise use placeholder
      if (!values.content || values.content.trim() === "") {
        if (values.contentHtml) {
          // Create a simple text summary from HTML content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = values.contentHtml;
          const textContent = tempDiv.textContent || tempDiv.innerText;
          values.content = textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '');
        } else {
          // Fallback placeholder
          values.content = "Content available in HTML format.";
        }
      }
      
      if (article) {
        // Update existing article
        const response = await apiRequest("PUT", `/api/articles/${article.id}`, values);
        const data = await response.json();
        
        if (!response.ok) {
          if (data.errors) {
            // Extract and display validation errors
            console.error("Validation errors:", data.errors);
            const errorMessage = data.errors.map((err: any) => 
              `${err.path.join('.')}: ${err.message}`
            ).join('\n');
            
            toast({
              title: "Validation Error",
              description: errorMessage,
              variant: "destructive",
            });
            return;
          } else {
            throw new Error(data.message || "Failed to update article");
          }
        }
        
        toast({
          title: "Article updated",
          description: "The article has been updated successfully.",
        });
      } else {
        // Create new article
        const response = await apiRequest("POST", "/api/articles", values);
        const data = await response.json();
        
        if (!response.ok) {
          if (data.errors) {
            // Extract and display validation errors
            console.error("Validation errors:", data.errors);
            const errorMessage = data.errors.map((err: any) => 
              `${err.path.join('.')}: ${err.message}`
            ).join('\n');
            
            toast({
              title: "Validation Error",
              description: errorMessage,
              variant: "destructive",
            });
            return;
          } else {
            throw new Error(data.message || "Failed to create article");
          }
        }
        
        toast({
          title: "Article created",
          description: "The article has been created successfully.",
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      onSuccess();
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const categories = ["News", "Guides", "Offers", "Reviews", "Tips"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Top Credit Card Reward Programs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. top-credit-card-reward-programs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="youtubeVideoId"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>YouTube Video (optional)</FormLabel>
                  {field.value && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => form.setValue("youtubeVideoId", "")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove Video
                    </Button>
                  )}
                </div>
                <FormControl>
                  <Input 
                    placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Enter either the YouTube video ID or full URL (both formats will work).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write a brief summary of the article (will be displayed in cards and listings)." 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contentHtml"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Article Content (HTML)</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleHtmlFileImport}
                  disabled={isImporting}
                  className="flex items-center gap-1"
                >
                  <UploadIcon className="h-4 w-4" />
                  {isImporting ? "Importing..." : "Import HTML"}
                </Button>
              </div>
              <FormControl>
                <Textarea 
                  placeholder="Enter HTML content for the article or import from a file." 
                  className="min-h-[400px] font-mono text-sm"
                  {...field} 
                />
              </FormControl>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".html,.htm" 
                onChange={handleFileChange} 
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can write HTML directly or import it from an HTML file using the Import button.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <input type="hidden" {...form.register("content")} />
        
        {/* Article Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {form.watch("imageUrl") && (
              <div className="h-48 overflow-hidden">
                <img
                  src={form.watch("imageUrl")}
                  alt={form.watch("title")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Article+Image";
                  }}
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="mr-2 h-4 w-4" />
                <time dateTime={form.watch("publishDate")}>
                  {format(new Date(form.watch("publishDate")), "MMMM d, yyyy")}
                </time>
                <span className="mx-2">•</span>
                <span>{form.watch("category")}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {form.watch("title") || "Article Title"}
              </h3>
              <p className="text-gray-600 mb-4">
                {form.watch("excerpt") || "Article excerpt preview"}
              </p>
              
              {form.watch("youtubeVideoId") && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-2">Video Preview:</h4>
                  <div>
                    <img 
                      src={`https://img.youtube.com/vi/${extractYoutubeVideoId(form.watch("youtubeVideoId") || '')}/mqdefault.jpg`}
                      alt="YouTube thumbnail"
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Saving..." : article ? "Update Article" : "Create Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
