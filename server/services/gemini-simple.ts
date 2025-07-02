import { GoogleGenAI } from "@google/genai";
export interface ParsedResumeData {
  fullName?: string;
  professionalTitle?: string;
  email?: string;
  mobileNumber?: string;
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
  hobbies?: string;
}

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    // Simple prompt without complex schema
    const prompt = `Extract information from this resume and return a JSON object:

${resumeText}

Return JSON with these fields (use null if not found):
{
  "fullName": "person's full name",
  "email": "email address", 
  "mobileNumber": "phone number",
  "summary": "professional summary",
  "workExperience": [{"company": "company name", "position": "job title", "description": "job description"}],
  "education": [{"institution": "school name", "degree": "degree", "field": "field of study"}],
  "skills": [{"name": "skill name", "category": "skill category"}]
}`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response from Gemini");
    }

    console.log("Gemini response preview:", content.substring(0, 200));

    // Clean and parse response
    let cleanContent = content.trim();
    
    // Remove markdown formatting if present
    cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    // Find JSON object
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(cleanContent);
    
    // Add IDs to array items
    if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
      parsedData.workExperience = parsedData.workExperience.map((exp: any, index: number) => ({
        ...exp,
        id: `exp-${index}`,
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isCurrent: exp.isCurrent || false,
        location: exp.location || "",
      }));
    }
    
    if (parsedData.education && Array.isArray(parsedData.education)) {
      parsedData.education = parsedData.education.map((edu: any, index: number) => ({
        ...edu,
        id: `edu-${index}`,
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        gpa: edu.gpa || "",
        description: edu.description || "",
      }));
    }
    
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      parsedData.skills = parsedData.skills.map((skill: any, index: number) => ({
        ...skill,
        id: `skill-${index}`,
        level: skill.level || "Intermediate",
        category: skill.category || "Technical",
      }));
    }

    return parsedData as ParsedResumeData;
    
  } catch (error) {
    console.error("Error parsing resume with Gemini:", error);
    throw new Error("Failed to parse resume with AI");
  }
}