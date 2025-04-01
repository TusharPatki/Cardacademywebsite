import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BankForm } from "@/components/admin/BankForm";
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
  Search,
  ChevronLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Bank } from "@/lib/types";
import { Link } from "wouter";

interface AdminBanksPageProps {
  mode?: "new" | "edit";
}

export default function AdminBanksPage({ mode }: AdminBanksPageProps) {
  const [, params] = useRoute("/admin/banks/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);
  
  // Fetch all banks
  const { data: banks, isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  // If in edit mode, fetch the bank details
  const { data: bankToEdit } = useQuery<Bank>({
    queryKey: [`/api/banks/${params?.id}`],
    enabled: mode === "edit" || !!params?.id,
  });
  
  // Filter banks
  const filteredBanks = banks?.filter(bank => {
    // Search term filter
    if (searchTerm && !bank.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Handle delete bank
  const handleDeleteBank = async () => {
    if (!bankToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/banks/${bankToDelete.id}`);
      
      toast({
        title: "Bank deleted",
        description: `${bankToDelete.name} has been deleted successfully.`,
      });
      
      // Refetch banks
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      
      // Reset bank to delete
      setBankToDelete(null);
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast({
        title: "Error",
        description: "Failed to delete the bank. Please try again.",
        variant: "destructive",
      });
    }
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
              onClick={() => navigate("/admin/banks")}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Banks
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === "new" ? "Add New Bank" : "Edit Bank"}
            </h1>
          </div>
          
          <BankForm 
            bank={bankToEdit} 
            onSuccess={() => navigate("/admin/banks")} 
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
          <h1 className="text-2xl font-bold">Partner Banks</h1>
          <Link href="/admin/banks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add New Bank
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center relative mb-6">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search banks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full max-w-md border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading banks...</p>
              </div>
            ) : filteredBanks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No banks found.</p>
                
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Bank Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanks.map(bank => (
                      <TableRow key={bank.id}>
                        <TableCell>
                          {bank.logoUrl ? (
                            <img
                              src={bank.logoUrl}
                              alt={bank.name}
                              className="h-8 w-auto"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-primary-100 flex items-center justify-center rounded-full">
                              <span className="text-primary font-medium">
                                {bank.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{bank.name}</TableCell>
                        <TableCell>{bank.slug}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{bank.description}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/banks/edit/${bank.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setBankToDelete(bank)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Bank</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{bank.name}"? This action cannot be undone.
                                    <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded">
                                      Warning: This will also delete all credit cards associated with this bank.
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setBankToDelete(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteBank}
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
