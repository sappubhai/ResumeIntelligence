<?php
require_once __DIR__ . '/../config/database.php';

class Resume {
    private $conn;
    private $table_name = "resumes";
    
    public $id;
    public $user_id;
    public $template_id;
    public $title;
    public $full_name;
    public $professional_title;
    public $email;
    public $mobile_number;
    public $date_of_birth;
    public $address;
    public $linkedin_id;
    public $summary;
    public $work_experience;
    public $education;
    public $skills;
    public $certifications;
    public $projects;
    public $achievements;
    public $languages;
    public $hobbies;
    public $additional_info;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET user_id=:user_id, template_id=:template_id, title=:title,
                     full_name=:full_name, professional_title=:professional_title,
                     email=:email, mobile_number=:mobile_number, date_of_birth=:date_of_birth,
                     address=:address, linkedin_id=:linkedin_id, summary=:summary,
                     work_experience=:work_experience, education=:education, skills=:skills,
                     certifications=:certifications, projects=:projects, achievements=:achievements,
                     languages=:languages, hobbies=:hobbies, additional_info=:additional_info";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":template_id", $this->template_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":professional_title", $this->professional_title);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":mobile_number", $this->mobile_number);
        $stmt->bindParam(":date_of_birth", $this->date_of_birth);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":linkedin_id", $this->linkedin_id);
        $stmt->bindParam(":summary", $this->summary);
        $stmt->bindParam(":work_experience", $this->work_experience);
        $stmt->bindParam(":education", $this->education);
        $stmt->bindParam(":skills", $this->skills);
        $stmt->bindParam(":certifications", $this->certifications);
        $stmt->bindParam(":projects", $this->projects);
        $stmt->bindParam(":achievements", $this->achievements);
        $stmt->bindParam(":languages", $this->languages);
        $stmt->bindParam(":hobbies", $this->hobbies);
        $stmt->bindParam(":additional_info", $this->additional_info);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET template_id=:template_id, title=:title,
                     full_name=:full_name, professional_title=:professional_title,
                     email=:email, mobile_number=:mobile_number, date_of_birth=:date_of_birth,
                     address=:address, linkedin_id=:linkedin_id, summary=:summary,
                     work_experience=:work_experience, education=:education, skills=:skills,
                     certifications=:certifications, projects=:projects, achievements=:achievements,
                     languages=:languages, hobbies=:hobbies, additional_info=:additional_info
                 WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":template_id", $this->template_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":professional_title", $this->professional_title);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":mobile_number", $this->mobile_number);
        $stmt->bindParam(":date_of_birth", $this->date_of_birth);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":linkedin_id", $this->linkedin_id);
        $stmt->bindParam(":summary", $this->summary);
        $stmt->bindParam(":work_experience", $this->work_experience);
        $stmt->bindParam(":education", $this->education);
        $stmt->bindParam(":skills", $this->skills);
        $stmt->bindParam(":certifications", $this->certifications);
        $stmt->bindParam(":projects", $this->projects);
        $stmt->bindParam(":achievements", $this->achievements);
        $stmt->bindParam(":languages", $this->languages);
        $stmt->bindParam(":hobbies", $this->hobbies);
        $stmt->bindParam(":additional_info", $this->additional_info);
        
        return $stmt->execute();
    }
    
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->setProperties($row);
            return true;
        }
        
        return false;
    }
    
    public function findByUserId($user_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY updated_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
    
    private function setProperties($row) {
        $this->id = $row['id'];
        $this->user_id = $row['user_id'];
        $this->template_id = $row['template_id'];
        $this->title = $row['title'];
        $this->full_name = $row['full_name'];
        $this->professional_title = $row['professional_title'];
        $this->email = $row['email'];
        $this->mobile_number = $row['mobile_number'];
        $this->date_of_birth = $row['date_of_birth'];
        $this->address = $row['address'];
        $this->linkedin_id = $row['linkedin_id'];
        $this->summary = $row['summary'];
        $this->work_experience = $row['work_experience'];
        $this->education = $row['education'];
        $this->skills = $row['skills'];
        $this->certifications = $row['certifications'];
        $this->projects = $row['projects'];
        $this->achievements = $row['achievements'];
        $this->languages = $row['languages'];
        $this->hobbies = $row['hobbies'];
        $this->additional_info = $row['additional_info'];
        $this->created_at = $row['created_at'];
        $this->updated_at = $row['updated_at'];
    }
}
?>