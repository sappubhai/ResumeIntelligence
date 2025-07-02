# ResumeBuilder Pro - AI-Powered Resume Builder

## Overview

ResumeBuilder Pro is a full-stack web application that helps users create professional resumes using AI-powered parsing and multiple templates. The application has been migrated to a PHP/React/MySQL architecture for shared hosting compatibility while maintaining all original functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Tailwind CSS for styling and responsive design
- **Build Tool**: Vite for development and production builds
- **Deployment**: Static build served from shared hosting

### Backend Architecture
- **Runtime**: PHP 8+ for shared hosting compatibility
- **API**: RESTful API with custom PHP router
- **Database**: MySQL with JSON columns for complex data structures
- **Authentication**: PHP sessions with bcrypt password hashing
- **File Processing**: Native PHP file handling with shell utilities fallback
- **PDF Generation**: wkhtmltopdf with TCPDF fallback for resume generation
- **AI Integration**: OpenAI GPT-4o for intelligent resume parsing via cURL

## Key Components

### Authentication System
- **Provider**: PHP native sessions with email/password authentication
- **Session Storage**: PHP sessions with configurable storage backend
- **Security**: Bcrypt password hashing, session security, input validation
- **User Management**: User registration and login with MySQL user storage

### File Processing Pipeline
- **Upload Handling**: PHP native file upload handling (10MB limit)
- **Supported Formats**: PDF, DOC, DOCX
- **AI Parsing**: OpenAI GPT-4o extracts structured data via cURL requests
- **Text Extraction**: Shell utilities (pdftotext, antiword, pandoc) with PHP fallbacks

### Template System
- **Template Storage**: HTML/CSS templates stored in MySQL database
- **Categories**: Professional, creative, academic, and industry-specific templates
- **Customization**: Server-side template rendering with data replacement
- **Preview**: Template metadata for frontend preview display

### PDF Generation
- **Engine**: wkhtmltopdf for high-quality PDF rendering with TCPDF fallback
- **Styling**: Template CSS preserved in PDF output
- **Format**: A4 format with professional margins
- **Performance**: Server-side rendering optimized for shared hosting

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
- **MySQL Database**: Relational database for data persistence (shared hosting compatible)
- **OpenAI API**: GPT-4o model for intelligent resume parsing
- **Shared Hosting**: Standard LAMP stack hosting environment

### Development Tools
- **Vite**: Frontend build tool with HMR and optimization for React
- **Local Development**: Replit environment for development and testing
- **Production**: Standard shared hosting with PHP and MySQL

### Libraries & Packages
- **Frontend**: React, TanStack Query, Wouter, Tailwind CSS
- **Backend**: Native PHP with PDO, cURL for API requests
- **File Processing**: Shell utilities (pdftotext, antiword, pandoc) with PHP fallbacks
- **PDF Generation**: wkhtmltopdf with TCPDF fallback option
- **Database**: MySQL with JSON column support for complex data structures

## Deployment Strategy

### Development
- **Environment**: Replit development environment with original Node.js stack
- **Database**: PostgreSQL for development and testing
- **Build**: Vite dev server for frontend development
- **Testing**: Full-stack testing in Replit environment

### Production (Shared Hosting)
- **Frontend**: Vite build output served as static files
- **Backend**: PHP files deployed to shared hosting server
- **Database**: MySQL database with imported schema
- **Environment Variables**: DB_HOST, DB_NAME, DB_USER, DB_PASS, OPENAI_API_KEY, SESSION_SECRET
- **Web Server**: Apache with .htaccess URL rewriting

### Environment Configuration
- **Development**: Original Node.js/Express stack in Replit
- **Build Frontend**: `cd frontend && npm run build`
- **Deploy Backend**: Upload PHP files to shared hosting
- **Database Setup**: Import `backend/config/schema.sql` to MySQL
- **Configuration**: Create `.env` file with production credentials

## Changelog

- July 01, 2025: Initial setup with Node.js/Express/PostgreSQL
- July 02, 2025: Migrated from Replit Auth to email/password authentication with Passport.js
- July 02, 2025: **Major Architecture Migration** - Converted entire application from Node.js/Express/PostgreSQL to PHP/React/MySQL for shared hosting compatibility:
  - Created complete PHP backend with MVC architecture
  - Maintained all original functionality (authentication, file upload, AI parsing, PDF generation)
  - Restructured frontend as standalone React application
  - Added MySQL database schema with JSON columns
  - Created deployment documentation for shared hosting
  - Preserved user experience and feature parity

## User Preferences

Preferred communication style: Simple, everyday language.