import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { type Bank } from "@/lib/types";

export default function BanksPage() {
  const { data: banks, isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Our Partner Banks
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore credit card options from our trusted banking partners. Each bank offers unique
              benefits and rewards programs to suit your financial needs.
            </p>
          </div>
          
          {isLoading ? (
            // Skeleton loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-full mr-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {banks?.map((bank) => (
                <Link key={bank.id} href={`/banks/${bank.slug}`}>
                  <a>
                    <Card className="h-full hover:shadow-md transition-shadow duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle>{bank.name}</CardTitle>
                        <CardDescription>
                          Credit Card Issuer
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mb-4">
                          {bank.logoUrl ? (
                            <img 
                              src={bank.logoUrl} 
                              alt={bank.name} 
                              className="h-16 w-auto mr-4"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-primary-100 flex items-center justify-center rounded-full mr-4">
                              <span className="text-primary font-bold text-2xl">
                                {bank.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 line-clamp-3">
                          {bank.description}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
