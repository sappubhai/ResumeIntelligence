import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, FileText, Sparkles, Zap, Target, CheckCircle2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

const processingSteps = [
  { icon: FileText, text: "Reading your resume...", duration: 3000 },
  { icon: Brain, text: "AI analyzing content...", duration: 4000 },
  { icon: Sparkles, text: "Extracting key information...", duration: 3000 },
  { icon: Zap, text: "Organizing data into sections...", duration: 2000 },
  { icon: Target, text: "Finalizing your profile...", duration: 1000 },
];

const tips = [
  "💡 Tip: Use action verbs like 'led', 'developed', 'achieved' in your work experience",
  "🎯 Tip: Quantify your achievements with numbers and percentages when possible",
  "✨ Tip: Keep your summary concise but impactful - 2-3 lines work best",
  "🚀 Tip: List your most relevant skills first to catch employer attention",
  "📈 Tip: Include specific technologies and tools you've worked with",
  "🔥 Tip: Highlight leadership experience and team collaboration skills",
  "⚡ Tip: Use consistent date formats throughout your resume",
  "🎨 Tip: Choose a clean, professional template that matches your industry",
];

export default function LoadingModal({ 
  isOpen, 
  title = "Processing Your Resume...", 
  description = "Our AI is analyzing your resume and extracting all the key information."
}: LoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setCurrentTip(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 200);

    // Step progression
    let stepTimeout: NodeJS.Timeout;
    const progressSteps = () => {
      if (currentStep < processingSteps.length - 1) {
        stepTimeout = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, processingSteps[currentStep]?.duration || 3000);
      }
    };

    progressSteps();

    // Tip rotation
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
      clearTimeout(stepTimeout);
    };
  }, [isOpen, currentStep]);

  const CurrentIcon = processingSteps[currentStep]?.icon || Brain;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping"></div>
              <div className="relative bg-blue-500 rounded-full p-2">
                <CurrentIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="bg-blue-500 rounded-full p-2">
              <CurrentIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                {processingSteps[currentStep]?.text || "Processing..."}
              </p>
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>

          {/* Steps Overview */}
          <div className="space-y-2">
            {processingSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isCompleted 
                      ? 'bg-green-50 text-green-700' 
                      : isCurrent 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className={`rounded-full p-1 ${
                    isCompleted 
                      ? 'bg-green-500' 
                      : isCurrent 
                        ? 'bg-blue-500' 
                        : 'bg-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    ) : (
                      <Icon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.text}</span>
                  {isCurrent && (
                    <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Rotating Tips */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-full p-1.5 mt-0.5">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 mb-1">Quick Tip</p>
                <p className="text-sm text-orange-800 leading-relaxed">
                  {tips[currentTip]}
                </p>
              </div>
            </div>
          </div>

          {/* Duration estimate */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This usually takes 30-60 seconds depending on resume complexity
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}