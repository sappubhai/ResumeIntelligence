import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
You are an expert resume parser. Extract the following information from the resume text below and return it as valid JSON only (no additional text or explanation):

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

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are an expert resume parser that extracts structured data from resume text. Always respond with valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            professionalTitle: { type: "string" },
            email: { type: "string" },
            mobileNumber: { type: "string" },
            dateOfBirth: { type: "string" },
            address: { type: "string" },
            linkedinId: { type: "string" },
            summary: { type: "string" },
            workExperience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  position: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  isCurrent: { type: "boolean" },
                  description: { type: "string" },
                  location: { type: "string" }
                }
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  institution: { type: "string" },
                  degree: { type: "string" },
                  field: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  gpa: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  level: { type: "string", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
                  category: { type: "string" }
                }
              }
            },
            certifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  issuer: { type: "string" },
                  issueDate: { type: "string" },
                  expiryDate: { type: "string" },
                  credentialId: { type: "string" },
                  url: { type: "string" }
                }
              }
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  technologies: { type: "array", items: { type: "string" } },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  url: { type: "string" },
                  repository: { type: "string" }
                }
              }
            },
            achievements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            languages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  proficiency: { type: "string", enum: ["Basic", "Conversational", "Fluent", "Native"] }
                }
              }
            },
            hobbies: { type: "string" },
            additionalInfo: { type: "string" }
          }
        }
      },
      contents: prompt,
    });

    const content = response.text;
    if (!content) {
      throw new Error("No content received from Gemini");
    }

    console.log("Raw Gemini response:", content);

    try {
      const parsedData = JSON.parse(content);
      
      // Add unique IDs to array items
      if (parsedData.workExperience) {
        parsedData.workExperience = parsedData.workExperience.map((exp: any, index: number) => ({
          ...exp,
          id: `exp-${index}`,
        }));
      }
      
      if (parsedData.education) {
        parsedData.education = parsedData.education.map((edu: any, index: number) => ({
          ...edu,
          id: `edu-${index}`,
        }));
      }
      
      if (parsedData.skills) {
        parsedData.skills = parsedData.skills.map((skill: any, index: number) => ({
          ...skill,
          id: `skill-${index}`,
        }));
      }
      
      if (parsedData.certifications) {
        parsedData.certifications = parsedData.certifications.map((cert: any, index: number) => ({
          ...cert,
          id: `cert-${index}`,
        }));
      }
      
      if (parsedData.projects) {
        parsedData.projects = parsedData.projects.map((proj: any, index: number) => ({
          ...proj,
          id: `proj-${index}`,
        }));
      }
      
      if (parsedData.achievements) {
        parsedData.achievements = parsedData.achievements.map((ach: any, index: number) => ({
          ...ach,
          id: `ach-${index}`,
        }));
      }
      
      if (parsedData.languages) {
        parsedData.languages = parsedData.languages.map((lang: any, index: number) => ({
          ...lang,
          id: `lang-${index}`,
        }));
      }
      
      return parsedData as ParsedResumeData;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Content that failed to parse:", content);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume content with AI");
  }
}