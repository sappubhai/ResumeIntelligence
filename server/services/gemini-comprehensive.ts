import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

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
    name: string;
    rating: number; // 0-5 stars
    category: string;
  }>;
  
  // Internships
  internships?: Array<{
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
    title: string;
    description: string;
    date: string;
    category: string;
  }>;
  hobbies?: string;
  additionalInfo?: string;
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    const prompt = `
You are an expert resume parser with intelligent section mapping capabilities. Extract ALL available information from the following resume text and return it in JSON format. Be thorough and extract as much detail as possible.

INTELLIGENT SECTION MAPPING:
- Map resume sections to their best-fitting categories regardless of header names
- Examples: "Bio" → "summary", "Key Skills" → "skills", "Education Background" → "education", "Work History" → "workExperience", "Trainings" → "certifications", "Personal Details" → "personalInfo"
- Handle both modern and traditional resume formats
- Extract location information and split into country, state, city when possible

Please extract the following comprehensive information:

1. PROFILE/ABOUT ME: Full name, professional title, email, mobile, address, LinkedIn, summary/objective
2. CAREER HIGHLIGHTS: Key achievements, notable accomplishments
3. SKILLS: Technical and soft skills with estimated proficiency (0-5 stars), categorized
4. EDUCATION: Institution, board/affiliation, degree, field, dates, status, score type, division, location
5. WORK EXPERIENCE: Company, position, dates, current status, description, location details
6. INTERNSHIPS: Same structure as work experience
7. TRAINING & CERTIFICATIONS: Name, issuer, status, dates, credentials
8. AWARDS AND HONORS: Text description or list
9. PROFESSIONAL AFFILIATIONS: Memberships, organizations
10. PROJECTS: Name, description, technologies, dates, URLs
11. EXTRA-CURRICULAR ACTIVITIES: Activities, leadership roles
12. LANGUAGES: Language name with proficiency rating (0-5 stars)
13. PERSONAL INFORMATION: Photo, birthdate, gender, marital status, passport, nationality
14. PERSONAL INTERESTS: Hobbies, interests, activities
15. REFERENCES: Name, position, company, location, contact details

Format dates as YYYY-MM-DD when possible. If only year is available, use YYYY-01-01.
For skills and languages, assign ratings 0-5 based on context clues.
For education status, determine "Completed" or "Pursuing".
For score type, determine "Percentage" or "CGPA" based on format.

Return ONLY valid JSON with comprehensive data extraction.

Resume text:
${resumeText}
`;

    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const response = await model.generateContent(prompt);
    const resultText = response.response.text();
    
    // Clean up the response text to extract JSON
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
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
        id: `proj_${index + 1}`,
      }));
    }
    
    if (result.achievements) {
      result.achievements = result.achievements.map((item: any, index: number) => ({
        ...item,
        id: `achv_${index + 1}`,
      }));
    }
    
    if (result.languages) {
      result.languages = result.languages.map((item: any, index: number) => ({
        ...item,
        id: `lang_${index + 1}`,
      }));
    }
    
    if (result.internships) {
      result.internships = result.internships.map((item: any, index: number) => ({
        ...item,
        id: `intern_${index + 1}`,
      }));
    }
    
    if (result.references) {
      result.references = result.references.map((item: any, index: number) => ({
        ...item,
        id: `ref_${index + 1}`,
      }));
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw new Error("Failed to parse resume with AI");
  }
}