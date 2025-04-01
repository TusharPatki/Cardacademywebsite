import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { CreditCardItem } from "@/components/cards/CreditCardItem";
import { Newsletter } from "@/components/home/Newsletter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
} from "@/components/ui";
import { type Category, type Card as CreditCard, type Bank } from "@/lib/types";
import { ChevronDown, Filter } from "lucide-react";

export default function CardsPage() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recommended");
  const [showMoreCards, setShowMoreCards] = useState(false);
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch banks for filtering
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // Fetch all cards
  const { data: cards, isLoading } = useQuery<CreditCard[]>({
    queryKey: ['/api/cards'],
  });
  
  // If no active category is set, use all cards
  const filteredByCategory = activeCategory
    ? cards?.filter(card => card.categoryId === activeCategory)
    : cards || [];
  
  // Filter and sort cards
  const filteredCards = filteredByCategory.filter(card => {
    if (selectedBank !== "all" && card.bankId !== parseInt(selectedBank)) {
      return false;
    }
    
    if (selectedFee === "no-fee" && card.annualFee !== "$0") {
      return false;
    } else if (selectedFee === "under-100" && (card.annualFee === "$0" || parseInt(card.annualFee.replace(/[^0-9]/g, "")) >= 100)) {
      return false;
    } else if (selectedFee === "100-300" && (parseInt(card.annualFee.replace(/[^0-9]/g, "")) < 100 || parseInt(card.annualFee.replace(/[^0-9]/g, "")) >= 300)) {
      return false;
    } else if (selectedFee === "300-plus" && parseInt(card.annualFee.replace(/[^0-9]/g, "")) < 300) {
      return false;
    }
    
    return true;
  });
  
  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOption === "highest-cashback") {
      return b.rewardsDescription.includes("5%") ? 1 : -1;
    } else if (sortOption === "lowest-fee") {
      return parseInt(a.annualFee.replace(/[^0-9]/g, "")) - parseInt(b.annualFee.replace(/[^0-9]/g, ""));
    } else if (sortOption === "intro-apr") {
      return (b.introApr?.length || 0) - (a.introApr?.length || 0);
    }
    return 0;
  });
  
  // Control how many cards to display
  const displayedCards = showMoreCards ? sortedCards : sortedCards.slice(0, 9);

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Compare Credit Cards
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find the perfect credit card for your needs by comparing features, rewards, and fees.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Credit Card Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Tabs 
                    defaultValue="all" 
                    onValueChange={(value) => setActiveCategory(value === "all" ? null : parseInt(value))}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 md:flex md:flex-wrap">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {categories?.map((category) => (
                        <TabsTrigger key={category.id} value={category.id.toString()}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                  <Select
                    value={selectedBank}
                    onValueChange={setSelectedBank}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Banks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Banks</SelectItem>
                      {banks?.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee</label>
                  <Select
                    value={selectedFee}
                    onValueChange={setSelectedFee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Annual Fee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fees</SelectItem>
                      <SelectItem value="no-fee">No Annual Fee</SelectItem>
                      <SelectItem value="under-100">Under $100</SelectItem>
                      <SelectItem value="100-300">$100 - $300</SelectItem>
                      <SelectItem value="300-plus">$300+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <Select
                    value={sortOption}
                    onValueChange={setSortOption}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="highest-cashback">Highest Cashback</SelectItem>
                      <SelectItem value="lowest-fee">Lowest Annual Fee</SelectItem>
                      <SelectItem value="intro-apr">Intro APR Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Reset filters button */}
              {(activeCategory !== null || selectedBank !== "all" || selectedFee !== "all" || sortOption !== "recommended") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setActiveCategory(null);
                    setSelectedBank("all");
                    setSelectedFee("all");
                    setSortOption("recommended");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Results count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Showing {displayedCards.length} of {sortedCards.length} cards
            </p>
          </div>
          
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
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
              ))
            ) : displayedCards.length > 0 ? (
              displayedCards.map((card) => (
                <CreditCardItem key={card.id} card={card} banks={banks} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No credit cards match your current filters.</p>
                <Button onClick={() => {
                  setActiveCategory(null);
                  setSelectedBank("all");
                  setSelectedFee("all");
                  setSortOption("recommended");
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Load More Button - only show if there are more to load */}
          {!isLoading && sortedCards.length > 9 && (
            <div className="mt-10 text-center">
              <Button 
                variant="outline" 
                className="px-6 py-3"
                onClick={() => setShowMoreCards(!showMoreCards)}
              >
                {showMoreCards ? "Show Less" : "Load More Cards"} 
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showMoreCards ? "rotate-180" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
