# ResumeBuilder Pro - PHP/MySQL Deployment Guide

This document provides instructions for deploying the ResumeBuilder Pro application on shared hosting with PHP and MySQL.

## Architecture Overview

The application has been converted to a PHP/React/MySQL architecture for shared hosting compatibility:

- **Frontend**: React 18 with TypeScript, Vite build system
- **Backend**: PHP 8+ with MySQL database
- **Database**: MySQL with JSON columns for complex data

## File Structure

```
project/
├── backend/                    # PHP backend
│   ├── api/                   # API endpoints
│   │   └── index.php         # Main API router
│   ├── config/               # Configuration files
│   │   ├── database.php      # Database connection
│   │   └── schema.sql        # Database schema
│   ├── controllers/          # API controllers
│   ├── models/              # Data models
│   ├── middleware/          # Authentication middleware
│   ├── utils/               # Utility classes
│   ├── .htaccess            # Apache configuration
│   └── .env.example         # Environment variables template
└── frontend/                 # React frontend
    ├── src/                 # Source code
    ├── dist/                # Built files (after npm run build)
    ├── package.json         # Dependencies
    └── vite.config.ts       # Build configuration
```

## Deployment Instructions

### 1. Database Setup

1. Create a MySQL database on your hosting provider
2. Import the schema from `backend/config/schema.sql`
3. Note your database credentials

### 2. Backend Configuration

1. Upload the `backend/` folder to your web server
2. Copy `.env.example` to `.env` and configure:

```env
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_db_username
DB_PASS=your_db_password
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_random_session_secret
```

3. Ensure the web server has write permissions for session storage
4. Verify `.htaccess` is working for URL rewriting

### 3. Frontend Build and Deploy

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build for production:
```bash
npm run build
```

3. Upload the `frontend/dist/` contents to your web server's public folder
4. Configure your web server to serve the React app

### 4. Web Server Configuration

#### Apache (.htaccess in document root)

```apache
RewriteEngine On

# Handle API routes
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ backend/api/index.php [QSA,L]

# Handle React app (frontend)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Nginx

```nginx
location /api {
    try_files $uri $uri/ /backend/api/index.php?$query_string;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### 5. Required PHP Extensions

Ensure your hosting provider has these PHP extensions enabled:

- PDO and PDO_MySQL
- cURL (for OpenAI API)
- JSON
- ZIP (for DOCX file parsing)
- Session support

### 6. Optional: File Parsing Dependencies

For better resume file parsing, install these utilities on your server:

- `pdftotext` (for PDF parsing)
- `antiword` (for DOC files)
- `pandoc` (for DOCX files)

If these are not available, the application will use basic fallback methods.

## Environment Variables

Required environment variables for the backend:

- `DB_HOST`: MySQL server hostname
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASS`: Database password
- `OPENAI_API_KEY`: OpenAI API key for resume parsing
- `SESSION_SECRET`: Random string for session security

## Security Considerations

1. **File Uploads**: The application limits file uploads to 10MB and only allows PDF, DOC, and DOCX files
2. **Authentication**: Uses PHP sessions with bcrypt password hashing
3. **SQL Injection**: All database queries use prepared statements
4. **CORS**: Configured for same-origin requests
5. **Environment**: Sensitive configuration is stored in `.env` file

## Features Maintained

All original features are preserved:

- ✅ User authentication (registration/login)
- ✅ Resume file upload and AI parsing
- ✅ Resume creation and editing
- ✅ Multiple professional templates
- ✅ PDF generation and download
- ✅ Responsive design
- ✅ User dashboard

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify database credentials in `.env`
2. **API 404 Errors**: Check that `.htaccess` rewriting is working
3. **File Upload Errors**: Ensure PHP `upload_max_filesize` and `post_max_size` are set appropriately
4. **OpenAI Errors**: Verify API key is correct and has sufficient credits
5. **Session Issues**: Check PHP session configuration and permissions

### File Permissions

Ensure these permissions on shared hosting:

- PHP files: 644
- Directories: 755
- `.htaccess`: 644
- Session directory: 755 (writable)

## Support

For deployment issues:

1. Check server error logs
2. Verify PHP version (8.0+ recommended)
3. Test API endpoints manually
4. Check browser console for frontend errors

This deployment guide ensures the application works on most shared hosting providers with standard PHP and MySQL support.