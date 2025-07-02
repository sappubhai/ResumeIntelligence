<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table_name = "users";
    
    public $id;
    public $email;
    public $password;
    public $name;
    public $created_at;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET email=:email, password=:password, name=:name";
        
        $stmt = $this->conn->prepare($query);
        
        // Hash password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);
        
        // Bind values
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":name", $this->name);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    public function findByEmail() {
        $query = "SELECT id, email, password, name, created_at 
                 FROM " . $this->table_name . " 
                 WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->name = $row['name'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    public function findById($id) {
        $query = "SELECT id, email, name, created_at 
                 FROM " . $this->table_name . " 
                 WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->name = $row['name'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    public function verifyPassword($plain_password) {
        return password_verify($plain_password, $this->password);
    }
    
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
}
?>