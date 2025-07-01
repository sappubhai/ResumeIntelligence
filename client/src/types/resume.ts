import type { z } from "zod";

// Base types matching the schema
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
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
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

// Form data type for React Hook Form
export interface ResumeFormData {
  title: string;
  fullName?: string;
  professionalTitle?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  address?: string;
  linkedinId?: string;
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  languages: Language[];
  hobbies?: string;
  additionalInfo?: string;
}

// Template types
export interface ResumeTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  previewImage?: string;
  htmlTemplate: string;
  cssStyles: string;
  isActive: boolean;
}

// API response types
export interface ApiError {
  message: string;
  errors?: any[];
}

export interface FileUploadResponse {
  success: boolean;
  resumeId?: number;
  message?: string;
}

// Utility types
export type SkillLevel = Skill['level'];
export type LanguageProficiency = Language['proficiency'];

// Constants
export const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const LANGUAGE_PROFICIENCIES: LanguageProficiency[] = ['Basic', 'Conversational', 'Fluent', 'Native'];

export const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Database',
  'DevOps',
  'Cloud Computing',
  'Design',
  'Marketing',
  'Project Management',
  'Communication',
  'Leadership',
  'Analytics',
  'Other'
];

export const ACHIEVEMENT_CATEGORIES = [
  'Work',
  'Academic',
  'Professional',
  'Personal',
  'Volunteer',
  'Sports',
  'Awards',
  'Publications',
  'Other'
];
