<?php
session_start();

class Auth {
    public static function authenticate() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        return $_SESSION['user_id'];
    }
    
    public static function login($user_id, $user_data) {
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_email'] = $user_data['email'];
        $_SESSION['user_name'] = $user_data['name'];
    }
    
    public static function logout() {
        session_destroy();
    }
    
    public static function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        return [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'name' => $_SESSION['user_name']
        ];
    }
    
    public static function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
}
?>