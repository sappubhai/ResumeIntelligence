import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin"))
      .limit(1);

    if (existingAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin", 10);
      
      await db.insert(users).values({
        email: "admin",
        password: hashedPassword,
        name: "Administrator",
        role: "admin",
        isActive: true
      });

      console.log("✅ Default admin user created:");
      console.log("   Email: admin");
      console.log("   Password: admin");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Failed to initialize admin user:", error);
  }
}