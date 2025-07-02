<?php
require_once __DIR__ . '/../models/Resume.php';
require_once __DIR__ . '/../models/Template.php';

class PDFGenerator {
    
    public function generateResumePDF($resumeId, $templateId) {
        $resume = new Resume();
        $template = new Template();
        
        if (!$resume->findById($resumeId) || !$template->findById($templateId)) {
            throw new Exception('Resume or template not found');
        }
        
        $html = $this->generateHTML($resume, $template);
        
        // Use wkhtmltopdf if available on shared hosting
        if ($this->isWkhtmltopdfAvailable()) {
            return $this->generateWithWkhtmltopdf($html);
        }
        
        // Fallback: Use TCPDF library
        return $this->generateWithTCPDF($html);
    }
    
    private function generateHTML($resume, $template) {
        $html = $template->html_content;
        $css = $template->css_content;
        
        // Decode JSON fields
        $workExperience = json_decode($resume->work_experience ?? '[]', true);
        $education = json_decode($resume->education ?? '[]', true);
        $skills = json_decode($resume->skills ?? '[]', true);
        $certifications = json_decode($resume->certifications ?? '[]', true);
        $projects = json_decode($resume->projects ?? '[]', true);
        $achievements = json_decode($resume->achievements ?? '[]', true);
        $languages = json_decode($resume->languages ?? '[]', true);
        
        // Replace placeholders
        $replacements = [
            '{{fullName}}' => $resume->full_name ?? '',
            '{{professionalTitle}}' => $resume->professional_title ?? '',
            '{{email}}' => $resume->email ?? '',
            '{{mobileNumber}}' => $resume->mobile_number ?? '',
            '{{address}}' => $resume->address ?? '',
            '{{linkedinId}}' => $resume->linkedin_id ?? '',
            '{{summary}}' => $resume->summary ?? '',
            '{{hobbies}}' => $resume->hobbies ?? '',
            '{{additionalInfo}}' => $resume->additional_info ?? '',
            '{{cssContent}}' => $css
        ];
        
        // Replace simple placeholders
        foreach ($replacements as $placeholder => $value) {
            $html = str_replace($placeholder, htmlspecialchars($value), $html);
        }
        
        // Replace work experience
        $workExpHtml = '';
        foreach ($workExperience as $job) {
            $endDate = $job['isCurrent'] ? 'Present' : ($job['endDate'] ?? '');
            $workExpHtml .= sprintf(
                '<div class="job">
                    <h3>%s at %s</h3>
                    <p class="date">%s - %s</p>
                    <p class="location">%s</p>
                    <p>%s</p>
                </div>',
                htmlspecialchars($job['position'] ?? ''),
                htmlspecialchars($job['company'] ?? ''),
                htmlspecialchars($job['startDate'] ?? ''),
                htmlspecialchars($endDate),
                htmlspecialchars($job['location'] ?? ''),
                htmlspecialchars($job['description'] ?? '')
            );
        }
        
        // Replace education
        $educationHtml = '';
        foreach ($education as $edu) {
            $educationHtml .= sprintf(
                '<div class="degree">
                    <h3>%s in %s</h3>
                    <p>%s</p>
                    <p class="date">%s - %s</p>
                    %s
                </div>',
                htmlspecialchars($edu['degree'] ?? ''),
                htmlspecialchars($edu['field'] ?? ''),
                htmlspecialchars($edu['institution'] ?? ''),
                htmlspecialchars($edu['startDate'] ?? ''),
                htmlspecialchars($edu['endDate'] ?? ''),
                !empty($edu['gpa']) ? '<p>GPA: ' . htmlspecialchars($edu['gpa']) . '</p>' : ''
            );
        }
        
        // Replace skills
        $skillsHtml = '';
        foreach ($skills as $skill) {
            $skillsHtml .= sprintf(
                '<div class="skill">
                    <span class="skill-name">%s</span>
                    <span class="skill-level">%s</span>
                </div>',
                htmlspecialchars($skill['name'] ?? ''),
                htmlspecialchars($skill['level'] ?? '')
            );
        }
        
        // Handle Handlebars-style loops (basic implementation)
        $html = preg_replace('/{{#each workExperience}}.*?{{\/each}}/s', $workExpHtml, $html);
        $html = preg_replace('/{{#each education}}.*?{{\/each}}/s', $educationHtml, $html);
        $html = preg_replace('/{{#each skills}}.*?{{\/each}}/s', $skillsHtml, $html);
        
        return $html;
    }
    
    private function isWkhtmltopdfAvailable() {
        $output = shell_exec('which wkhtmltopdf 2>/dev/null');
        return !empty($output);
    }
    
    private function generateWithWkhtmltopdf($html) {
        $tempHtml = tempnam(sys_get_temp_dir(), 'resume_') . '.html';
        $tempPdf = tempnam(sys_get_temp_dir(), 'resume_') . '.pdf';
        
        file_put_contents($tempHtml, $html);
        
        $command = sprintf(
            'wkhtmltopdf --page-size A4 --margin-top 10mm --margin-bottom 10mm --margin-left 10mm --margin-right 10mm %s %s 2>/dev/null',
            escapeshellarg($tempHtml),
            escapeshellarg($tempPdf)
        );
        
        exec($command, $output, $returnCode);
        
        if ($returnCode === 0 && file_exists($tempPdf)) {
            $pdfContent = file_get_contents($tempPdf);
            unlink($tempHtml);
            unlink($tempPdf);
            return $pdfContent;
        }
        
        // Clean up and throw exception
        if (file_exists($tempHtml)) unlink($tempHtml);
        if (file_exists($tempPdf)) unlink($tempPdf);
        
        throw new Exception('Failed to generate PDF with wkhtmltopdf');
    }
    
    private function generateWithTCPDF($html) {
        // This is a basic implementation - you would need to include TCPDF library
        // For shared hosting, you might need to install TCPDF via Composer
        throw new Exception('TCPDF implementation not available. Please install TCPDF library or ensure wkhtmltopdf is available.');
    }
}
?>