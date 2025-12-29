<?php
header('Content-Type: application/json; charset=utf-8');

// ==========================================
// 配置区域
// ==========================================
// 请将此处的 API KEY 替换为您在火山引擎申请的实际 API KEY
$api_key = "b4636e66-f373-4a5c-825b-72d3ec4d7a36"; 

// 模型 ID (根据您提供的范例)
$model = "doubao-seed-1-6-251015"; 

// API 地址
$api_url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
// ==========================================

// 允许跨域 (开发环境方便调试)
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
$user_message = $input['message'] ?? '';
$building_id = $input['building_id'] ?? 0;

if (empty($user_message)) {
    echo json_encode(['status' => 'error', 'message' => '消息不能为空']);
    exit;
}

// 映射建筑 ID 到文本文件名
$building_map = [
    1 => 'ForbiddenCity',
    2 => 'TempleOfHeaven', // 假设
    3 => 'PotalaPalace',   // 假设
    4 => 'YellowCraneTower', // 假设
    5 => 'GreatWall'       // 假设
];

// 读取背景知识
$context_content = "";
if (isset($building_map[$building_id])) {
    // 路径回退到 frontend/text/
    $file_path = __DIR__ . '/../../../frontend/text/' . $building_map[$building_id];
    // 尝试读取文件，如果文件没有后缀名（如您之前创建的 ForbiddenCity），直接读取
    // 如果有 .txt 后缀，请自行添加
    if (file_exists($file_path)) {
        $context_content = file_get_contents($file_path);
    } elseif (file_exists($file_path . '.txt')) {
        $context_content = file_get_contents($file_path . '.txt');
    }
}

// 构建 System Prompt
$system_prompt = "你是一个专业的中国古代建筑导游 AI。";
if (!empty($context_content)) {
    $system_prompt .= "\n\n请基于以下关于该建筑的详细资料来回答用户的问题。如果用户的问题在资料中找不到答案，你可以利用你的广博知识进行补充，但请优先依据资料。面对用户无关的问题时也请礼貌拒绝。\n\n【建筑资料】：\n" . $context_content;
} else {
    $system_prompt .= "请回答用户关于中国古代建筑的问题，面对用户无关的问题时也请礼貌拒绝。";
}

// 构建请求体
$data = [
    "model" => $model,
    "messages" => [
        [
            "role" => "system",
            "content" => $system_prompt
        ],
        [
            "role" => "user",
            "content" => $user_message
        ]
    ],
    "stream" => false
];

// 初始化 cURL
$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer " . $api_key
]);
// 如果本地开发遇到 SSL 证书问题，可以取消注释下面这行（生产环境不建议）
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

if ($curl_error) {
    echo json_encode(['status' => 'error', 'message' => 'API 请求失败: ' . $curl_error]);
    exit;
}

// 解析 API 响应
$result = json_decode($response, true);

if (isset($result['choices'][0]['message']['content'])) {
    $ai_reply = $result['choices'][0]['message']['content'];
    echo json_encode([
        'status' => 'success',
        'reply' => $ai_reply
    ]);
} else {
    // 尝试提取错误信息
    $error_msg = $result['error']['message'] ?? '未知错误';
    echo json_encode([
        'status' => 'error',
        'message' => 'AI 响应异常: ' . $error_msg,
        'raw_response' => $result // 调试用
    ]);
}
?>