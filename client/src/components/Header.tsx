import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FileText, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleHome = () => {
    setLocation("/");
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={handleHome}
          >
            <FileText className="text-primary text-2xl" />
            <h1 className="text-xl font-bold text-neutral-800">ResumeBuilder Pro</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}