import { db } from "../db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * A migration script to add the email field to existing users
 */
export async function addEmailFieldToUsers() {
  try {
    console.log("Checking if email column exists...");
    
    // First check if the column exists
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'email';
    `);
    
    if (result.rows.length === 0) {
      console.log("Email column doesn't exist, adding it...");
      
      // Add the email column if it doesn't exist
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN email TEXT UNIQUE;
      `);
      
      console.log("Email column added successfully");
      
      // Update existing users with generated email addresses based on username
      console.log("Updating existing users with default email addresses...");
      
      const allUsers = await db.select().from(users);
      
      for (const user of allUsers) {
        const email = `${user.username}@example.com`;
        await db
          .update(users)
          .set({ email })
          .where(sql`id = ${user.id}`);
      }
      
      console.log("Existing users updated with default emails");
      
      // Now make the email column NOT NULL
      await db.execute(sql`
        ALTER TABLE users
        ALTER COLUMN email SET NOT NULL;
      `);
      
      console.log("Email column set to NOT NULL");
    } else {
      console.log("Email column already exists, skipping migration");
    }
    
    return { success: true, message: "Email migration completed successfully" };
  } catch (error) {
    console.error("Error in email migration:", error);
    return { success: false, message: "Email migration failed", error };
  }
}