import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  FileUp,
  Sparkles,
  Code,
  ArrowLeft,
  Eye,
  Save
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TemplateData {
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
}

export default function TemplateUpload() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedTemplate, setConvertedTemplate] = useState<TemplateData | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("professional");
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/admin/templates/upload", formData, {
        headers: {}
      });
    },
    onSuccess: (data) => {
      setConvertedTemplate(data);
      setConverting(false);
      toast({
        title: "Conversion Successful",
        description: "Template has been converted from the uploaded file.",
      });
    },
    onError: (error) => {
      setConverting(false);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert the uploaded file to template.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (templateData: TemplateData) => {
      return await apiRequest("POST", "/api/admin/templates", templateData);
    },
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Template has been saved successfully.",
      });
      setTimeout(() => {
        setLocation("/admin");
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save the template.",
        variant: "destructive",
      });
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    }
  });

  const handleUpload = async () => {
    if (!file) return;

    setConverting(true);
    setConversionProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setConversionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', templateName || file.name.replace(/\.[^/.]+$/, ""));
    formData.append('description', templateDescription);
    formData.append('category', templateCategory);

    uploadMutation.mutate(formData);
  };

  const handleSaveTemplate = () => {
    if (!convertedTemplate) return;

    const templateData: TemplateData = {
      name: templateName || convertedTemplate.name,
      description: templateDescription || convertedTemplate.description,
      category: templateCategory,
      html: convertedTemplate.html,
      css: convertedTemplate.css
    };

    saveMutation.mutate(templateData);
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
                <h1 className="text-2xl font-bold text-slate-900">Upload Template</h1>
                <p className="text-sm text-slate-600">Convert PDF/Word to HTML template</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!convertedTemplate ? (
          <>
            {/* Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Resume Template</CardTitle>
                <CardDescription>
                  Upload a PDF or Word document to automatically convert it to an HTML template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Modern Professional"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="executive">Executive</option>
                      <option value="student">Student</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the template..."
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
                    ${file ? 'bg-green-50 border-green-300' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    {file ? (
                      <>
                        <div className="flex justify-center">
                          <div className="p-4 bg-green-100 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Upload className="w-8 h-8 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {isDragActive ? "Drop your file here" : "Drop your template file here"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            or click to browse
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Supports PDF, DOC, DOCX files up to 10MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Conversion Progress */}
                {converting && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Converting template...</span>
                      <span className="text-gray-900 font-medium">{conversionProgress}%</span>
                    </div>
                    <Progress value={conversionProgress} className="h-2" />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is analyzing and converting your template...</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/admin")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || converting || uploadMutation.isPending}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {converting || uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Convert to Template
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>AI-Powered Conversion:</strong> Our AI will analyze the uploaded document's layout, 
                styling, and structure to create an HTML template that matches at least 90% of the original design. 
                The conversion process typically takes 30-60 seconds.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Converted Template Preview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Converted Template</CardTitle>
                    <CardDescription>
                      Review and save the converted template
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conversion Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={templateName || convertedTemplate.name}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Badge variant="outline">{templateCategory}</Badge>
                  </div>
                </div>

                {/* Preview Tabs */}
                <div className="border rounded-lg">
                  <div className="flex border-b">
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'preview' 
                          ? 'text-indigo-600 border-b-2 border-indigo-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('preview')}
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Preview
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'html' 
                          ? 'text-indigo-600 border-b-2 border-indigo-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('html')}
                    >
                      <Code className="w-4 h-4 inline mr-2" />
                      HTML Code
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 h-96 overflow-auto">
                    {activeTab === 'preview' ? (
                      <div>
                        <style dangerouslySetInnerHTML={{ __html: convertedTemplate.css }} />
                        <div dangerouslySetInnerHTML={{ __html: convertedTemplate.html }} />
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">HTML:</h4>
                          <code className="block bg-gray-100 p-2 rounded">{convertedTemplate.html}</code>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">CSS:</h4>
                          <code className="block bg-gray-100 p-2 rounded">{convertedTemplate.css}</code>
                        </div>
                      </pre>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConvertedTemplate(null);
                      setFile(null);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Another
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saveMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}