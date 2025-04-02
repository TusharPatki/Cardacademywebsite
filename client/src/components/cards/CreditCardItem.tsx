import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, Star, ArrowRight, Calendar } from "lucide-react";
import { type Card as CreditCard, type Bank, type Category } from "@/lib/types";
import { format } from "date-fns";

interface CreditCardItemProps {
  card: CreditCard;
  banks?: Bank[];
  showFullDetails?: boolean;
}

export function CreditCardItem({ card, banks, showFullDetails = false }: CreditCardItemProps) {
  // Get bank and category data if not provided
  const { data: bankData } = useQuery<Bank>({
    queryKey: ['/api/banks', card.bankId],
    enabled: !banks,
  });
  
  const { data: categoryData } = useQuery<Category>({
    queryKey: ['/api/categories', card.categoryId],
  });
  
  // Find bank data either from props or query
  const bank = banks?.find(b => b.id === card.bankId) || bankData;
  
  // Handlers
  const handleApplyClick = (e: React.MouseEvent) => {
    if (!card.applyLink) {
      e.preventDefault();
    }
  };
  
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div 
        className="p-4 text-white flex justify-between items-center"
        style={{
          background: `linear-gradient(to right, ${card.cardColorFrom || '#0F4C81'}, ${card.cardColorTo || '#0F4C81'})`
        }}
      >
        <span className="font-semibold">{card.name}</span>
        {bank && (
          <img 
            src={bank.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg'} 
            alt={bank.name} 
            className="h-8 w-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            {categoryData?.name || "Credit Card"}
          </div>
          
          {card.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
              <span className="text-sm font-medium">{card.rating}</span>
            </div>
          )}
        </div>
        
        {card.imageUrl ? (
          <div className="mb-4 flex justify-center">
            <img 
              src={card.imageUrl} 
              alt={card.name} 
              className="h-32 object-contain rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center mb-4 bg-gray-50 rounded-md">
            <span className="text-gray-400">{card.name}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          {card.publishDate && (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              <time dateTime={new Date(card.publishDate).toISOString()}>
                {format(new Date(card.publishDate), "MMMM d, yyyy")}
              </time>
              <span className="mx-2">•</span>
            </>
          )}
          <span>{categoryData?.name || "Credit Card"}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {card.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {card.rewardsDescription || "This card offers premium rewards and benefits for cardholders."}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Annual Fee</div>
            <div className="font-semibold">{card.annualFee}</div>
          </div>
          
          <div>
            <div className="text-gray-500">Intro APR</div>
            <div className="font-semibold">{card.introApr || "N/A"}</div>
          </div>
          
          <div>
            <div className="text-gray-500">Regular APR</div>
            <div className="font-semibold">{card.regularApr || "Variable"}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
          <Link href={`/cards/${card.slug}`} className="text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
            Read More <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link href={card.applyLink || `/cards/${card.slug}/apply`}>
            <Button 
              className="w-full bg-blue-800 hover:bg-blue-700"
              onClick={handleApplyClick}
            >
              Apply Now
            </Button>
          </Link>
          
          <div className="mt-1 flex justify-end">
            <Link href={`/cards/${card.slug}`} onClick={handleInfoClick}>
              <Button
                size="icon"
                variant="outline"
                className="w-10 h-10 rounded-full border border-gray-200"
              >
                <InfoIcon className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
