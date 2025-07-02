import puppeteer from 'puppeteer';
import type { Resume, Template } from '@shared/schema';

export async function generateResumeHTML(resume: Resume, template: Template): Promise<string> {
  return generateHTMLFromTemplate(resume, template);
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

function generateHTMLFromTemplate(resume: Resume, template: Template): string {
  // Generate a complete professional resume HTML based on your attached resume design
  const professionalResumeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${resume.fullName || 'Resume'}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          background: white;
          font-size: 11px;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
        }
        
        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 15px;
        }
        
        .header-left {
          flex: 1;
        }
        
        .header-right {
          text-align: right;
          color: #666;
          font-size: 10px;
        }
        
        .name {
          font-size: 28px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .title {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .contact-info {
          line-height: 1.6;
        }
        
        /* Main Content Layout */
        .main-content {
          display: flex;
          gap: 30px;
        }
        
        .left-column {
          flex: 2;
        }
        
        .right-column {
          flex: 1;
        }
        
        /* Section Headers */
        .section-header {
          background: #0066cc;
          color: white;
          padding: 8px 15px;
          margin: 20px 0 15px 0;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-header.right-column {
          background: #f8f9fa;
          color: #0066cc;
          border-left: 4px solid #0066cc;
        }
        
        /* Work Experience */
        .experience-item {
          margin-bottom: 20px;
          border-left: 3px solid #e9ecef;
          padding-left: 15px;
        }
        
        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .job-title {
          font-weight: bold;
          color: #0066cc;
          font-size: 12px;
        }
        
        .company {
          color: #666;
          font-size: 11px;
        }
        
        .dates {
          color: #666;
          font-size: 10px;
          font-style: italic;
        }
        
        .location {
          color: #888;
          font-size: 10px;
          margin-bottom: 5px;
        }
        
        .description {
          text-align: justify;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        .achievements {
          margin-top: 10px;
        }
        
        .achievements h4 {
          color: #0066cc;
          font-size: 11px;
          margin-bottom: 5px;
        }
        
        .achievements ul {
          padding-left: 15px;
        }
        
        .achievements li {
          margin-bottom: 3px;
          font-size: 10px;
        }
        
        /* Skills */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 5px;
          margin-bottom: 15px;
        }
        
        .skill-item {
          background: #f8f9fa;
          padding: 5px 10px;
          border-left: 3px solid #0066cc;
          font-size: 10px;
          font-weight: 500;
        }
        
        /* Education */
        .education-item {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .education-item:last-child {
          border-bottom: none;
        }
        
        .degree {
          font-weight: bold;
          color: #0066cc;
          font-size: 11px;
        }
        
        .institution {
          color: #666;
          font-size: 10px;
          margin-bottom: 3px;
        }
        
        /* Certifications */
        .cert-item {
          margin-bottom: 10px;
          font-size: 10px;
        }
        
        .cert-name {
          font-weight: bold;
          color: #0066cc;
        }
        
        .cert-issuer {
          color: #666;
        }
        
        /* Languages */
        .languages-list {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .language-item {
          font-size: 10px;
          font-weight: 500;
        }
        
        /* Career Timeline */
        .timeline {
          margin: 20px 0;
        }
        
        .timeline-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 10px;
        }
        
        .timeline-date {
          background: #0066cc;
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          min-width: 100px;
          text-align: center;
          margin-right: 15px;
        }
        
        .timeline-role {
          font-weight: 500;
        }
        
        .timeline-company {
          color: #666;
          margin-left: 10px;
        }
        
        /* Summary Box */
        .summary-box {
          background: #f8f9fa;
          border-left: 4px solid #0066cc;
          padding: 15px;
          margin: 20px 0;
          font-size: 11px;
          line-height: 1.5;
          text-align: justify;
        }
        
        /* Core Competencies */
        .competencies {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        
        .competency-item {
          display: flex;
          align-items: center;
          font-size: 10px;
        }
        
        .competency-item::before {
          content: "▶";
          color: #0066cc;
          margin-right: 8px;
          font-size: 8px;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .container { padding: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <h1 class="name">${resume.fullName || ''}</h1>
            <div class="title">${resume.professionalTitle || ''}</div>
          </div>
          <div class="header-right">
            ${resume.photoUrl ? `
            <div style="float: right; margin-left: 20px;">
              <img src="${resume.photoUrl}" alt="Profile Photo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #0066cc;">
            </div>
            ` : ''}
            <div style="clear: both;">
              ${resume.mobileNumber ? `<div>${resume.mobileNumber}</div>` : ''}
              ${resume.email ? `<div>${resume.email}</div>` : ''}
              ${resume.address ? `<div>${resume.address}</div>` : ''}
              ${resume.linkedinId ? `<div>${resume.linkedinId}</div>` : ''}
              ${resume.dateOfBirth ? `<div>Date of Birth: ${resume.dateOfBirth}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Summary -->
        ${resume.summary ? `
        <div class="summary-box">
          ${resume.summary}
        </div>
        ` : ''}

        <!-- Main Content -->
        <div class="main-content">
          <div class="left-column">
            <!-- Professional Summary & Work Experience -->
            ${(resume.workExperience as any[] || []).length > 0 ? `
            <div class="section-header">Work Experience</div>
            ${(resume.workExperience as any[]).map(exp => `
              <div class="experience-item">
                <div class="experience-header">
                  <div>
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                  </div>
                  <div class="dates">${exp.startDate} - ${exp.isCurrent ? 'Present' : (exp.endDate || '')}</div>
                </div>
                ${exp.location ? `<div class="location">${exp.location}</div>` : ''}
                ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
              </div>
            `).join('')}
            ` : ''}

            <!-- Career Timeline -->
            ${(resume.workExperience as any[] || []).length > 0 ? `
            <div class="section-header">Career Timeline</div>
            <div class="timeline">
              ${(resume.workExperience as any[]).map(exp => `
                <div class="timeline-item">
                  <div class="timeline-date">${exp.startDate} - ${exp.isCurrent ? 'Present' : (exp.endDate || '')}</div>
                  <div class="timeline-role">${exp.position}</div>
                  <div class="timeline-company">${exp.company}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>

          <div class="right-column">
            <!-- Technical Skills -->
            ${(resume.skills as any[] || []).length > 0 ? `
            <div class="section-header right-column">Technical Skills</div>
            <div class="skills-grid">
              ${(resume.skills as any[]).map(skill => `
                <div class="skill-item">${skill.name}</div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Core Competencies -->
            <div class="section-header right-column">Core Competencies</div>
            <div class="competencies">
              <div class="competency-item">SAP Implementation & Development</div>
              <div class="competency-item">Technical Problem Solving</div>
              <div class="competency-item">Client & Stakeholder Management</div>
              <div class="competency-item">Process Analysis & Improvement</div>
              <div class="competency-item">Emerging Technology Adoption</div>
            </div>

            <!-- Certifications -->
            ${(resume.certifications as any[] || []).length > 0 ? `
            <div class="section-header right-column">Certifications</div>
            ${(resume.certifications as any[]).map(cert => `
              <div class="cert-item">
                <div class="cert-name">${cert.name}</div>
                <div class="cert-issuer">${cert.issuer} - ${cert.issueDate}</div>
              </div>
            `).join('')}
            ` : ''}

            <!-- Education -->
            ${(resume.education as any[] || []).length > 0 ? `
            <div class="section-header right-column">Education</div>
            ${(resume.education as any[]).map(edu => `
              <div class="education-item">
                <div class="degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                <div class="institution">${edu.institution}</div>
                <div class="dates">${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}</div>
              </div>
            `).join('')}
            ` : ''}

            <!-- Languages -->
            ${(resume.languages as any[] || []).length > 0 ? `
            <div class="section-header right-column">Languages</div>
            <div class="languages-list">
              ${(resume.languages as any[]).map(lang => `
                <div class="language-item">${lang.name}</div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Achievements -->
            ${(resume.achievements as any[] || []).length > 0 ? `
            <div class="section-header right-column">Achievements</div>
            ${(resume.achievements as any[]).map(achievement => `
              <div class="cert-item">
                <div class="cert-name">${achievement.title}</div>
                <div class="cert-issuer">${achievement.description}</div>
              </div>
            `).join('')}
            ` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return professionalResumeHtml;
}
