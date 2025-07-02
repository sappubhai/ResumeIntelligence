<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/FileParser.php';
require_once __DIR__ . '/../utils/OpenAIParser.php';

class UploadController {
    
    public function uploadResume() {
        $user_id = Auth::authenticate();
        
        if (!isset($_FILES['resume']) || $_FILES['resume']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error']);
            return;
        }
        
        $file = $_FILES['resume'];
        $allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        $max_size = 10 * 1024 * 1024; // 10MB
        
        if (!in_array($file['type'], $allowed_types)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.']);
            return;
        }
        
        if ($file['size'] > $max_size) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 10MB limit']);
            return;
        }
        
        try {
            // Parse the file content
            $fileParser = new FileParser();
            $text = $fileParser->parseFile($file['tmp_name'], $file['type']);
            
            // Use OpenAI to extract structured data
            $openAIParser = new OpenAIParser();
            $parsedData = $openAIParser->parseResumeText($text);
            
            echo json_encode([
                'message' => 'Resume parsed successfully',
                'data' => $parsedData
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to parse resume: ' . $e->getMessage()]);
        }
    }
}
?>