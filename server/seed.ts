import { db } from "./db";
import { users, categories, banks, cards, articles, calculators } from "@shared/schema";
import { eq } from "drizzle-orm";
import { log } from "./vite";

// Seed function to populate the database with initial data
export async function seedDatabase() {
  try {
    log("Starting database seeding process...");
    
    // Check if admin user exists, create if not
    const existingUsers = await db.select().from(users).where(eq(users.username, "admin"));
    if (existingUsers.length === 0) {
      log("Creating admin user...");
      await db.insert(users).values({
        username: "admin",
        email: "admin@creditcardadvisor.com",
        password: "password123", // In a real app, this would be hashed
        isAdmin: true,
      });
    } else {
      log("Admin user already exists, skipping creation...");
    }
    
    // Check if categories exist, create if not
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      log("Creating credit card categories...");
      await db.insert(categories).values([
        { name: "Cashback Cards", slug: "cashback-cards" },
        { name: "Rewards Cards", slug: "rewards-cards" },
        { name: "Travel Cards", slug: "travel-cards" },
        { name: "Fuel Cards", slug: "fuel-cards" },
        { name: "Balance Transfer", slug: "balance-transfer" },
        { name: "Business Cards", slug: "business-cards" }
      ]);
    } else {
      log("Categories already exist, skipping creation...");
    }
    
    // Check if banks exist, create if not
    const existingBanks = await db.select().from(banks);
    if (existingBanks.length === 0) {
      log("Creating banks...");
      await db.insert(banks).values([
        { 
          name: "Chase", 
          slug: "chase",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Chase_logo.svg/200px-Chase_logo.svg.png",
          description: "Chase offers a wide range of credit cards with great rewards and benefits."
        },
        { 
          name: "Citi", 
          slug: "citi",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Citibank_logo.svg/200px-Citibank_logo.svg.png",
          description: "Citi offers a variety of credit cards with competitive rewards and perks."
        },
        { 
          name: "American Express", 
          slug: "american-express",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png",
          description: "American Express provides premium credit cards with exclusive benefits and rewards."
        },
        { 
          name: "Capital One", 
          slug: "capital-one",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Capital_One_logo.svg/200px-Capital_One_logo.svg.png",
          description: "Capital One offers innovative credit cards with great rewards and no annual fees."
        },
        { 
          name: "Discover", 
          slug: "discover",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Discover_Card_logo.svg/200px-Discover_Card_logo.svg.png",
          description: "Discover provides credit cards with cashback rewards and no annual fees."
        },
        { 
          name: "Bank of America", 
          slug: "bank-of-america",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Bank_of_America_logo.svg/200px-Bank_of_America_logo.svg.png",
          description: "Bank of America offers a variety of credit cards with competitive rewards."
        }
      ]);
    } else {
      log("Banks already exist, skipping creation...");
    }
    
    // Get the IDs of banks and categories for cards
    const allBanks = await db.select().from(banks);
    const allCategories = await db.select().from(categories);
    
    // Create a map for easy lookup
    const bankMap = Object.fromEntries(allBanks.map(bank => [bank.slug, bank.id]));
    const categoryMap = Object.fromEntries(allCategories.map(cat => [cat.slug, cat.id]));
    
    // Check if cards exist, create if not
    const existingCards = await db.select().from(cards);
    if (existingCards.length === 0 && Object.keys(bankMap).length > 0 && Object.keys(categoryMap).length > 0) {
      log("Creating credit cards...");
      
      await db.insert(cards).values([
        {
          name: "Citi® Double Cash Card",
          slug: "citi-double-cash-card",
          bankId: bankMap.citi,
          categoryId: categoryMap["cashback-cards"],
          annualFee: "$0",
          introApr: "0% for 18 months",
          regularApr: "14.74% - 24.74%",
          rewardsDescription: "Earn 1% when you buy and 1% when you pay. No categories to track.",
          rating: "4.8",
          featured: true,
          cardColorFrom: "#0066B3",
          cardColorTo: "#0058A0"
        },
        {
          name: "Chase Freedom Unlimited®",
          slug: "chase-freedom-unlimited",
          bankId: bankMap.chase,
          categoryId: categoryMap["cashback-cards"],
          annualFee: "$0",
          introApr: "0% for 15 months",
          regularApr: "15.24% - 23.99%",
          rewardsDescription: "5% on travel, 3% on dining and drugstores, 1.5% on everything else.",
          rating: "4.7",
          featured: true,
          cardColorFrom: "#7B2CBF",
          cardColorTo: "#5A189A"
        },
        {
          name: "Discover it® Cash Back",
          slug: "discover-it-cash-back",
          bankId: bankMap.discover,
          categoryId: categoryMap["cashback-cards"],
          annualFee: "$0",
          introApr: "0% for 14 months",
          regularApr: "13.49% - 24.49%",
          rewardsDescription: "5% cashback in rotating categories (up to quarterly max), 1% on all other purchases.",
          rating: "4.6",
          featured: true,
          cardColorFrom: "#0B8457",
          cardColorTo: "#096C46"
        }
      ]);
    } else {
      log("Credit cards already exist, skipping creation...");
    }
    
    // Check if articles exist, create if not
    const existingArticles = await db.select().from(articles);
    if (existingArticles.length === 0) {
      log("Creating articles...");
      
      await db.insert(articles).values([
        {
          title: "Top Credit Card Reward Programs for Summer Travel",
          slug: "top-credit-card-reward-programs-summer-travel",
          content: "Detailed content about the best credit cards for summer travel...",
          excerpt: "Maximize your summer vacation with these top travel credit cards offering enhanced rewards and perks for the season.",
          imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
          publishDate: new Date("2023-06-15"),
          category: "News"
        },
        {
          title: "Limited Time: Citi Double Cash Offering $200 Welcome Bonus",
          slug: "citi-double-cash-welcome-bonus",
          content: "Detailed information about the Citi Double Cash Card welcome bonus...",
          excerpt: "Citi has launched a special promotion for new cardholders with an increased welcome bonus and additional benefits.",
          imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
          publishDate: new Date("2023-06-10"),
          category: "Offers"
        },
        {
          title: "How to Improve Your Credit Score in 2023",
          slug: "improve-credit-score-2023",
          content: "Detailed guide on improving your credit score...",
          excerpt: "Expert tips on improving your credit score quickly and effectively to qualify for better credit card offers and rates.",
          imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
          publishDate: new Date("2023-06-05"),
          category: "Guides"
        }
      ]);
    } else {
      log("Articles already exist, skipping creation...");
    }
    
    // Check if calculators exist, create if not
    const existingCalculators = await db.select().from(calculators);
    if (existingCalculators.length === 0) {
      log("Creating calculators...");
      
      await db.insert(calculators).values([
        {
          name: "Credit Card Payoff Calculator",
          slug: "credit-card-payoff",
          description: "Calculate how long it will take to pay off your credit card balance.",
          iconName: "credit-card"
        },
        {
          name: "APR Calculator",
          slug: "apr-calculator",
          description: "Understand the true cost of credit with our APR calculator.",
          iconName: "percentage"
        },
        {
          name: "Rewards Value Calculator",
          slug: "rewards-value",
          description: "Determine the real value of your credit card rewards and points.",
          iconName: "coins"
        },
        {
          name: "Balance Transfer Calculator",
          slug: "balance-transfer",
          description: "Compare balance transfer offers and calculate potential savings.",
          iconName: "exchange-alt"
        }
      ]);
    } else {
      log("Calculators already exist, skipping creation...");
    }
    
    log("Database seeding completed successfully!");
  } catch (error) {
    log("Error seeding database: " + error);
    throw error;
  }
}