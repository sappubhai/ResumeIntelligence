
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
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    
    .resume-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563eb;
    }
    
    .full-name {
      font-size: 2.5em;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1e40af;
    }
    
    .professional-title {
      font-size: 1.4em;
      color: #64748b;
      margin: 0 0 20px 0;
      font-weight: normal;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 0.95em;
    }
    
    .contact-info span {
      padding: 5px 0;
    }
    
    .resume-template section {
      margin-bottom: 35px;
    }
    
    .resume-template h3 {
      font-size: 1.4em;
      color: #1e40af;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-item, .education-item {
      margin-bottom: 25px;
    }
    
    .experience-item h4, .education-item h4 {
      font-size: 1.1em;
      margin: 0 0 5px 0;
      color: #374151;
    }
    
    .date-range {
      font-style: italic;
      color: #6b7280;
      margin: 0 0 10px 0;
      font-size: 0.9em;
    }
    
    .description {
      margin: 10px 0;
      text-align: justify;
    }
    
    .institution {
      color: #6b7280;
      margin: 0 0 5px 0;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .skill-name {
      font-weight: 500;
    }
    
    .skill-rating {
      color: #fbbf24;
      font-size: 1.1em;
    }
    
    @media (max-width: 768px) {
      .resume-template {
        padding: 20px;
      }
      
      .contact-info {
        flex-direction: column;
        gap: 10px;
      }
      
      .full-name {
        font-size: 2em;
      }
      
      .skills-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}
