import {
  users, categories, banks, cards, articles, calculators,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Bank, type InsertBank,
  type Card, type InsertCard,
  type Article, type InsertArticle,
  type Calculator, type InsertCalculator
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Banks
  getAllBanks(): Promise<Bank[]>;
  getBank(id: number): Promise<Bank | undefined>;
  getBankBySlug(slug: string): Promise<Bank | undefined>;
  createBank(bank: InsertBank): Promise<Bank>;
  updateBank(id: number, bank: Partial<InsertBank>): Promise<Bank | undefined>;
  deleteBank(id: number): Promise<boolean>;
  
  // Cards
  getAllCards(): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  getCardBySlug(slug: string): Promise<Card | undefined>;
  getCardsByCategory(categoryId: number): Promise<Card[]>;
  getCardsByBank(bankId: number): Promise<Card[]>;
  getFeaturedCards(): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  
  // Articles
  getAllArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getRecentArticles(limit: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Calculators
  getAllCalculators(): Promise<Calculator[]>;
  getCalculator(id: number): Promise<Calculator | undefined>;
  getCalculatorBySlug(slug: string): Promise<Calculator | undefined>;
  createCalculator(calculator: InsertCalculator): Promise<Calculator>;
  updateCalculator(id: number, calculator: Partial<InsertCalculator>): Promise<Calculator | undefined>;
  deleteCalculator(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private banks: Map<number, Bank>;
  private cards: Map<number, Card>;
  private articles: Map<number, Article>;
  private calculators: Map<number, Calculator>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private bankCurrentId: number;
  private cardCurrentId: number;
  private articleCurrentId: number;
  private calculatorCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.banks = new Map();
    this.cards = new Map();
    this.articles = new Map();
    this.calculators = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.bankCurrentId = 1;
    this.cardCurrentId = 1;
    this.articleCurrentId = 1;
    this.calculatorCurrentId = 1;
    
    // Initialize with some data
    this.initializeData();
  }

  private initializeData(): void {
    // Add default admin user
    this.createUser({
      username: "admin",
      email: "admin@example.com", // Add default email
      password: "password123", // In a real app, this would be hashed
      isAdmin: true,
    });

    // Add default categories
    const categoryIds = {
      cashback: this.createCategory({ name: "Cashback Cards", slug: "cashback-cards" }).id,
      rewards: this.createCategory({ name: "Rewards Cards", slug: "rewards-cards" }).id,
      travel: this.createCategory({ name: "Travel Cards", slug: "travel-cards" }).id,
      fuel: this.createCategory({ name: "Fuel Cards", slug: "fuel-cards" }).id,
      balance: this.createCategory({ name: "Balance Transfer", slug: "balance-transfer" }).id,
      business: this.createCategory({ name: "Business Cards", slug: "business-cards" }).id,
    };

    // Add default banks
    const bankIds = {
      chase: this.createBank({ 
        name: "Chase", 
        slug: "chase",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Chase_logo.svg/200px-Chase_logo.svg.png",
        description: "Chase offers a wide range of credit cards with great rewards and benefits."
      }).id,
      citi: this.createBank({ 
        name: "Citi", 
        slug: "citi",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Citibank_logo.svg/200px-Citibank_logo.svg.png",
        description: "Citi offers a variety of credit cards with competitive rewards and perks."
      }).id,
      amex: this.createBank({ 
        name: "American Express", 
        slug: "american-express",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png",
        description: "American Express provides premium credit cards with exclusive benefits and rewards."
      }).id,
      capital: this.createBank({ 
        name: "Capital One", 
        slug: "capital-one",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Capital_One_logo.svg/200px-Capital_One_logo.svg.png",
        description: "Capital One offers innovative credit cards with great rewards and no annual fees."
      }).id,
      discover: this.createBank({ 
        name: "Discover", 
        slug: "discover",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Discover_Card_logo.svg/200px-Discover_Card_logo.svg.png",
        description: "Discover provides credit cards with cashback rewards and no annual fees."
      }).id,
      boa: this.createBank({ 
        name: "Bank of America", 
        slug: "bank-of-america",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Bank_of_America_logo.svg/200px-Bank_of_America_logo.svg.png",
        description: "Bank of America offers a variety of credit cards with competitive rewards."
      }).id,
    };

    // Add sample cards
    this.createCard({
      name: "Citi® Double Cash Card",
      slug: "citi-double-cash-card",
      bankId: bankIds.citi,
      categoryId: categoryIds.cashback,
      annualFee: "$0",
      introApr: "0% for 18 months",
      regularApr: "14.74% - 24.74%",
      rewardsDescription: "Earn 1% when you buy and 1% when you pay. No categories to track.",
      rating: "4.8",
      featured: true,
      cardColorFrom: "#0066B3",
      cardColorTo: "#0058A0"
    });

    this.createCard({
      name: "Chase Freedom Unlimited®",
      slug: "chase-freedom-unlimited",
      bankId: bankIds.chase,
      categoryId: categoryIds.cashback,
      annualFee: "$0",
      introApr: "0% for 15 months",
      regularApr: "15.24% - 23.99%",
      rewardsDescription: "5% on travel, 3% on dining and drugstores, 1.5% on everything else.",
      rating: "4.7",
      featured: true,
      cardColorFrom: "#7B2CBF",
      cardColorTo: "#5A189A"
    });

    this.createCard({
      name: "Discover it® Cash Back",
      slug: "discover-it-cash-back",
      bankId: bankIds.discover,
      categoryId: categoryIds.cashback,
      annualFee: "$0",
      introApr: "0% for 14 months",
      regularApr: "13.49% - 24.49%",
      rewardsDescription: "5% cashback in rotating categories (up to quarterly max), 1% on all other purchases.",
      rating: "4.6",
      featured: true,
      cardColorFrom: "#0B8457",
      cardColorTo: "#096C46"
    });

    // Add sample articles
    this.createArticle({
      title: "Top Credit Card Reward Programs for Summer Travel",
      slug: "top-credit-card-reward-programs-summer-travel",
      content: "Detailed content about the best credit cards for summer travel...",
      excerpt: "Maximize your summer vacation with these top travel credit cards offering enhanced rewards and perks for the season.",
      imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
      publishDate: new Date("2023-06-15"),
      category: "News"
    });

    this.createArticle({
      title: "Limited Time: Citi Double Cash Offering $200 Welcome Bonus",
      slug: "citi-double-cash-welcome-bonus",
      content: "Detailed information about the Citi Double Cash Card welcome bonus...",
      excerpt: "Citi has launched a special promotion for new cardholders with an increased welcome bonus and additional benefits.",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
      publishDate: new Date("2023-06-10"),
      category: "Offers"
    });

    this.createArticle({
      title: "How to Improve Your Credit Score in 2023",
      slug: "improve-credit-score-2023",
      content: "Detailed guide on improving your credit score...",
      excerpt: "Expert tips on improving your credit score quickly and effectively to qualify for better credit card offers and rates.",
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
      publishDate: new Date("2023-06-05"),
      category: "Guides"
    });

    // Add default calculators
    this.createCalculator({
      name: "Credit Card Payoff Calculator",
      slug: "credit-card-payoff",
      description: "Calculate how long it will take to pay off your credit card balance.",
      iconName: "credit-card"
    });

    this.createCalculator({
      name: "APR Calculator",
      slug: "apr-calculator",
      description: "Understand the true cost of credit with our APR calculator.",
      iconName: "percentage"
    });

    this.createCalculator({
      name: "Rewards Value Calculator",
      slug: "rewards-value",
      description: "Determine the real value of your credit card rewards and points.",
      iconName: "coins"
    });

    this.createCalculator({
      name: "Balance Transfer Calculator",
      slug: "balance-transfer",
      description: "Compare balance transfer offers and calculate potential savings.",
      iconName: "exchange-alt"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === usernameOrEmail || user.email === usernameOrEmail,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Bank methods
  async getAllBanks(): Promise<Bank[]> {
    return Array.from(this.banks.values());
  }

  async getBank(id: number): Promise<Bank | undefined> {
    return this.banks.get(id);
  }

  async getBankBySlug(slug: string): Promise<Bank | undefined> {
    return Array.from(this.banks.values()).find(
      (bank) => bank.slug === slug,
    );
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const id = this.bankCurrentId++;
    const bank: Bank = { ...insertBank, id };
    this.banks.set(id, bank);
    return bank;
  }

  async updateBank(id: number, updateData: Partial<InsertBank>): Promise<Bank | undefined> {
    const bank = this.banks.get(id);
    if (!bank) return undefined;
    
    const updatedBank: Bank = { ...bank, ...updateData };
    this.banks.set(id, updatedBank);
    return updatedBank;
  }

  async deleteBank(id: number): Promise<boolean> {
    return this.banks.delete(id);
  }

  // Card methods
  async getAllCards(): Promise<Card[]> {
    return Array.from(this.cards.values());
  }

  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async getCardBySlug(slug: string): Promise<Card | undefined> {
    return Array.from(this.cards.values()).find(
      (card) => card.slug === slug,
    );
  }

  async getCardsByCategory(categoryId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.categoryId === categoryId,
    );
  }

  async getCardsByBank(bankId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.bankId === bankId,
    );
  }

  async getFeaturedCards(): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.featured,
    );
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardCurrentId++;
    const card: Card = { ...insertCard, id };
    this.cards.set(id, card);
    return card;
  }

  async updateCard(id: number, updateData: Partial<InsertCard>): Promise<Card | undefined> {
    const card = this.cards.get(id);
    if (!card) return undefined;
    
    const updatedCard: Card = { ...card, ...updateData };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    return this.cards.delete(id);
  }

  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug,
    );
  }

  async getRecentArticles(limit: number): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limit);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    const article: Article = { ...insertArticle, id };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, updateData: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle: Article = { ...article, ...updateData };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  // Calculator methods
  async getAllCalculators(): Promise<Calculator[]> {
    return Array.from(this.calculators.values());
  }

  async getCalculator(id: number): Promise<Calculator | undefined> {
    return this.calculators.get(id);
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    return Array.from(this.calculators.values()).find(
      (calculator) => calculator.slug === slug,
    );
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const id = this.calculatorCurrentId++;
    const calculator: Calculator = { ...insertCalculator, id };
    this.calculators.set(id, calculator);
    return calculator;
  }

  async updateCalculator(id: number, updateData: Partial<InsertCalculator>): Promise<Calculator | undefined> {
    const calculator = this.calculators.get(id);
    if (!calculator) return undefined;
    
    const updatedCalculator: Calculator = { ...calculator, ...updateData };
    this.calculators.set(id, updatedCalculator);
    return updatedCalculator;
  }

  async deleteCalculator(id: number): Promise<boolean> {
    return this.calculators.delete(id);
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    // First try to find by username
    const [user] = await db
      .select()
      .from(users)
      .where(
        eq(users.username, usernameOrEmail)
      );
    
    if (user) return user;
    
    // If not found, try by email
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(
        eq(users.email, usernameOrEmail)
      );
    
    return userByEmail || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Bank methods
  async getAllBanks(): Promise<Bank[]> {
    return await db.select().from(banks);
  }

  async getBank(id: number): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async getBankBySlug(slug: string): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.slug, slug));
    return bank || undefined;
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const [bank] = await db.insert(banks).values(insertBank).returning();
    return bank;
  }

  async updateBank(id: number, updateData: Partial<InsertBank>): Promise<Bank | undefined> {
    const [bank] = await db
      .update(banks)
      .set(updateData)
      .where(eq(banks.id, id))
      .returning();
    return bank || undefined;
  }

  async deleteBank(id: number): Promise<boolean> {
    const result = await db.delete(banks).where(eq(banks.id, id)).returning();
    return result.length > 0;
  }

  // Card methods
  async getAllCards(): Promise<Card[]> {
    return await db.select().from(cards);
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card || undefined;
  }

  async getCardBySlug(slug: string): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.slug, slug));
    return card || undefined;
  }

  async getCardsByCategory(categoryId: number): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.categoryId, categoryId));
  }

  async getCardsByBank(bankId: number): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.bankId, bankId));
  }

  async getFeaturedCards(): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.featured, true));
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const [card] = await db.insert(cards).values(insertCard).returning();
    return card;
  }

  async updateCard(id: number, updateData: Partial<InsertCard>): Promise<Card | undefined> {
    const [card] = await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, id))
      .returning();
    return card || undefined;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id)).returning();
    return result.length > 0;
  }

  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.publishDate));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article || undefined;
  }

  async getRecentArticles(limit: number): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .orderBy(desc(articles.publishDate))
      .limit(limit);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: number, updateData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();
    return article || undefined;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  // Calculator methods
  async getAllCalculators(): Promise<Calculator[]> {
    return await db.select().from(calculators);
  }

  async getCalculator(id: number): Promise<Calculator | undefined> {
    const [calculator] = await db.select().from(calculators).where(eq(calculators.id, id));
    return calculator || undefined;
  }

  async getCalculatorBySlug(slug: string): Promise<Calculator | undefined> {
    const [calculator] = await db.select().from(calculators).where(eq(calculators.slug, slug));
    return calculator || undefined;
  }

  async createCalculator(insertCalculator: InsertCalculator): Promise<Calculator> {
    const [calculator] = await db.insert(calculators).values(insertCalculator).returning();
    return calculator;
  }

  async updateCalculator(id: number, updateData: Partial<InsertCalculator>): Promise<Calculator | undefined> {
    const [calculator] = await db
      .update(calculators)
      .set(updateData)
      .where(eq(calculators.id, id))
      .returning();
    return calculator || undefined;
  }

  async deleteCalculator(id: number): Promise<boolean> {
    const result = await db.delete(calculators).where(eq(calculators.id, id)).returning();
    return result.length > 0;
  }
}

// Initialize the storage
export const storage = new DatabaseStorage();
