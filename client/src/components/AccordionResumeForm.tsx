import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Trophy,
  FolderOpen,
  Globe,
  Heart,
  Camera,
  Phone,
  Mail,
  MapPin,
  Star,
  Building,
  Calendar,
  Users,
  Target,
  BookOpen,
  Zap,
  Coffee,
  ChevronDown
} from "lucide-react";
import type { Resume, InsertResume } from "@shared/schema";

// Comprehensive schema for all 15 resume sections
const comprehensiveResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  
  // 1. Profile/About Me
  fullName: z.string().optional(),
  professionalTitle: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  mobileNumber: z.string().optional(),
  address: z.string().optional(),
  linkedinId: z.string().optional(),
  summary: z.string().optional(),
  
  // 2. Career Highlights
  careerHighlights: z.string().optional(),
  
  // 3. Skills
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number().min(0).max(5),
    category: z.string(),
  })).default([]),
  
  // 4. Education
  education: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    board: z.string().optional(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    status: z.enum(['Completed', 'Pursuing']).default('Completed'),
    scoreType: z.enum(['Percentage', 'CGPA']).default('Percentage'),
    score: z.string().optional(),
    division: z.enum(['I', 'II', 'III']).optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  })).default([]),
  
  // 5. Work Experience
  workExperience: z.array(z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  })).default([]),
  
  // 6. Internships
  internships: z.array(z.object({
    id: z.string(),
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  })).default([]),
  
  // 7. Training & Certifications
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string().optional(),
    status: z.enum(['Completed', 'In Progress']).default('Completed'),
    issueDate: z.string(),
    expiryDate: z.string().optional(),
  })).default([]),
  
  // 8. Awards and Honors
  awardsAndHonors: z.string().optional(),
  
  // 9. Professional Affiliations
  professionalAffiliations: z.string().optional(),
  
  // 10. Projects
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    startDate: z.string(),
    endDate: z.string().optional(),
    url: z.string().optional(),
  })).default([]),
  
  // 11. Extra-Curricular Activities
  extraCurricularActivities: z.string().optional(),
  
  // 12. Languages
  languages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number().min(0).max(5),
  })).default([]),
  
  // 13. Personal Information
  personalInfo: z.object({
    photo: z.string().optional(),
    birthdate: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    maritalStatus: z.enum(['Single', 'Married', 'Other']).optional(),
    passportNumber: z.string().optional(),
    nationality: z.string().optional(),
    additionalDetails: z.string().optional(),
  }).optional(),
  
  // 14. Personal Interests
  personalInterests: z.string().optional(),
  
  // 15. References
  references: z.array(z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    company: z.string(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
  })).default([]),
});

type ComprehensiveResumeFormData = z.infer<typeof comprehensiveResumeSchema>;

interface AccordionResumeFormProps {
  initialData?: Resume;
  onSave: (data: Partial<InsertResume>) => void;
  onDataChange?: (hasChanges: boolean) => void;
  isLoading?: boolean;
}

// Star Rating Component
const StarRating = ({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`cursor-pointer transition-colors ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
};

export default function AccordionResumeForm({ 
  initialData, 
  onSave, 
  onDataChange, 
  isLoading = false 
}: AccordionResumeFormProps) {
  const [activeAccordion, setActiveAccordion] = useState<string>("personal");
  
  const form = useForm<ComprehensiveResumeFormData>({
    resolver: zodResolver(comprehensiveResumeSchema),
    defaultValues: {
      title: initialData?.title || "",
      fullName: initialData?.fullName || "",
      professionalTitle: initialData?.professionalTitle || "",
      email: initialData?.email || "",
      mobileNumber: initialData?.mobileNumber || "",
      address: initialData?.address || "",
      linkedinId: initialData?.linkedinId || "",
      summary: initialData?.summary || "",
      careerHighlights: initialData?.careerHighlights || "",
      skills: initialData?.skills || [],
      education: initialData?.education || [],
      workExperience: initialData?.workExperience || [],
      internships: initialData?.internships || [],
      certifications: initialData?.certifications || [],
      awardsAndHonors: initialData?.awardsAndHonors || "",
      professionalAffiliations: initialData?.professionalAffiliations || "",
      projects: initialData?.projects || [],
      extraCurricularActivities: initialData?.extraCurricularActivities || "",
      languages: initialData?.languages || [],
      personalInfo: initialData?.personalInfo || {},
      personalInterests: initialData?.personalInterests || "",
      references: initialData?.references || [],
    },
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { fields: internshipFields, append: appendInternship, remove: removeInternship } = useFieldArray({
    control: form.control,
    name: "internships",
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control: form.control,
    name: "references",
  });

  const onSubmit = (data: ComprehensiveResumeFormData) => {
    console.log("Form data before save:", data);
    
    // Clean and format the data for the database
    const resumeData: Partial<InsertResume> = {
      title: data.title || "",
      fullName: data.fullName || "",
      professionalTitle: data.professionalTitle || "",
      email: data.email || "",
      mobileNumber: data.mobileNumber || "",
      address: data.address || "",
      linkedinId: data.linkedinId || "",
      summary: data.summary || "",
      careerHighlights: data.careerHighlights || "",
      
      // Ensure arrays are properly formatted and never null
      skills: data.skills || [],
      education: data.education || [],
      workExperience: data.workExperience || [],
      internships: data.internships || [],
      certifications: data.certifications || [],
      projects: data.projects || [],
      languages: data.languages || [],
      references: data.references || [],
      
      // Ensure string fields are proper nulls or strings
      awardsAndHonors: data.awardsAndHonors || null,
      professionalAffiliations: data.professionalAffiliations || null,
      extraCurricularActivities: data.extraCurricularActivities || null,
      personalInterests: data.personalInterests || null,
      
      // Ensure personalInfo is a proper object or null
      personalInfo: data.personalInfo && Object.keys(data.personalInfo).length > 0 ? data.personalInfo : null,
    };
    
    console.log("Resume data being saved:", resumeData);
    onSave(resumeData);
  };

  // Watch for changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && onDataChange) {
        onDataChange(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  // Update form when initialData changes (after resume parsing)
  useEffect(() => {
    console.log("AccordionResumeForm - initialData received:", initialData);
    if (initialData) {
      // Handle both single object and array format
      const resumeData = Array.isArray(initialData) ? initialData[0] : initialData;
      console.log("Processing resume data:", resumeData);
      
      if (!resumeData) return;
      
      // Map parsed data to form structure with proper field mapping
      const formData = {
        title: resumeData.title || "",
        fullName: resumeData.fullName || "",
        professionalTitle: resumeData.professionalTitle || "",
        email: resumeData.email || "",
        mobileNumber: resumeData.mobileNumber || "",
        address: resumeData.address || "",
        linkedinId: resumeData.linkedinId || "",
        summary: resumeData.summary || "",
        careerHighlights: resumeData.careerHighlights || "",
        
        // Skills - ensure proper structure with IDs
        skills: (resumeData.skills || []).map((skill: any, index: number) => ({
          id: skill.id || `skill-${index}`,
          name: skill.name || "",
          rating: skill.rating || 0,
          category: skill.category || "Technical"
        })),
        
        // Education - ensure proper structure with IDs
        education: (resumeData.education || []).map((edu: any, index: number) => ({
          id: edu.id || `edu-${index}`,
          institution: edu.institution || "",
          board: edu.board || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          status: edu.status || "Completed",
          scoreType: edu.scoreType || "Percentage",
          score: edu.score || "",
          division: edu.division || "",
          country: edu.country || "",
          state: edu.state || "",
          city: edu.city || "",
          description: edu.description || ""
        })),
        
        // Work Experience - ensure proper structure with IDs
        workExperience: (resumeData.workExperience || []).map((work: any, index: number) => ({
          id: work.id || `work-${index}`,
          company: work.company || "",
          position: work.position || "",
          startDate: work.startDate || "",
          endDate: work.endDate || "",
          isCurrent: work.isCurrent || false,
          description: work.description || "",
          location: work.location || "",
          country: work.country || "",
          state: work.state || "",
          city: work.city || ""
        })),
        
        // Internships - ensure proper structure with IDs
        internships: (resumeData.internships || []).map((intern: any, index: number) => ({
          id: intern.id || `intern-${index}`,
          company: intern.company || "",
          position: intern.position || "",
          startDate: intern.startDate || "",
          endDate: intern.endDate || "",
          isCurrent: intern.isCurrent || false,
          description: intern.description || "",
          country: intern.country || "",
          state: intern.state || "",
          city: intern.city || ""
        })),
        
        // Certifications - ensure proper structure with IDs
        certifications: (resumeData.certifications || []).map((cert: any, index: number) => ({
          id: cert.id || `cert-${index}`,
          name: cert.name || "",
          issuer: cert.issuer || "",
          status: cert.status || "Completed",
          issueDate: cert.issueDate || "",
          expiryDate: cert.expiryDate || ""
        })),
        
        // Projects - ensure proper structure with IDs
        projects: (resumeData.projects || []).map((project: any, index: number) => ({
          id: project.id || `project-${index}`,
          name: project.name || "",
          description: project.description || "",
          technologies: project.technologies || [],
          startDate: project.startDate || "",
          endDate: project.endDate || "",
          url: project.url || ""
        })),
        
        // Languages - ensure proper structure with IDs
        languages: (resumeData.languages || []).map((lang: any, index: number) => ({
          id: lang.id || `lang-${index}`,
          name: lang.name || "",
          rating: lang.rating || 0
        })),
        
        // References - ensure proper structure with IDs
        references: (resumeData.references || []).map((ref: any, index: number) => ({
          id: ref.id || `ref-${index}`,
          name: ref.name || "",
          position: ref.position || "",
          company: ref.company || "",
          country: ref.country || "",
          state: ref.state || "",
          city: ref.city || "",
          mobile: ref.mobile || "",
          email: ref.email || ""
        })),
        
        // Simple string fields
        awardsAndHonors: resumeData.awardsAndHonors || "",
        professionalAffiliations: resumeData.professionalAffiliations || "",
        extraCurricularActivities: resumeData.extraCurricularActivities || "",
        personalInterests: resumeData.personalInterests || "",
        
        // Personal info object
        personalInfo: resumeData.personalInfo || {}
      };
      
      console.log("Resetting form with data:", formData);
      form.reset(formData);
    }
  }, [initialData, form]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-sm text-orange-800">
          Changes you save here will reflect on all templates for this resume.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Resume Preview
          </Button>
          <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
            Update Info
          </Button>
          <Button variant="outline" size="sm">
            Download
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Resume Title */}
              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Software Engineer Resume" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Accordion 
                type="single" 
                collapsible 
                value={activeAccordion} 
                onValueChange={setActiveAccordion}
                className="w-full space-y-2"
              >
                {/* 1. Personal Details / Social */}
                <AccordionItem value="personal" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <span>Personal Details / Social</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="professionalTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedinId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn Profile</FormLabel>
                            <FormControl>
                              <Input placeholder="linkedin.com/in/yourprofile" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2. About me & Summary */}
                <AccordionItem value="summary" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <span>About me & Summary</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write a compelling summary of your professional background..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="careerHighlights"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Career Highlights</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="• Key achievement 1&#10;• Key achievement 2&#10;• Notable accomplishment..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. Work Experience / Internships */}
                <AccordionItem value="experience" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                      <span>Work Experience / Internships</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-6">
                      {/* Work Experience */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Work Experience</h4>
                        {workFields.map((field, index) => (
                          <div key={field.id} className="space-y-4 p-4 border rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium">Experience {index + 1}</h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeWork(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.company`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Company name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.position`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Job title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.startDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`workExperience.${index}.endDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name={`workExperience.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe your responsibilities and achievements..."
                                      className="min-h-[80px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendWork({
                            id: `work_${Date.now()}`,
                            company: "",
                            position: "",
                            startDate: "",
                            endDate: "",
                            isCurrent: false,
                            description: "",
                          })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Work Experience
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. Education */}
                <AccordionItem value="education" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-gray-600" />
                      <span>Education</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Education {index + 1}</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEducation(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.institution`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Institution</FormLabel>
                                  <FormControl>
                                    <Input placeholder="School/University name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select degree type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="SSC">SSC</SelectItem>
                                        <SelectItem value="HSC">HSC</SelectItem>
                                        <SelectItem value="Graduation">Graduation</SelectItem>
                                        <SelectItem value="Post-Grad">Post-Grad</SelectItem>
                                        <SelectItem value="Diploma">Diploma</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.field`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field of Study</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Specialization" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`education.${index}.status`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Pursuing">Pursuing</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendEducation({
                          id: `edu_${Date.now()}`,
                          institution: "",
                          degree: "",
                          field: "",
                          startDate: "",
                          endDate: "",
                          status: "Completed",
                          scoreType: "Percentage",
                        })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5. Certifications */}
                <AccordionItem value="certifications" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-gray-600" />
                      <span>Certifications</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {certificationFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Certification {index + 1}</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCertification(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Certification Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Name of certification" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.issuer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Issuing Organization</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Organization name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendCertification({
                          id: `cert_${Date.now()}`,
                          name: "",
                          issuer: "",
                          status: "Completed",
                          issueDate: "",
                        })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Certification
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 6. Skills */}
                <AccordionItem value="skills" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-gray-600" />
                      <span>Skills</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {skillFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`skills.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Skill Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., JavaScript" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`skills.${index}.category`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Programming" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`skills.${index}.rating`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rating (0-5 stars)</FormLabel>
                                  <FormControl>
                                    <StarRating
                                      rating={field.value || 0}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSkill(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendSkill({
                          id: `skill_${Date.now()}`,
                          name: "",
                          rating: 0,
                          category: "",
                        })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 7. Achievements */}
                <AccordionItem value="achievements" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-gray-600" />
                      <span>Achievements</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="awardsAndHonors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Awards and Honors</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="• Award/Achievement 1&#10;• Award/Achievement 2&#10;• Honor received..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 8. Projects */}
                <AccordionItem value="projects" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-gray-600" />
                      <span>Projects</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {projectFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Project {index + 1}</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeProject(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`projects.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Name of project" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`projects.${index}.url`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`projects.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the project..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendProject({
                          id: `project_${Date.now()}`,
                          name: "",
                          description: "",
                          technologies: [],
                          startDate: "",
                          url: "",
                        })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 9. Language */}
                <AccordionItem value="languages" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <span>Language</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {languageFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`languages.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Language</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., English" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`languages.${index}.rating`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Proficiency (0-5 stars)</FormLabel>
                                  <FormControl>
                                    <StarRating
                                      rating={field.value || 0}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeLanguage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendLanguage({
                          id: `lang_${Date.now()}`,
                          name: "",
                          rating: 0,
                        })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Language
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 10. Hobbies */}
                <AccordionItem value="hobbies" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5 text-gray-600" />
                      <span>Hobbies</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="personalInterests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Interests & Hobbies</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reading, Photography, Traveling, Sports..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="extraCurricularActivities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extra-Curricular Activities</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Volunteer work, club memberships, leadership roles..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 11. Additional Information */}
                <AccordionItem value="additional" className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                      <span>Additional Information</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="professionalAffiliations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Affiliations</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Professional organizations, memberships..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    console.log("Bottom save button clicked!");
                    console.log("Form errors:", form.formState.errors);
                    console.log("Form is valid:", form.formState.isValid);
                  }}
                >
                  {isLoading ? "Saving..." : "Save Resume"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}