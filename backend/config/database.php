<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    
    public function __construct() {
        $this->loadEnv();
        
        // Try DATABASE_URL first (for PostgreSQL in Replit)
        if (isset($_ENV['DATABASE_URL'])) {
            $this->parseDatabaseUrl($_ENV['DATABASE_URL']);
        } else {
            $this->host = $_ENV['DB_HOST'] ?? 'localhost';
            $this->db_name = $_ENV['DB_NAME'] ?? 'resume_builder';
            $this->username = $_ENV['DB_USER'] ?? 'postgres';
            $this->password = $_ENV['DB_PASS'] ?? '';
        }
    }

    private function loadEnv() {
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $_ENV[trim($key)] = trim($value);
                }
            }
        }
        
        // Load from server environment
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'DATABASE_') === 0 || strpos($key, 'PG') === 0) {
                $_ENV[$key] = $value;
            }
        }
    }

    private function parseDatabaseUrl($url) {
        $parsed = parse_url($url);
        $this->host = $parsed['host'] ?? 'localhost';
        $this->username = $parsed['user'] ?? 'postgres';
        $this->password = $parsed['pass'] ?? '';
        $this->db_name = ltrim($parsed['path'] ?? '/resume_builder', '/');
    }
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "pgsql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }
        
        return $this->conn;
    }
}
?>