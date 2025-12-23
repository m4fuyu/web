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
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $response = [
        'status' => 'error',
        'message' => '只支持GET请求'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    // 查询所有用户
    $query = "SELECT username, password FROM userAccount ORDER BY username";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = [
            'username' => $row['username'],
            'password' => $row['password']  // 注意：实际项目中不应该返回密码
        ];
    }
    
    $response = [
        'status' => 'success',
        'data' => $users,
        'count' => count($users)
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>

