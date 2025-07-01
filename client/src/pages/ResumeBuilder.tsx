import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import ResumeForm from "@/components/ResumeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download, Eye } from "lucide-react";
import type { Resume, InsertResume } from "@shared/schema";

export default function ResumeBuilder() {
  const { resumeId } = useParams();
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const isEditing = !!resumeId;

  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ["/api/resumes", resumeId],
    enabled: !!user && isEditing,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertResume>) => {
      if (isEditing) {
        const response = await apiRequest("PUT", `/api/resumes/${resumeId}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/resumes", data);
        return response.json();
      }
    },
    onSuccess: (savedResume) => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      
      if (!isEditing) {
        // Redirect to edit mode after creating
        setLocation(`/builder/${savedResume.id}`);
      }
      
      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save resume",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!resumeId) throw new Error("Resume ID is required for download");
      
      const response = await apiRequest("POST", `/api/resumes/${resumeId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume?.title || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Download Failed",
        description: "Failed to download resume",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: Partial<InsertResume>) => {
    saveMutation.mutate(data);
  };

  const handleDownload = () => {
    if (!resumeId) {
      toast({
        title: "Save First",
        description: "Please save your resume before downloading.",
        variant: "destructive",
      });
      return;
    }
    downloadMutation.mutate();
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    setLocation("/");
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading...</p>
      </div>
    </div>;
  }

  if (isEditing && resumeLoading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading resume...</p>
      </div>
    </div>;
  }

  if (isEditing && !resume) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">Resume Not Found</h1>
        <p className="text-neutral-600 mb-4">The resume you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Action Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleGoBack}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-neutral-800">
                  {isEditing ? `Edit: ${resume?.title}` : 'Create New Resume'}
                </h1>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600">You have unsaved changes</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!resumeId || downloadMutation.isPending}
              >
                <Download className="mr-2 w-4 h-4" />
                Download PDF
              </Button>
              
              <Button
                onClick={() => handleSave(resume as any || {})}
                disabled={saveMutation.isPending}
              >
                <Save className="mr-2 w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResumeForm
          initialData={resume}
          onSave={handleSave}
          onDataChange={(hasChanges) => setHasUnsavedChanges(hasChanges)}
          isLoading={saveMutation.isPending}
        />
      </div>
    </div>
  );
}
