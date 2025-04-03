import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArticleForm } from "@/components/admin/ArticleForm";
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
  Badge,
} from "@/components/ui";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Filter,
  Search,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Article } from "@/lib/types";
import { Link } from "wouter";
import { format } from "date-fns";

interface AdminArticlesPageProps {
  mode?: "new" | "edit";
}

export default function AdminArticlesPage({ mode }: AdminArticlesPageProps) {
  const [, params] = useRoute("/admin/articles/edit/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  
  // Fetch all articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });
  
  // If in edit mode, fetch the article details
  const { data: articleToEdit } = useQuery<Article>({
    queryKey: [`/api/articles/${params?.id}`],
    enabled: mode === "edit" || !!params?.id,
  });
  
  // Get unique categories
  const categories = articles 
    ? [...new Set(articles.map(article => article.category))]
    : [];
  
  // Filter articles
  const filteredArticles = articles?.filter(article => {
    // Search term filter
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && article.category !== selectedCategory) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Handle delete article
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/articles/${articleToDelete.id}`);
      
      toast({
        title: "Article deleted",
        description: `"${articleToDelete.title}" has been deleted successfully.`,
      });
      
      // Refetch articles
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      
      // Reset article to delete
      setArticleToDelete(null);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete the article. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
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
              onClick={() => navigate("/admin/articles")}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === "new" ? "Add New Article" : "Edit Article"}
            </h1>
          </div>
          
          <ArticleForm 
            article={articleToEdit} 
            onSuccess={() => navigate("/admin/articles")} 
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
          <h1 className="text-2xl font-bold">Articles</h1>
          <Link href="/admin/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add New Article
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center relative flex-1">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <select
                value={selectedCategory || ""}
                onChange={e => setSelectedCategory(e.target.value || null)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              {(searchTerm || selectedCategory) && (
                <Button variant="outline" onClick={resetFilters} className="flex-shrink-0">
                  <Filter className="h-4 w-4 mr-2" /> Reset
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No articles found.</p>
                
                {(searchTerm || selectedCategory) && (
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
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-md truncate">
                            {article.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {format(new Date(article.publishDate), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.youtubeVideoId ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              Has Video
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setArticleToDelete(article)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{article.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setArticleToDelete(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteArticle}
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
