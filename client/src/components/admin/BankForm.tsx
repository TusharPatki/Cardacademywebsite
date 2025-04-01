import { useState } from "react";
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
import { type Bank } from "@/lib/types";

interface BankFormProps {
  bank?: Bank;
  onSuccess: () => void;
}

export function BankForm({ bank, onSuccess }: BankFormProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  
  // Form schema
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
    logoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    description: z.string().min(10, "Description must be at least 10 characters."),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: bank ? {
      ...bank,
      logoUrl: bank.logoUrl || "",
    } : {
      name: "",
      slug: "",
      logoUrl: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    
    try {
      if (bank) {
        // Update existing bank
        await apiRequest("PUT", `/api/banks/${bank.id}`, values);
        toast({
          title: "Bank updated",
          description: "The bank has been updated successfully.",
        });
      } else {
        // Create new bank
        await apiRequest("POST", "/api/banks", values);
        toast({
          title: "Bank created",
          description: "The bank has been created successfully.",
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      onSuccess();
    } catch (error) {
      console.error("Error saving bank:", error);
      toast({
        title: "Error",
        description: "Failed to save the bank. Please try again.",
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
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Chase" {...field} />
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
                  <Input placeholder="e.g. chase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. https://example.com/logo.svg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the bank and its credit card offerings." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Bank Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            {form.watch("logoUrl") ? (
              <img 
                src={form.watch("logoUrl")} 
                alt={form.watch("name") || "Bank logo"} 
                className="h-12 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/200x80?text=Logo";
                }}
              />
            ) : (
              <div className="h-12 w-12 bg-primary-100 flex items-center justify-center rounded-full">
                <span className="text-primary font-bold text-xl">
                  {(form.watch("name") || "B").charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{form.watch("name") || "Bank Name"}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {form.watch("description") || "Bank description preview"}
              </p>
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
            {isPending ? "Saving..." : bank ? "Update Bank" : "Create Bank"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
