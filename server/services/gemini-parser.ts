import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the comprehensive ParsedResumeData interface
export interface ParsedResumeData {
  // Basic Profile Information
  fullName?: string;
  professionalTitle?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  address?: string;
  linkedinId?: string;
  summary?: string;
  
  // Career Highlights
  careerHighlights?: string;
  
  // Work Experience
  workExperience?: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    country?: string;
    state?: string;
    city?: string;
    location?: string;
  }>;
  
  // Education
  education?: Array<{
    id: string;
    institution: string;
    board?: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    status: 'Completed' | 'Pursuing';
    scoreType: 'Percentage' | 'CGPA';
    score?: string;
    division?: 'I' | 'II' | 'III';
    country?: string;
    state?: string;
    city?: string;
    description?: string;
  }>;
  
  // Skills with ratings
  skills?: Array<{
    id: string;
    name: string;
    rating: number; // 0-5 stars
    category: string;
  }>;
  
  // Internships
  internships?: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    country?: string;
    state?: string;
    city?: string;
  }>;
  
  // Training & Certifications
  certifications?: Array<{
    id: string;
    name: string;
    issuer?: string;
    status: 'Completed' | 'In Progress';
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  
  // Awards and Honors
  awardsAndHonors?: string;
  
  // Professional Affiliations
  professionalAffiliations?: string;
  
  // Projects
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate?: string;
    url?: string;
    repository?: string;
  }>;
  
  // Extra-Curricular Activities
  extraCurricularActivities?: string;
  
  // Languages with ratings
  languages?: Array<{
    id: string;
    name: string;
    rating: number; // 0-5 stars
  }>;
  
  // Personal Information
  personalInfo?: {
    photo?: string;
    birthdate?: string;
    gender?: 'Male' | 'Female' | 'Other';
    maritalStatus?: 'Single' | 'Married' | 'Other';
    passportNumber?: string;
    nationality?: string;
    additionalDetails?: string;
  };
  
  // Personal Interests
  personalInterests?: string;
  
  // References
  references?: Array<{
    id: string;
    name: string;
    position: string;
    company: string;
    country?: string;
    state?: string;
    city?: string;
    mobile?: string;
    email?: string;
  }>;
  
  // Legacy fields
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
  }>;
  hobbies?: string;
  additionalInfo?: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    // Clean the text to remove invalid characters
    const cleanText = resumeText
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Keep only printable characters
      .trim();

    console.log('Sending to Gemini for parsing...');
    console.log('Text length:', cleanText.length);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert resume parser with intelligent section mapping capabilities. Extract ALL available information from the following resume text and return it in JSON format only. Be thorough and extract as much detail as possible.

INTELLIGENT SECTION MAPPING:
- Map resume sections to their best-fitting categories regardless of header names
- Examples: "Bio" → "summary", "Key Skills" → "skills", "Education Background" → "education", "Work History" → "workExperience", "Trainings" → "certifications", "Personal Details" → "personalInfo"
- Handle both modern and traditional resume formats
- Extract location information and split into country, state, city when possible

IMPORTANT: Return ONLY valid JSON, no additional text or explanation. The JSON must include ALL these fields (use empty arrays/strings if not found):

{
  "fullName": "string",
  "professionalTitle": "string", 
  "email": "string",
  "mobileNumber": "string",
  "dateOfBirth": "string",
  "address": "string",
  "linkedinId": "string",
  "summary": "string",
  "careerHighlights": "string",
  "workExperience": [
    {
      "id": "string",
      "company": "string",
      "position": "string", 
      "startDate": "string",
      "endDate": "string",
      "isCurrent": boolean,
      "description": "string",
      "country": "string",
      "state": "string", 
      "city": "string",
      "location": "string"
    }
  ],
  "education": [
    {
      "id": "string",
      "institution": "string",
      "board": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "status": "Completed",
      "scoreType": "Percentage",
      "score": "string",
      "division": "I",
      "country": "string",
      "state": "string",
      "city": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "id": "string",
      "name": "string",
      "rating": 4,
      "category": "string"
    }
  ],
  "internships": [
    {
      "id": "string",
      "company": "string",
      "position": "string",
      "startDate": "string", 
      "endDate": "string",
      "isCurrent": boolean,
      "description": "string",
      "country": "string",
      "state": "string",
      "city": "string"
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string",
      "issuer": "string",
      "status": "Completed",
      "issueDate": "string",
      "expiryDate": "string",
      "credentialId": "string",
      "url": "string"
    }
  ],
  "awardsAndHonors": "string",
  "professionalAffiliations": "string",
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "startDate": "string",
      "endDate": "string",
      "url": "string",
      "repository": "string"
    }
  ],
  "extraCurricularActivities": "string",
  "languages": [
    {
      "id": "string",
      "name": "string",
      "rating": 4
    }
  ],
  "personalInfo": {
    "photo": "string",
    "birthdate": "string",
    "gender": "Male",
    "maritalStatus": "Single",
    "passportNumber": "string",
    "nationality": "string",
    "additionalDetails": "string"
  },
  "personalInterests": "string",
  "references": [
    {
      "id": "string",
      "name": "string",
      "position": "string",
      "company": "string",
      "country": "string",
      "state": "string",
      "city": "string",
      "mobile": "string",
      "email": "string"
    }
  ],
  "achievements": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "date": "string",
      "category": "string"
    }
  ],
  "hobbies": "string",
  "additionalInfo": "string"
}

Parse this resume and extract all information:

${cleanText}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini Response:', text);

    // Parse the JSON response
    let parsedData: ParsedResumeData;
    try {
      // Clean the response to extract JSON
      const cleanResponse = text.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      console.error('Response was:', text);
      throw new Error('Invalid JSON response from Gemini');
    }

    // Add IDs to array items if they don't exist
    if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
      parsedData.workExperience = parsedData.workExperience.map((exp: any, index: number) => ({
        ...exp,
        id: exp.id || `exp-${index}`,
      }));
    }

    if (parsedData.education && Array.isArray(parsedData.education)) {
      parsedData.education = parsedData.education.map((edu: any, index: number) => ({
        ...edu,
        id: edu.id || `edu-${index}`,
      }));
    }

    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      parsedData.skills = parsedData.skills.map((skill: any, index: number) => ({
        ...skill,
        id: skill.id || `skill-${index}`,
      }));
    }

    if (parsedData.internships && Array.isArray(parsedData.internships)) {
      parsedData.internships = parsedData.internships.map((internship: any, index: number) => ({
        ...internship,
        id: internship.id || `internship-${index}`,
      }));
    }

    if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
      parsedData.certifications = parsedData.certifications.map((cert: any, index: number) => ({
        ...cert,
        id: cert.id || `cert-${index}`,
      }));
    }

    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      parsedData.projects = parsedData.projects.map((project: any, index: number) => ({
        ...project,
        id: project.id || `project-${index}`,
      }));
    }

    if (parsedData.languages && Array.isArray(parsedData.languages)) {
      parsedData.languages = parsedData.languages.map((lang: any, index: number) => ({
        ...lang,
        id: lang.id || `lang-${index}`,
      }));
    }

    if (parsedData.references && Array.isArray(parsedData.references)) {
      parsedData.references = parsedData.references.map((ref: any, index: number) => ({
        ...ref,
        id: ref.id || `ref-${index}`,
      }));
    }

    if (parsedData.achievements && Array.isArray(parsedData.achievements)) {
      parsedData.achievements = parsedData.achievements.map((achievement: any, index: number) => ({
        ...achievement,
        id: achievement.id || `achievement-${index}`,
      }));
    }

    console.log('Successfully parsed resume data:', JSON.stringify(parsedData, null, 2));
    return parsedData;

  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    throw new Error(`Failed to parse resume with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}