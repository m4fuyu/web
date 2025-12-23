<?php
header('Content-Type: application/json; charset=utf-8');

// 数据库配置
$servername = "localhost";
$db_username = "root";  // 请修改为你的数据库用户名
$db_password = "";      // 请修改为你的数据库密码
$dbname = "user_management";

// 创建数据库连接
$conn = mysqli_connect($servername, $db_username, $db_password, $dbname);

// 检查连接是否成功
if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => '数据库连接失败: ' . mysqli_connect_error(),
        'redirect' => null
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 设置字符集
mysqli_set_charset($conn, "utf8");

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = [
        'status' => 'error',
        'message' => '只支持POST请求',
        'redirect' => null
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    $response = [
        'status' => 'error',
        'message' => '用户名和密码不能为空',
        'redirect' => null
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 对输入的用户名和密码进行base64编码
$encoded_username = base64_encode($username);
$encoded_password = base64_encode($password);

// 首先查询普通用户表
$username_safe = mysqli_real_escape_string($conn, $username);
$query = "SELECT username, password FROM userAccount WHERE username = '$username_safe'";
$result = mysqli_query($conn, $query);
$user = mysqli_fetch_assoc($result);
$is_admin = false;

// 如果在普通用户表中没有找到，查询管理员表
if (!$user) {
    $query = "SELECT username, password FROM adminAccount WHERE username = '$username_safe'";
    $result = mysqli_query($conn, $query);
    $user = mysqli_fetch_assoc($result);
    $is_admin = true;
}

// 如果用户名不存在
if (!$user) {
    $response = [
        'status' => 'error',
        'message' => '用户不存在',
        'redirect' => null
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
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
        'is_admin' => $is_admin,
        'login_time' => time()
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
    
    $response = [
        'status' => 'success',
        'message' => '登录成功',
        'redirect' => $redirect_url,
        'user_info' => [
            'username' => $user['username'],
            'is_admin' => $is_admin
        ]
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} else {
    // 密码错误
    $response = [
        'status' => 'error',
        'message' => '密码错误',
        'redirect' => null
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>
