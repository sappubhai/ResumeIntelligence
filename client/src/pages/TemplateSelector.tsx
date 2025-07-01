import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import TemplatePreview from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Grid, List } from "lucide-react";
import { useState } from "react";

export default function TemplateSelector() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const handleSelectTemplate = (templateId: number) => {
    setLocation(`/builder?template=${templateId}`);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">Resume Templates</h1>
                <p className="text-sm text-neutral-600">Choose a professional template for your resume</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templatesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">No templates available at the moment.</p>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-6"
          }>
            {templates.map((template: any, index: number) => (
              <Card 
                key={template.id}
                className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className={viewMode === 'grid' ? "p-6" : "p-6 flex items-center space-x-6"}>
                  <div className={viewMode === 'grid' ? "" : "flex-shrink-0"}>
                    <TemplatePreview 
                      template={template}
                      colorIndex={index % 4}
                      compact={viewMode === 'list'}
                    />
                  </div>
                  
                  <div className={viewMode === 'grid' ? "mt-4" : "flex-1"}>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                        {template.category}
                      </span>
                      
                      <Button 
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-white transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template.id);
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
