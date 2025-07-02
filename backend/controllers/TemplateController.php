<?php
require_once __DIR__ . '/../models/Template.php';

class TemplateController {
    
    public function getTemplates() {
        $template = new Template();
        $templates = $template->getAll();
        
        echo json_encode($templates);
    }
    
    public function getTemplate($id) {
        $template = new Template();
        
        if ($template->findById($id)) {
            $templateData = [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'category' => $template->category,
                'html_content' => $template->html_content,
                'css_content' => $template->css_content,
                'preview_image' => $template->preview_image,
                'is_premium' => $template->is_premium,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at
            ];
            
            echo json_encode($templateData);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Template not found']);
        }
    }
    
    public function getTemplatesByCategory($category) {
        $template = new Template();
        $templates = $template->getByCategory($category);
        
        echo json_encode($templates);
    }
}
?>