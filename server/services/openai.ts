import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-openai-api-key" 
});

export interface ParsedResumeData {
  fullName?: string;
  professionalTitle?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  address?: string;
  linkedinId?: string;
  summary?: string;
  workExperience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    location?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    description?: string;
  }>;
  skills?: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    category: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate?: string;
    url?: string;
    repository?: string;
  }>;
  achievements?: Array<{
    title: string;
    description: string;
    date: string;
    category: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  }>;
  hobbies?: string;
  additionalInfo?: string;
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    const prompt = `
You are an expert resume parser. Extract ALL available information from the following resume text and return it in JSON format. Be thorough and extract as much detail as possible.

Please extract the following information:
- Personal Information: Full name, professional title, email, mobile/phone number, date of birth, address, LinkedIn profile
- Professional Summary/Objective
- Work Experience: Company, position/title, start date, end date (or current), job description, location
- Education: Institution, degree, field of study, start date, end date, GPA (if mentioned)
- Skills: Technical and soft skills with proficiency levels if mentioned, categorized
- Certifications: Name, issuing organization, issue date, expiry date, credential ID, URL
- Projects: Name, description, technologies used, dates, URLs/repositories
- Achievements/Awards: Title, description, date, category
- Languages: Language name and proficiency level
- Hobbies/Interests
- Additional Information

Format dates as YYYY-MM-DD when possible. If only year is available, use YYYY-01-01.
For skills, categorize them (e.g., "Programming", "Design", "Management", etc.).
Assign skill levels based on context clues (years of experience, project complexity, etc.).

Return ONLY valid JSON in this exact structure:
{
  "fullName": "string",
  "professionalTitle": "string",
  "email": "string",
  "mobileNumber": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "address": "string",
  "linkedinId": "string",
  "summary": "string",
  "workExperience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "isCurrent": boolean,
      "description": "string",
      "location": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "gpa": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "category": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM-DD",
      "expiryDate": "YYYY-MM-DD",
      "credentialId": "string",
      "url": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "url": "string",
      "repository": "string"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string",
      "date": "YYYY-MM-DD",
      "category": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "Basic|Conversational|Fluent|Native"
    }
  ],
  "hobbies": "string",
  "additionalInfo": "string"
}

Resume text:
${resumeText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser that extracts structured data from resume text. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Add unique IDs to array items
    if (result.workExperience) {
      result.workExperience = result.workExperience.map((item: any, index: number) => ({
        ...item,
        id: `work_${index + 1}`,
      }));
    }
    
    if (result.education) {
      result.education = result.education.map((item: any, index: number) => ({
        ...item,
        id: `edu_${index + 1}`,
      }));
    }
    
    if (result.skills) {
      result.skills = result.skills.map((item: any, index: number) => ({
        ...item,
        id: `skill_${index + 1}`,
      }));
    }
    
    if (result.certifications) {
      result.certifications = result.certifications.map((item: any, index: number) => ({
        ...item,
        id: `cert_${index + 1}`,
      }));
    }
    
    if (result.projects) {
      result.projects = result.projects.map((item: any, index: number) => ({
        ...item,
        id: `project_${index + 1}`,
      }));
    }
    
    if (result.achievements) {
      result.achievements = result.achievements.map((item: any, index: number) => ({
        ...item,
        id: `achievement_${index + 1}`,
      }));
    }
    
    if (result.languages) {
      result.languages = result.languages.map((item: any, index: number) => ({
        ...item,
        id: `lang_${index + 1}`,
      }));
    }

    return result as ParsedResumeData;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume content with AI");
  }
}
