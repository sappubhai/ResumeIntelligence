import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export default function LoadingModal({ 
  isOpen, 
  title = "Processing...", 
  description = "Please wait while we process your request." 
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <DialogTitle className="text-lg font-semibold text-neutral-800">
                {title}
              </DialogTitle>
              <DialogDescription className="text-neutral-600">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
