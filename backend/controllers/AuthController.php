<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthController {
    
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $user = new User();
        $user->email = $data['email'];
        $user->name = $data['name'];
        $user->password = $data['password'];
        
        if ($user->emailExists()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }
        
        if ($user->create()) {
            $userData = [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name
            ];
            
            Auth::login($user->id, $userData);
            
            http_response_code(201);
            echo json_encode($userData);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }
    
    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing email or password']);
            return;
        }
        
        $user = new User();
        $user->email = $data['email'];
        
        if ($user->findByEmail() && $user->verifyPassword($data['password'])) {
            $userData = [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name
            ];
            
            Auth::login($user->id, $userData);
            
            echo json_encode($userData);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
    
    public function logout() {
        Auth::logout();
        echo json_encode(['message' => 'Logged out successfully']);
    }
    
    public function getUser() {
        $user = Auth::getCurrentUser();
        
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
        }
    }
}
?>