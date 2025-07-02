import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Heart
} from "lucide-react";
import type { Resume, InsertResume } from "@shared/schema";
import type { ResumeFormData } from "@/types/resume";

const resumeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fullName: z.string().optional(),
  professionalTitle: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  mobileNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  linkedinId: z.string().optional(),
  summary: z.string().optional(),
  workExperience: z.array(z.object({
    id: z.string(),
    company: z.string().min(1, "Company is required"),
    position: z.string().min(1, "Position is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string().min(1, "Description is required"),
    location: z.string().optional(),
  })).default([]),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    field: z.string().min(1, "Field of study is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Skill name is required"),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    category: z.string().min(1, "Category is required"),
  })).default([]),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Certification name is required"),
    issuer: z.string().min(1, "Issuer is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    url: z.string().optional(),
  })).default([]),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
    technologies: z.array(z.string()).default([]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    url: z.string().optional(),
    repository: z.string().optional(),
  })).default([]),
  achievements: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().min(1, "Date is required"),
    category: z.string().min(1, "Category is required"),
  })).default([]),
  languages: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Language name is required"),
    proficiency: z.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
  })).default([]),
  hobbies: z.string().optional(),
  additionalInfo: z.string().optional(),
});

interface ResumeFormProps {
  initialData?: Resume;
  onSave: (data: Partial<InsertResume>) => void;
  onDataChange?: (hasChanges: boolean) => void;
  isLoading?: boolean;
}

export default function ResumeForm({ 
  initialData, 
  onSave, 
  onDataChange,
  isLoading = false 
}: ResumeFormProps) {
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      title: initialData?.title || "My Resume",
      fullName: initialData?.fullName || "",
      professionalTitle: initialData?.professionalTitle || "",
      email: initialData?.email || "",
      mobileNumber: initialData?.mobileNumber || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      address: initialData?.address || "",
      linkedinId: initialData?.linkedinId || "",
      summary: initialData?.summary || "",
      workExperience: (initialData?.workExperience as any[]) || [],
      education: (initialData?.education as any[]) || [],
      skills: (initialData?.skills as any[]) || [],
      certifications: (initialData?.certifications as any[]) || [],
      projects: (initialData?.projects as any[]) || [],
      achievements: (initialData?.achievements as any[]) || [],
      languages: (initialData?.languages as any[]) || [],
      hobbies: initialData?.hobbies || "",
      additionalInfo: initialData?.additionalInfo || "",
    },
  });

  const { 
    fields: workExperienceFields, 
    append: appendWorkExperience, 
    remove: removeWorkExperience 
  } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { 
    fields: educationFields, 
    append: appendEducation, 
    remove: removeEducation 
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { 
    fields: skillsFields, 
    append: appendSkill, 
    remove: removeSkill 
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const { 
    fields: certificationsFields, 
    append: appendCertification, 
    remove: removeCertification 
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const { 
    fields: projectsFields, 
    append: appendProject, 
    remove: removeProject 
  } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const { 
    fields: achievementsFields, 
    append: appendAchievement, 
    remove: removeAchievement 
  } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const { 
    fields: languagesFields, 
    append: appendLanguage, 
    remove: removeLanguage 
  } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  // Reset form when initialData changes (e.g., when resume loads from API)
  useEffect(() => {
    if (initialData) {
      console.log("Form reset with initialData:", initialData);
      // Handle case where initialData might be an array or object
      const resumeData = Array.isArray(initialData) ? initialData[0] : initialData;

      if (resumeData) {
        const resetData = {
          title: resumeData.title || "My Resume",
          fullName: resumeData.fullName || "",
          professionalTitle: resumeData.professionalTitle || "",
          email: resumeData.email || "",
          mobileNumber: resumeData.mobileNumber || "",
          dateOfBirth: resumeData.dateOfBirth || "",
          address: resumeData.address || "",
          linkedinId: resumeData.linkedinId || "",
          summary: resumeData.summary || "",
          workExperience: (resumeData.workExperience as any[]) || [],
          education: (resumeData.education as any[]) || [],
          skills: (resumeData.skills as any[]) || [],
          certifications: (resumeData.certifications as any[]) || [],
          projects: (resumeData.projects as any[]) || [],
          achievements: (resumeData.achievements as any[]) || [],
          languages: (resumeData.languages as any[]) || [],
          hobbies: resumeData.hobbies || "",
          additionalInfo: resumeData.additionalInfo || "",
        };
        console.log("Reset data:", resetData);
        form.reset(resetData);
      }
    }
  }, [initialData, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      const formHasChanges = form.formState.isDirty;
      setHasChanges(formHasChanges);
      onDataChange?.(formHasChanges);
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  const onSubmit = (data: ResumeFormData) => {
    onSave(data);
  };

  const addWorkExperience = () => {
    appendWorkExperience({
      id: `work_${Date.now()}`,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      location: "",
    });
  };

  const addEducation = () => {
    appendEducation({
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    });
  };

  const addSkill = () => {
    appendSkill({
      id: `skill_${Date.now()}`,
      name: "",
      level: "Intermediate",
      category: "",
    });
  };

  const addCertification = () => {
    appendCertification({
      id: `cert_${Date.now()}`,
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      url: "",
    });
  };

  const addProject = () => {
    appendProject({
      id: `project_${Date.now()}`,
      name: "",
      description: "",
      technologies: [],
      startDate: "",
      endDate: "",
      url: "",
      repository: "",
    });
  };

  const addAchievement = () => {
    appendAchievement({
      id: `achievement_${Date.now()}`,
      title: "",
      description: "",
      date: "",
      category: "",
    });
  };

  const addLanguage = () => {
    appendLanguage({
      id: `lang_${Date.now()}`,
      name: "",
      proficiency: "Conversational",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="personal" className="text-xs">
              <User className="w-4 h-4 mr-1" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">
              <Briefcase className="w-4 h-4 mr-1" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="text-xs">
              <GraduationCap className="w-4 h-4 mr-1" />
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">
              <Code className="w-4 h-4 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="certifications" className="text-xs">
              <Award className="w-4 h-4 mr-1" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs">
              <FolderOpen className="w-4 h-4 mr-1" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              <Trophy className="w-4 h-4 mr-1" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="additional" className="text-xs">
              <Heart className="w-4 h-4 mr-1" />
              Additional
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Professional Resume" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <Input placeholder="Software Engineer" {...field} />
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
                          <Input type="email" placeholder="john@example.com" {...field} />
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
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <Input placeholder="linkedin.com/in/johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, City, State, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write a brief summary of your professional background and goals..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="mr-2 w-5 h-5" />
                    Work Experience
                  </div>
                  <Button type="button" onClick={addWorkExperience}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Experience
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {workExperienceFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeWorkExperience(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                              <Input placeholder="Company Name" {...field} />
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
                              <Input placeholder="Job Title" {...field} />
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
                              <Input 
                                type="date" 
                                disabled={form.watch(`workExperience.${index}.isCurrent`)}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Currently working here</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`workExperience.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your responsibilities and achievements..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}

                {workExperienceFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No work experience added yet. Click "Add Experience" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 w-5 h-5" />
                    Education
                  </div>
                  <Button type="button" onClick={addEducation}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Education
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {educationFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                              <Input placeholder="University Name" {...field} />
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
                              <Input placeholder="Bachelor's, Master's, etc." {...field} />
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
                              <Input placeholder="Computer Science, Business, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.gpa`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GPA (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="3.8/4.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`education.${index}.startDate`}
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
                        name={`education.${index}.endDate`}
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
                      name={`education.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional details about your education..."
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}

                {educationFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No education added yet. Click "Add Education" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Code className="mr-2 w-5 h-5" />
                    Skills
                  </div>
                  <Button type="button" onClick={addSkill}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Skill
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillsFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-sm">Skill {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkill(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`skills.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Skill Name</FormLabel>
                              <FormControl>
                                <Input placeholder="JavaScript" {...field} />
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
                              <FormLabel className="text-xs">Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Programming, Design, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                  <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {skillsFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No skills added yet. Click "Add Skill" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 w-5 h-5" />
                    Certifications
                  </div>
                  <Button type="button" onClick={addCertification}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Certification
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {certificationsFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Certification {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                              <Input placeholder="AWS Certified Developer" {...field} />
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
                              <Input placeholder="Amazon Web Services" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.issueDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.credentialId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credential ID (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC123DEF456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`certifications.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificate URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}

                {certificationsFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No certifications added yet. Click "Add Certification" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderOpen className="mr-2 w-5 h-5" />
                    Projects
                  </div>
                  <Button type="button" onClick={addProject}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Project
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {projectsFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProject(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
                              <Input placeholder="E-commerce Website" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`projects.${index}.startDate`}
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
                        name={`projects.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                            <FormLabel>Project URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://myproject.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`projects.${index}.repository`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repository URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/user/repo" {...field} />
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
                        <FormItem className="mt-4">
                          <FormLabel>Project Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project, your role, and achievements..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}

                {projectsFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No projects added yet. Click "Add Project" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="mr-2 w-5 h-5" />
                    Achievements
                  </div>
                  <Button type="button" onClick={addAchievement}>
                    <Plus className="mr-2 w-4 h-4" />
                    Add Achievement
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {achievementsFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Achievement {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`achievements.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Achievement Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Employee of the Month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`achievements.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Work, Academic, Personal, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`achievements.${index}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
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
                      name={`achievements.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the achievement and its significance..."
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}

                {achievementsFields.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No achievements added yet. Click "Add Achievement" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Information */}
          <TabsContent value="additional">
            <div className="space-y-6">
              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="mr-2 w-5 h-5" />
                      Languages
                    </div>
                    <Button type="button" onClick={addLanguage}>
                      <Plus className="mr-2 w-4 h-4" />
                      Add Language
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languagesFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-sm">Language {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLanguage(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name={`languages.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Language</FormLabel>
                                <FormControl>
                                  <Input placeholder="English, Spanish, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`languages.${index}.proficiency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Proficiency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select proficiency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Basic">Basic</SelectItem>
                                    <SelectItem value="Conversational">Conversational</SelectItem>
                                    <SelectItem value="Fluent">Fluent</SelectItem>
                                    <SelectItem value="Native">Native</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  {languagesFields.length === 0 && (
                    <div className="text-center py-6 text-neutral-500">
                      No languages added yet. Click "Add Language" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hobbies and Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 w-5 h-5" />
                    Hobbies & Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="hobbies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hobbies & Interests</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Photography, hiking, reading, cooking, traveling..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any other relevant information you'd like to include..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </form>
    </Form>
  );
}