import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { type Card as CreditCard, type Bank, type Category } from "@/lib/types";

interface CardFormProps {
  card?: CreditCard;
  onSuccess: () => void;
}

export function CardForm({ card, onSuccess }: CardFormProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  
  // Fetch banks for the dropdown
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // Fetch categories for the dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Form schema
  const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
    bankId: z.string().transform(val => parseInt(val, 10)),
    categoryId: z.string().transform(val => parseInt(val, 10)),
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
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: card ? {
      name: card.name || "",
      slug: card.slug || "",
      bankId: card.bankId !== null && card.bankId !== undefined ? Number(card.bankId) : 0,
      categoryId: card.categoryId !== null && card.categoryId !== undefined ? Number(card.categoryId) : 0,
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
    } : {
      name: "",
      slug: "",
      bankId: 0,
      categoryId: 0,
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
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    
    try {
      if (card) {
        // Update existing card
        await apiRequest("PUT", `/api/cards/${card.id}`, values);
        toast({
          title: "Card updated",
          description: "The credit card has been updated successfully.",
        });
      } else {
        // Create new card
        await apiRequest("POST", "/api/cards", values);
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
              <FormLabel>HTML Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter HTML content for the card details page." 
                  className="min-h-[200px] font-mono text-sm"
                  {...field} 
                />
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
