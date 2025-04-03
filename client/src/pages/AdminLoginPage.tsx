import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema } from "@shared/schema";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { login, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);
  
  // Form setup
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt started");
      await login(values);
      
      console.log("Login successful, checking auth state:", user);
      
      toast({
        title: "Login successful",
        description: "Welcome to the Credit Card Advisor admin panel.",
      });
      
      // Slight delay to ensure state is properly updated
      setTimeout(() => {
        console.log("Navigating to admin panel, auth state:", user);
        navigate("/admin");
      }, 300);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid login credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <LockKeyhole className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Credit Card Advisor Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the admin dashboard
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="usernameOrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username or Email</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your username or email"
                          autoComplete="username email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-6 border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
