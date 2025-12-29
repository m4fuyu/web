<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    sendResponse('error', '用户名和密码不能为空');
}

// 对输入的密码进行base64编码
$encoded_password = base64_encode($password);

// 首先查询普通用户表
$query = "SELECT username, password FROM userAccount WHERE username = '$username'";
$result = mysqli_query($conn, $query);

if (!$result) {
    sendResponse('error', '数据库查询失败(User): ' . mysqli_error($conn));
}

$user = mysqli_fetch_assoc($result);
$is_admin = false;

// 如果在普通用户表中没有找到，查询管理员表
if (!$user) {
    $query = "SELECT username, password FROM adminAccount WHERE username = '$username'";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        sendResponse('error', '数据库查询失败(Admin): ' . mysqli_error($conn));
    }
    
    $user = mysqli_fetch_assoc($result);
    $is_admin = true;
}

// 如果用户名不存在
if (!$user) {
    sendResponse('error', '用户不存在');
}

// 对数据库中的密码进行trim和base64编码后比较
$db_password = trim($user['password']);
$db_password_encoded = base64_encode($db_password);

// 验证密码
if ($encoded_password === $db_password_encoded) {
    // 密码正确，设置cookie
    $cookie_name = "user_session";
    $cookie_data = [
        'username' => $user['username'],
        'is_admin' => $is_admin
    ];
    $cookie_value = json_encode($cookie_data, JSON_UNESCAPED_UNICODE);
    $cookie_expiry = time() + (86400 * 30); // 30天过期
    
    // 检测并设置正确的cookie路径
    $script_dir = dirname($_SERVER['SCRIPT_NAME']); // 获取当前脚本的目录路径
    // 从 /code/backend/api/user/ 提取 /code/
    $cookie_path = '/';
    if (strpos($script_dir, '/code') === 0) {
        $cookie_path = '/code/';
    }
    
    // HttpOnly设置为false，允许前端JavaScript读取cookie
    setcookie($cookie_name, $cookie_value, $cookie_expiry, $cookie_path, "", false, false);

    // 根据用户类型设置跳转地址（相对于前端页面路径）
    $redirect_url = $is_admin ? 'admin/index.html' : 'index.html';
    
    sendResponse('success', '登录成功', [
        'username' => $user['username'],
        'is_admin' => $is_admin
    ], $redirect_url);
} else {
    sendResponse('error', '密码错误');
}

mysqli_close($conn);
?>
