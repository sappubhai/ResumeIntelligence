<?php
require_once __DIR__ . '/../config/database.php';

class Template {
    private $conn;
    private $table_name = "templates";
    
    public $id;
    public $name;
    public $description;
    public $category;
    public $html_content;
    public $css_content;
    public $preview_image;
    public $is_premium;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->category = $row['category'];
            $this->html_content = $row['html_content'];
            $this->css_content = $row['css_content'];
            $this->preview_image = $row['preview_image'];
            $this->is_premium = $row['is_premium'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET name=:name, description=:description, category=:category,
                     html_content=:html_content, css_content=:css_content,
                     preview_image=:preview_image, is_premium=:is_premium";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":html_content", $this->html_content);
        $stmt->bindParam(":css_content", $this->css_content);
        $stmt->bindParam(":preview_image", $this->preview_image);
        $stmt->bindParam(":is_premium", $this->is_premium);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    public function getByCategory($category) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE category = :category ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category", $category);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>