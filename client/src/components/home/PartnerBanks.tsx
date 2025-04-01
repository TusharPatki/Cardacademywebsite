import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { type Bank } from "@/lib/types";

export function PartnerBanks() {
  const { data: banks, isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our Partner Banks
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore credit card options from our trusted banking partners.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-32">
                  <div className="h-16 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-3 h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
              </div>
            ))
          ) : (
            banks?.map((bank) => (
              <Link key={bank.id} href={`/banks/${bank.slug}`}>
                <a className="group">
                  <Card className="p-6 flex items-center justify-center hover:shadow-md transition-shadow duration-300 h-32">
                    {bank.logoUrl ? (
                      <img 
                        src={bank.logoUrl} 
                        alt={bank.name} 
                        className="max-h-16 max-w-full"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-primary-100 flex items-center justify-center rounded-full">
                        <span className="text-primary-600 font-bold text-xl">
                          {bank.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Card>
                  <p className="mt-3 text-center text-sm font-medium text-gray-900 group-hover:text-primary">
                    {bank.name}
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
