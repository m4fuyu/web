<?php
header('Content-Type: application/json; charset=utf-8');

// 引入管理员权限验证函数
require_once __DIR__ . '/checkAdminAuth.php';

// 验证管理员权限
$admin_session = checkAdminAuth();
if (!$admin_session) {
    $response = [
        'status' => 'error',
        'message' => '未登录或没有管理员权限，请先登录管理员账号'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

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
$old_username = isset($_POST['old_username']) ? trim($_POST['old_username']) : '';
$new_username = isset($_POST['new_username']) ? trim($_POST['new_username']) : '';
$new_password = isset($_POST['new_password']) ? trim($_POST['new_password']) : '';

if (empty($old_username)) {
    $response = [
        'status' => 'error',
        'message' => '原用户名不能为空'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 如果提供了新用户名，验证格式
if (!empty($new_username)) {
    $username_pattern = '/^[a-zA-Z0-9]{4,15}$/';
    if (!preg_match($username_pattern, $new_username)) {
        $response = [
            'status' => 'error',
            'message' => '新用户名只能包含字母和数字，长度为4-15位'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
}

// 如果提供了新密码，验证格式
if (!empty($new_password)) {
    $password_pattern = '/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/';
    if (!preg_match($password_pattern, $new_password)) {
        $response = [
            'status' => 'error',
            'message' => '新密码必须为6-16位，可以使用字母、数字和特殊符号'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
}

// 如果新用户名和新密码都为空，返回错误
if (empty($new_username) && empty($new_password)) {
    $response = [
        'status' => 'error',
        'message' => '新用户名和新密码至少需要提供一个'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    $old_username_safe = mysqli_real_escape_string($conn, $old_username);
    
    // 检查原用户是否存在
    $check_query = "SELECT username FROM userAccount WHERE username = '$old_username_safe'";
    $check_result = mysqli_query($conn, $check_query);
    
    if (!mysqli_fetch_assoc($check_result)) {
        $response = [
            'status' => 'error',
            'message' => '用户不存在'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    // 如果新用户名与原用户名不同，检查新用户名是否已存在
    if (!empty($new_username) && $new_username !== $old_username) {
        $new_username_safe = mysqli_real_escape_string($conn, $new_username);
        $check_new_query = "SELECT username FROM userAccount WHERE username = '$new_username_safe'
                           UNION
                           SELECT username FROM adminAccount WHERE username = '$new_username_safe'";
        $check_new_result = mysqli_query($conn, $check_new_query);
        
        if (mysqli_fetch_assoc($check_new_result)) {
            $response = [
                'status' => 'error',
                'message' => '新用户名已存在'
            ];
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            mysqli_close($conn);
            exit();
        }
    }
    
    // 构建更新SQL语句
    $update_fields = [];
    
    if (!empty($new_username) && $new_username !== $old_username) {
        $new_username_safe = mysqli_real_escape_string($conn, $new_username);
        $update_fields[] = "username = '$new_username_safe'";
    }
    
    if (!empty($new_password)) {
        $new_password_safe = mysqli_real_escape_string($conn, $new_password);
        $update_fields[] = "password = '$new_password_safe'";
    }
    
    if (empty($update_fields)) {
        $response = [
            'status' => 'error',
            'message' => '没有需要更新的字段'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    $update_query = "UPDATE userAccount SET " . implode(', ', $update_fields) . " WHERE username = '$old_username_safe'";
    
    if (mysqli_query($conn, $update_query)) {
        $response = [
            'status' => 'success',
            'message' => '用户信息更新成功'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('更新失败: ' . mysqli_error($conn));
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

