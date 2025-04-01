import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import {
  CreditCard as CreditCardIcon,
  Building,
  FileText,
  ListOrdered,
  TrendingUp,
  BarChart,
  PieChart,
} from "lucide-react";
import { type Card as CreditCardType, type Bank, type Article } from "@/lib/types";

export default function AdminDashboardPage() {
  // Fetch data for dashboard
  const { data: cards } = useQuery<CreditCardType[]>({
    queryKey: ['/api/cards'],
  });
  
  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
  });
  
  const { data: articles } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });
  
  // Count by category
  const getCategoryCount = () => {
    if (!cards) return {};
    
    const counts: Record<number, number> = {};
    cards.forEach(card => {
      counts[card.categoryId] = (counts[card.categoryId] || 0) + 1;
    });
    
    return counts;
  };
  
  const categoryCount = getCategoryCount();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="space-x-2">
            <Link href="/admin/cards/new">
              <Button size="sm">
                <CreditCardIcon className="h-4 w-4 mr-2" /> Add Card
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {banks?.length || 0} partner banks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Partner Banks</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banks?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Providing various credit card options
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                News, guides, and reviews
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cards?.slice(0, 5).map(card => (
                  <div key={card.id} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-3"
                        style={{ backgroundColor: (card.cardColorFrom || '#0F4C81') as string }}
                      ></div>
                      <span className="font-medium">{card.name}</span>
                    </div>
                    <Link href={`/admin/cards/edit/${card.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link href="/admin/cards">
                  <Button variant="outline" className="w-full">
                    <ListOrdered className="h-4 w-4 mr-2" /> View All Cards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {articles?.slice(0, 5).map(article => (
                  <div key={article.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <span className="font-medium">{article.title}</span>
                      <div className="text-xs text-gray-500">
                        {new Date(article.publishDate).toLocaleDateString()} • {article.category}
                      </div>
                    </div>
                    <Link href={`/admin/articles/edit/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link href="/admin/articles">
                  <Button variant="outline" className="w-full">
                    <ListOrdered className="h-4 w-4 mr-2" /> View All Articles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/cards/new">
                  <Button variant="outline" className="w-full">
                    <CreditCardIcon className="h-4 w-4 mr-2" /> Add New Card
                  </Button>
                </Link>
                
                <Link href="/admin/banks/new">
                  <Button variant="outline" className="w-full">
                    <Building className="h-4 w-4 mr-2" /> Add New Bank
                  </Button>
                </Link>
                
                <Link href="/admin/articles/new">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" /> Add New Article
                  </Button>
                </Link>
                
                <Link href="/" target="_blank">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" /> View Website
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Database</span>
                  <span className="text-sm font-medium">In-Memory</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Environment</span>
                  <span className="text-sm font-medium">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">API Status</span>
                  <span className="text-sm font-medium text-green-500">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Version</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-gray-500">
                  Note: Data is stored in memory and will reset when the server restarts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
