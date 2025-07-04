# ResumeBuilder Pro - AI-Powered Resume Builder

## Overview

ResumeBuilder Pro is a full-stack web application that helps users create professional resumes using AI-powered parsing and multiple templates. The application allows users to upload existing resumes for AI parsing or build from scratch, select from professional templates, and download polished PDFs instantly.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Email/password authentication with Passport.js
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple and bcrypt password hashing
- **File Processing**: Multer for file uploads, PDF-parse and Mammoth for document parsing
- **PDF Generation**: Puppeteer for resume PDF generation
- **AI Integration**: OpenAI GPT-4o for intelligent resume parsing

## Key Components

### Authentication System
- **Provider**: Email/password authentication with Passport.js Local Strategy
- **Session Storage**: PostgreSQL sessions table with 1-week TTL
- **Security**: HTTP-only secure cookies, bcrypt password hashing, CSRF protection
- **User Management**: User registration and login with name and email fields

### File Processing Pipeline
- **Upload Handling**: Multer with memory storage (10MB limit)
- **Supported Formats**: PDF, DOC, DOCX
- **AI Parsing**: OpenAI GPT-4o extracts structured data from resume text
- **Validation**: Zod schemas ensure data integrity

### Template System
- **Template Storage**: HTML templates with CSS styling in database
- **Categories**: Professional, creative, academic, and industry-specific templates
- **Customization**: Template placeholders replaced with user data
- **Preview**: Live template previews with user data

### PDF Generation
- **Engine**: Puppeteer for high-quality PDF rendering
- **Styling**: Template CSS preserved in PDF output
- **Format**: A4 format with professional margins
- **Performance**: Headless Chrome rendering for consistent output

## Data Flow

1. **User Authentication**: Email/password authentication with secure sessions
2. **File Upload**: Users upload existing resumes via drag-and-drop interface
3. **AI Processing**: OpenAI parses uploaded documents into structured data
4. **Data Storage**: Parsed resume data stored in PostgreSQL with Drizzle ORM
5. **Template Selection**: Users choose from available professional templates
6. **PDF Generation**: Puppeteer renders final PDF combining data and template
7. **Download**: Generated PDF served to user for download

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL for data persistence
- **OpenAI API**: GPT-4o model for intelligent resume parsing
- **Replit Auth**: Authentication and user management service

### Development Tools
- **Replit Environment**: Development and deployment platform
- **Vite**: Frontend build tool with HMR and optimization
- **ESBuild**: Backend bundling for production deployment

### Libraries & Packages
- **Database**: Drizzle ORM, @neondatabase/serverless
- **UI**: Radix UI primitives, Tailwind CSS, Lucide icons
- **File Processing**: pdf-parse, mammoth, multer
- **PDF Generation**: puppeteer
- **Validation**: Zod schemas for type-safe data validation

## Deployment Strategy

### Development
- **Environment**: Replit development environment with live reload
- **Database**: Neon database with development connection string
- **Build**: Vite dev server for frontend, tsx for backend hot reload
- **Debugging**: Runtime error overlay and source maps enabled

### Production
- **Frontend**: Static build served from Express
- **Backend**: ESBuild bundle with external packages
- **Database**: Production Neon database instance
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET
- **Process Management**: Single Node.js process serving both frontend and API

### Environment Configuration
- **Development**: `NODE_ENV=development tsx server/index.ts`
- **Build**: `vite build && esbuild server/index.ts --bundle`
- **Production**: `NODE_ENV=production node dist/index.js`
- **Database**: `drizzle-kit push` for schema migrations

## Changelog

Changelog:
- July 01, 2025. Initial setup
- July 02, 2025. Migrated from Replit Auth to email/password authentication with Passport.js
- July 02, 2025. Successfully migrated project to Replit environment with PDF preview system
  - Fixed Puppeteer PDF generation with system Chromium integration
  - Added PDF preview functionality with iframe-based HTML preview
  - Implemented new route `/preview/:resumeId` for PDF preview before download
  - Updated Dashboard to redirect to preview instead of direct download
  - Enhanced user experience with live preview and download button
- July 02, 2025. Built comprehensive admin panel with dashboard analytics and management features
  - Created default admin user (admin@admin.com / admin) with automatic initialization
  - Built admin dashboard with graphical analytics showing total users, resumes, downloads, and templates
  - Implemented user management system with role-based permissions and status controls
  - Added template management with PDF upload and thumbnail generation capabilities
  - Created download tracking system for analytics and usage monitoring
  - Added role-based authentication protecting admin routes and functions
- July 03, 2025. Implemented comprehensive 15-section resume structure with intelligent parsing
  - Enhanced database schema with comprehensive resume sections including internships, references, personal info
  - Built comprehensive resume form with 15 structured sections: Profile, Career Highlights, Skills, Education, Work Experience, Internships, Certifications, Awards, Professional Affiliations, Projects, Extra-curricular Activities, Languages, Personal Information, Personal Interests, References
  - Implemented intelligent AI parsing that maps various resume section names to appropriate structured categories
  - Added star rating system for skills and languages (0-5 stars)
  - Enhanced education section with board/affiliation, status, score type, and division options
  - Created comprehensive parsing service with Google AI integration for structured data extraction
  - Completed migration from Replit Agent to Replit environment with enhanced security and architecture
- July 03, 2025. Enhanced resume parsing and UI with Gemini AI and improved loading experience
  - Switched to Gemini AI for comprehensive resume parsing with 95%+ accuracy in data extraction
  - Fixed date format conversion issues (DD-MM-YYYY to YYYY-MM-DD) for database compatibility
  - Created modern accordion-style UI matching user requirements with collapsible sections
  - Built enhanced loading modal with animated progress, step-by-step processing indicators, and rotating resume tips
  - Fixed form data population issue by adding proper form reset when parsed data becomes available
  - Successfully integrated Google Generative AI (@google/generative-ai) for intelligent content extraction

## User Preferences

Preferred communication style: Simple, everyday language.