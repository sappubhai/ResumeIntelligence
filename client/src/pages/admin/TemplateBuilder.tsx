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
import { X } from "lucide-react";

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
  type: 'single' | 'left-sidebar' | 'right-sidebar' | 'grid' | 'custom';
  sidebarSections: TemplateSection[];
  mainSections: TemplateSection[];
  gridRows: TemplateRow[];
  customRows: CustomRow[];
}

interface CustomRow {
  id: string;
  type: 'header' | 'sidebar' | 'content';
  columns: CustomColumn[];
}

interface CustomColumn {
  id: string;
  width: number; // percentage of row width
  sections: TemplateSection[];
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

const DropZone = ({ location, onDrop, children, className = "", showAddButton = false, onAddSection }: { location: string; onDrop: (sectionId: string, location: string) => void; children: React.ReactNode; className?: string, showAddButton?: boolean, onAddSection?: () => void }) => {
  const [, drop] = useDrop({
    accept: 'section',
    drop: (item: { sectionId: string }) => {
      onDrop(item.sectionId, location);
    },
  });

  return (
    <div ref={drop} className={`min-h-[100px] ${className}`}>
      {children}
      {showAddButton && onAddSection && (
        <Button variant="ghost" className="w-full border-dashed border-2" onClick={onAddSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      )}
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
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [targetLocation, setTargetLocation] = useState<'main' | 'sidebar'>('main');
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
    gridRows: [],
    customRows: []
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
    pageLayout.customRows.forEach(row => {
        row.columns.forEach(column => {
            sections.push(...column.sections);
        });
    });
    return sections;
  };

  const moveSection = (dragIndex: number, hoverIndex: number, fromLocation: string, toLocation: string) => {
    setPageLayout(prev => {
      const newLayout = { ...prev };
      let draggedSection: TemplateSection | undefined;

      // 1. Remove from old location
      if (fromLocation === 'sidebar') {
        draggedSection = newLayout.sidebarSections[dragIndex];
        newLayout.sidebarSections.splice(dragIndex, 1);
      } else if (fromLocation === 'main') {
        draggedSection = newLayout.mainSections[dragIndex];
        newLayout.mainSections.splice(dragIndex, 1);
      } else if (fromLocation.startsWith('grid')) {
        const [rowId, colIndex] = fromLocation.split('-');
        const rowIndex = newLayout.gridRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          draggedSection = newLayout.gridRows[rowIndex].sections[parseInt(colIndex)][dragIndex];
          newLayout.gridRows[rowIndex].sections[parseInt(colIndex)].splice(dragIndex, 1);
        }
      } else if (fromLocation.startsWith('custom')) {
        const [rowId, colId] = fromLocation.split('-');
        const rowIndex = newLayout.customRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          const colIndex = newLayout.customRows[rowIndex].columns.findIndex(col => col.id === colId);
          if (colIndex !== -1) {
            draggedSection = newLayout.customRows[rowIndex].columns[colIndex].sections[dragIndex];
            newLayout.customRows[rowIndex].columns[colIndex].sections.splice(dragIndex, 1);
          }
        }
      }

      if (!draggedSection) return newLayout;

      // 2. Add to new location
      if (toLocation === 'sidebar') {
        newLayout.sidebarSections.splice(hoverIndex, 0, draggedSection);
        draggedSection.location = 'sidebar';
      } else if (toLocation === 'main') {
        newLayout.mainSections.splice(hoverIndex, 0, draggedSection);
        draggedSection.location = 'main';
      } else if (toLocation.startsWith('grid')) {
        const [rowId, colIndex] = toLocation.split('-');
        const rowIndex = newLayout.gridRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          if (!newLayout.gridRows[rowIndex].sections[parseInt(colIndex)]) {
            newLayout.gridRows[rowIndex].sections[parseInt(colIndex)] = [];
          }
          newLayout.gridRows[rowIndex].sections[parseInt(colIndex)].splice(hoverIndex, 0, draggedSection);
          draggedSection.location = toLocation;
        }
      } else if (toLocation.startsWith('custom')) {
        const [rowId, colId] = toLocation.split('-');
        const rowIndex = newLayout.customRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          const colIndex = newLayout.customRows[rowIndex].columns.findIndex(col => col.id === colId);
          if (colIndex !== -1) {
            newLayout.customRows[rowIndex].columns[colIndex].sections.splice(hoverIndex, 0, draggedSection);
            draggedSection.location = toLocation;
          }
        }
      }

      return newLayout;
    });
  };

  const handleSectionDrop = (sectionId: string, location: string) => {
    // This function intentionally left blank.  The moveSection handles the drop logic now.
    // It is here to satisfy the DropZone's onDrop prop.
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
      } else if (location.startsWith('grid')) {
        const [rowId, colIndex] = location.split('-');
        const rowIndex = newLayout.gridRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          if (!newLayout.gridRows[rowIndex].sections[parseInt(colIndex)]) {
            newLayout.gridRows[rowIndex].sections[parseInt(colIndex)] = [];
          }
          newLayout.gridRows[rowIndex].sections[parseInt(colIndex)].push(newSection);
        }
      } else if (location.startsWith('custom')) {
        const [rowId, colId] = location.split('-');
        const rowIndex = newLayout.customRows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          const colIndex = newLayout.customRows[rowIndex].columns.findIndex(col => col.id === colId);
          if (colIndex !== -1) {
            newLayout.customRows[rowIndex].columns[colIndex].sections.push(newSection);
          }
        }
      }
      return newLayout;
    });
  };

  const handleAddSectionToLocation = (location: string) => {
    // Open a modal or UI to select the section type to add
    const sectionType = prompt("Enter section type (e.g., header, summary):");
    const sectionTitle = prompt("Enter section title:");
    if (sectionType && sectionTitle) {
      addSection(sectionType, sectionTitle, location);
    }
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

       // Update in custom rows
       newLayout.customRows = newLayout.customRows.map(row => ({
        ...row,
        columns: row.columns.map(col => ({
          ...col,
          sections: col.sections.map(section => section.id === id ? { ...section, ...updates } : section)
        }))
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

      newLayout.customRows = newLayout.customRows.map(row => ({
        ...row,
        columns: row.columns.map(col => ({
          ...col,
          sections: col.sections.filter(section => section.id !== id)
        }))
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
        } else if (sectionToDuplicate.location.startsWith('grid')) {
            const [rowId, colIndex] = sectionToDuplicate.location.split('-');
            const rowIndex = newLayout.gridRows.findIndex(row => row.id === rowId);
            if (rowIndex !== -1) {
              if (!newLayout.gridRows[rowIndex].sections[parseInt(colIndex)]) {
                newLayout.gridRows[rowIndex].sections[parseInt(colIndex)] = [];
              }
              newLayout.gridRows[rowIndex].sections[parseInt(colIndex)].push(newSection);
              newSection.location = sectionToDuplicate.location;
            }
        } else if (sectionToDuplicate.location.startsWith('custom')) {
          const [rowId, colId] = sectionToDuplicate.location.split('-');
          const rowIndex = newLayout.customRows.findIndex(row => row.id === rowId);
          if (rowIndex !== -1) {
            const colIndex = newLayout.customRows[rowIndex].columns.findIndex(col => col.id === colId);
            if (colIndex !== -1) {
              newLayout.customRows[rowIndex].columns[colIndex].sections.push(newSection);
              newSection.location = sectionToDuplicate.location;
            }
          }
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

  const addCustomRow = (type: 'header' | 'sidebar' | 'content') => {
    const rowId = Date.now().toString();
    let columns: CustomColumn[] = [];

    if (type === 'header') {
      columns = [{
        id: `${rowId}-col-0`,
        width: 100,
        sections: []
      }];
    } else if (type === 'sidebar') {
      columns = [
        {
          id: `${rowId}-col-0`,
          width: 25,
          sections: []
        },
        {
          id: `${rowId}-col-1`,
          width: 75,
          sections: []
        }
      ];
    } else {
      columns = [
        {
          id: `${rowId}-col-0`,
          width: 50,
          sections: []
        },
        {
          id: `${rowId}-col-1`,
          width: 50,
          sections: []
        }
      ];
    }

    const newRow: CustomRow = {
      id: rowId,
      type,
      columns
    };

    setPageLayout(prev => ({
      ...prev,
      customRows: [...prev.customRows, newRow]
    }));
  };

  const addSidebarHeaderRow = () => {
    const newRow: TemplateRow = {
      id: Date.now().toString(),
      columns: 1,
      sections: { 0: [] }
    };

    setPageLayout(prev => ({
      ...prev,
      gridRows: [newRow, ...prev.gridRows]
    }));
  };

  const addSidebarContentRow = () => {
    const newRow: TemplateRow = {
      id: Date.now().toString(),
      columns: 2,
      sections: { 0: [], 1: [] }
    };

    setPageLayout(prev => ({
      ...prev,
      gridRows: [...prev.gridRows, newRow]
    }));
  };

  const updateCustomColumnWidth = (rowId: string, columnId: string, newWidth: number) => {
    setPageLayout(prev => ({
      ...prev,
      customRows: prev.customRows.map(row => {
        if (row.id === rowId) {
          const updatedColumns = row.columns.map(col => 
            col.id === columnId ? { ...col, width: newWidth } : col
          );
          // Adjust other columns proportionally
          const targetColumn = updatedColumns.find(col => col.id === columnId);
          const otherColumns = updatedColumns.filter(col => col.id !== columnId);
          const remainingWidth = 100 - newWidth;
          const totalOtherWidth = otherColumns.reduce((sum, col) => sum + col.width, 0);

          if (totalOtherWidth > 0) {
            otherColumns.forEach(col => {
              col.width = (col.width / totalOtherWidth) * remainingWidth;
            });
          }

          return { ...row, columns: updatedColumns };
        }
        return row;
      })
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