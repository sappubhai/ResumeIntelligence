import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloudUpload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, DOC, or DOCX file');
      return;
    }
    
    setSelectedFile(file);
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
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragOver && "border-primary bg-primary/5",
        !isDragOver && "border-muted-foreground/25"
      )}>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className="cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <File className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  className="w-full"
                >
                  Upload Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
                
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragOver ? "Drop your resume here" : "Upload your resume"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your resume or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, and DOCX files (max {maxSize}MB)
                  </p>
                </div>
                
                <Button variant="outline" className="mt-4">
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}