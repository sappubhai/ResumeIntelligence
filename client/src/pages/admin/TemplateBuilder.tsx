import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Palette, 
  ArrowLeft, 
  Save, 
  Eye, 
  Code,
  Layers,
  Square,
  Circle,
  Type,
  Image,
  Minus,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Users,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Download,
  Upload,
  Trash2,
  Settings,
  Move,
  Copy,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface TemplateSection {
  id: string;
  type: string;
  title: string;
  content: any;
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    fontSize?: string;
    fontFamily?: string;
    textAlign?: string;
  };
}

interface DraggableItemProps {
  section: TemplateSection;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  updateSection: (id: string, updates: Partial<TemplateSection>) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
}

const DraggableItem = ({ section, index, moveSection, updateSection, deleteSection, duplicateSection }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [, drag] = useDrag({
    type: 'section',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'section',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveSection(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const getSectionIcon = () => {
    switch (section.type) {
      case 'header': return <User className="w-4 h-4" />;
      case 'summary': return <FileText className="w-4 h-4" />;
      case 'experience': return <Briefcase className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      case 'skills': return <Award className="w-4 h-4" />;
      case 'languages': return <Languages className="w-4 h-4" />;
      case 'references': return <Users className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={ref}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 bg-white hover:border-gray-400 cursor-move"
      style={{
        backgroundColor: section.style.backgroundColor || '#ffffff',
        borderRadius: `${section.style.borderRadius || 8}px`,
        padding: `${section.style.padding || 16}px`,
        margin: `${section.style.margin || 0}px 0`
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded">
            {getSectionIcon()}
          </div>
          <span className="font-medium">{section.title}</span>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicateSection(section.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => deleteSection(section.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Move className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {section.type === 'header' && 'Contact information and photo'}
        {section.type === 'summary' && 'Professional summary or objective'}
        {section.type === 'experience' && 'Work experience details'}
        {section.type === 'education' && 'Educational background'}
        {section.type === 'skills' && 'Technical and soft skills'}
        {section.type === 'languages' && 'Language proficiencies'}
        {section.type === 'references' && 'Professional references'}
      </div>
    </div>
  );
};

export default function TemplateBuilder() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [templateName, setTemplateName] = useState("Custom Template");
  const [templateCategory, setTemplateCategory] = useState("professional");
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      id: '1',
      type: 'header',
      title: 'Header',
      content: {},
      style: {
        backgroundColor: '#f3f4f6',
        padding: 24,
        borderRadius: 8
      }
    },
    {
      id: '2',
      type: 'summary',
      title: 'Professional Summary',
      content: {},
      style: {
        padding: 16,
        fontSize: 'base'
      }
    }
  ]);

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [globalStyles, setGlobalStyles] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    fontSize: 'base',
    photoStyle: 'circle',
    sectionDivider: 'line',
    colorScheme: 'professional'
  });

  const availableSections = [
    { type: 'header', title: 'Header', icon: User },
    { type: 'summary', title: 'Professional Summary', icon: FileText },
    { type: 'experience', title: 'Work Experience', icon: Briefcase },
    { type: 'education', title: 'Education', icon: GraduationCap },
    { type: 'skills', title: 'Skills', icon: Award },
    { type: 'languages', title: 'Languages', icon: Languages },
    { type: 'references', title: 'References', icon: Users },
    { type: 'custom', title: 'Custom Section', icon: Plus }
  ];

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const draggedSection = sections[dragIndex];
    const newSections = [...sections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);
    setSections(newSections);
  };

  const addSection = (type: string, title: string) => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      type,
      title,
      content: {},
      style: {
        padding: 16,
        fontSize: 'base'
      }
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<TemplateSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const duplicateSection = (id: string) => {
    const sectionToDuplicate = sections.find(s => s.id === id);
    if (sectionToDuplicate) {
      const newSection = {
        ...sectionToDuplicate,
        id: Date.now().toString(),
        title: `${sectionToDuplicate.title} (Copy)`
      };
      setSections([...sections, newSection]);
    }
  };

  const generateTemplate = () => {
    const css = `
      :root {
        --primary-color: ${globalStyles.primaryColor};
        --secondary-color: ${globalStyles.secondaryColor};
        --font-family: ${globalStyles.fontFamily}, sans-serif;
      }
      
      body {
        font-family: var(--font-family);
        color: #1f2937;
        line-height: 1.6;
      }
      
      .photo-${globalStyles.photoStyle} {
        ${globalStyles.photoStyle === 'circle' ? 'border-radius: 50%;' : 'border-radius: 8px;'}
        width: 120px;
        height: 120px;
        object-fit: cover;
      }
      
      .section-divider {
        ${globalStyles.sectionDivider === 'line' ? 'border-top: 2px solid var(--primary-color);' : ''}
        ${globalStyles.sectionDivider === 'gradient' ? 'background: linear-gradient(to right, var(--primary-color), var(--secondary-color)); height: 2px;' : ''}
        margin: 24px 0;
      }
    `;

    const html = `
      <div class="resume-template">
        ${sections.map(section => `
          <section class="resume-section ${section.type}" style="${Object.entries(section.style).map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${typeof value === 'number' ? value + 'px' : value}`;
          }).join('; ')}">
            ${generateSectionHTML(section)}
          </section>
        `).join('')}
      </div>
    `;

    return { html, css };
  };

  const generateSectionHTML = (section: TemplateSection) => {
    switch (section.type) {
      case 'header':
        return `
          <div class="header-content">
            <img src="{{photoUrl}}" alt="{{fullName}}" class="photo-${globalStyles.photoStyle}" />
            <div class="header-info">
              <h1 class="name">{{fullName}}</h1>
              <p class="title">{{professionalTitle}}</p>
              <div class="contact-info">
                <span>{{email}}</span> | <span>{{mobileNumber}}</span> | <span>{{address}}</span>
              </div>
            </div>
          </div>
        `;
      case 'summary':
        return `
          <h2>${section.title}</h2>
          <p>{{summary}}</p>
        `;
      case 'experience':
        return `
          <h2>${section.title}</h2>
          {{#workExperience}}
          <div class="experience-item">
            <h3>{{position}} at {{company}}</h3>
            <p class="date">{{startDate}} - {{endDate}}</p>
            <p>{{description}}</p>
          </div>
          {{/workExperience}}
        `;
      case 'education':
        return `
          <h2>${section.title}</h2>
          {{#education}}
          <div class="education-item">
            <h3>{{degree}} in {{field}}</h3>
            <p>{{institution}}</p>
            <p class="date">{{startDate}} - {{endDate}}</p>
          </div>
          {{/education}}
        `;
      case 'skills':
        return `
          <h2>${section.title}</h2>
          <div class="skills-grid">
            {{#skills}}
            <div class="skill-item">
              <span>{{name}}</span>
              <div class="skill-rating">★★★★☆</div>
            </div>
            {{/skills}}
          </div>
        `;
      default:
        return `<h2>${section.title}</h2><p>Custom content here</p>`;
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { html, css } = generateTemplate();
      return await apiRequest("POST", "/api/admin/templates", {
        name: templateName,
        category: templateCategory,
        html,
        css,
        description: `Custom template created with Template Builder`
      });
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Your custom template has been saved successfully.",
      });
      setTimeout(() => {
        setLocation("/admin");
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save the template.",
        variant: "destructive",
      });
    }
  });

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Template Builder</h1>
                  <p className="text-sm text-slate-600">Create custom templates visually</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Components */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="executive">Executive</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableSections.map((section) => (
                      <Button
                        key={section.type}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addSection(section.type, section.title)}
                      >
                        <section.icon className="w-4 h-4 mr-2" />
                        {section.title}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Styles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={globalStyles.primaryColor}
                        onChange={(e) => setGlobalStyles({...globalStyles, primaryColor: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={globalStyles.primaryColor}
                        onChange={(e) => setGlobalStyles({...globalStyles, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Photo Style</Label>
                    <RadioGroup
                      value={globalStyles.photoStyle}
                      onValueChange={(value) => setGlobalStyles({...globalStyles, photoStyle: value})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="circle" id="circle" />
                        <Label htmlFor="circle" className="flex items-center cursor-pointer">
                          <Circle className="w-4 h-4 mr-2" />
                          Circle
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="square" id="square" />
                        <Label htmlFor="square" className="flex items-center cursor-pointer">
                          <Square className="w-4 h-4 mr-2" />
                          Square
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={globalStyles.fontFamily}
                      onChange={(e) => setGlobalStyles({...globalStyles, fontFamily: e.target.value})}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Template Canvas</CardTitle>
                  <CardDescription>Drag and drop sections to rearrange</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[600px] bg-gray-50 rounded-lg p-6">
                    {sections.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Layers className="w-16 h-16 mx-auto mb-4" />
                          <p>Add sections from the left panel to start building your template</p>
                        </div>
                      </div>
                    ) : (
                      sections.map((section, index) => (
                        <DraggableItem
                          key={section.id}
                          section={section}
                          index={index}
                          moveSection={moveSection}
                          updateSection={updateSection}
                          deleteSection={deleteSection}
                          duplicateSection={duplicateSection}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Section Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSection ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={currentSection.title}
                          onChange={(e) => updateSection(currentSection.id, { title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={currentSection.style.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { 
                              style: { ...currentSection.style, backgroundColor: e.target.value }
                            })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={currentSection.style.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, { 
                              style: { ...currentSection.style, backgroundColor: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Padding</Label>
                        <Slider
                          value={[currentSection.style.padding || 16]}
                          onValueChange={([value]) => updateSection(currentSection.id, { 
                            style: { ...currentSection.style, padding: value }
                          })}
                          max={48}
                          step={4}
                        />
                        <span className="text-sm text-gray-500">{currentSection.style.padding || 16}px</span>
                      </div>

                      <div className="space-y-2">
                        <Label>Border Radius</Label>
                        <Slider
                          value={[currentSection.style.borderRadius || 8]}
                          onValueChange={([value]) => updateSection(currentSection.id, { 
                            style: { ...currentSection.style, borderRadius: value }
                          })}
                          max={24}
                          step={2}
                        />
                        <span className="text-sm text-gray-500">{currentSection.style.borderRadius || 8}px</span>
                      </div>

                      <div className="space-y-2">
                        <Label>Text Alignment</Label>
                        <RadioGroup
                          value={currentSection.style.textAlign || 'left'}
                          onValueChange={(value) => updateSection(currentSection.id, { 
                            style: { ...currentSection.style, textAlign: value }
                          })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="left" id="left" />
                            <Label htmlFor="left">Left</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="center" id="center" />
                            <Label htmlFor="center">Center</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="right" id="right" />
                            <Label htmlFor="right">Right</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Select a section to edit its properties
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}