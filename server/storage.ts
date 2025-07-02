import {
  users,
  resumes,
  templates,
  type User,
  type Resume,
  type Template,
  type InsertResume,
  type InsertTemplate,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; password: string; name: string }): Promise<User>;
  
  // Session store
  sessionStore: session.Store;
  
  // Resume operations
  getUserResumes(userId: number): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume>;
  deleteResume(id: number): Promise<void>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: false
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: { email: string; password: string; name: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values([userData])
      .returning();
    return newUser;
  }

  // Resume operations
  async getUserResumes(userId: number): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume || undefined;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values([resume])
      .returning();
    return newResume;
  }

  async updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume> {
    const [updatedResume] = await db
      .update(resumes)
      .set({
        ...resume,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning();
    return updatedResume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isActive, true));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }
}

export const storage = new DatabaseStorage();