import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({ 
  onFileUpload, 
  accept = ".pdf,.doc,.docx",
  maxSize = 10,
  className 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert(`Invalid file type. Please upload: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Upload Dropzone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
          isDragOver 
            ? "border-primary bg-blue-50" 
            : "border-neutral-300 hover:border-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInputChange}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center space-x-3">
            <FileUp className="text-primary w-8 h-8" />
            <div className="text-left">
              <p className="font-medium text-neutral-800">{selectedFile.name}</p>
              <p className="text-sm text-neutral-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <CloudUpload className="text-neutral-400 w-12 h-12 mx-auto mb-3" />
            <p className="text-neutral-600 font-medium mb-1">
              Drop your resume here or click to browse
            </p>
            <p className="text-sm text-neutral-500">
              Supports PDF, DOC, DOCX (Max {maxSize}MB)
            </p>
          </>
        )}
      </div>

      {/* Upload Button */}
      <Button 
        onClick={handleBrowseClick}
        className="w-full bg-primary hover:bg-blue-700"
        disabled={!!selectedFile}
      >
        <CloudUpload className="mr-2 w-4 h-4" />
        {selectedFile ? "File Selected" : "Upload Resume"}
      </Button>
    </div>
  );
}
