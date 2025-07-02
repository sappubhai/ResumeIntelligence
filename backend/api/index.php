<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $env = parse_ini_file(__DIR__ . '/../.env');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Autoload classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/../controllers/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Simple router
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and leading slash
$path = strtok($request_uri, '?');
$path = ltrim($path, '/');

// Remove 'api/' prefix if present
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Route handling
try {
    switch (true) {
        // Authentication routes
        case $path === 'register' && $request_method === 'POST':
            $controller = new AuthController();
            $controller->register();
            break;
            
        case $path === 'login' && $request_method === 'POST':
            $controller = new AuthController();
            $controller->login();
            break;
            
        case $path === 'logout' && $request_method === 'POST':
            $controller = new AuthController();
            $controller->logout();
            break;
            
        case $path === 'user' && $request_method === 'GET':
            $controller = new AuthController();
            $controller->getUser();
            break;
            
        // Resume routes
        case $path === 'resumes' && $request_method === 'GET':
            $controller = new ResumeController();
            $controller->getResumes();
            break;
            
        case $path === 'resumes' && $request_method === 'POST':
            $controller = new ResumeController();
            $controller->createResume();
            break;
            
        case preg_match('/^resumes\/(\d+)$/', $path, $matches) && $request_method === 'GET':
            $controller = new ResumeController();
            $controller->getResume($matches[1]);
            break;
            
        case preg_match('/^resumes\/(\d+)$/', $path, $matches) && $request_method === 'PUT':
            $controller = new ResumeController();
            $controller->updateResume($matches[1]);
            break;
            
        case preg_match('/^resumes\/(\d+)$/', $path, $matches) && $request_method === 'DELETE':
            $controller = new ResumeController();
            $controller->deleteResume($matches[1]);
            break;
            
        // Template routes
        case $path === 'templates' && $request_method === 'GET':
            $controller = new TemplateController();
            $controller->getTemplates();
            break;
            
        case preg_match('/^templates\/(\d+)$/', $path, $matches) && $request_method === 'GET':
            $controller = new TemplateController();
            $controller->getTemplate($matches[1]);
            break;
            
        case preg_match('/^templates\/category\/([^\/]+)$/', $path, $matches) && $request_method === 'GET':
            $controller = new TemplateController();
            $controller->getTemplatesByCategory($matches[1]);
            break;
            
        // Upload routes
        case $path === 'upload/resume' && $request_method === 'POST':
            $controller = new UploadController();
            $controller->uploadResume();
            break;
            
        // PDF download routes
        case preg_match('/^resumes\/(\d+)\/pdf$/', $path, $matches) && $request_method === 'GET':
            $controller = new PDFController();
            $controller->downloadResumePDF($matches[1]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>