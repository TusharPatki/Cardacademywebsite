import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CardForm } from "@/components/admin/CardForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Filter,
  Search,
  ChevronLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Card as CreditCard, type Bank, type Category } from "@/lib/types";
import { Link } from "wouter";

interface AdminCardsPageProps {
  mode?: "new" | "edit";
}

export default function AdminCardsPage({ mode }: AdminCardsPageProps) {
  const [, params] = useRoute("/admin/cards/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
  
  // Fetch all cards
  const { data: cards, isLoading } = useQuery<CreditCard[]>({
    queryKey: ['/api/cards'],
  });
  
  // Fetch categories for filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch banks for filter
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // If in edit mode, fetch the card details
  const { data: cardToEdit } = useQuery<CreditCard>({
    queryKey: [`/api/cards/${params?.id}`],
    enabled: mode === "edit" || !!params?.id,
  });
  
  // Filter cards
  const filteredCards = cards?.filter(card => {
    // Search term filter
    if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && card.categoryId !== selectedCategory) {
      return false;
    }
    
    // Bank filter
    if (selectedBank && card.bankId !== selectedBank) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Handle delete card
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/cards/${cardToDelete.id}`);
      
      toast({
        title: "Card deleted",
        description: `${cardToDelete.name} has been deleted successfully.`,
      });
      
      // Refetch cards
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      
      // Reset card to delete
      setCardToDelete(null);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Error",
        description: "Failed to delete the card. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedBank(null);
  };
  
  // Determine bank name for a card
  const getBankName = (bankId: number) => {
    const bank = banks?.find(b => b.id === bankId);
    return bank?.name || "Unknown";
  };
  
  // Determine category name for a card
  const getCategoryName = (categoryId: number) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };
  
  // Determine content to show based on mode
  if (mode === "new" || mode === "edit" || params?.id) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/admin/cards")}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Cards
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === "new" ? "Add New Card" : "Edit Card"}
            </h1>
          </div>
          
          <CardForm 
            card={cardToEdit} 
            onSuccess={() => navigate("/admin/cards")} 
          />
        </div>
      </AdminLayout>
    );
  }
  
  // List view (default)
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Credit Cards</h1>
          <Link href="/admin/cards/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add New Card
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center relative flex-1">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <select
                value={selectedCategory?.toString() || ""}
                onChange={e => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedBank?.toString() || ""}
                onChange={e => setSelectedBank(e.target.value ? parseInt(e.target.value) : null)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Banks</option>
                {banks?.map(bank => (
                  <option key={bank.id} value={bank.id.toString()}>
                    {bank.name}
                  </option>
                ))}
              </select>
              
              {(searchTerm || selectedCategory || selectedBank) && (
                <Button variant="outline" onClick={resetFilters} className="flex-shrink-0">
                  <Filter className="h-4 w-4 mr-2" /> Reset
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading cards...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No credit cards found.</p>
                
                {(searchTerm || selectedCategory || selectedBank) && (
                  <Button variant="outline" onClick={resetFilters}>
                    <Filter className="h-4 w-4 mr-2" /> Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card Name</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Annual Fee</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map(card => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div 
                              className="w-6 h-6 rounded mr-3"
                              style={{ backgroundColor: card.cardColorFrom }}
                            ></div>
                            {card.name}
                          </div>
                        </TableCell>
                        <TableCell>{getBankName(card.bankId)}</TableCell>
                        <TableCell>{getCategoryName(card.categoryId)}</TableCell>
                        <TableCell>{card.annualFee}</TableCell>
                        <TableCell>
                          {card.featured ? (
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-300" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/cards/edit/${card.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setCardToDelete(card)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Card</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{card.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setCardToDelete(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteCard}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
