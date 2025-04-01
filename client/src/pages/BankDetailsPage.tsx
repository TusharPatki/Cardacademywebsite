import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { CreditCardItem } from "@/components/cards/CreditCardItem";
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { type Bank, type Card as CreditCard } from "@/lib/types";
import { Link } from "wouter";

export default function BankDetailsPage() {
  const [, params] = useRoute("/banks/:slug");
  const slug = params?.slug;
  
  const { data: bank, isLoading: isLoadingBank } = useQuery<Bank>({
    queryKey: [`/api/banks/${slug}`],
    enabled: !!slug,
  });
  
  const { data: bankCards, isLoading: isLoadingCards } = useQuery<CreditCard[]>({
    queryKey: ['/api/cards', { bankId: bank?.id }],
    enabled: !!bank?.id,
  });

  if (isLoadingBank) {
    return (
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full mr-4"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!bank) {
    return (
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bank Not Found</h1>
            <p className="text-gray-600 mb-6">The bank you're looking for doesn't exist or has been removed.</p>
            <Link href="/banks">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banks
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <Link href="/banks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banks
              </Button>
            </Link>
          </div>
          
          <div className="mb-10">
            <div className="flex items-center mb-6">
              {bank.logoUrl ? (
                <img
                  src={bank.logoUrl}
                  alt={bank.name}
                  className="h-20 w-auto mr-6"
                />
              ) : (
                <div className="h-20 w-20 bg-primary-100 flex items-center justify-center rounded-full mr-6">
                  <span className="text-primary font-bold text-4xl">{bank.name.charAt(0)}</span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{bank.name}</h1>
            </div>
            
            <Card className="mb-10">
              <CardHeader>
                <CardTitle>About {bank.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{bank.description}</p>
              </CardContent>
            </Card>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{bank.name} Credit Cards</h2>
            
            {isLoadingCards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="h-[450px] animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-16 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-5 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bankCards && bankCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankCards.map(card => (
                  <CreditCardItem key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No credit cards available for this bank at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
