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
    // Clean the text to remove invalid UTF-8 sequences and null bytes
    const cleanText = resumeText
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ''); // Keep only printable characters
    
    // Simple rule-based parsing for now (can be enhanced with AI later)
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
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

    // Helper function to clean text fields
    const cleanField = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\0/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
        .trim();
    };

    // Extract email
    const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) result.email = cleanField(emailMatch[0]);

    // Extract phone number
    const phoneMatch = cleanText.match(/(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) result.mobileNumber = cleanField(phoneMatch[0]);

    // Extract name (likely to be in the first few lines)
    for (const line of lines.slice(0, 5)) {
      if (line.length > 5 && line.length < 50 && 
          !line.includes('@') && 
          !line.match(/\d{3}/) &&
          line.split(' ').length >= 2 &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv')) {
        result.fullName = cleanField(line);
        break;
      }
    }

    // Extract summary/objective - look for more patterns
    const summaryKeywords = ['summary', 'objective', 'profile', 'about', 'overview', 'career objective', 'professional summary', 'bio', 'introduction'];
    let summaryFound = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
          if (lines[j] && lines[j].length > 10 && !lines[j].toLowerCase().includes('experience') && !lines[j].toLowerCase().includes('education')) {
            summaryLines.push(lines[j]);
          } else if (lines[j] && lines[j].length > 50) {
            // If it's a long line, it might be a summary
            summaryLines.push(lines[j]);
          }
        }
        if (summaryLines.length > 0) {
          result.summary = cleanField(summaryLines.join(' '));
          summaryFound = true;
          break;
        }
      }
    }
    
    // If no summary found, look for first paragraph after personal details
    if (!summaryFound && result.fullName) {
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        if (line.length > 100 && !line.includes('@') && !line.match(/\d{3}/)) {
          result.summary = cleanField(line);
          break;
        }
      }
    }

    // Extract skills - enhanced pattern recognition
    const skillKeywords = ['skills', 'technologies', 'competencies', 'expertise', 'technical skills', 'core competencies', 'key skills'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (skillKeywords.some(keyword => line.includes(keyword))) {
        // Look for skills in the following lines
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const skillLine = lines[j];
          if (skillLine && skillLine.length > 2 && skillLine.length < 150) {
            // Stop if we hit another section
            if (skillLine.toLowerCase().includes('experience') || 
                skillLine.toLowerCase().includes('education') ||
                skillLine.toLowerCase().includes('certification')) {
              break;
            }
            
            // Split by common delimiters and extract skills
            const skills = skillLine.split(/[,•·|;:\n\t]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
            for (const skill of skills) {
              const cleanSkill = cleanField(skill);
              if (cleanSkill.length > 1 && !cleanSkill.match(/^\d+$/) && !cleanSkill.includes('years')) {
                // Determine skill category based on common patterns
                let category = 'Technical';
                if (cleanSkill.toLowerCase().includes('management') || cleanSkill.toLowerCase().includes('leadership')) {
                  category = 'Management';
                } else if (cleanSkill.toLowerCase().includes('communication') || cleanSkill.toLowerCase().includes('teamwork')) {
                  category = 'Soft Skills';
                }
                
                result.skills!.push({
                  name: cleanSkill,
                  level: 'Intermediate' as const,
                  category: category
                });
              }
            }
          }
        }
        break;
      }
    }

    // Extract work experience - enhanced pattern recognition
    const workKeywords = ['experience', 'employment', 'work history', 'career', 'professional experience', 'work experience', 'employment history'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (workKeywords.some(keyword => line.includes(keyword))) {
        let currentJob = null;
        // Look for company/position patterns in the next lines
        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const workLine = lines[j];
          if (workLine && workLine.length > 3) {
            // Stop if we hit another major section
            if (workLine.toLowerCase().includes('education') || 
                workLine.toLowerCase().includes('skills') ||
                workLine.toLowerCase().includes('certification')) {
              break;
            }
            
            // Look for date patterns (various formats)
            const datePattern = /(\d{4}|\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
            
            if (datePattern.test(workLine)) {
              // This line likely contains position and dates
              const cleanWorkLine = cleanField(workLine);
              if (cleanWorkLine.length > 0) {
                // Try to extract company name from previous line or current line
                let company = "Company Name";
                let position = cleanWorkLine;
                
                // Look for company indicators
                if (j > 0 && lines[j-1] && !datePattern.test(lines[j-1])) {
                  company = cleanField(lines[j-1]);
                  if (company.length > 50) company = company.substring(0, 50) + "...";
                }
                
                // Extract description from following lines
                let description = "";
                for (let k = j + 1; k < Math.min(j + 5, lines.length); k++) {
                  if (lines[k] && lines[k].length > 10 && !datePattern.test(lines[k])) {
                    if (!lines[k].toLowerCase().includes('education') && 
                        !lines[k].toLowerCase().includes('skills')) {
                      description += lines[k] + " ";
                    } else {
                      break;
                    }
                  }
                }
                
                result.workExperience!.push({
                  company: company,
                  position: position,
                  startDate: "2020-01-01",
                  endDate: workLine.toLowerCase().includes('present') || workLine.toLowerCase().includes('current') ? undefined : "2023-12-31",
                  isCurrent: workLine.toLowerCase().includes('present') || workLine.toLowerCase().includes('current'),
                  description: cleanField(description.trim()) || "Work experience details",
                  location: ""
                });
              }
            }
          }
        }
        break;
      }
    }

    // Extract education - enhanced pattern recognition
    const eduKeywords = ['education', 'academic', 'university', 'college', 'degree', 'qualification', 'academic background'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (eduKeywords.some(keyword => line.includes(keyword))) {
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const eduLine = lines[j];
          if (eduLine && eduLine.length > 5) {
            // Stop if we hit another major section
            if (eduLine.toLowerCase().includes('experience') || 
                eduLine.toLowerCase().includes('skills') ||
                eduLine.toLowerCase().includes('certification')) {
              break;
            }
            
            // Look for degree patterns
            const degreePattern = /(bachelor|master|phd|diploma|certificate|b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?com|m\.?com|mba|be|me)/i;
            const datePattern = /(\d{4}|\d{1,2}\/\d{4})/;
            
            if (degreePattern.test(eduLine) || datePattern.test(eduLine)) {
              const cleanEduLine = cleanField(eduLine);
              if (cleanEduLine.length > 0) {
                // Try to parse institution and degree
                let institution = "Institution";
                let degree = "Degree";
                let field = "Field of Study";
                
                // Look for institution in nearby lines
                for (let k = Math.max(0, j-2); k < Math.min(j+3, lines.length); k++) {
                  if (k !== j && lines[k] && lines[k].length > 5) {
                    const testLine = lines[k].toLowerCase();
                    if (testLine.includes('university') || testLine.includes('college') || 
                        testLine.includes('institute') || testLine.includes('school')) {
                      institution = cleanField(lines[k]);
                      break;
                    }
                  }
                }
                
                // Extract degree and field from the main line
                const degreeMatch = cleanEduLine.match(degreePattern);
                if (degreeMatch) {
                  degree = degreeMatch[0];
                  // Try to find field after degree
                  const afterDegree = cleanEduLine.substring(cleanEduLine.indexOf(degreeMatch[0]) + degreeMatch[0].length);
                  if (afterDegree.length > 3) {
                    field = afterDegree.replace(/in\s+/i, '').trim();
                  }
                }
                
                result.education!.push({
                  institution: institution,
                  degree: degree,
                  field: field,
                  startDate: "2016-01-01",
                  endDate: "2020-12-31",
                  gpa: "",
                  description: ""
                });
              }
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
    // Helper function for error handling
    const cleanErrorText = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\0/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
        .trim();
    };
    
    // Return basic structure with extracted text
    return {
      fullName: "",
      professionalTitle: "",
      email: "",
      mobileNumber: "",
      summary: cleanErrorText(resumeText.substring(0, 200)) + "...",
      workExperience: [],
      education: [],
      skills: [],
      hobbies: ""
    };
  }
}