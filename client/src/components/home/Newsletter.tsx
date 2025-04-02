import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Mock subscribe functionality
    setTimeout(() => {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll now receive our latest credit card news and offers.",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-primary-700 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Stay updated with credit card news and offers
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-primary-100">
              Subscribe to our newsletter to receive personalized credit card recommendations and exclusive offers.
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <form onSubmit={handleSubmit} className="sm:flex">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md px-5 py-3 placeholder-gray-500 sm:max-w-xs bg-white border-0"
                placeholder="Enter your email"
              />
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button
                  type="submit"
                  className="block rounded-md bg-accent py-3 px-5 text-base font-medium shadow hover:bg-accent-600 sm:px-10 w-full sm:w-auto text-black"
                  disabled={isLoading}
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </form>
            <p className="mt-3 text-sm text-primary-100">
              We care about your data. Read our{" "}
              <Link href="/privacy">
                <a className="font-medium text-white underline">
                  Privacy Policy
                </a>
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
