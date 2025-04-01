import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { type Category, type Card as CreditCard, type Bank } from "@/lib/types";
import { CreditCardItem } from "@/components/cards/CreditCardItem";
import { ChevronDown } from "lucide-react";

export function CreditCardCategories() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recommended");
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch banks for filtering
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // Fetch cards based on active category
  const { data: cards, isLoading } = useQuery<CreditCard[]>({
    queryKey: ['/api/cards', activeCategory],
    enabled: !!activeCategory,
  });
  
  // If no active category is set, use the first category as default when available
  if (categories?.length && activeCategory === null) {
    setActiveCategory(categories[0].id);
  }
  
  // Filter and sort cards
  const filteredCards = cards?.filter(card => {
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
  }) || [];
  
  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOption === "highest-cashback") {
      // This is a simplified sort - in reality, you'd parse the cashback percentage from the rewards description
      return b.rewardsDescription.includes("5%") ? 1 : -1;
    } else if (sortOption === "lowest-fee") {
      return parseInt(a.annualFee.replace(/[^0-9]/g, "")) - parseInt(b.annualFee.replace(/[^0-9]/g, ""));
    } else if (sortOption === "intro-apr") {
      return (b.introApr?.length || 0) - (a.introApr?.length || 0);
    }
    // Default "recommended" sort uses the order from the API
    return 0;
  });

  return (
    <section className="py-12 bg-white" id="cards">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Ideal Credit Card
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compare and discover credit cards that match your lifestyle and maximize your benefits.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <Tabs 
            defaultValue={categories?.[0]?.id.toString()} 
            onValueChange={(value) => setActiveCategory(parseInt(value))}
            className="w-full"
          >
            <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
              {categories?.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id.toString()}
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 text-sm font-medium rounded-none bg-transparent h-auto data-[state=active]:bg-transparent"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Select
              value={selectedBank}
              onValueChange={setSelectedBank}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
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
            
            <Select
              value={selectedFee}
              onValueChange={setSelectedFee}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
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
          
          <div className="flex items-center w-full sm:w-auto">
            <span className="text-sm text-gray-700 mr-2 hidden sm:inline">Sort by:</span>
            <Select
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Recommended" />
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

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
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
          ) : sortedCards.length > 0 ? (
            sortedCards.map((card) => (
              <CreditCardItem key={card.id} card={card} banks={banks} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No credit cards match your current filters.</p>
              <Button onClick={() => {
                setSelectedBank("all");
                setSelectedFee("all");
                setSortOption("recommended");
              }}>
                Reset Filters
              </Button>
            </div>
          )}
          
          {/* Load More Button - only show if there are more than 6 cards */}
          {sortedCards.length > 6 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-8 flex justify-center">
              <Button variant="outline" className="px-6 py-3">
                Load More Cards <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
