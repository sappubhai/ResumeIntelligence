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
    // Compile the Handlebars template
    const htmlTemplate = Handlebars.compile(template.htmlTemplate);

    // Prepare data for template
    const templateData = {
      fullName: resume.fullName || '',
      professionalTitle: resume.professionalTitle || '',
      email: resume.email || '',
      mobileNumber: resume.mobileNumber || '',
      address: resume.address || '',
      linkedinId: resume.linkedinId || '',
      summary: resume.summary || '',
      workExperience: resume.workExperience || [],
      education: resume.education || [],
      skills: resume.skills || [],
      certifications: resume.certifications || [],
      projects: resume.projects || [],
      languages: resume.languages || [],
      references: resume.references || [],
      personalInfo: resume.personalInfo || {},
    };

    // Render the template with data
    const html = htmlTemplate(templateData);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${template.cssStyles}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  } catch (error) {
    console.error('Error rendering template:', error);
    // Fallback to simple replacement
    return generateFallbackHTML(resume, template);
  }
}

function generateFallbackHTML(resume: Resume, template: Template): string {
  let html = template.htmlTemplate;
  let css = template.cssStyles;

  // Replace placeholders with actual data
  const replacements: Record<string, string> = {
    '{{fullName}}': resume.fullName || '',
    '{{professionalTitle}}': resume.professionalTitle || '',
    '{{email}}': resume.email || '',
    '{{mobileNumber}}': resume.mobileNumber || '',
    '{{address}}': resume.address || '',
    '{{linkedinId}}': resume.linkedinId || '',
    '{{summary}}': resume.summary || '',
    '{{workExperience}}': formatWorkExperience(resume.workExperience || []),
    '{{education}}': formatEducation(resume.education || []),
    '{{skills}}': formatSkills(resume.skills || []),
    '{{certifications}}': formatCertifications(resume.certifications || []),
    '{{projects}}': formatProjects(resume.projects || []),
    '{{languages}}': formatLanguages(resume.languages || []),
    '{{references}}': formatReferences(resume.references || []),
  };

  // Replace all placeholders
  Object.entries(replacements).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
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