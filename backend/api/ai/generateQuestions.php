<?php
header('Content-Type: application/json; charset=utf-8');

// ==========================================
// 配置区域
// ==========================================
// 使用与 chat.php 相同的 API KEY (或者替换为您新的 Key)
$api_key = "b4636e66-f373-4a5c-825b-72d3ec4d7a36"; 

// 模型 ID (Doubao-1.6-flash)
$model = "doubao-seed-1-6-flash-250828"; 

// API 地址
$api_url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
// ==========================================

// 允许跨域
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => '只支持 POST 请求']);
    exit;
}

// 获取前端发送的数据
$input = json_decode(file_get_contents('php://input'), true);
$building_name = $input['building_name'] ?? '';

if (empty($building_name)) {
    echo json_encode(['status' => 'error', 'message' => '建筑名称不能为空']);
    exit;
}

// 构建 Prompt
$system_prompt = "你是一个中国古代建筑专家。请根据用户提供的建筑名称，生成5道相关的单项选择题。
要求返回格式必须是纯粹的 JSON 数组，不要包含 markdown 标记（如 ```json ... ```），也不要包含其他任何文字。
JSON 数组中包含 5 个对象，每个对象包含以下字段：
- question: 题目描述
- options: 一个包含4个选项字符串的数组
- correctIndex: 正确选项的索引（0-3 之间的整数）
- hint: 一个简短的提示，用于帮助用户回答

例如：
[
  {
    \"question\": \"紫禁城是哪个朝代开始建设的？\",
    \"options\": [\"唐朝\", \"宋朝\", \"明朝\", \"清朝\"],
    \"correctIndex\": 2,
    \"hint\": \"由明成祖朱棣下令建设。\"
  }
]";

$user_prompt = "请生成关于“{$building_name}”的5道题目。";

// 构建请求数据
$data = [
    'model' => $model,
    'messages' => [
        ['role' => 'system', 'content' => $system_prompt],
        ['role' => 'user', 'content' => $user_prompt]
    ],
    'temperature' => 0.7
];

// 发起 cURL 请求
$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key
]);
// 忽略 SSL 验证（开发环境）
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    echo json_encode(['status' => 'error', 'message' => 'Curl error: ' . $curl_error]);
    exit;
}

if ($http_code !== 200) {
    echo json_encode(['status' => 'error', 'message' => 'API error HTTP ' . $http_code, 'debug' => $response]);
    exit;
}

// 解析 API 响应
$result = json_decode($response, true);
$content = $result['choices'][0]['message']['content'] ?? '';

// 尝试解析返回的 JSON 内容
// 有时候 AI 会返回 markdown 代码块，需要清洗
$clean_content = preg_replace('/^```json\s*|\s*```$/', '', trim($content));

$questions = json_decode($clean_content, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    // 如果解析失败，尝试返回原始文本以便调试，或者返回错误
    echo json_encode([
        'status' => 'error', 
        'message' => 'AI 返回格式解析失败', 
        'raw_content' => $content
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'data' => $questions
    ]);
}
?>