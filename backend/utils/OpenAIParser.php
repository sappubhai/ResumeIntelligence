<?php
class OpenAIParser {
    private $apiKey;
    private $apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    public function __construct() {
        $this->apiKey = $_ENV['OPENAI_API_KEY'] ?? '';
        if (empty($this->apiKey)) {
            throw new Exception('OpenAI API key not configured');
        }
    }
    
    public function parseResumeText($text) {
        $prompt = $this->buildPrompt($text);
        
        $data = [
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a resume parsing expert. Extract structured data from resume text and return it in JSON format.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.1,
            'max_tokens' => 2000
        ];
        
        $response = $this->makeAPICall($data);
        
        if (!$response) {
            throw new Exception('Failed to get response from OpenAI');
        }
        
        $content = $response['choices'][0]['message']['content'] ?? '';
        $parsedData = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from OpenAI');
        }
        
        return $this->formatResponse($parsedData);
    }
    
    private function buildPrompt($text) {
        return "Parse the following resume text and extract the information in JSON format with these exact fields:

{
  \"fullName\": \"string\",
  \"professionalTitle\": \"string\",
  \"email\": \"string\",
  \"mobileNumber\": \"string\",
  \"dateOfBirth\": \"YYYY-MM-DD or null\",
  \"address\": \"string\",
  \"linkedinId\": \"string\",
  \"summary\": \"string\",
  \"workExperience\": [
    {
      \"id\": \"unique_id\",
      \"company\": \"string\",
      \"position\": \"string\",
      \"startDate\": \"YYYY-MM\",
      \"endDate\": \"YYYY-MM or null if current\",
      \"isCurrent\": boolean,
      \"description\": \"string\",
      \"location\": \"string\"
    }
  ],
  \"education\": [
    {
      \"id\": \"unique_id\",
      \"institution\": \"string\",
      \"degree\": \"string\",
      \"field\": \"string\",
      \"startDate\": \"YYYY-MM\",
      \"endDate\": \"YYYY-MM\",
      \"gpa\": \"string or null\",
      \"description\": \"string\"
    }
  ],
  \"skills\": [
    {
      \"id\": \"unique_id\",
      \"name\": \"string\",
      \"level\": \"Beginner|Intermediate|Advanced|Expert\",
      \"category\": \"string\"
    }
  ],
  \"certifications\": [
    {
      \"id\": \"unique_id\",
      \"name\": \"string\",
      \"issuer\": \"string\",
      \"issueDate\": \"YYYY-MM\",
      \"expiryDate\": \"YYYY-MM or null\",
      \"credentialId\": \"string or null\",
      \"url\": \"string or null\"
    }
  ],
  \"projects\": [
    {
      \"id\": \"unique_id\",
      \"name\": \"string\",
      \"description\": \"string\",
      \"technologies\": [\"string\"],
      \"startDate\": \"YYYY-MM\",
      \"endDate\": \"YYYY-MM or null\",
      \"url\": \"string or null\",
      \"repository\": \"string or null\"
    }
  ],
  \"achievements\": [
    {
      \"id\": \"unique_id\",
      \"title\": \"string\",
      \"description\": \"string\",
      \"date\": \"YYYY-MM\",
      \"category\": \"string\"
    }
  ],
  \"languages\": [
    {
      \"id\": \"unique_id\",
      \"name\": \"string\",
      \"proficiency\": \"Basic|Conversational|Fluent|Native\"
    }
  ],
  \"hobbies\": \"string\",
  \"additionalInfo\": \"string\"
}

Resume text:
$text

Return only the JSON object, no additional text or explanations.";
    }
    
    private function makeAPICall($data) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey
            ],
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_error($ch)) {
            curl_close($ch);
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('OpenAI API error: HTTP ' . $httpCode . ' - ' . $response);
        }
        
        return json_decode($response, true);
    }
    
    private function formatResponse($data) {
        // Ensure all required fields exist with default values
        return [
            'fullName' => $data['fullName'] ?? '',
            'professionalTitle' => $data['professionalTitle'] ?? '',
            'email' => $data['email'] ?? '',
            'mobileNumber' => $data['mobileNumber'] ?? '',
            'dateOfBirth' => $data['dateOfBirth'] ?? null,
            'address' => $data['address'] ?? '',
            'linkedinId' => $data['linkedinId'] ?? '',
            'summary' => $data['summary'] ?? '',
            'workExperience' => $data['workExperience'] ?? [],
            'education' => $data['education'] ?? [],
            'skills' => $data['skills'] ?? [],
            'certifications' => $data['certifications'] ?? [],
            'projects' => $data['projects'] ?? [],
            'achievements' => $data['achievements'] ?? [],
            'languages' => $data['languages'] ?? [],
            'hobbies' => $data['hobbies'] ?? '',
            'additionalInfo' => $data['additionalInfo'] ?? ''
        ];
    }
}
?>