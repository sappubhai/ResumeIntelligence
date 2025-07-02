<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/PDFGenerator.php';

class PDFController {
    
    public function downloadResumePDF($resumeId) {
        $user_id = Auth::authenticate();
        
        // Verify the resume belongs to the current user
        $resume = new Resume();
        if (!$resume->findById($resumeId)) {
            http_response_code(404);
            echo json_encode(['error' => 'Resume not found']);
            return;
        }
        
        if ($resume->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        
        try {
            $pdfGenerator = new PDFGenerator();
            $pdfContent = $pdfGenerator->generateResumePDF($resumeId, $resume->template_id);
            
            // Set headers for PDF download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . ($resume->title ?? 'resume') . '.pdf"');
            header('Content-Length: ' . strlen($pdfContent));
            header('Cache-Control: private, no-transform, no-store, must-revalidate');
            
            echo $pdfContent;
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate PDF: ' . $e->getMessage()]);
        }
    }
}
?>