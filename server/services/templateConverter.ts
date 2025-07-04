import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ConvertedTemplate {
  name: string;
  description: string;
  html: string;
  css: string;
}

export async function convertTemplateFromFile(
  buffer: Buffer, 
  mimetype: string, 
  templateName: string,
  templateDescription: string
): Promise<ConvertedTemplate> {
  try {
    // Step 1: Extract text and basic structure from document
    let textContent = '';
    let structuralInfo = '';

    if (mimetype === 'application/pdf') {
      const result = await extractFromPDF(buffer);
      textContent = result.text;
      structuralInfo = result.structure;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await extractFromWord(buffer);
      textContent = result.text;
      structuralInfo = result.structure;
    } else {
      throw new Error('Unsupported file format');
    }

    // Step 2: Use AI to analyze and convert to HTML template
    const { html, css } = await convertToHTMLTemplate(textContent, structuralInfo);

    return {
      name: templateName,
      description: templateDescription,
      html,
      css
    };
  } catch (error) {
    console.error('Error converting template:', error);
    throw new Error(`Failed to convert template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractFromPDF(buffer: Buffer) {
  const typedArray = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: typedArray });
  const pdf = await loadingTask.promise;

  let fullText = '';
  let structuralInfo = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Extract text with position info for structure analysis
    const textItems = textContent.items.map((item: any) => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height,
      fontSize: item.height
    }));

    // Analyze structure based on positioning and font sizes
    const pageText = textItems.map(item => item.text).join(' ');
    fullText += pageText + '\n';

    // Identify headers by font size and position
    const headers = textItems.filter(item => item.fontSize > 14);
    structuralInfo += `Page ${pageNum} headers: ${headers.map(h => h.text).join(', ')}\n`;
  }

  return { text: fullText, structure: structuralInfo };
}

async function extractFromWord(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const htmlResult = await mammoth.convertToHtml({ buffer });

  // Extract structure from HTML
  const structuralInfo = extractWordStructure(htmlResult.value);

  return { 
    text: result.value, 
    structure: structuralInfo 
  };
}

function extractWordStructure(html: string): string {
  const headerMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
  const headers = headerMatches.map(match => match.replace(/<[^>]*>/g, ''));

  const strongMatches = html.match(/<strong[^>]*>(.*?)<\/strong>/gi) || [];
  const boldText = strongMatches.map(match => match.replace(/<[^>]*>/g, ''));

  return `Headers: ${headers.join(', ')}\nBold text: ${boldText.join(', ')}`;
}

async function convertToHTMLTemplate(textContent: string, structuralInfo: string): Promise<{ html: string, css: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert web developer specializing in resume template conversion. Convert the following resume document into a professional HTML template with corresponding CSS.

TASK: Create an HTML template that replicates the visual layout and styling of the original document as closely as possible (90%+ accuracy).

REQUIREMENTS:
1. Use placeholder variables in {{variableName}} format for dynamic content
2. Maintain the original layout structure, spacing, and visual hierarchy
3. Create responsive design that works on different screen sizes
4. Use modern CSS techniques (flexbox, grid where appropriate)
5. Ensure professional typography and spacing
6. Include all sections present in the original document

PLACEHOLDER VARIABLES TO USE:
{{fullName}}, {{professionalTitle}}, {{email}}, {{mobileNumber}}, {{address}}, {{linkedinId}}, {{summary}}, {{workExperience}}, {{education}}, {{skills}}, {{certifications}}, {{projects}}, {{languages}}, {{references}}, {{personalInfo}}

STRUCTURAL ANALYSIS:
${structuralInfo}

DOCUMENT CONTENT:
${textContent}

RESPONSE FORMAT: Return a JSON object with "html" and "css" properties. The HTML should be a complete template structure, and CSS should provide professional styling that matches the original layout.

Example structure:
{
  "html": "<div class='resume-template'>...</div>",
  "css": ".resume-template { ... }"
}

Focus on:
- Font hierarchy and sizes
- Section spacing and margins
- Color scheme (professional)
- Layout structure (single/multi-column)
- Headers and dividers
- Contact information layout
- List styling for experience/education
- Skills presentation format`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    const cleanResponse = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanResponse);
    return {
      html: parsed.html || generateFallbackHTML(),
      css: parsed.css || generateFallbackCSS()
    };
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    // Return fallback template
    return {
      html: generateFallbackHTML(),
      css: generateFallbackCSS()
    };
  }
}

function generateFallbackHTML(): string {
  return `
    <div class="resume-template">
      <header class="resume-header">
        <div class="header-content">
          <h1 class="full-name">{{fullName}}</h1>
          <h2 class="professional-title">{{professionalTitle}}</h2>
          <div class="contact-info">
            <span class="email">{{email}}</span>
            <span class="phone">{{mobileNumber}}</span>
            <span class="address">{{address}}</span>
            {{#if linkedinId}}<span class="linkedin">{{linkedinId}}</span>{{/if}}
          </div>
        </div>
      </header>

      {{#if summary}}
      <section class="summary-section">
        <h3>Professional Summary</h3>
        <p>{{summary}}</p>
      </section>
      {{/if}}

      {{#if workExperience}}
      <section class="experience-section">
        <h3>Work Experience</h3>
        {{#each workExperience}}
        <div class="experience-item">
          <h4>{{position}} - {{company}}</h4>
          <p class="date-range">{{startDate}} - {{#if isCurrent}}Present{{else}}{{endDate}}{{/if}}</p>
          <p class="description">{{description}}</p>
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if education}}
      <section class="education-section">
        <h3>Education</h3>
        {{#each education}}
        <div class="education-item">
          <h4>{{degree}} in {{field}}</h4>
          <p class="institution">{{institution}}</p>
          <p class="date-range">{{startDate}} - {{endDate}}</p>
        </div>
        {{/each}}
      </section>
      {{/if}}

      {{#if skills}}
      <section class="skills-section">
        <h3>Skills</h3>
        <div class="skills-grid">
          {{#each skills}}
          <div class="skill-item">
            <span class="skill-name">{{name}}</span>
            <div class="skill-rating">
              {{#repeat rating}}★{{/repeat}}{{#repeat (subtract 5 rating)}}☆{{/repeat}}
            </div>
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </div>
  `;
}

function generateFallbackCSS(): string {
  return `
    .resume-template {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      color: #333;
      line-height: 1.6;
      background: white;
    }

    .resume-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .full-name {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .professional-title {
      font-size: 1.4rem;
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
      font-weight: 300;
    }

    .contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.95rem;
    }

    .contact-info span {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .summary-section,
    .experience-section,
    .education-section,
    .skills-section {
      margin-bottom: 2.5rem;
      background: #ffffff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #667eea;
    }

    .summary-section h3,
    .experience-section h3,
    .education-section h3,
    .skills-section h3 {
      font-size: 1.4rem;
      color: #2c3e50;
      margin: 0 0 1.5rem 0;
      font-weight: 600;
      position: relative;
      padding-bottom: 0.75rem;
    }

    .summary-section h3:after,
    .experience-section h3:after,
    .education-section h3:after,
    .skills-section h3:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }

    .experience-item,
    .education-item {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #667eea;
      transition: transform 0.2s ease;
    }

    .experience-item:hover,
    .education-item:hover {
      transform: translateX(5px);
    }

    .experience-item h4,
    .education-item h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1.15rem;
      font-weight: 600;
    }

    .date-range {
      color: #667eea;
      font-size: 0.9rem;
      margin: 0 0 0.75rem 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .description {
      color: #555;
      margin: 0;
      line-height: 1.6;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .skill-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s ease;
    }

    .skill-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
    }

    @media print {
      .resume-template {
        padding: 0.25in;
      }
      .resume-header {
        background: #667eea !important;
        -webkit-print-color-adjust: exact;
      }
    }
  `;
}