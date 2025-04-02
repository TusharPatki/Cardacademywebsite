// Re-export types from schema.ts for frontend use
import {
  User,
  Category,
  Bank,
  Card,
  Article,
  Calculator,
  LoginInput
} from "@shared/schema";

export type {
  User,
  Category,
  Bank,
  Card,
  Article,
  Calculator,
  LoginInput
};

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

// API response types
export interface ChatResponse {
  response: string;
  citations?: string[];
  provider?: "gemini" | "perplexity" | "error";
}

// Combined types for displaying data
export interface CardWithDetails extends Card {
  bankName?: string;
  categoryName?: string;
}
