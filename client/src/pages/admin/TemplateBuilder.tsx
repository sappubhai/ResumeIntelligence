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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Draggable source for available sections
const DraggableSourceSection = ({ section }: { section: any }) => {
  const [, drag] = useDrag({
    type: 'new-section',
    item: { sectionType: section.type, sectionTitle: section.title },
  });

  return (
    <div
      ref={drag}
      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-grab transition-colors"
      title={`Drag to add ${section.title}`}
    >
      <div className="flex items-center gap-2">
        <section.icon className="w-4 h-4" />
        <span className="text-sm font-medium">{section.title}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Drag to canvas</p>
    </div>
  );
};

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

const DropZone = ({ location, onDrop, children, className = "", showAddButton = false, onAddSection, onNewSectionDrop }: { 
  location: string; 
  onDrop: (sectionId: string, location: string) => void; 
  children: React.ReactNode; 
  className?: string; 
  showAddButton?: boolean; 
  onAddSection?: () => void;
  onNewSectionDrop?: (sectionType: string, sectionTitle: string, location: string) => void;
}) => {
  const [, drop] = useDrop({
    accept: ['section', 'new-section'],
    drop: (item: { sectionId?: string; sectionType?: string; sectionTitle?: string }) => {
      if (item.sectionId) {
        onDrop(item.sectionId, location);
      } else if (item.sectionType && item.sectionTitle && onNewSectionDrop) {
        onNewSectionDrop(item.sectionType, item.sectionTitle, location);
      }
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
  const [targetLocation, setTargetLocation] = useState<'main' | 'sidebar' | string>('main'); // Allow string for grid/custom locations
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

  const handleNewSectionDrop = (sectionType: string, sectionTitle: string, location: string) => {
    addSection(sectionType, sectionTitle, location);
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
      } else if (location.startsWith('grid-')) {
        const parts = location.split('-');
        if (parts.length >= 3) {
          const rowId = parts[1];
          const colIndex = parseInt(parts[2]);
          const rowIndex = newLayout.gridRows.findIndex(row => row.id === rowId);
          if (rowIndex !== -1) {
            if (!newLayout.gridRows[rowIndex].sections[colIndex]) {
              newLayout.gridRows[rowIndex].sections[colIndex] = [];
            }
            newLayout.gridRows[rowIndex].sections[colIndex].push(newSection);
          }
        }
      } else if (location.startsWith('custom-')) {
        const parts = location.split('-');
        if (parts.length >= 3) {
          const rowId = parts[1];
          const colId = parts[2];
          const rowIndex = newLayout.customRows.findIndex(row => row.id === rowId);
          if (rowIndex !== -1) {
            const colIndex = newLayout.customRows[rowIndex].columns.findIndex(col => col.id === colId);
            if (colIndex !== -1) {
              newLayout.customRows[rowIndex].columns[colIndex].sections.push(newSection);
            }
          }
        }
      }
      return newLayout;
    });
  };

  const handleAddSectionToLocation = (location: string) => {
    setTargetLocation(location);
    setShowSectionModal(true);
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

  const generateTemplate = () => {
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
        border: 1px solid #e5e7eb;
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
      .layout-left-sidebar { grid-template-columns: 300px 1fr; }
      .layout-right-sidebar { grid-template-columns: 1fr 300px; }
      .sidebar { background: #f8f9fa; padding: 1rem; border-radius: 8px; }
      .main-content { background: white; }
      .grid-row { display: grid; gap: 1rem; margin-bottom: 1rem; }
      .grid-col-1 { grid-template-columns: 1fr; }
      .grid-col-2 { grid-template-columns: 1fr 1fr; }
      .grid-col-3 { grid-template-columns: 1fr 1fr 1fr; }
      .grid-col-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
      .grid-col-5 { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
      .custom-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
      .custom-column { padding: 0.5rem; }
      .field-group { margin-bottom: 0.75rem; }
      .field-label { font-weight: 600; color: #555; display: inline-block; margin-right: 0.5rem; }
      .field-value { color: #333; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: ${globalStyles.headerStyle === 'centered' ? 'center' : 'flex-start'}; }
    `;

    let html = '';

    if (pageLayout.type === 'single') {
      html = `
        <div class="resume-template layout-single">
          <div class="main-content">
            ${pageLayout.mainSections.map(section => `
              <div class="template-section" style="${getSectionStyle(section)}">
                <h2 class="section-title">${section.title}</h2>
                ${generateSectionContent(section)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (pageLayout.type === 'left-sidebar') {
      html = `
        <div class="resume-template layout-left-sidebar">
          <div class="template-layout">
            <div class="sidebar">
              ${pageLayout.sidebarSections.map(section => `
                <div class="template-section" style="${getSectionStyle(section)}">
                  <h2 class="section-title">${section.title}</h2>
                  ${generateSectionContent(section)}
                </div>
              `).join('')}
            </div>
            <div class="main-content">
              ${pageLayout.mainSections.map(section => `
                <div class="template-section" style="${getSectionStyle(section)}">
                  <h2 class="section-title">${section.title}</h2>
                  ${generateSectionContent(section)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (pageLayout.type === 'right-sidebar') {
      html = `
        <div class="resume-template layout-right-sidebar">
          <div class="template-layout">
            <div class="main-content">
              ${pageLayout.mainSections.map(section => `
                <div class="template-section" style="${getSectionStyle(section)}">
                  <h2 class="section-title">${section.title}</h2>
                  ${generateSectionContent(section)}
                </div>
              `).join('')}
            </div>
            <div class="sidebar">
              ${pageLayout.sidebarSections.map(section => `
                <div class="template-section" style="${getSectionStyle(section)}">
                  <h2 class="section-title">${section.title}</h2>
                  ${generateSectionContent(section)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (pageLayout.type === 'grid') {
      html = `
        <div class="resume-template">
          ${pageLayout.gridRows.map(row => `
            <div class="grid-row grid-col-${row.columns}">
              ${Array.from({ length: row.columns }, (_, i) => `
                <div class="grid-column">
                  ${(row.sections[i] || []).map(section => `
                    <div class="template-section" style="${getSectionStyle(section)}">
                      <h2 class="section-title">${section.title}</h2>
                      ${generateSectionContent(section)}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
    } else if (pageLayout.type === 'custom') {
      html = `
        <div class="resume-template">
          ${pageLayout.customRows.map(row => `
            <div class="custom-row">
              ${row.columns.map(col => `
                <div class="custom-column" style="width: ${col.width}%;">
                  ${col.sections.map(section => `
                    <div class="template-section" style="${getSectionStyle(section)}">
                      <h2 class="section-title">${section.title}</h2>
                      ${generateSectionContent(section)}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
    }

    return { html, css };
  };

  const getSectionStyle = (section: TemplateSection) => {
    return Object.entries(section.style)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}${typeof value === 'number' && !['z-index', 'opacity'].includes(cssKey) ? 'px' : ''}`;
      })
      .join('; ');
  };

  const generateSectionContent = (section: TemplateSection) => {
    const enabledFields = Object.entries(section.fields).filter(([_, field]) => field.enabled);

    if (section.type === 'header') {
      return `
        <div class="contact-info">
          ${enabledFields.map(([key, field]) => `
            <div class="field-group">
              <span class="field-label">${field.label}:</span>
              <span class="field-value">[${field.label}]</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="section-content">
        ${enabledFields.map(([key, field]) => `
          <div class="field-group">
            <span class="field-label">${field.label}:</span>
            <span class="field-value">[${field.label}]</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex h-screen">
          {/* Left Sidebar - Tools */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setLocation("/admin/templates")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-bold">Template Builder</h1>
              </div>

              <Tabs defaultValue="sections" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="sections" className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-700">Available Sections</h3>
                    <p className="text-xs text-gray-500">Drag sections to canvas or click to add</p>
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-2">
                        {availableSections.map((section) => (
                          <DraggableSourceSection
                            key={section.type}
                            section={section}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Page Layout</Label>
                      <RadioGroup
                        value={pageLayout.type}
                        onValueChange={(value: any) => 
                          setPageLayout(prev => ({ ...prev, type: value }))
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="single" id="single" />
                          <Label htmlFor="single" className="flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            Single Column
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left-sidebar" id="left-sidebar" />
                          <Label htmlFor="left-sidebar" className="flex items-center gap-2">
                            <Sidebar className="w-4 h-4" />
                            Left Sidebar
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right-sidebar" id="right-sidebar" />
                          <Label htmlFor="right-sidebar" className="flex items-center gap-2">
                            <AlignRight className="w-4 h-4" />
                            Right Sidebar
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="grid" id="grid" />
                          <Label htmlFor="grid" className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4" />
                            Grid Layout
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Custom Layout
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Layout Controls for All Types */}
                    <div className="space-y-3">
                      <Label>Layout Controls</Label>
                      
                      {(pageLayout.type === 'single' || pageLayout.type === 'left-sidebar' || pageLayout.type === 'right-sidebar') && (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addRow(1)}
                          >
                            Add Header Row
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addRow(2)}
                          >
                            Add Two Column Row
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addRow(3)}
                          >
                            Add Three Column Row
                          </Button>
                        </div>
                      )}

                      {pageLayout.type === 'grid' && (
                        <div className="space-y-2">
                          <Label>Add Grid Rows</Label>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(cols => (
                              <Button
                                key={cols}
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => addRow(cols)}
                              >
                                Add {cols} Column Row
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {pageLayout.type === 'custom' && (
                        <div className="space-y-2">
                          <Label>Add Custom Rows</Label>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => addCustomRow('header')}
                            >
                              Add Header Row (100%)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => addCustomRow('sidebar')}
                            >
                              Add Sidebar Row (25% + 75%)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => addCustomRow('content')}
                            >
                              Add Content Row (50% + 50%)
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  {currentSection ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Editing: {currentSection.title}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={currentSection.style.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(currentSection.id, {
                              style: { ...currentSection.style, backgroundColor: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>Padding</Label>
                          <Slider
                            value={[currentSection.style.padding || 16]}
                            onValueChange={([value]) => updateSection(currentSection.id, {
                              style: { ...currentSection.style, padding: value }
                            })}
                            max={50}
                            step={2}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Border Radius</Label>
                          <Slider
                            value={[currentSection.style.borderRadius || 8]}
                            onValueChange={([value]) => updateSection(currentSection.id, {
                              style: { ...currentSection.style, borderRadius: value }
                            })}
                            max={20}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Section Fields</h4>
                        {Object.entries(currentSection.fields).map(([key, field]) => (
                          <div key={key} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{field.label}</span>
                            <Switch
                              checked={field.enabled}
                              onCheckedChange={(checked) => {
                                updateSection(currentSection.id, {
                                  fields: {
                                    ...currentSection.fields,
                                    [key]: { ...field, enabled: checked }
                                  }
                                });
                              }}
                            />
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addCustomField(currentSection.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom Field
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a section to edit its style
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="text-xl font-bold border-none p-0 focus:ring-0"
                    placeholder="Template Name"
                  />
                  <div className="flex gap-2">
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                      const { html, css } = generateTemplate();
                      const previewWindow = window.open('', '_blank', 'width=800,height=600');
                      if (previewWindow) {
                        previewWindow.document.open();
                        previewWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>Template Preview</title>
                              <style>${css}</style>
                              <style>
                                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                .preview-container { max-width: 800px; margin: 0 auto; }
                              </style>
                            </head>
                            <body>
                              <div class="preview-container">
                                ${html}
                              </div>
                            </body>
                          </html>
                        `);
                        previewWindow.document.close();
                      }
                    }}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveMutation.isPending ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </div>

              {/* Template Canvas */}
              <div className="bg-white rounded-lg shadow-sm border min-h-[800px] p-8 mx-auto max-w-4xl">
                {pageLayout.type === 'single' && (
                  <DropZone 
                    location="main" 
                    onDrop={handleSectionDrop} 
                    onNewSectionDrop={handleNewSectionDrop}
                    className="space-y-4" 
                    showAddButton 
                    onAddSection={() => handleAddSectionToLocation('main')}
                  >
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
                  <div className={`grid gap-6 ${pageLayout.type === 'left-sidebar' ? 'grid-cols-[300px_1fr]' : 'grid-cols-[1fr_300px]'}`}>
                    {pageLayout.type === 'left-sidebar' && (
                      <>
                        <DropZone 
                          location="sidebar" 
                          onDrop={handleSectionDrop} 
                          onNewSectionDrop={handleNewSectionDrop}
                          className="space-y-4 bg-gray-50 p-4 rounded-lg" 
                          showAddButton 
                          onAddSection={() => handleAddSectionToLocation('sidebar')}
                        >
                          <h3 className="font-medium text-sm text-gray-600 mb-4">Sidebar</h3>
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
                        <DropZone 
                          location="main" 
                          onDrop={handleSectionDrop} 
                          onNewSectionDrop={handleNewSectionDrop}
                          className="space-y-4" 
                          showAddButton 
                          onAddSection={() => handleAddSectionToLocation('main')}
                        >
                          <h3 className="font-medium text-sm text-gray-600 mb-4">Main Content</h3>
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
                      </>
                    )}

                    {pageLayout.type === 'right-sidebar' && (
                      <>
                        <DropZone 
                          location="main" 
                          onDrop={handleSectionDrop} 
                          onNewSectionDrop={handleNewSectionDrop}
                          className="space-y-4" 
                          showAddButton 
                          onAddSection={() => handleAddSectionToLocation('main')}
                        >
                          <h3 className="font-medium text-sm text-gray-600 mb-4">Main Content</h3>
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
                        <DropZone 
                          location="sidebar" 
                          onDrop={handleSectionDrop} 
                          onNewSectionDrop={handleNewSectionDrop}
                          className="space-y-4 bg-gray-50 p-4 rounded-lg" 
                          showAddButton 
                          onAddSection={() => handleAddSectionToLocation('sidebar')}
                        >
                          <h3 className="font-medium text-sm text-gray-600 mb-4">Sidebar</h3>
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
                      </>
                    )}
                  </div>
                )}

                {pageLayout.type === 'grid' && (
                  <div className="space-y-4">
                    {pageLayout.gridRows.map((row) => (
                      <div key={row.id} className={`grid gap-4 grid-cols-${row.columns}`}>
                        {Array.from({ length: row.columns }, (_, colIndex) => (
                          <DropZone
                            key={colIndex}
                            location={`grid-${row.id}-${colIndex}`}
                            onDrop={handleSectionDrop}
                            onNewSectionDrop={handleNewSectionDrop}
                            className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[200px]"
                            showAddButton
                            onAddSection={() => handleAddSectionToLocation(`grid-${row.id}-${colIndex}`)}
                          >
                            <h4 className="text-xs text-gray-500 mb-2">Column {colIndex + 1}</h4>
                            {(row.sections[colIndex] || []).map((section, sectionIndex) => (
                              <DraggableItem
                                key={section.id}
                                section={section}
                                index={sectionIndex}
                                location={`grid-${row.id}-${colIndex}`}
                                moveSection={moveSection}
                                updateSection={updateSection}
                                deleteSection={deleteSection}
                                duplicateSection={duplicateSection}
                                onSelectSection={setSelectedSection}
                                isSelected={selectedSection === section.id}
                              />
                            ))}
                          </DropZone>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {pageLayout.type === 'custom' && (
                  <div className="space-y-4">
                    {pageLayout.customRows.map((row) => (
                      <div key={row.id} className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-medium capitalize">{row.type} Row</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setPageLayout(prev => ({
                                ...prev,
                                customRows: prev.customRows.filter(r => r.id !== row.id)
                              }));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-4">
                          {row.columns.map((column) => (
                            <DropZone
                              key={column.id}
                              location={`custom-${row.id}-${column.id}`}
                              onDrop={handleSectionDrop}
                              onNewSectionDrop={handleNewSectionDrop}
                              className="border border-gray-200 rounded p-3 min-h-[150px] flex-1"
                              style={{ width: `${column.width}%` }}
                              showAddButton
                              onAddSection={() => handleAddSectionToLocation(`custom-${row.id}-${column.id}`)}
                            >
                              <div className="flex flex-col gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Width:</span>
                                  <Input
                                    type="number"
                                    min="5"
                                    max="95"
                                    value={Math.round(column.width)}
                                    onChange={(e) => {
                                      const newWidth = parseInt(e.target.value) || 10;
                                      updateCustomColumnWidth(row.id, column.id, newWidth);
                                    }}
                                    className="w-16 h-6 text-xs"
                                  />
                                  <span className="text-xs text-gray-500">%</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="95"
                                  value={column.width}
                                  onChange={(e) => updateCustomColumnWidth(row.id, column.id, parseInt(e.target.value))}
                                  className="w-full h-1"
                                />
                              </div>
                              {column.sections.map((section, sectionIndex) => (
                                <DraggableItem
                                  key={section.id}
                                  section={section}
                                  index={sectionIndex}
                                  location={`custom-${row.id}-${column.id}`}
                                  moveSection={moveSection}
                                  updateSection={updateSection}
                                  deleteSection={deleteSection}
                                  duplicateSection={duplicateSection}
                                  onSelectSection={setSelectedSection}
                                  isSelected={selectedSection === section.id}
                                />
                              ))}
                            </DropZone>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-2">
              <div className="grid gap-4 grid-cols-1">
                {availableSections.map((section) => (
                  <Button
                    key={section.type}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      addSection(section.type, section.title, targetLocation);
                      setShowSectionModal(false);
                    }}
                  >
                    <section.icon className="w-4 h-4 mr-2" />
                    {section.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}