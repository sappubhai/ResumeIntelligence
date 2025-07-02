-- MySQL Database Schema for Resume Builder
CREATE DATABASE IF NOT EXISTS resume_builder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE resume_builder;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT
);

-- Templates table
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    html_content LONGTEXT NOT NULL,
    css_content LONGTEXT,
    preview_image VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    professional_title VARCHAR(255),
    email VARCHAR(255),
    mobile_number VARCHAR(50),
    date_of_birth DATE,
    address TEXT,
    linkedin_id VARCHAR(255),
    summary TEXT,
    work_experience JSON,
    education JSON,
    skills JSON,
    certifications JSON,
    projects JSON,
    achievements JSON,
    languages JSON,
    hobbies TEXT,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT
);

-- Insert default templates
INSERT INTO templates (name, description, category, html_content, css_content) VALUES
('Professional SAP Consultant', 'Clean and professional template perfect for SAP consultants and technical professionals', 'Professional', 
'<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{fullName}} - Resume</title>
    <style>{{cssContent}}</style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="name">{{fullName}}</h1>
            <p class="title">{{professionalTitle}}</p>
            <div class="contact-info">
                <span>{{email}}</span>
                <span>{{mobileNumber}}</span>
                <span>{{address}}</span>
            </div>
        </header>
        
        <section class="summary">
            <h2>Professional Summary</h2>
            <p>{{summary}}</p>
        </section>
        
        <section class="experience">
            <h2>Work Experience</h2>
            {{#each workExperience}}
            <div class="job">
                <h3>{{position}} at {{company}}</h3>
                <p class="date">{{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}</p>
                <p class="location">{{location}}</p>
                <p>{{description}}</p>
            </div>
            {{/each}}
        </section>
        
        <section class="education">
            <h2>Education</h2>
            {{#each education}}
            <div class="degree">
                <h3>{{degree}} in {{field}}</h3>
                <p>{{institution}}</p>
                <p class="date">{{startDate}} - {{endDate}}</p>
                {{#if gpa}}<p>GPA: {{gpa}}</p>{{/if}}
            </div>
            {{/each}}
        </section>
        
        <section class="skills">
            <h2>Skills</h2>
            <div class="skills-grid">
                {{#each skills}}
                <div class="skill">
                    <span class="skill-name">{{name}}</span>
                    <span class="skill-level">{{level}}</span>
                </div>
                {{/each}}
            </div>
        </section>
    </div>
</body>
</html>',
'* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
.container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
.header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
.name { font-size: 2.5em; color: #007acc; margin-bottom: 10px; }
.title { font-size: 1.3em; color: #666; margin-bottom: 15px; }
.contact-info { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
.contact-info span { background: #f8f9fa; padding: 5px 10px; border-radius: 4px; }
h2 { color: #007acc; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 20px; }
.job, .degree { margin-bottom: 25px; }
.job h3, .degree h3 { color: #333; margin-bottom: 5px; }
.date { color: #666; font-style: italic; }
.location { color: #666; }
.skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.skill { display: flex; justify-content: space-between; background: #f8f9fa; padding: 8px 12px; border-radius: 4px; }
.skill-name { font-weight: 500; }
.skill-level { color: #007acc; font-size: 0.9em; }'),

('Modern Creative', 'Creative and modern template for designers and creative professionals', 'Creative',
'<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{fullName}} - Resume</title>
    <style>{{cssContent}}</style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="profile">
                <h1>{{fullName}}</h1>
                <p class="title">{{professionalTitle}}</p>
            </div>
            <div class="contact">
                <h3>Contact</h3>
                <p>{{email}}</p>
                <p>{{mobileNumber}}</p>
                <p>{{address}}</p>
            </div>
            <div class="skills">
                <h3>Skills</h3>
                {{#each skills}}
                <div class="skill-item">
                    <span>{{name}}</span>
                    <div class="skill-bar">
                        <div class="skill-progress" data-level="{{level}}"></div>
                    </div>
                </div>
                {{/each}}
            </div>
        </div>
        <div class="main-content">
            <section class="summary">
                <h2>About Me</h2>
                <p>{{summary}}</p>
            </section>
            <section class="experience">
                <h2>Experience</h2>
                {{#each workExperience}}
                <div class="job">
                    <h3>{{position}}</h3>
                    <h4>{{company}}</h4>
                    <p class="date">{{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}</p>
                    <p>{{description}}</p>
                </div>
                {{/each}}
            </section>
            <section class="education">
                <h2>Education</h2>
                {{#each education}}
                <div class="degree">
                    <h3>{{degree}} in {{field}}</h3>
                    <h4>{{institution}}</h4>
                    <p class="date">{{startDate}} - {{endDate}}</p>
                </div>
                {{/each}}
            </section>
        </div>
    </div>
</body>
</html>',
'* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Inter", sans-serif; background: #f5f7fa; }
.container { display: flex; min-height: 100vh; max-width: 1000px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
.sidebar { width: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; }
.profile h1 { font-size: 1.8em; margin-bottom: 10px; }
.profile .title { opacity: 0.9; margin-bottom: 30px; }
.contact, .skills { margin-bottom: 30px; }
.contact h3, .skills h3 { font-size: 1.1em; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; }
.skill-item { margin-bottom: 15px; }
.skill-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; margin-top: 5px; }
.skill-progress { height: 100%; background: white; border-radius: 3px; }
.main-content { flex: 1; padding: 40px; }
h2 { color: #333; margin-bottom: 20px; font-size: 1.4em; }
.job, .degree { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
.job h3, .degree h3 { color: #667eea; margin-bottom: 5px; }
.job h4, .degree h4 { color: #666; margin-bottom: 5px; }
.date { color: #999; font-size: 0.9em; margin-bottom: 10px; }');