import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ResumePreviewProps {
  resumeId: string;
  templateId?: string;
}

export default function ResumePreview() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  // Extract resumeId and templateId from URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const resumeId = location.split('/')[2]; // /preview/:id
  const templateId = searchParams.get('template');

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

  // Set preview URL when resumeId and templateId are available
  useEffect(() => {
    if (resumeId) {
      const url = `/api/resumes/${resumeId}/preview${templateId ? `?templateId=${templateId}` : ''}`;
      setPreviewUrl(url);
    }
  }, [resumeId, templateId]);

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId: templateId ? parseInt(templateId) : undefined }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download PDF");
      }
      
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resume PDF downloaded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!resumeId) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Resume</h1>
            <p className="text-neutral-600 mb-6">No resume ID provided.</p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900">Resume Preview</h1>
          </div>
          <Button 
            onClick={() => downloadMutation.mutate()} 
            disabled={downloadMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {downloadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="border-b border-neutral-200 p-4 bg-neutral-50">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Eye className="w-4 h-4" />
                Live Preview - This is how your resume will look in PDF format
              </div>
            </div>
            <div className="bg-white" style={{ minHeight: '842px' }}>
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[842px] border-0"
                  title="Resume Preview"
                  style={{ 
                    transform: 'scale(0.8)', 
                    transformOrigin: 'top left',
                    width: '125%',
                    height: '1052px'
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}