import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Zap, Download, Users, Star, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogin = () => {
    setLocation("/auth");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <FileText className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-neutral-800">ResumeBuilder Pro</h1>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button onClick={handleDashboard} variant="outline">
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-neutral-900 mb-6">
              Build Your Professional Resume with 
              <span className="text-primary"> AI Power</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Upload your existing resume or create from scratch. Our AI will extract and format your information perfectly. Choose from professional templates and download instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-blue-700">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg">
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Everything You Need to Build the Perfect Resume
            </h2>
            <p className="text-xl text-neutral-600">
              Professional tools powered by AI to help you land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4">
                  <Zap className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Parsing</h3>
                <p className="text-neutral-600">
                  Upload your existing resume and our AI will automatically extract and format all your information into our system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-secondary/10 rounded-lg p-3 w-fit mb-4">
                  <FileText className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
                <p className="text-neutral-600">
                  Choose from our collection of ATS-friendly templates designed by experts to help you stand out.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-accent/10 rounded-lg p-3 w-fit mb-4">
                  <Download className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant PDF Download</h3>
                <p className="text-neutral-600">
                  Generate and download your professional resume as a PDF with one click. Perfect formatting guaranteed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                  <Shield className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-neutral-600">
                  Your personal information is encrypted and secure. We never share your data with third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
                  <Users className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-neutral-600">
                  Get help from our resume experts and career coaches to make your resume perfect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
                  <Star className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">ATS Optimized</h3>
                <p className="text-neutral-600">
                  All our templates are optimized for Applicant Tracking Systems to ensure your resume gets seen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Your Professional Resume?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have landed their dream jobs with our resume builder.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="bg-white text-primary hover:bg-neutral-100"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <FileText className="text-primary text-2xl" />
            <h3 className="text-xl font-bold">ResumeBuilder Pro</h3>
          </div>
          <p className="text-neutral-400 mb-4">
            Build professional resumes with AI-powered tools
          </p>
          <p className="text-sm text-neutral-500">
            © 2024 ResumeBuilder Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
