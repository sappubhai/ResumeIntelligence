import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { parseResumeWithAI, type ParsedResumeData } from './gemini-simple-fixed';

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
    
    // Use AI to parse the extracted text
    const parsedData = await parseResumeWithAI(textContent);
    
    console.log('Parsed data:', JSON.stringify(parsedData, null, 2));
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw error;
  }
}
