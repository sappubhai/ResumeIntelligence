<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route to API
if (preg_match('/^\/api/', $_SERVER['REQUEST_URI'])) {
    require_once 'api/index.php';
} else {
    // Default response
    echo json_encode([
        'message' => 'ResumeBuilder PHP API',
        'version' => '1.0.0',
        'status' => 'running',
        'endpoints' => [
            'GET /api/test' => 'Test endpoint',
            'POST /api/auth/login' => 'Login endpoint',
            'POST /api/auth/register' => 'Register endpoint',
            'GET /api/templates' => 'Get templates',
            'GET /api/resumes' => 'Get user resumes'
        ]
    ]);
}
?>