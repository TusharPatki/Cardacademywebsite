import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  CreditCard, 
  Percent, 
  Coins, 
  ArrowLeftRight 
} from "lucide-react";
import { type Calculator } from "@/lib/types";

// Map of icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  "credit-card": <CreditCard className="text-primary-600 text-xl" />,
  "percentage": <Percent className="text-primary-600 text-xl" />,
  "coins": <Coins className="text-primary-600 text-xl" />,
  "exchange-alt": <ArrowLeftRight className="text-primary-600 text-xl" />,
};

export function FinancialCalculators() {
  const { data: calculators, isLoading } = useQuery<Calculator[]>({
    queryKey: ['/api/calculators'],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Calculators
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Make informed financial decisions with our suite of calculators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse h-[196px]">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : (
            calculators?.map((calculator) => (
              <Link key={calculator.id} href={`/calculators/${calculator.slug}`}>
                <a className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    {iconMap[calculator.iconName] || <CreditCard className="text-primary-600 text-xl" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {calculator.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {calculator.description}
                  </p>
                </a>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
