<?php
class FileParser {
    
    public function parseFile($filePath, $mimeType) {
        switch ($mimeType) {
            case 'application/pdf':
                return $this->parsePDF($filePath);
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return $this->parseWord($filePath);
            default:
                throw new Exception('Unsupported file type');
        }
    }
    
    private function parsePDF($filePath) {
        // For shared hosting compatibility, we'll use a simple approach
        // This requires pdftotext utility to be available on the server
        $output = shell_exec("pdftotext '$filePath' -");
        
        if ($output === null) {
            throw new Exception('Failed to parse PDF. pdftotext utility may not be available.');
        }
        
        return $output;
    }
    
    private function parseWord($filePath) {
        // For DOC/DOCX files, we'll try different approaches based on availability
        
        // Try antiword for .doc files
        if (strpos($filePath, '.doc') !== false) {
            $output = shell_exec("antiword '$filePath' 2>/dev/null");
            if ($output !== null && trim($output) !== '') {
                return $output;
            }
        }
        
        // Try pandoc for DOCX files
        $output = shell_exec("pandoc '$filePath' -t plain 2>/dev/null");
        if ($output !== null && trim($output) !== '') {
            return $output;
        }
        
        // Fallback: try to read as ZIP and extract document.xml for DOCX
        if ($this->isDocx($filePath)) {
            return $this->parseDocxFallback($filePath);
        }
        
        throw new Exception('Failed to parse Word document. Required utilities may not be available.');
    }
    
    private function isDocx($filePath) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);
        
        return $mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    private function parseDocxFallback($filePath) {
        $zip = new ZipArchive();
        
        if ($zip->open($filePath) === TRUE) {
            $content = $zip->getFromName('word/document.xml');
            $zip->close();
            
            if ($content !== false) {
                // Basic XML parsing to extract text
                $content = preg_replace('/<[^>]+>/', ' ', $content);
                $content = html_entity_decode($content);
                $content = preg_replace('/\s+/', ' ', $content);
                return trim($content);
            }
        }
        
        throw new Exception('Failed to extract content from DOCX file');
    }
}
?>