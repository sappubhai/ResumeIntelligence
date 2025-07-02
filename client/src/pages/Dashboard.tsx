import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// Utility function for auth errors
const isUnauthorizedError = (error: Error): boolean => {
  return error.message.includes('401') || error.message.includes('Unauthorized');
};
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import LoadingModal from "@/components/LoadingModal";
import TemplatePreview from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CloudUpload, 
  Edit, 
  Plus, 
  Download, 
  MoreVertical,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Target,
  Settings,
  HelpCircle,
  MessageCircle,
  Rocket
} from "lucide-react";
import type { Resume, Template } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedResumeForDownload, setSelectedResumeForDownload] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
      return;
    }
  }, [user, authLoading, toast, setLocation]);

  const { data: resumes = [], isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/resumes/parse", formData);
      return response.json();
    },
    onSuccess: (newResume) => {
      setShowLoadingModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Uploaded Successfully",
        description: "Redirecting to edit your resume...",
      });
      // Redirect to edit page after successful upload
      setTimeout(() => {
        setLocation(`/builder/${newResume.id}`);
      }, 1000);
    },
    onError: (error) => {
      setShowLoadingModal(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ resumeId, templateId }: { resumeId: number; templateId: number }) => {
      const response = await apiRequest("POST", `/api/resumes/${resumeId}/download`, { templateId });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resumeId}.pdf`;
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
          setLocation("/auth");
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

  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    setShowLoadingModal(true);
    uploadMutation.mutate(formData);
  };

  const handleDownload = (resumeId: number) => {
    setSelectedResumeForDownload(resumeId);
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (templateId: number) => {
    if (selectedResumeForDownload) {
      downloadMutation.mutate({ 
        resumeId: selectedResumeForDownload, 
        templateId 
      });
      setShowTemplateModal(false);
      setSelectedResumeForDownload(null);
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user.firstName || 'there'}!
              </h2>
              <p className="text-blue-100 text-lg">
                Ready to build your professional resume? Choose an option below to get started.
              </p>
            </div>
            <div className="hidden lg:block">
              <Rocket className="text-6xl opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Resume Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <CloudUpload className="text-primary text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    Upload Existing Resume
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Upload your Word or PDF resume and let AI extract and format your information automatically.
                  </p>

                  <FileUpload onFileUpload={handleFileUpload} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 rounded-lg p-3">
                  <Edit className="text-secondary text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                    Create from Scratch
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Start fresh and build your resume step by step with our guided form builder.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-sm text-neutral-600">
                      <CheckCircle className="text-secondary w-4 h-4" />
                      <span>Personal Information</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-neutral-600">
                      <CheckCircle className="text-secondary w-4 h-4" />
                      <span>Work Experience & Education</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-neutral-600">
                      <CheckCircle className="text-secondary w-4 h-4" />
                      <span>Skills & Certifications</span>
                    </div>
                  </div>

                  <Link href="/builder">
                    <Button className="w-full bg-secondary hover:bg-green-700">
                      <Plus className="mr-2 w-4 h-4" />
                      Start Building
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Resumes */}
        <Card className="mb-8">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-800">Your Resumes</h3>
              <span className="text-sm text-neutral-500">
                {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <CardContent className="p-6">
            {resumesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">No resumes yet. Create your first one!</p>
                <Link href="/builder">
                  <Button>
                    <Plus className="mr-2 w-4 h-4" />
                    Create Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resumes.map((resume: Resume, index: number) => (
                  <div 
                    key={resume.id} 
                    className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`bg-gradient-to-br ${
                        index % 3 === 0 ? 'from-blue-50 to-blue-100' :
                        index % 3 === 1 ? 'from-green-50 to-green-100' :
                        'from-purple-50 to-purple-100'
                      } rounded-lg p-4 flex-1 mr-3`}>
                        <div className="bg-white rounded shadow-sm p-2 mb-2">
                          <div className={`h-1 ${
                            index % 3 === 0 ? 'bg-primary' :
                            index % 3 === 1 ? 'bg-secondary' :
                            'bg-accent'
                          } rounded mb-1`}></div>
                          <div className="h-1 bg-neutral-200 rounded mb-1"></div>
                          <div className="h-1 bg-neutral-200 rounded"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-white rounded"></div>
                          <div className="h-1 bg-white rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-medium text-neutral-800 mb-1">
                      {resume.title}
                    </h4>
                    <p className="text-sm text-neutral-500 mb-3">
                      Last modified {new Date(resume.updatedAt!).toLocaleDateString()}
                    </p>

                    <div className="flex space-x-2">
                      <Link href={`/builder/${resume.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(resume.id)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates and Tips */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Templates */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-800">Resume Templates</h3>
                    <p className="text-neutral-600 mt-1">Choose from our collection of professional templates</p>
                  </div>
                  <Link href="/templates">
                    <Button variant="ghost" className="text-primary hover:text-blue-700">
                      View All →
                    </Button>
                  </Link>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {templates.slice(0, 4).map((template: any, index: number) => (
                    <div 
                      key={template.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all cursor-pointer group"
                    >
                      <div className={`bg-gradient-to-br ${
                        index % 4 === 0 ? 'from-blue-50 to-blue-100' :
                        index % 4 === 1 ? 'from-green-50 to-green-100' :
                        index % 4 === 2 ? 'from-purple-50 to-purple-100' :
                        'from-gray-50 to-gray-100'
                      } rounded-lg p-6 mb-4`}>
                        <div className="bg-white rounded shadow-sm p-3 mb-3">
                          <div className={`h-2 ${
                            index % 4 === 0 ? 'bg-primary' :
                            index % 4 === 1 ? 'bg-secondary' :
                            index % 4 === 2 ? 'bg-accent' :
                            'bg-neutral-600'
                          } rounded w-16 mb-1`}></div>
                          <div className="h-1 bg-neutral-400 rounded w-12 mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-neutral-300 rounded"></div>
                            <div className="h-1 bg-neutral-300 rounded w-4/5"></div>
                            <div className="h-1 bg-neutral-300 rounded w-3/5"></div>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-medium text-neutral-800 mb-1">{template.name}</h4>
                      <p className="text-sm text-neutral-500 mb-3">{template.description}</p>

                      <Button 
                        className="w-full bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 group-hover:bg-primary group-hover:text-white transition-all"
                        size="sm"
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips & Stats */}
          <div className="space-y-6">
            {/* Tips */}
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Resume Tips</h3>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                    <Lightbulb className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Optimize for ATS</h4>
                    <p className="text-sm text-neutral-600">Use relevant keywords from job descriptions.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="bg-secondary/10 rounded-lg p-2 flex-shrink-0">
                    <TrendingUp className="text-secondary w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Quantify Achievements</h4>
                    <p className="text-sm text-neutral-600">Include numbers and specific results.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="bg-accent/10 rounded-lg p-2 flex-shrink-0">
                    <Target className="text-accent w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-1">Tailor for Each Job</h4>
                    <p className="text-sm text-neutral-600">Customize your resume for each application.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Your Progress</h3>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">Profile Completion</span>
                      <span className="font-medium text-neutral-800">
                        {resumes.length > 0 ? '85%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: resumes.length > 0 ? '85%' : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{resumes.length}</div>
                      <div className="text-xs text-neutral-500">Resumes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">0</div>
                      <div className="text-xs text-neutral-500">Downloads</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Quick Links</h3>
              </div>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start p-3">
                    <Settings className="w-4 h-4 mr-3" />
                    Account Settings
                  </Button>

                  <Button variant="ghost" className="w-full justify-start p-3">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help & Support
                  </Button>

                  <Button variant="ghost" className="w-full justify-start p-3">
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Send Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoadingModal 
        isOpen={showLoadingModal} 
        title="Processing Resume"
        description="AI is extracting information from your resume. This may take a few moments..."
      />

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <p className="text-neutral-600">Select a template for your resume download</p>
          </DialogHeader>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
            {templates.map((template: Template, index: number) => (
              <div
                key={template.id}
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all cursor-pointer group"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <TemplatePreview 
                  template={template}
                  colorIndex={index % 4}
                  compact={false}
                />
                
                <div className="mt-3">
                  <h4 className="font-medium text-neutral-800 mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {template.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}