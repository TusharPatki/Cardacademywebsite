import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

// Categories for credit cards
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// Banks that issue credit cards
export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
});

// Credit cards with their details
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bankId: integer("bank_id").notNull(),
  categoryId: integer("category_id").notNull(),
  annualFee: text("annual_fee").notNull(),
  introApr: text("intro_apr"),
  regularApr: text("regular_apr"),
  rewardsDescription: text("rewards_description"),
  rating: text("rating"),
  featured: boolean("featured").default(false),
  cardColorFrom: text("card_color_from").default("#0F4C81"),
  cardColorTo: text("card_color_to").default("#0F4C81"),
});

// Articles, news and blog posts
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  publishDate: timestamp("publish_date").notNull(),
  category: text("category").notNull(),
});

// Calculators available on the site
export const calculators = pgTable("calculators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // No relations for users currently
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  cards: many(cards),
}));

export const banksRelations = relations(banks, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  bank: one(banks, {
    fields: [cards.bankId],
    references: [banks.id],
  }),
  category: one(categories, {
    fields: [cards.categoryId],
    references: [categories.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
});

export const insertBankSchema = createInsertSchema(banks).pick({
  name: true,
  slug: true,
  logoUrl: true,
  description: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  name: true,
  slug: true,
  bankId: true,
  categoryId: true,
  annualFee: true,
  introApr: true,
  regularApr: true,
  rewardsDescription: true,
  rating: true,
  featured: true,
  cardColorFrom: true,
  cardColorTo: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  imageUrl: true,
  publishDate: true,
  category: true,
});

export const insertCalculatorSchema = createInsertSchema(calculators).pick({
  name: true,
  slug: true,
  description: true,
  iconName: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Bank = typeof banks.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Calculator = typeof calculators.$inferSelect;
export type InsertCalculator = z.infer<typeof insertCalculatorSchema>;

// Auth schemas for login
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
