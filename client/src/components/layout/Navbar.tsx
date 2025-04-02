import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, X } from "lucide-react";
import { type User } from "@/lib/types";

interface NavItemProps {
  href: string;
  label: string;
  active?: boolean;
}

const NavItem = ({ href, label, active }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={`border-b-2 px-1 pt-1 font-medium ${
          active
            ? "border-primary text-primary"
            : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800"
        }`}
      >
        {label}
      </a>
    </Link>
  );
};

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current user if logged in
  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/banks", label: "Partner Banks" },
    { href: "/cards", label: "Credit Cards" },
    { href: "/assistant", label: "Smart Assistant" },
    { href: "/news", label: "Offers & News" },
    { href: "/calculators", label: "Calculators" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <img src="/logo.png" alt="CardAcademy" className="h-8 w-auto mr-2" />
                  <span className="text-primary font-bold text-2xl">
                    Card<span className="text-blue-900">Academy</span>
                  </span>
                </div>
              </a>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={location === item.href}
                />
              ))}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              className="text-gray-700 hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <Link href="/admin">
                <Button variant="outline" className="text-sm">
                  Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/admin/login">
                <Button className="text-sm">Sign In</Button>
              </Link>
            )}
          </div>
          
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menu"
                  className="text-gray-700 hover:text-primary"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <span className="text-primary font-bold text-2xl">
                        Card<span className="text-accent">Savvy</span>
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col py-4 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <a
                          className={`px-4 py-2 rounded-md text-base font-medium ${
                            location === item.href
                              ? "text-primary bg-primary-50"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-auto border-t pt-4">
                    {user ? (
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button className="w-full" variant="outline">
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
