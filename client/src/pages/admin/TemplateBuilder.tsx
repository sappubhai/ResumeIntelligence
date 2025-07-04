
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
  Plus,
  Layout,
  Columns,
  Sidebar,
  AlignLeft,
  AlignRight,
  Grid3X3
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
  fields: Record<string, { enabled: boolean; label: string; type: string; required?: boolean }>;
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
  location: 'sidebar' | 'main' | string; // row ID for grid layout
}

interface TemplateRow {
  id: string;
  columns: number;
  sections: { [columnIndex: number]: TemplateSection[] };
}

interface PageLayout {
  type: 'single' | 'left-sidebar' | 'right-sidebar' | 'grid';
  sidebarSections: TemplateSection[];
  mainSections: TemplateSection[];
  gridRows: TemplateRow[];
}

interface DraggableItemProps {
  section: TemplateSection;
  index: number;
  location: string;
  moveSection: (dragIndex: number, hoverIndex: number, fromLocation: string, toLocation: string) => void;
  updateSection: (id: string, updates: Partial<TemplateSection>) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  onSelectSection: (sectionId: string) => void;
  isSelected: boolean;
}

const DraggableItem = ({ section, index, location, moveSection, updateSection, deleteSection, duplicateSection, onSelectSection, isSelected }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [, drag] = useDrag({
    type: 'section',
    item: { index, location, sectionId: section.id },
  });

  const [, drop] = useDrop({
    accept: 'section',
    hover: (item: { index: number; location: string; sectionId: string }) => {
      if (item.index !== index || item.location !== location) {
        moveSection(item.index, index, item.location, location);
        item.index = index;
        item.location = location;
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
      className={`border-2 border-dashed rounded-lg p-3 mb-3 bg-white hover:border-gray-400 cursor-move transition-all ${
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
      }`}
      style={{
        backgroundColor: section.style.backgroundColor || '#ffffff',
        borderRadius: `${section.style.borderRadius || 8}px`,
        padding: `${section.style.padding || 12}px`,
        margin: `${section.style.margin || 0}px 0`
      }}
      onClick={() => onSelectSection(section.id)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-100 rounded">
            {getSectionIcon()}
          </div>
          <span className="font-medium text-sm">{section.title}</span>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Move className="h-3 w-3 text-gray-400" />
        </div>
      </div>
      <div className="text-xs text-gray-600">
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

const DropZone = ({ location, onDrop, children, className = "" }: { location: string; onDrop: (sectionId: string, location: string) => void; children: React.ReactNode; className?: string }) => {
  const [, drop] = useDrop({
    accept: 'section',
    drop: (item: { sectionId: string }) => {
      onDrop(item.sectionId, location);
    },
  });

  return (
    <div ref={drop} className={`min-h-[100px] ${className}`}>
      {children}
    </div>
  );
};

export default function TemplateBuilder() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [templateName, setTemplateName] = useState("Custom Template");
  const [templateCategory, setTemplateCategory] = useState("professional");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [pageLayout, setPageLayout] = useState<PageLayout>({
    type: 'single',
    sidebarSections: [],
    mainSections: [
      {
        id: '1',
        type: 'header',
        title: 'Header',
        content: {},
        fields: {
          fullName: { enabled: true, label: 'Full Name', type: 'text', required: true },
          professionalTitle: { enabled: true, label: 'Professional Title', type: 'text' },
          email: { enabled: true, label: 'Email', type: 'email', required: true },
          phone: { enabled: true, label: 'Phone', type: 'tel' },
          address: { enabled: true, label: 'Address', type: 'text' },
          photo: { enabled: true, label: 'Photo', type: 'file' },
          linkedin: { enabled: false, label: 'LinkedIn', type: 'url' },
          website: { enabled: false, label: 'Website', type: 'url' }
        },
        style: {
          backgroundColor: '#f3f4f6',
          padding: 24,
          borderRadius: 8
        },
        location: 'main'
      }
    ],
    gridRows: []
  });

  const [globalStyles, setGlobalStyles] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
    fontFamily: 'Inter',
    fontSize: 'base',
    photoStyle: 'circle',
    sectionDivider: 'line',
    colorScheme: 'professional',
    headerStyle: 'centered',
    spacing: 'normal',
    borderStyle: 'none'
  });

  const availableSections = [
    { type: 'header', title: 'Header', icon: User, fields: {
      fullName: { enabled: true, label: 'Full Name', type: 'text', required: true },
      professionalTitle: { enabled: true, label: 'Professional Title', type: 'text' },
      email: { enabled: true, label: 'Email', type: 'email', required: true },
      phone: { enabled: true, label: 'Phone', type: 'tel' },
      address: { enabled: true, label: 'Address', type: 'text' },
      photo: { enabled: true, label: 'Photo', type: 'file' },
      linkedin: { enabled: false, label: 'LinkedIn', type: 'url' },
      website: { enabled: false, label: 'Website', type: 'url' }
    }},
    { type: 'summary', title: 'Professional Summary', icon: FileText, fields: {
      summary: { enabled: true, label: 'Summary Text', type: 'textarea', required: true }
    }},
    { type: 'experience', title: 'Work Experience', icon: Briefcase, fields: {
      company: { enabled: true, label: 'Company', type: 'text', required: true },
      position: { enabled: true, label: 'Position', type: 'text', required: true },
      startDate: { enabled: true, label: 'Start Date', type: 'date' },
      endDate: { enabled: true, label: 'End Date', type: 'date' },
      current: { enabled: true, label: 'Current Position', type: 'checkbox' },
      description: { enabled: true, label: 'Description', type: 'textarea' },
      achievements: { enabled: false, label: 'Key Achievements', type: 'textarea' }
    }},
    { type: 'education', title: 'Education', icon: GraduationCap, fields: {
      institution: { enabled: true, label: 'Institution', type: 'text', required: true },
      degree: { enabled: true, label: 'Degree', type: 'text', required: true },
      field: { enabled: true, label: 'Field of Study', type: 'text' },
      startDate: { enabled: true, label: 'Start Date', type: 'date' },
      endDate: { enabled: true, label: 'End Date', type: 'date' },
      gpa: { enabled: false, label: 'GPA', type: 'number' },
      honors: { enabled: false, label: 'Honors', type: 'text' }
    }},
    { type: 'skills', title: 'Skills', icon: Award, fields: {
      skillName: { enabled: true, label: 'Skill Name', type: 'text', required: true },
      level: { enabled: true, label: 'Proficiency Level', type: 'select' },
      category: { enabled: false, label: 'Category', type: 'text' },
      showRating: { enabled: true, label: 'Show Rating', type: 'checkbox' }
    }},
    { type: 'languages', title: 'Languages', icon: Languages, fields: {
      language: { enabled: true, label: 'Language', type: 'text', required: true },
      proficiency: { enabled: true, label: 'Proficiency', type: 'select' },
      certification: { enabled: false, label: 'Certification', type: 'text' }
    }},
    { type: 'references', title: 'References', icon: Users, fields: {
      name: { enabled: true, label: 'Name', type: 'text', required: true },
      title: { enabled: true, label: 'Title', type: 'text' },
      company: { enabled: true, label: 'Company', type: 'text' },
      email: { enabled: true, label: 'Email', type: 'email' },
      phone: { enabled: true, label: 'Phone', type: 'tel' },
      relationship: { enabled: false, label: 'Relationship', type: 'text' }
    }}
  ];

  const getAllSections = () => {
    const sections = [...pageLayout.sidebarSections, ...pageLayout.mainSections];
    pageLayout.gridRows.forEach(row => {
      Object.values(row.sections).forEach(columnSections => {
        sections.push(...columnSections);
      });
    });
    return sections;
  };

  const moveSection = (dragIndex: number, hoverIndex: number, fromLocation: string, toLocation: string) => {
    const allSections = getAllSections();
    const draggedSection = allSections.find(s => s.location === fromLocation);
    if (!draggedSection) return;

    // Update section location
    draggedSection.location = toLocation;
    
    // Update page layout
    setPageLayout(prev => {
      const newLayout = { ...prev };
      
      // Remove from old location
      if (fromLocation === 'sidebar') {
        newLayout.sidebarSections = newLayout.sidebarSections.filter(s => s.id !== draggedSection.id);
      } else if (fromLocation === 'main') {
        newLayout.mainSections = newLayout.mainSections.filter(s => s.id !== draggedSection.id);
      }
      
      // Add to new location
      if (toLocation === 'sidebar') {
        newLayout.sidebarSections.splice(hoverIndex, 0, draggedSection);
      } else if (toLocation === 'main') {
        newLayout.mainSections.splice(hoverIndex, 0, draggedSection);
      }
      
      return newLayout;
    });
  };

  const addSection = (type: string, title: string, location: string = 'main') => {
    const sectionTemplate = availableSections.find(s => s.type === type);
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      type,
      title,
      content: {},
      fields: sectionTemplate?.fields || {},
      style: {
        padding: 16,
        fontSize: 'base'
      },
      location
    };
    
    setPageLayout(prev => {
      const newLayout = { ...prev };
      if (location === 'sidebar') {
        newLayout.sidebarSections.push(newSection);
      } else if (location === 'main') {
        newLayout.mainSections.push(newSection);
      }
      return newLayout;
    });
  };

  const updateSection = (id: string, updates: Partial<TemplateSection>) => {
    setPageLayout(prev => {
      const newLayout = { ...prev };
      
      // Update in sidebar
      newLayout.sidebarSections = newLayout.sidebarSections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      );
      
      // Update in main
      newLayout.mainSections = newLayout.mainSections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      );
      
      // Update in grid rows
      newLayout.gridRows = newLayout.gridRows.map(row => ({
        ...row,
        sections: Object.fromEntries(
          Object.entries(row.sections).map(([col, sections]) => [
            col,
            sections.map(section => section.id === id ? { ...section, ...updates } : section)
          ])
        )
      }));
      
      return newLayout;
    });
  };

  const deleteSection = (id: string) => {
    setPageLayout(prev => {
      const newLayout = { ...prev };
      
      newLayout.sidebarSections = newLayout.sidebarSections.filter(section => section.id !== id);
      newLayout.mainSections = newLayout.mainSections.filter(section => section.id !== id);
      
      newLayout.gridRows = newLayout.gridRows.map(row => ({
        ...row,
        sections: Object.fromEntries(
          Object.entries(row.sections).map(([col, sections]) => [
            col,
            sections.filter(section => section.id !== id)
          ])
        )
      }));
      
      return newLayout;
    });
    
    if (selectedSection === id) {
      setSelectedSection(null);
    }
  };

  const duplicateSection = (id: string) => {
    const allSections = getAllSections();
    const sectionToDuplicate = allSections.find(s => s.id === id);
    if (sectionToDuplicate) {
      const newSection = {
        ...sectionToDuplicate,
        id: Date.now().toString(),
        title: `${sectionToDuplicate.title} (Copy)`
      };
      
      setPageLayout(prev => {
        const newLayout = { ...prev };
        if (sectionToDuplicate.location === 'sidebar') {
          newLayout.sidebarSections.push(newSection);
        } else if (sectionToDuplicate.location === 'main') {
          newLayout.mainSections.push(newSection);
        }
        return newLayout;
      });
    }
  };

  const addRow = (columns: number) => {
    const newRow: TemplateRow = {
      id: Date.now().toString(),
      columns,
      sections: {}
    };
    for (let i = 0; i < columns; i++) {
      newRow.sections[i] = [];
    }
    
    setPageLayout(prev => ({
      ...prev,
      gridRows: [...prev.gridRows, newRow]
    }));
  };

  const addCustomSection = () => {
    const newSection: TemplateSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'Custom Section',
      content: {},
      fields: {
        customField1: { enabled: true, label: 'Custom Field 1', type: 'text' }
      },
      style: {
        padding: 16,
        fontSize: 'base'
      },
      location: 'main'
    };
    
    setPageLayout(prev => ({
      ...prev,
      mainSections: [...prev.mainSections, newSection]
    }));
  };

  const addCustomField = (sectionId: string) => {
    const fieldKey = `customField${Date.now()}`;
    updateSection(sectionId, {
      fields: {
        ...currentSection?.fields,
        [fieldKey]: { enabled: true, label: `Custom Field ${Object.keys(currentSection?.fields || {}).length + 1}`, type: 'text' }
      }
    });
  };

  const currentSection = getAllSections().find(s => s.id === selectedSection);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allSections = getAllSections();
      const { html, css } = generateTemplate(allSections);
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

  const generateTemplate = (sections: TemplateSection[]) => {
    const css = `
      .resume-template {
        font-family: ${globalStyles.fontFamily}, sans-serif;
        color: #333;
        line-height: 1.6;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0.5in;
        background: white;
      }
      .template-header {
        text-align: ${globalStyles.headerStyle === 'centered' ? 'center' : 'left'};
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: ${globalStyles.primaryColor}10;
        border-radius: 8px;
      }
      .template-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border-radius: 6px;
      }
      .section-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: ${globalStyles.primaryColor};
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid ${globalStyles.primaryColor};
      }
      .template-layout {
        display: grid;
        gap: 1.5rem;
      }
      .layout-single { grid-template-columns: 1fr; }
      .layout-left-sidebar { grid-template-columns: 1fr 2fr; }
      .layout-right-sidebar { grid-template-columns: 2fr 1fr; }
      .sidebar { background: #f8f9fa; padding: 1rem; border-radius: 8px; }
      .main-content { background: white; }
      .grid-row { display: grid; gap: 1rem; margin-bottom: 1rem; }
      .grid-col-1 { grid-template-columns: 1fr; }
      .grid-col-2 { grid-template-columns: 1fr 1fr; }
      .grid-col-3 { grid-template-columns: 1fr 1fr 1fr; }
      .grid-col-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
      .grid-col-5 { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
      .field-group { margin-bottom: 0.75rem; }
      .field-label { font-weight: 600; color: #555; }
      .field-value { color: #333; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: ${globalStyles.headerStyle === 'centered' ? 'center' : 'flex-start'}; }
      .contact-item { display: flex; align-items: center; gap: 0.25rem; }
      .photo-circle { border-radius: 50%; }
      .photo-square { border-radius: 8px; }
    `;

    let html = '<div class="resume-template">';
    
    if (pageLayout.type === 'single') {
      html += '<div class="template-layout layout-single">';
      html += '<div class="main-content">';
      pageLayout.mainSections.forEach(section => {
        html += generateSectionHTML(section);
      });
      html += '</div></div>';
    } else if (pageLayout.type === 'left-sidebar' || pageLayout.type === 'right-sidebar') {
      html += `<div class="template-layout ${pageLayout.type === 'left-sidebar' ? 'layout-left-sidebar' : 'layout-right-sidebar'}">`;
      
      if (pageLayout.type === 'left-sidebar') {
        html += '<div class="sidebar">';
        pageLayout.sidebarSections.forEach(section => {
          html += generateSectionHTML(section);
        });
        html += '</div>';
      }
      
      html += '<div class="main-content">';
      pageLayout.mainSections.forEach(section => {
        html += generateSectionHTML(section);
      });
      html += '</div>';
      
      if (pageLayout.type === 'right-sidebar') {
        html += '<div class="sidebar">';
        pageLayout.sidebarSections.forEach(section => {
          html += generateSectionHTML(section);
        });
        html += '</div>';
      }
      
      html += '</div>';
    } else if (pageLayout.type === 'grid') {
      pageLayout.gridRows.forEach(row => {
        html += `<div class="grid-row grid-col-${row.columns}">`;
        for (let i = 0; i < row.columns; i++) {
          html += '<div class="grid-column">';
          (row.sections[i] || []).forEach(section => {
            html += generateSectionHTML(section);
          });
          html += '</div>';
        }
        html += '</div>';
      });
    }
    
    html += '</div>';
    
    return { html, css };
  };

  const generateSectionHTML = (section: TemplateSection) => {
    let sectionHTML = `<div class="template-section" style="`;
    if (section.style.backgroundColor) sectionHTML += `background-color: ${section.style.backgroundColor}; `;
    if (section.style.padding) sectionHTML += `padding: ${section.style.padding}px; `;
    if (section.style.borderRadius) sectionHTML += `border-radius: ${section.style.borderRadius}px; `;
    if (section.style.textAlign) sectionHTML += `text-align: ${section.style.textAlign}; `;
    sectionHTML += '">';
    
    sectionHTML += `<h3 class="section-title">${section.title}</h3>`;
    
    // Generate sample data based on section type
    if (section.type === 'header') {
      sectionHTML += `
        <div class="template-header">
          <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem;">John Doe</h1>
          <h2 style="margin: 0 0 1rem 0; font-size: 1.25rem; color: #666;">Software Engineer</h2>
          <div class="contact-info">
            <span class="contact-item">📧 john.doe@email.com</span>
            <span class="contact-item">📱 (555) 123-4567</span>
            <span class="contact-item">📍 New York, NY</span>
            <span class="contact-item">🔗 linkedin.com/in/johndoe</span>
          </div>
        </div>
      `;
    } else if (section.type === 'summary') {
      sectionHTML += `
        <p>Experienced software engineer with 5+ years of expertise in full-stack development. 
        Passionate about creating scalable web applications and leading development teams.</p>
      `;
    } else if (section.type === 'experience') {
      sectionHTML += `
        <div class="field-group">
          <h4 style="margin: 0 0 0.25rem 0;">Senior Software Engineer - TechCorp Inc.</h4>
          <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Jan 2022 - Present</p>
          <p>Led development of microservices architecture serving 1M+ users. Mentored junior developers and improved deployment efficiency by 40%.</p>
        </div>
      `;
    } else if (section.type === 'education') {
      sectionHTML += `
        <div class="field-group">
          <h4 style="margin: 0 0 0.25rem 0;">Bachelor of Science in Computer Science</h4>
          <p style="margin: 0 0 0.5rem 0; color: #666;">University of Technology - 2018</p>
          <p>Relevant Coursework: Data Structures, Algorithms, Software Engineering</p>
        </div>
      `;
    } else if (section.type === 'skills') {
      sectionHTML += `
        <div class="field-group">
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span style="background: ${globalStyles.primaryColor}20; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">JavaScript</span>
            <span style="background: ${globalStyles.primaryColor}20; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">React</span>
            <span style="background: ${globalStyles.primaryColor}20; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">Node.js</span>
            <span style="background: ${globalStyles.primaryColor}20; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem;">Python</span>
          </div>
        </div>
      `;
    } else if (section.type === 'custom') {
      sectionHTML += `
        <div class="field-group">
          <p>Custom section content - This section can be customized with any fields you define.</p>
        </div>
      `;
    }
    
    sectionHTML += '</div>';
    return sectionHTML;
  };

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
                  <p className="text-sm text-slate-600">Create custom templates with advanced layouts</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const allSections = getAllSections();
                    const { html, css } = generateTemplate(allSections);
                    const previewWindow = window.open('', '_blank');
                    if (previewWindow) {
                      previewWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Template Preview</title>
                            <style>${css}</style>
                          </head>
                          <body>${html}</body>
                        </html>
                      `);
                      previewWindow.document.close();
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const allSections = getAllSections();
                    const { html, css } = generateTemplate(allSections);
                    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${templateName}</title>
    <style>${css}</style>
</head>
<body>${html}</body>
</html>`;
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HTML
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Layout & Components */}
            <div className="lg:col-span-1 space-y-4">
              {/* Template Info */}
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

              {/* Page Layout */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Page Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout Type</Label>
                    <RadioGroup
                      value={pageLayout.type}
                      onValueChange={(value: any) => setPageLayout(prev => ({ ...prev, type: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single" className="flex items-center cursor-pointer">
                          <Layout className="w-4 h-4 mr-2" />
                          Single Column
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left-sidebar" id="left-sidebar" />
                        <Label htmlFor="left-sidebar" className="flex items-center cursor-pointer">
                          <Sidebar className="w-4 h-4 mr-2" />
                          Left Sidebar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right-sidebar" id="right-sidebar" />
                        <Label htmlFor="right-sidebar" className="flex items-center cursor-pointer">
                          <AlignRight className="w-4 h-4 mr-2" />
                          Right Sidebar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grid" id="grid" />
                        <Label htmlFor="grid" className="flex items-center cursor-pointer">
                          <Grid3X3 className="w-4 h-4 mr-2" />
                          Grid Layout
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {pageLayout.type === 'grid' && (
                    <div className="space-y-2">
                      <Label>Add Row</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(cols => (
                          <Button
                            key={cols}
                            variant="outline"
                            size="sm"
                            onClick={() => addRow(cols)}
                          >
                            {cols} Col
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Sections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="main" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="main">Main</TabsTrigger>
                      <TabsTrigger value="sidebar" disabled={pageLayout.type === 'single'}>
                        Sidebar
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="main" className="space-y-2">
                      {availableSections.map((section) => (
                        <Button
                          key={section.type}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => addSection(section.type, section.title, 'main')}
                        >
                          <section.icon className="w-4 h-4 mr-2" />
                          {section.title}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full justify-start border-dashed border-2"
                        onClick={addCustomSection}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Custom Section
                      </Button>
                    </TabsContent>
                    <TabsContent value="sidebar" className="space-y-2">
                      {availableSections.map((section) => (
                        <Button
                          key={section.type}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => addSection(section.type, section.title, 'sidebar')}
                        >
                          <section.icon className="w-4 h-4 mr-2" />
                          {section.title}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full justify-start border-dashed border-2"
                        onClick={() => addCustomSection()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Custom Section
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Global Styles */}
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
                  <CardDescription>
                    Layout: {pageLayout.type.charAt(0).toUpperCase() + pageLayout.type.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[600px] bg-gray-50 rounded-lg p-4">
                    {pageLayout.type === 'single' && (
                      <DropZone location="main" onDrop={() => {}}>
                        {pageLayout.mainSections.map((section, index) => (
                          <DraggableItem
                            key={section.id}
                            section={section}
                            index={index}
                            location="main"
                            moveSection={moveSection}
                            updateSection={updateSection}
                            deleteSection={deleteSection}
                            duplicateSection={duplicateSection}
                            onSelectSection={setSelectedSection}
                            isSelected={selectedSection === section.id}
                          />
                        ))}
                      </DropZone>
                    )}

                    {(pageLayout.type === 'left-sidebar' || pageLayout.type === 'right-sidebar') && (
                      <div className={`grid grid-cols-3 gap-4 ${pageLayout.type === 'right-sidebar' ? 'grid-flow-col-dense' : ''}`}>
                        {/* Sidebar */}
                        <div className={`${pageLayout.type === 'right-sidebar' ? 'col-start-3' : ''}`}>
                          <div className="bg-gray-100 p-3 rounded-lg min-h-[200px]">
                            <h4 className="font-medium mb-2">Sidebar</h4>
                            <DropZone location="sidebar" onDrop={() => {}}>
                              {pageLayout.sidebarSections.map((section, index) => (
                                <DraggableItem
                                  key={section.id}
                                  section={section}
                                  index={index}
                                  location="sidebar"
                                  moveSection={moveSection}
                                  updateSection={updateSection}
                                  deleteSection={deleteSection}
                                  duplicateSection={duplicateSection}
                                  onSelectSection={setSelectedSection}
                                  isSelected={selectedSection === section.id}
                                />
                              ))}
                            </DropZone>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-2">
                          <div className="bg-white p-3 rounded-lg min-h-[200px]">
                            <h4 className="font-medium mb-2">Main Content</h4>
                            <DropZone location="main" onDrop={() => {}}>
                              {pageLayout.mainSections.map((section, index) => (
                                <DraggableItem
                                  key={section.id}
                                  section={section}
                                  index={index}
                                  location="main"
                                  moveSection={moveSection}
                                  updateSection={updateSection}
                                  deleteSection={deleteSection}
                                  duplicateSection={duplicateSection}
                                  onSelectSection={setSelectedSection}
                                  isSelected={selectedSection === section.id}
                                />
                              ))}
                            </DropZone>
                          </div>
                        </div>
                      </div>
                    )}

                    {pageLayout.type === 'grid' && (
                      <div className="space-y-4">
                        {pageLayout.gridRows.map((row, rowIndex) => (
                          <div key={row.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Row {rowIndex + 1} ({row.columns} columns)</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPageLayout(prev => ({
                                  ...prev,
                                  gridRows: prev.gridRows.filter(r => r.id !== row.id)
                                }))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className={`grid grid-cols-${row.columns} gap-2`}>
                              {Array.from({ length: row.columns }).map((_, colIndex) => (
                                <div key={colIndex} className="bg-gray-100 p-2 rounded min-h-[100px]">
                                  <div className="text-xs text-gray-500 mb-1">Column {colIndex + 1}</div>
                                  <DropZone location={`${row.id}-${colIndex}`} onDrop={() => {}}>
                                    {(row.sections[colIndex] || []).map((section, sectionIndex) => (
                                      <DraggableItem
                                        key={section.id}
                                        section={section}
                                        index={sectionIndex}
                                        location={`${row.id}-${colIndex}`}
                                        moveSection={moveSection}
                                        updateSection={updateSection}
                                        deleteSection={deleteSection}
                                        duplicateSection={duplicateSection}
                                        onSelectSection={setSelectedSection}
                                        isSelected={selectedSection === section.id}
                                      />
                                    ))}
                                  </DropZone>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Section Properties */}
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

                      <div className="space-y-3">
                        <Label>Section Fields</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {Object.entries(currentSection.fields).map(([fieldKey, field]) => (
                            <div key={fieldKey} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.enabled}
                                  onCheckedChange={(checked) => updateSection(currentSection.id, {
                                    fields: {
                                      ...currentSection.fields,
                                      [fieldKey]: { ...field, enabled: checked }
                                    }
                                  })}
                                />
                                <Label className="text-sm">{field.label}</Label>
                                {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                {fieldKey.startsWith('customField') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-600"
                                    onClick={() => {
                                      const newFields = { ...currentSection.fields };
                                      delete newFields[fieldKey];
                                      updateSection(currentSection.id, { fields: newFields });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {currentSection.type === 'custom' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => addCustomField(currentSection.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Custom Field
                          </Button>
                        )}
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
