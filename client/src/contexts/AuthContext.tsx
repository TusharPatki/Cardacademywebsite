import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type User, type LoginInput, type AuthContextType } from "@/lib/types";

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Query current user
  const { data: user = null, isInitialLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 300000, // 5 minutes
    retry: false,
    refetchOnMount: true,
  });
  
  // Update loading state when initial query completes
  useEffect(() => {
    if (!isInitialLoading) {
      setIsLoading(false);
    }
  }, [isInitialLoading]);
  
  // Login function
  const login = async (data: LoginInput) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      // Ensure the response is processed
      await response.json();
      
      // Refetch user data after login and wait for it to complete
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Ensure the latest user data is fetched
      await queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
    } catch (error) {
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    } catch (error) {
      throw error;
    }
  };
  
  // Context value
  const value = {
    user,
    isLoading,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
