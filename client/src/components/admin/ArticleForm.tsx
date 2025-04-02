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
    content: z.string().min(100, "Content must be at least 100 characters."),
    contentHtml: z.string().optional(),
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
      if (article) {
        // Update existing article
        await apiRequest("PUT", `/api/articles/${article.id}`, values);
        toast({
          title: "Article updated",
          description: "The article has been updated successfully.",
        });
      } else {
        // Create new article
        await apiRequest("POST", "/api/articles", values);
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
        description: "Failed to save the article. Please try again.",
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
                <FormLabel>YouTube Video ID</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. dQw4w9WgXcQ (from https://www.youtube.com/watch?v=dQw4w9WgXcQ)" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Enter only the video ID from the YouTube URL, not the full URL.
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write the full article content." 
                  className="min-h-[300px]"
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
                <FormLabel>HTML Content</FormLabel>
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
                  placeholder="Enter HTML content for the article or import from a file. This will override the regular content when displaying the article." 
                  className="min-h-[200px] font-mono text-sm"
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
                      src={`https://img.youtube.com/vi/${form.watch("youtubeVideoId")}/mqdefault.jpg`}
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
