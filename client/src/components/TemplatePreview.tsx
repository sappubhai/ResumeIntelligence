import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface Template {
    id: number;
    name: string;
    description?: string;
    category: string;
}

interface TemplatePreviewProps {
  template: Template;
  colorIndex: number;
  compact?: boolean;
  previewUrl?: string;
  className?: string;
}

export default function TemplatePreview({ template, colorIndex, compact = false, previewUrl, className }: TemplatePreviewProps) {
  const getColorClasses = (index: number) => {
    const colors = [
      {
        bg: 'from-blue-50 to-blue-100',
        accent: 'bg-primary',
        text: 'text-primary'
      },
      {
        bg: 'from-green-50 to-green-100',
        accent: 'bg-secondary',
        text: 'text-secondary'
      },
      {
        bg: 'from-purple-50 to-purple-100',
        accent: 'bg-accent',
        text: 'text-accent'
      },
      {
        bg: 'from-gray-50 to-gray-100',
        accent: 'bg-neutral-600',
        text: 'text-neutral-600'
      }
    ];
    return colors[index % colors.length];
  };

  const colorClasses = getColorClasses(colorIndex);

  if (compact) {
    return (
      <div className={cn("w-24 h-32", className)}>
        <div className={`bg-gradient-to-br ${colorClasses.bg} rounded-lg p-3 h-full`}>
          <div className="bg-white rounded shadow-sm p-2 mb-2 h-3/4">
            <div className={`h-1 ${colorClasses.accent} rounded mb-1`}></div>
            <div className="h-0.5 bg-neutral-200 rounded mb-1"></div>
            <div className="h-0.5 bg-neutral-200 rounded mb-2"></div>
            <div className="space-y-0.5">
              <div className="h-0.5 bg-neutral-300 rounded"></div>
              <div className="h-0.5 bg-neutral-300 rounded w-4/5"></div>
              <div className="h-0.5 bg-neutral-300 rounded w-3/5"></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-0.5 bg-white rounded"></div>
            <div className="h-0.5 bg-white rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  // Template-specific layouts based on name or category
  const renderTemplateLayout = () => {
    const templateName = template.name.toLowerCase();

    if (templateName.includes('modern') || templateName.includes('professional')) {
      return (
        <div className="bg-white rounded shadow-sm p-2 mb-2 text-xs">
          {/* Header section with name and contact */}
          <div className="mb-2 pb-1 border-b border-neutral-200">
            <div className="h-2 bg-neutral-800 rounded w-16 mb-1"></div>
            <div className="h-1 bg-neutral-400 rounded w-12 mb-1"></div>
            <div className="flex justify-between text-[6px] text-neutral-500">
              <span>+91 9049373474</span>
              <span>Mumbai, IN</span>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <div className="h-1 bg-neutral-600 rounded w-full mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-neutral-300 rounded w-full"></div>
                <div className="h-0.5 bg-neutral-300 rounded w-4/5"></div>
                <div className="h-0.5 bg-neutral-300 rounded w-3/5"></div>
              </div>
            </div>
            <div>
              <div className="h-1 bg-neutral-600 rounded w-3/4 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-neutral-300 rounded w-2/3"></div>
                <div className="h-0.5 bg-neutral-300 rounded w-1/2"></div>
                <div className="h-0.5 bg-neutral-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Work experience section */}
          <div>
            <div className="h-1 bg-neutral-600 rounded w-1/2 mb-1"></div>
            <div className="space-y-0.5">
              <div className="h-0.5 bg-neutral-300 rounded w-full"></div>
              <div className="h-0.5 bg-neutral-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      );
    }

    if (templateName.includes('executive') || templateName.includes('classic')) {
      return (
        <div className="bg-white rounded shadow-sm p-3 mb-3">
          <div className={`border-l-4 ${colorClasses.accent} pl-3 mb-2`}>
            <div className="h-2 bg-neutral-800 rounded w-16 mb-1"></div>
            <div className="h-1 bg-neutral-400 rounded w-12"></div>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-neutral-300 rounded"></div>
            <div className="h-1 bg-neutral-300 rounded w-4/5"></div>
            <div className="h-1 bg-neutral-300 rounded w-3/5"></div>
          </div>
        </div>
      );
    }

    if (templateName.includes('creative') || templateName.includes('portfolio')) {
      return (
        <div className="bg-white rounded shadow-sm p-3 mb-3">
          <div className="text-center mb-2">
            <div className={`w-6 h-6 ${colorClasses.accent} rounded-full mx-auto mb-1`}></div>
            <div className="h-2 bg-neutral-800 rounded w-12 mx-auto mb-1"></div>
            <div className="h-1 bg-neutral-400 rounded w-8 mx-auto"></div>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-neutral-300 rounded"></div>
            <div className="h-1 bg-neutral-300 rounded w-4/5"></div>
            <div className="h-1 bg-neutral-300 rounded w-3/5"></div>
          </div>
        </div>
      );
    }

    if (templateName.includes('minimalist') || templateName.includes('simple')) {
      return (
        <div className="bg-white rounded shadow-sm p-3 mb-3">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="col-span-2">
              <div className="h-2 bg-neutral-800 rounded w-full mb-1"></div>
              <div className="h-1 bg-neutral-400 rounded w-3/4"></div>
            </div>
            <div className="w-8 h-8 bg-neutral-300 rounded"></div>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-neutral-300 rounded"></div>
            <div className="h-1 bg-neutral-300 rounded w-4/5"></div>
          </div>
        </div>
      );
    }

    // Default layout
    return (
      <div className="bg-white rounded shadow-sm p-3 mb-3">
        <div className={`h-2 ${colorClasses.accent} rounded mb-1`}></div>
        <div className="h-1 bg-neutral-400 rounded w-12 mb-2"></div>
        <div className="space-y-1">
          <div className="h-1 bg-neutral-300 rounded"></div>
          <div className="h-1 bg-neutral-300 rounded w-4/5"></div>
          <div className="h-1 bg-neutral-300 rounded w-3/5"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("", className)}>
      <div className={`bg-gradient-to-br ${colorClasses.bg} rounded-lg p-6 mb-4`}>
        {previewUrl ? (
          <div className="overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0 pointer-events-none"
              style={{ 
                transform: 'scale(0.15)', 
                transformOrigin: 'top left',
                width: '667%',
                height: '667%'
              }}
            />
          </div>
        ) : (
          renderTemplateLayout()
        )}
        <div className="space-y-2">
          <div className="h-1 bg-white rounded"></div>
          <div className="h-1 bg-white rounded w-4/5"></div>
          <div className="h-1 bg-white rounded w-3/5"></div>
        </div>
      </div>
    </div>
  );
}