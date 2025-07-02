<?php
require_once __DIR__ . '/../models/Resume.php';
require_once __DIR__ . '/../middleware/auth.php';

class ResumeController {
    
    public function getResumes() {
        $user_id = Auth::authenticate();
        
        $resume = new Resume();
        $resumes = $resume->findByUserId($user_id);
        
        // Decode JSON fields for frontend consumption
        foreach ($resumes as &$r) {
            $r['work_experience'] = json_decode($r['work_experience'] ?? '[]');
            $r['education'] = json_decode($r['education'] ?? '[]');
            $r['skills'] = json_decode($r['skills'] ?? '[]');
            $r['certifications'] = json_decode($r['certifications'] ?? '[]');
            $r['projects'] = json_decode($r['projects'] ?? '[]');
            $r['achievements'] = json_decode($r['achievements'] ?? '[]');
            $r['languages'] = json_decode($r['languages'] ?? '[]');
        }
        
        echo json_encode($resumes);
    }
    
    public function getResume($id) {
        $user_id = Auth::authenticate();
        
        $resume = new Resume();
        if ($resume->findById($id)) {
            // Check if the resume belongs to the current user
            if ($resume->user_id != $user_id) {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied']);
                return;
            }
            
            // Decode JSON fields
            $resumeData = [
                'id' => $resume->id,
                'user_id' => $resume->user_id,
                'template_id' => $resume->template_id,
                'title' => $resume->title,
                'full_name' => $resume->full_name,
                'professional_title' => $resume->professional_title,
                'email' => $resume->email,
                'mobile_number' => $resume->mobile_number,
                'date_of_birth' => $resume->date_of_birth,
                'address' => $resume->address,
                'linkedin_id' => $resume->linkedin_id,
                'summary' => $resume->summary,
                'work_experience' => json_decode($resume->work_experience ?? '[]'),
                'education' => json_decode($resume->education ?? '[]'),
                'skills' => json_decode($resume->skills ?? '[]'),
                'certifications' => json_decode($resume->certifications ?? '[]'),
                'projects' => json_decode($resume->projects ?? '[]'),
                'achievements' => json_decode($resume->achievements ?? '[]'),
                'languages' => json_decode($resume->languages ?? '[]'),
                'hobbies' => $resume->hobbies,
                'additional_info' => $resume->additional_info,
                'created_at' => $resume->created_at,
                'updated_at' => $resume->updated_at
            ];
            
            echo json_encode($resumeData);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Resume not found']);
        }
    }
    
    public function createResume() {
        $user_id = Auth::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $resume = new Resume();
        $resume->user_id = $user_id;
        $resume->template_id = $data['template_id'] ?? 1;
        $resume->title = $data['title'] ?? 'Untitled Resume';
        $resume->full_name = $data['full_name'] ?? '';
        $resume->professional_title = $data['professional_title'] ?? '';
        $resume->email = $data['email'] ?? '';
        $resume->mobile_number = $data['mobile_number'] ?? '';
        $resume->date_of_birth = $data['date_of_birth'] ?? null;
        $resume->address = $data['address'] ?? '';
        $resume->linkedin_id = $data['linkedin_id'] ?? '';
        $resume->summary = $data['summary'] ?? '';
        $resume->work_experience = json_encode($data['work_experience'] ?? []);
        $resume->education = json_encode($data['education'] ?? []);
        $resume->skills = json_encode($data['skills'] ?? []);
        $resume->certifications = json_encode($data['certifications'] ?? []);
        $resume->projects = json_encode($data['projects'] ?? []);
        $resume->achievements = json_encode($data['achievements'] ?? []);
        $resume->languages = json_encode($data['languages'] ?? []);
        $resume->hobbies = $data['hobbies'] ?? '';
        $resume->additional_info = $data['additional_info'] ?? '';
        
        if ($resume->create()) {
            http_response_code(201);
            echo json_encode(['id' => $resume->id, 'message' => 'Resume created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create resume']);
        }
    }
    
    public function updateResume($id) {
        $user_id = Auth::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $resume = new Resume();
        if (!$resume->findById($id)) {
            http_response_code(404);
            echo json_encode(['error' => 'Resume not found']);
            return;
        }
        
        // Check if the resume belongs to the current user
        if ($resume->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        
        // Update fields
        $resume->template_id = $data['template_id'] ?? $resume->template_id;
        $resume->title = $data['title'] ?? $resume->title;
        $resume->full_name = $data['full_name'] ?? $resume->full_name;
        $resume->professional_title = $data['professional_title'] ?? $resume->professional_title;
        $resume->email = $data['email'] ?? $resume->email;
        $resume->mobile_number = $data['mobile_number'] ?? $resume->mobile_number;
        $resume->date_of_birth = $data['date_of_birth'] ?? $resume->date_of_birth;
        $resume->address = $data['address'] ?? $resume->address;
        $resume->linkedin_id = $data['linkedin_id'] ?? $resume->linkedin_id;
        $resume->summary = $data['summary'] ?? $resume->summary;
        $resume->work_experience = isset($data['work_experience']) ? json_encode($data['work_experience']) : $resume->work_experience;
        $resume->education = isset($data['education']) ? json_encode($data['education']) : $resume->education;
        $resume->skills = isset($data['skills']) ? json_encode($data['skills']) : $resume->skills;
        $resume->certifications = isset($data['certifications']) ? json_encode($data['certifications']) : $resume->certifications;
        $resume->projects = isset($data['projects']) ? json_encode($data['projects']) : $resume->projects;
        $resume->achievements = isset($data['achievements']) ? json_encode($data['achievements']) : $resume->achievements;
        $resume->languages = isset($data['languages']) ? json_encode($data['languages']) : $resume->languages;
        $resume->hobbies = $data['hobbies'] ?? $resume->hobbies;
        $resume->additional_info = $data['additional_info'] ?? $resume->additional_info;
        
        if ($resume->update()) {
            echo json_encode(['message' => 'Resume updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update resume']);
        }
    }
    
    public function deleteResume($id) {
        $user_id = Auth::authenticate();
        
        $resume = new Resume();
        if (!$resume->findById($id)) {
            http_response_code(404);
            echo json_encode(['error' => 'Resume not found']);
            return;
        }
        
        // Check if the resume belongs to the current user
        if ($resume->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        
        if ($resume->delete()) {
            echo json_encode(['message' => 'Resume deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete resume']);
        }
    }
}
?>