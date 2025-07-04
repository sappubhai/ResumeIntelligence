import puppeteer from 'puppeteer';
import type { Resume, Template } from '@shared/schema';
import Handlebars from 'handlebars';

// Register Handlebars helpers
Handlebars.registerHelper('repeat', function(count: number) {
  return new Array(count + 1).join('');
});

Handlebars.registerHelper('subtract', function(a: number, b: number) {
  return a - b;
});

Handlebars.registerHelper('if', function(condition: any, options: any) {
  if (condition) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('each', function(context: any[], options: any) {
  let ret = '';
  if (context && context.length > 0) {
    for (let i = 0; i < context.length; i++) {
      ret += options.fn(context[i]);
    }
  }
  return ret;
});

export async function generateResumeHTML(resume: Resume, template: Template): Promise<string> {
  try {
    // Use the template's HTML and CSS - ensure each template has unique styling
    const templateHtml = template.htmlTemplate;
    const templateCss = template.cssStyles;

    console.log(`Generating preview for template: ${template.name} (ID: ${template.id})`);

    // Use the template's HTML and CSS
    let htmlTemplate = template.htmlTemplate;
    const cssStyles = template.cssStyles;

    // Replace template variables with actual data
    let html = htmlTemplate;

    // Replace basic fields
    html = html.replace(/\{\{fullName\}\}/g, resume.fullName || '');
    html = html.replace(/\{\{professionalTitle\}\}/g, resume.professionalTitle || '');
    html = html.replace(/\{\{email\}\}/g, resume.email || '');
    html = html.replace(/\{\{mobileNumber\}\}/g, resume.mobileNumber || '');
    html = html.replace(/\{\{address\}\}/g, resume.address || '');
    html = html.replace(/\{\{summary\}\}/g, resume.summary || '');

    // Handle work experience array with proper Handlebars-style replacement
    if (resume.workExperience && Array.isArray(resume.workExperience)) {
      const experienceHtml = resume.workExperience.map(exp => {
        let expHtml = `
          <div class="job">
            <h3>${exp.position || ''}</h3>
            <p class="company">${exp.company || ''}</p>
            <p class="dates">${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
            <p>${exp.description || ''}</p>
          </div>
        `;

        // If template has specific structure, try to match it
        if (htmlTemplate.includes('{{position}} at {{company}}')) {
          expHtml = `
            <div class="job">
              <h3>${exp.position || ''} at ${exp.company || ''}</h3>
              <p class="dates">${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
              <p>${exp.description || ''}</p>
            </div>
          `;
        } else if (htmlTemplate.includes('company-location')) {
          expHtml = `
            <div class="job">
              <h3>${exp.position || ''}</h3>
              <p class="company-location">${exp.company || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}</p>
              <p>${exp.description || ''}</p>
            </div>
          `;
        }

        return expHtml;
      }).join('');

      // Replace the handlebars-style loop with actual HTML
      html = html.replace(/\{\{#each workExperience\}\}.*?\{\{\/each\}\}/gs, experienceHtml);
    }

    // Handle education if present
    if (resume.education && Array.isArray(resume.education)) {
      const educationHtml = resume.education.map(edu => {
        return `
          <div class="education-item">
            <h3>${edu.degree || ''}</h3>
            <p class="institution">${edu.institution || ''}</p>
            <p class="dates">${edu.startDate || ''} - ${edu.endDate || 'Present'}</p>
          </div>
        `;
      }).join('');

      html = html.replace(/\{\{#each education\}\}.*?\{\{\/each\}\}/gs, educationHtml);
    }

    // Handle skills if present
    if (resume.skills && Array.isArray(resume.skills)) {
      const skillsHtml = resume.skills.map(skill => {
        return `<span class="skill">${skill.name || skill}</span>`;
      }).join(', ');

      html = html.replace(/\{\{skills\}\}/g, skillsHtml);
    }

    // Combine HTML with CSS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${resume.title || 'Resume'}</title>
          <style>
            ${cssStyles}
            body { margin: 0; padding: 0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    return fullHtml;
  } catch (error) {
    console.error('Error generating resume HTML:', error);
    throw error;
  }
}

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
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    });

    const page = await browser.newPage();

    // Generate HTML content from template and resume data
    const htmlContent = await generateResumeHTML(resume, template);

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

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function formatWorkExperience(workExperience: any[]): string {
  return workExperience.map(exp => `
    <div>
      <h3>${exp.position}</h3>
      <p>${exp.company} - ${exp.startDate} to ${exp.endDate || 'Present'}</p>
      <p>${exp.description || ''}</p>
    </div>
  `).join('');
}

function formatEducation(education: any[]): string {
  return education.map(edu => `
    <div>
      <h3>${edu.degree}</h3>
      <p>${edu.institution} - ${edu.startDate} to ${edu.endDate || 'Present'}</p>
    </div>
  `).join('');
}

function formatSkills(skills: any[]): string {
  return skills.map(skill => `<span>${skill.name}</span>`).join(', ');
}

function formatCertifications(certifications: any[]): string {
  return certifications.map(cert => `
    <div>
      <h4>${cert.name}</h4>
      <p>${cert.issuer} - ${cert.issueDate}</p>
    </div>
  `).join('');
}

function formatProjects(projects: any[]): string {
  return projects.map(project => `
    <div>
      <h5>${project.name}</h5>
      <p>${project.description || ''}</p>
    </div>
  `).join('');
}

function formatLanguages(languages: any[]): string {
  return languages.map(lang => `<span>${lang.name}</span>`).join(', ');
}

function formatReferences(references: any[]): string {
  return references.map(ref => `
    <div>
      <h6>${ref.name}</h6>
      <p>${ref.position} - ${ref.company}</p>
      <p>${ref.email} | ${ref.phone}</p>
    </div>
  `).join('');
}