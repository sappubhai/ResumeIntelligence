import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { parseResumeWithAI, type ParsedResumeData } from './gemini-parser';

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's not a 503 error or if we've exceeded max retries
      if (i === maxRetries || !error.message?.includes('503') && !error.message?.includes('overloaded')) {
        break;
      }
      
      // Exponential backoff: wait longer between each retry
      const delay = baseDelay * Math.pow(2, i);
      console.log(`API overloaded, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Fallback parser that creates basic structure from extracted text
function createFallbackParsedData(textContent: string): ParsedResumeData {
  // Extract basic information using simple text parsing
  const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try to find email
  const emailMatch = textContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Try to find phone number
  const phoneMatch = textContent.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/);
  
  // Try to find name (usually first line or after certain keywords)
  let fullName = '';
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 50 && !line.includes('@') && !line.match(/\d{4,}/)) {
      fullName = line;
      break;
    }
  }
  
  return {
    fullName: fullName || 'Extracted Resume',
    email: emailMatch ? emailMatch[0] : '',
    mobileNumber: phoneMatch ? phoneMatch[0] : '',
    summary: `AI parsing temporarily unavailable. Please manually edit this resume. Original text length: ${textContent.length} characters.`,
    workExperience: [],
    education: [],
    skills: [],
    internships: [],
    certifications: [],
    projects: [],
    languages: [],
    professionalAffiliations: '',
    extraCurricularActivities: '',
    careerHighlights: '',
    personalInfo: {
      maritalStatus: undefined,
      passportNumber: '',
      nationality: '',
      additionalDetails: textContent.substring(0, 1000) + (textContent.length > 1000 ? '...' : '')
    },
    personalInterests: '',
    references: [],
    achievements: [],
    hobbies: '',
    additionalInfo: 'This resume was uploaded when AI parsing was temporarily unavailable. Please review and edit all sections manually.'
  };
}

export async function parseResumeFile(buffer: Buffer, mimetype: string): Promise<ParsedResumeData> {
  let textContent = '';
  
  try {
    if (mimetype === 'application/pdf') {
      // Parse PDF using pdfjs-dist
      const typedArray = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      textContent = fullText;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      textContent = result.value;
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or Word document.');
    }

    if (!textContent.trim()) {
      throw new Error('No text content found in the uploaded file.');
    }

    // Log the extracted text for debugging
    console.log('Extracted text length:', textContent.length);
    console.log('First 500 characters:', textContent.substring(0, 500));
    
    // Use AI to parse the extracted text with retry logic
    try {
      console.log('Sending to Gemini for parsing...');
      const parsedData = await retryWithBackoff(() => parseResumeWithAI(textContent));
      console.log('✅ Successfully parsed resume with AI');
      return parsedData;
    } catch (aiError: any) {
      console.error('❌ AI parsing failed after retries:', aiError.message);
      console.log('🔄 Using fallback parser...');
      
      // Use fallback parser if AI fails
      const fallbackData = createFallbackParsedData(textContent);
      console.log('✅ Resume parsed with fallback method');
      return fallbackData;
    }
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw error;
  }
}
