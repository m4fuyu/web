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
$db_password = "root";
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

// 获取用户名
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

if (empty($username)) {
    $response = [
        'status' => 'error',
        'message' => '用户名不能为空'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    // 转义用户名防止SQL注入
    $username_safe = mysqli_real_escape_string($conn, $username);
    
    // 检查用户是否存在
    $check_query = "SELECT username FROM userAccount WHERE username = '$username_safe'";
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
    
    // 删除用户
    $delete_query = "DELETE FROM userAccount WHERE username = '$username_safe'";
    
    if (mysqli_query($conn, $delete_query)) {
        $response = [
            'status' => 'success',
            'message' => '用户删除成功'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('删除失败: ' . mysqli_error($conn));
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

