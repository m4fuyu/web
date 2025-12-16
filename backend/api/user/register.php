<?php
/**
 * 用户注册接口
 * 请求方法: POST
 * 请求参数: username, password, realName, gender, email
 */

// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理OPTIONS预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 只允许POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '只支持POST请求'
    ]);
    exit();
}

// 引入数据库配置
require_once '../../config/database.php';

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);

// 如果不是JSON格式，尝试获取表单数据
if (!$data) {
    $data = $_POST;
}

// 验证必填字段
$required_fields = ['username', 'password'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "缺少必填字段: {$field}"
        ]);
        exit();
    }
}

$username = trim($data['username']);
$password = $data['password'];
$real_name = !empty($data['realName']) ? trim($data['realName']) : '';
$gender = !empty($data['gender']) ? $data['gender'] : '保密';
$email = !empty($data['email']) ? trim($data['email']) : '';

// 验证用户名格式（6-18位，只能包含字母、数字、下划线，必须以字母开头）
if (!preg_match('/^[a-zA-Z][a-zA-Z0-9_]{5,17}$/', $username)) {
    echo json_encode([
        'success' => false,
        'message' => '用户名必须是6-18位字母、数字或下划线，且以字母开头'
    ]);
    exit();
}

// 验证密码长度（至少6位）
if (strlen($password) < 6) {
    echo json_encode([
        'success' => false,
        'message' => '密码长度不能少于6位'
    ]);
    exit();
}

// 验证邮箱格式（如果提供）
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => '邮箱格式不正确'
    ]);
    exit();
}

// 验证性别
if (!in_array($gender, ['男', '女', '保密'])) {
    $gender = '保密';
}

try {
    // 检查用户名是否已存在
    $check_sql = "SELECT id FROM users WHERE username = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $username);
    $check_stmt->execute();
    $result = $check_stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => '用户名已存在'
        ]);
        exit();
    }

    // 检查邮箱是否已存在（如果提供）
    if (!empty($email)) {
        $email_check_sql = "SELECT id FROM users WHERE email = ?";
        $email_check_stmt = $conn->prepare($email_check_sql);
        $email_check_stmt->bind_param("s", $email);
        $email_check_stmt->execute();
        $email_result = $email_check_stmt->get_result();

        if ($email_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => '邮箱已被注册'
            ]);
            exit();
        }
    }

    // 密码加密
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 插入用户数据
    $insert_sql = "INSERT INTO users (username, password, real_name, gender, email) VALUES (?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    $insert_stmt->bind_param("sssss", $username, $hashed_password, $real_name, $gender, $email);

    if ($insert_stmt->execute()) {
        // 获取新用户ID
        $user_id = $conn->insert_id;

        // 设置会话
        session_start();
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        $_SESSION['real_name'] = $real_name;

        echo json_encode([
            'success' => true,
            'message' => '注册成功',
            'data' => [
                'user_id' => $user_id,
                'username' => $username,
                'real_name' => $real_name,
                'gender' => $gender
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '注册失败: ' . $conn->error
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '系统错误: ' . $e->getMessage()
    ]);
}

$conn->close();
?>