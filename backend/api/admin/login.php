<?php
/**
 * 管理员登录接口
 * 请求方法: POST
 * 请求参数: username, password
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

try {
    // 查询管理员信息
    $sql = "SELECT id, username, password, real_name, email, role, status FROM admins WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
        exit();
    }

    $admin = $result->fetch_assoc();

    // 检查管理员状态
    if ($admin['status'] == 0) {
        echo json_encode([
            'success' => false,
            'message' => '账号已被禁用，请联系超级管理员'
        ]);
        exit();
    }

    // 验证密码
    if (!password_verify($password, $admin['password'])) {
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
        exit();
    }

    // 密码正确，更新最后登录时间
    $update_sql = "UPDATE admins SET last_login = NOW() WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("i", $admin['id']);
    $update_stmt->execute();

    // 设置管理员会话
    session_start();
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['admin_real_name'] = $admin['real_name'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_role'] = $admin['role'];

    // 返回管理员信息（不包含密码）
    unset($admin['password']);

    echo json_encode([
        'success' => true,
        'message' => '登录成功',
        'data' => $admin
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '系统错误: ' . $e->getMessage()
    ]);
}

$conn->close();
?>