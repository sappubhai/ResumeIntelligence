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

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  try {
    // Simple rule-based parsing for now (can be enhanced with AI later)
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let result: ParsedResumeData = {
      fullName: "",
      professionalTitle: "",
      email: "",
      mobileNumber: "",
      summary: "",
      workExperience: [],
      education: [],
      skills: [],
      hobbies: ""
    };

    // Extract email
    const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) result.email = emailMatch[0];

    // Extract phone number
    const phoneMatch = resumeText.match(/(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) result.mobileNumber = phoneMatch[0];

    // Extract name (likely to be in the first few lines)
    for (const line of lines.slice(0, 5)) {
      if (line.length > 5 && line.length < 50 && 
          !line.includes('@') && 
          !line.match(/\d{3}/) &&
          line.split(' ').length >= 2 &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv')) {
        result.fullName = line;
        break;
      }
    }

    // Extract summary/objective
    const summaryKeywords = ['summary', 'objective', 'profile', 'about', 'overview'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          if (lines[j] && lines[j].length > 10) {
            summaryLines.push(lines[j]);
          }
        }
        if (summaryLines.length > 0) {
          result.summary = summaryLines.join(' ');
          break;
        }
      }
    }

    // Extract skills
    const skillKeywords = ['skills', 'technologies', 'competencies', 'expertise'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (skillKeywords.some(keyword => line.includes(keyword))) {
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const skillLine = lines[j];
          if (skillLine && skillLine.length > 2 && skillLine.length < 100) {
            // Split by common delimiters
            const skills = skillLine.split(/[,•·|;]/).map(s => s.trim()).filter(s => s.length > 1);
            for (const skill of skills) {
              result.skills!.push({
                name: skill,
                level: 'Intermediate' as const,
                category: 'Technical'
              });
            }
          }
        }
        break;
      }
    }

    // Extract basic work experience
    const workKeywords = ['experience', 'employment', 'work history', 'career'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (workKeywords.some(keyword => line.includes(keyword))) {
        // Look for company/position patterns in the next lines
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const workLine = lines[j];
          if (workLine && workLine.length > 5 && workLine.length < 100) {
            // Simple heuristic: if line has dates, it might be work experience
            if (workLine.match(/\d{4}/) || workLine.match(/\d{1,2}\/\d{4}/)) {
              result.workExperience!.push({
                company: "Company Name",
                position: workLine,
                startDate: "2020-01-01",
                endDate: "2023-12-31",
                isCurrent: false,
                description: "Work experience details",
                location: ""
              });
            }
          }
        }
        break;
      }
    }

    // Extract basic education
    const eduKeywords = ['education', 'academic', 'university', 'college', 'degree'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (eduKeywords.some(keyword => line.includes(keyword))) {
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const eduLine = lines[j];
          if (eduLine && eduLine.length > 5 && eduLine.length < 100) {
            if (eduLine.match(/\d{4}/) || eduLine.toLowerCase().includes('degree') || 
                eduLine.toLowerCase().includes('bachelor') || eduLine.toLowerCase().includes('master')) {
              result.education!.push({
                institution: eduLine,
                degree: "Degree",
                field: "Field of Study",
                startDate: "2016-01-01",
                endDate: "2020-12-31",
                gpa: "",
                description: ""
              });
            }
          }
        }
        break;
      }
    }

    // Add unique IDs to arrays
    if (result.workExperience) {
      result.workExperience = result.workExperience.map((item, index) => ({
        ...item,
        id: `work_${index + 1}`,
      })) as any;
    }
    
    if (result.education) {
      result.education = result.education.map((item, index) => ({
        ...item,
        id: `edu_${index + 1}`,
      })) as any;
    }
    
    if (result.skills) {
      result.skills = result.skills.map((item, index) => ({
        ...item,
        id: `skill_${index + 1}`,
      })) as any;
    }

    return result;
  } catch (error) {
    console.error("Error parsing resume:", error);
    // Return basic structure with extracted text
    return {
      fullName: "",
      professionalTitle: "",
      email: "",
      mobileNumber: "",
      summary: resumeText.substring(0, 200) + "...",
      workExperience: [],
      education: [],
      skills: [],
      hobbies: ""
    };
  }
}