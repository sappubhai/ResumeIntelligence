import puppeteer from 'puppeteer';
import type { Resume, Template } from '@shared/schema';

export async function generateResumePDF(resume: Resume, template: Template): Promise<Buffer> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    
    const page = await browser.newPage();
    
    // Generate HTML content from template and resume data
    const htmlContent = generateHTMLFromTemplate(resume, template);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateHTMLFromTemplate(resume: Resume, template: Template): string {
  // Replace template placeholders with resume data
  let html = template.htmlTemplate;
  
  // Personal Information
  html = html.replace(/{{fullName}}/g, resume.fullName || '');
  html = html.replace(/{{professionalTitle}}/g, resume.professionalTitle || '');
  html = html.replace(/{{email}}/g, resume.email || '');
  html = html.replace(/{{mobileNumber}}/g, resume.mobileNumber || '');
  html = html.replace(/{{address}}/g, resume.address || '');
  html = html.replace(/{{linkedinId}}/g, resume.linkedinId || '');
  html = html.replace(/{{summary}}/g, resume.summary || '');
  html = html.replace(/{{hobbies}}/g, resume.hobbies || '');
  html = html.replace(/{{additionalInfo}}/g, resume.additionalInfo || '');
  
  // Work Experience
  const workExperienceHtml = (resume.workExperience as any[] || []).map(exp => `
    <div class="experience-item">
      <h3>${exp.position}</h3>
      <h4>${exp.company}</h4>
      <p class="dates">${exp.startDate} - ${exp.isCurrent ? 'Present' : (exp.endDate || '')}</p>
      ${exp.location ? `<p class="location">${exp.location}</p>` : ''}
      <p class="description">${exp.description}</p>
    </div>
  `).join('');
  html = html.replace(/{{workExperience}}/g, workExperienceHtml);
  
  // Education
  const educationHtml = (resume.education as any[] || []).map(edu => `
    <div class="education-item">
      <h3>${edu.degree} in ${edu.field}</h3>
      <h4>${edu.institution}</h4>
      <p class="dates">${edu.startDate} - ${edu.endDate || ''}</p>
      ${edu.gpa ? `<p class="gpa">GPA: ${edu.gpa}</p>` : ''}
      ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
    </div>
  `).join('');
  html = html.replace(/{{education}}/g, educationHtml);
  
  // Skills
  const skillsHtml = (resume.skills as any[] || []).map(skill => `
    <span class="skill-item">${skill.name}</span>
  `).join('');
  html = html.replace(/{{skills}}/g, skillsHtml);
  
  // Projects
  const projectsHtml = (resume.projects as any[] || []).map(project => `
    <div class="project-item">
      <h3>${project.name}</h3>
      <p class="description">${project.description}</p>
      <p class="technologies">Technologies: ${project.technologies.join(', ')}</p>
      ${project.url ? `<p class="url"><a href="${project.url}">${project.url}</a></p>` : ''}
    </div>
  `).join('');
  html = html.replace(/{{projects}}/g, projectsHtml);
  
  // Add CSS styles
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${template.cssStyles}
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
  
  return fullHtml;
}
