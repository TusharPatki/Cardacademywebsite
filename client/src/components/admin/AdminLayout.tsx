import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Building,
  FileText,
  LogOut,
  Menu,
  X,
  ListChecks,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const [, params] = useRoute("/admin/:path*");
  const currentPath = params?.["path*"] || "";
  
  // Get authentication state
  const { user, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, isLoading, navigate]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  // If not logged in, don't render anything (will redirect)
  if (!user) {
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { href: "/admin/cards", label: "Credit Cards", icon: <CreditCard className="h-5 w-5 mr-2" /> },
    { href: "/admin/categories", label: "Categories", icon: <ListChecks className="h-5 w-5 mr-2" /> },
    { href: "/admin/banks", label: "Partner Banks", icon: <Building className="h-5 w-5 mr-2" /> },
    { href: "/admin/articles", label: "Articles", icon: <FileText className="h-5 w-5 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin">
              <a className="text-xl font-bold text-primary">
                Credit Card Advisor Admin
              </a>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] sm:w-[385px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="text-xl font-bold text-primary">
                      Credit Card Advisor Admin
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex-1 py-6">
                    <ul className="space-y-1">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} onClick={() => setIsOpen(false)}>
                            <a
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                item.href === "/admin" + (currentPath ? `/${currentPath}` : "")
                                  ? "bg-primary-50 text-primary"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {item.icon}
                              {item.label}
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="border-t py-4">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                    <Link href="/">
                      <a className="mt-4 block text-sm text-center text-gray-500 hover:text-gray-700">
                        Back to Website
                      </a>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                View Website
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:block w-64 border-r bg-white overflow-y-auto h-[calc(100vh-60px)] sticky top-[60px]">
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        item.href === "/admin" + (currentPath ? `/${currentPath}` : "")
                          ? "bg-primary-50 text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
