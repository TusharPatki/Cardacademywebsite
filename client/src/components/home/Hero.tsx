import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AIChat } from "./AIChat";

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-800 text-white">
      <div className="container mx-auto px-4 py-12 md:py-24 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Find Your Perfect Credit Card Match
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-primary-50">
              Discover the best credit cards tailored to your spending habits, lifestyle, and financial goals.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/cards">
                <Button
                  size="lg"
                  className="font-medium bg-white text-black hover:bg-gray-100"
                >
                  Browse Cards
                </Button>
              </Link>
              <Link href="/assistant">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-medium text-black border-white hover:bg-primary-700"
                >
                  Ask Our AI Assistant
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative mt-8 md:mt-0">
            <AIChat />
          </div>
        </div>
      </div>
    </section>
  );
}
