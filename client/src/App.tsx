import { Switch, Route, RouteComponentProps } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import HomePage from "@/pages/HomePage";
import CardsPage from "@/pages/CardsPage";
import CardDetailsPage from "@/pages/CardDetailsPage";
import BanksPage from "@/pages/BanksPage";
import BankDetailsPage from "@/pages/BankDetailsPage";
import NewsPage from "@/pages/NewsPage";
import ArticleDetailsPage from "@/pages/ArticleDetailsPage";
import AiAssistantPage from "@/pages/AiAssistantPage";
import CalculatorsPage from "@/pages/CalculatorsPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminCardsPage from "@/pages/AdminCardsPage";
import AdminCategoriesPage from "@/pages/AdminCategoriesPage";
import AdminBanksPage from "@/pages/AdminBanksPage";
import AdminArticlesPage from "@/pages/AdminArticlesPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/cards" component={CardsPage} />
      <Route path="/cards/:slug" component={CardDetailsPage} />
      <Route path="/banks" component={BanksPage} />
      <Route path="/banks/:slug" component={BankDetailsPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:slug" component={ArticleDetailsPage} />
      <Route path="/assistant" component={AiAssistantPage} />
      <Route path="/calculators" component={CalculatorsPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/cards">
        {() => <AdminCardsPage />}
      </Route>
      <Route path="/admin/cards/new">
        {() => <AdminCardsPage mode="new" />}
      </Route>
      <Route path="/admin/cards/edit/:id">
        {() => <AdminCardsPage mode="edit" />}
      </Route>
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/banks">
        {() => <AdminBanksPage />}
      </Route>
      <Route path="/admin/banks/new" component={() => <AdminBanksPage mode="new" />} />
      <Route path="/admin/banks/edit/:id">
        {() => <AdminBanksPage mode="edit" />}
      </Route>
      <Route path="/admin/articles">
        {() => <AdminArticlesPage />}
      </Route>
      <Route path="/admin/articles/new" component={() => <AdminArticlesPage mode="new" />} />
      <Route path="/admin/articles/edit/:id">
        {() => <AdminArticlesPage mode="edit" />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
