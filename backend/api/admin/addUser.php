<?php
header('Content-Type: application/json; charset=utf-8');

// 数据库配置
$servername = "localhost";
$db_username = "root";
$db_password = "";
$dbname = "user_management";

// 创建数据库连接
$conn = mysqli_connect($servername, $db_username, $db_password, $dbname);

if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => '数据库连接失败: ' . mysqli_connect_error()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

mysqli_set_charset($conn, "utf8");

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = [
        'status' => 'error',
        'message' => '只支持POST请求'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    $response = [
        'status' => 'error',
        'message' => '用户名和密码不能为空'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 用户名验证：只允许字母和数字，长度4-15位
$username_pattern = '/^[a-zA-Z0-9]{4,15}$/';
if (!preg_match($username_pattern, $username)) {
    $response = [
        'status' => 'error',
        'message' => '用户名只能包含字母和数字，长度为4-15位'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 密码验证：6-16位,可以使用字母、数字和特殊符号
$password_pattern = '/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/';
if (!preg_match($password_pattern, $password)) {
    $response = [
        'status' => 'error',
        'message' => '密码必须为6-16位，可以使用字母、数字和特殊符号'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    // 检查用户名是否已存在（检查普通用户表和管理员表）
    $username_safe = mysqli_real_escape_string($conn, $username);
    $check_query = "SELECT username FROM userAccount WHERE username = '$username_safe'
                    UNION
                    SELECT username FROM adminAccount WHERE username = '$username_safe'";
    $check_result = mysqli_query($conn, $check_query);
    
    if (mysqli_fetch_assoc($check_result)) {
        $response = [
            'status' => 'error',
            'message' => '用户名已存在'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    // 插入新用户
    $password_safe = mysqli_real_escape_string($conn, $password);
    $insert_query = "INSERT INTO userAccount (username, password) VALUES ('$username_safe', '$password_safe')";
    
    if (mysqli_query($conn, $insert_query)) {
        $response = [
            'status' => 'success',
            'message' => '用户添加成功'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('添加失败: ' . mysqli_error($conn));
    }
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>

