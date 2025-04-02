import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui";
import { InfoIcon, Star } from "lucide-react";
import { type Card as CreditCard, type Bank, type Category } from "@/lib/types";

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
  
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div 
        className="p-4 text-white flex justify-between items-center"
        style={{
          background: `linear-gradient(to right, ${card.cardColorFrom || '#0F4C81'}, ${card.cardColorTo || '#0F4C81'})`
        }}
      >
        <span className="font-semibold">{card.name}</span>
        {bank?.logoUrl && (
          <img 
            src={bank.logoUrl} 
            alt={bank.name} 
            className="h-8 w-auto rounded"
          />
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            {categoryData?.name || "Credit Card"}
          </Badge>
          {card.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
              <span className="text-sm font-medium">{card.rating}</span>
            </div>
          )}
        </div>
        
        {card.imageUrl ? (
          <div className="mb-4 overflow-hidden rounded-md">
            <img 
              src={card.imageUrl} 
              alt={card.name}
              className="w-full h-auto object-contain" 
              style={{maxHeight: "150px"}}
              onError={(e) => {
                // If image fails to load, show text instead
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                
                // Create a fallback element after the image fails
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-content')) {
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'fallback-content';
                  
                  const titleElement = document.createElement('h3');
                  titleElement.className = 'text-lg font-semibold text-gray-900 mb-2';
                  titleElement.textContent = card.rewardsDescription.split('.')[0];
                  
                  fallbackDiv.appendChild(titleElement);
                  parent.appendChild(fallbackDiv);
                }
              }}
            />
          </div>
        ) : (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {card.rewardsDescription.split('.')[0]}
          </h3>
        )}
        
        <p className="text-gray-600 text-sm mb-4">
          {showFullDetails 
            ? card.rewardsDescription 
            : card.rewardsDescription.length > 100 
              ? card.rewardsDescription.substring(0, 97) + '...' 
              : card.rewardsDescription}
        </p>
        
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Annual Fee</span>
            <span className="font-medium text-gray-900">{card.annualFee}</span>
          </div>
          {card.introApr && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Intro APR</span>
              <span className="font-medium text-gray-900">{card.introApr}</span>
            </div>
          )}
          {card.regularApr && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Regular APR</span>
              <span className="font-medium text-gray-900">{card.regularApr}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-x-3 flex">
          <Button
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/cards/${card.slug}/apply`}>
              <a>Apply Now</a>
            </Link>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3"
                  asChild
                >
                  <Link href={`/cards/${card.slug}`}>
                    <a><InfoIcon className="h-4 w-4" /></a>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
