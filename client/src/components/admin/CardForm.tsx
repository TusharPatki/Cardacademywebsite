import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon, ImageIcon } from "lucide-react";
import { type Card as CreditCard, type Bank, type Category } from "@/lib/types";

interface CardFormProps {
  card?: CreditCard;
  onSuccess: () => void;
}

export function CardForm({ card, onSuccess }: CardFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Fetch banks for the dropdown
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // Fetch categories for the dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Form schema with proper types
  const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
    bankId: z.string(), // Keep as string in the form schema
    categoryId: z.string(), // Keep as string in the form schema
    annualFee: z.string().min(1, "Annual fee is required."),
    introApr: z.string().optional(),
    regularApr: z.string().min(1, "Regular APR is required."),
    rewardsDescription: z.string().min(10, "Rewards description must be at least 10 characters."),
    contentHtml: z.string().optional(),
    youtubeVideoId: z.string().optional(),
    rating: z.string().optional(),
    featured: z.boolean().default(false),
    cardColorFrom: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color.").default("#0F4C81"),
    cardColorTo: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color.").default("#0F4C81"),
    imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    applyLink: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    publishDate: z.string(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: card ? {
      name: card.name || "",
      slug: card.slug || "",
      bankId: card.bankId !== null && card.bankId !== undefined ? String(card.bankId) : "",
      categoryId: card.categoryId !== null && card.categoryId !== undefined ? String(card.categoryId) : "",
      annualFee: card.annualFee || "$0",
      introApr: card.introApr || "",
      regularApr: card.regularApr || "",
      rewardsDescription: card.rewardsDescription || "",
      contentHtml: card.contentHtml || "",
      youtubeVideoId: card.youtubeVideoId || "",
      rating: card.rating || "",
      featured: card.featured === true,
      cardColorFrom: card.cardColorFrom || "#0F4C81",
      cardColorTo: card.cardColorTo || "#0F4C81",
      imageUrl: card.imageUrl || "",
      applyLink: card.applyLink || "",
      publishDate: card.publishDate ? format(new Date(card.publishDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    } : {
      name: "",
      slug: "",
      bankId: "",
      categoryId: "",
      annualFee: "$0",
      introApr: "",
      regularApr: "",
      rewardsDescription: "",
      contentHtml: "",
      youtubeVideoId: "",
      rating: "",
      featured: false,
      cardColorFrom: "#0F4C81",
      cardColorTo: "#0F4C81",
      imageUrl: "",
      applyLink: "",
      publishDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Function to handle HTML file imports
  const handleHtmlFileImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle HTML file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const text = await file.text();
      
      // Update the HTML content field
      form.setValue('contentHtml', text);
      
      // Try to extract a title from the HTML content for the card name if it's empty
      if (!form.getValues('name')) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          form.setValue('name', titleMatch[1]);
          
          // Generate a slug from the title
          const slug = titleMatch[1]
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          form.setValue('slug', slug);
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
  
  // Function to handle image upload
  const handleImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  
  // Handle image file selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only allow JPEG or PNG files
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG or PNG image.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image using the API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update the imageUrl field with the returned URL
      form.setValue('imageUrl', data.imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "The image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    
    try {
      // Convert string IDs to numbers before sending to API
      const dataToSubmit = {
        ...values,
        bankId: values.bankId ? parseInt(values.bankId, 10) : undefined,
        categoryId: values.categoryId ? parseInt(values.categoryId, 10) : undefined
      };
      
      if (card) {
        // Update existing card
        await apiRequest("PUT", `/api/cards/${card.id}`, dataToSubmit);
        toast({
          title: "Card updated",
          description: "The credit card has been updated successfully.",
        });
      } else {
        // Create new card
        await apiRequest("POST", "/api/cards", dataToSubmit);
        toast({
          title: "Card created",
          description: "The credit card has been created successfully.",
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      onSuccess();
    } catch (error) {
      console.error("Error saving card:", error);
      toast({
        title: "Error",
        description: "Failed to save the credit card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Citi® Double Cash Card" {...field} />
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
                  <Input placeholder="e.g. citi-double-cash-card" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {banks?.map(bank => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="annualFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Fee</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $0 or $95" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="introApr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intro APR (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 0% for 18 months" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="regularApr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regular APR</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 14.74% - 24.74%" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4.8" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cardColorFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Color (From)</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <Input
                    type="color"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cardColorTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Color (To)</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <Input
                    type="color"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-10 h-10 p-1"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="rewardsDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rewards Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the card rewards, benefits, and features." 
                  className="min-h-[100px]"
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
                  placeholder="Enter HTML content for the card details page or import from a file." 
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
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Card Image</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
              <FormControl>
                <Input 
                  placeholder="e.g. https://example.com/card-image.jpg" 
                  {...field} 
                />
              </FormControl>
              <input 
                type="file" 
                ref={imageInputRef} 
                accept=".jpg,.jpeg,.png" 
                onChange={handleImageChange} 
                className="hidden"
              />
              {field.value && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <img 
                    src={field.value} 
                    alt="Card Preview" 
                    className="max-h-40 rounded-md border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      toast({
                        title: "Image Error",
                        description: "Could not load image preview. URL may be invalid.",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Enter the URL for the card image or upload one (JPEG/PNG, recommended size: 800x450px).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applyLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apply Link</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. https://example.com/apply-for-card" 
                  {...field} 
                />
              </FormControl>
              <p className="text-sm text-gray-500 mt-1">
                Enter the URL where users can apply for this credit card.
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
          name="youtubeVideoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube Video ID or URL</FormLabel>
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
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Card</FormLabel>
                <p className="text-sm text-gray-500">
                  Featured cards are displayed prominently on the homepage.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        {/* Card Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 text-white"
              style={{
                background: `linear-gradient(to right, ${form.watch("cardColorFrom")}, ${form.watch("cardColorTo")})`
              }}
            >
              <span className="font-semibold">{form.watch("name") || "Card Preview"}</span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {(form.watch("rewardsDescription") || "").split('.')[0] || "Rewards Preview"}
              </h3>
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
            {isPending ? "Saving..." : card ? "Update Card" : "Create Card"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
