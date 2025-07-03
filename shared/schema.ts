import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  date,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  role: varchar("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Download statistics
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  resumeId: integer("resume_id").notNull().references(() => resumes.id),
  templateId: integer("template_id").notNull().references(() => templates.id),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Resume templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  previewImage: varchar("preview_image"),
  htmlTemplate: text("html_template").notNull(),
  cssStyles: text("css_styles").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User resumes
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").references(() => templates.id),
  title: varchar("title").notNull(),
  
  // Personal Information
  fullName: varchar("full_name"),
  professionalTitle: varchar("professional_title"),
  email: varchar("email"),
  mobileNumber: varchar("mobile_number"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  linkedinId: varchar("linkedin_id"),
  photoUrl: varchar("photo_url"), // Added photo field
  
  // Professional Summary
  summary: text("summary"),
  
  // JSON fields for complex data
  workExperience: jsonb("work_experience").$type<WorkExperience[]>().default([]),
  education: jsonb("education").$type<Education[]>().default([]),
  skills: jsonb("skills").$type<Skill[]>().default([]),
  certifications: jsonb("certifications").$type<Certification[]>().default([]),
  projects: jsonb("projects").$type<Project[]>().default([]),
  achievements: jsonb("achievements").$type<Achievement[]>().default([]),
  languages: jsonb("languages").$type<Language[]>().default([]),
  internships: jsonb("internships").$type<Internship[]>().default([]),
  references: jsonb("references").$type<Reference[]>().default([]),
  personalInfo: jsonb("personal_info").$type<PersonalInfo>(),
  
  // Text fields for various sections
  careerHighlights: text("career_highlights"),
  awardsAndHonors: text("awards_and_honors"),
  professionalAffiliations: text("professional_affiliations"),
  extraCurricularActivities: text("extra_curricular_activities"),
  personalInterests: text("personal_interests"),
  hobbies: text("hobbies"),
  additionalInfo: text("additional_info"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [resumes.templateId],
    references: [templates.id],
  }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  resumes: many(resumes),
}));

// Type definitions for JSON fields
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  location?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface Education {
  id: string;
  institution: string;
  board?: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  status: 'Completed' | 'Pursuing';
  scoreType: 'Percentage' | 'CGPA';
  score?: string;
  division?: 'I' | 'II' | 'III';
  country?: string;
  state?: string;
  city?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  rating: number; // 0-5 stars
  category: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  status: 'Completed' | 'In Progress';
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  repository?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

export interface Language {
  id: string;
  name: string;
  rating: number; // 0-5 stars
}

export interface Internship {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  country?: string;
  state?: string;
  city?: string;
  mobile?: string;
  email?: string;
}

export interface PersonalInfo {
  photo?: string;
  birthdate?: string;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: 'Single' | 'Married' | 'Other';
  passportNumber?: string;
  nationality?: string;
  additionalDetails?: string;
}

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Download = typeof downloads.$inferSelect;
