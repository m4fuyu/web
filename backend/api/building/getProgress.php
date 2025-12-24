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

// 从cookie中获取用户信息
if (!isset($_COOKIE['user_session'])) {
    $response = [
        'status' => 'error',
        'message' => '未登录，请先登录'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 解析cookie值
$cookie_value = $_COOKIE['user_session'];
$user_session = null;

// 尝试解析JSON（cookie可能已经解码或未解码）
$user_session = json_decode($cookie_value, true);

// 如果失败，尝试URL解码后再解析
if (!$user_session || !is_array($user_session)) {
    $decoded_value = urldecode($cookie_value);
    $user_session = json_decode($decoded_value, true);
}

// 如果还是失败，可能cookie值被双重编码了
if (!$user_session || !is_array($user_session)) {
    $decoded_value = urldecode(urldecode($cookie_value));
    $user_session = json_decode($decoded_value, true);
}

if (!$user_session || !isset($user_session['username'])) {
    $response = [
        'status' => 'error',
        'message' => '登录信息无效，请重新登录'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

$username = $user_session['username'];
$is_admin = $user_session['is_admin'] ?? false;

try {
    // 根据用户类型查询对应的表
    $username_safe = mysqli_real_escape_string($conn, $username);
    $table_name = ($is_admin === true || $is_admin === 'true' || $is_admin === 1 || $is_admin === '1') ? 'adminAccount' : 'userAccount';
    
    $query = "SELECT ForbiddenCity, GreatWall, TempleOfHeaven, YellowCraneTower, PotalaPalace 
              FROM {$table_name} 
              WHERE username = '$username_safe'";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $row = mysqli_fetch_assoc($result);
    
    if (!$row) {
        $response = [
            'status' => 'error',
            'message' => '用户不存在'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    // 将布尔值转换为布尔类型（MySQL返回的可能是0/1）
    $progress = [
        'ForbiddenCity' => (bool)$row['ForbiddenCity'],
        'GreatWall' => (bool)$row['GreatWall'],
        'TempleOfHeaven' => (bool)$row['TempleOfHeaven'],
        'YellowCraneTower' => (bool)$row['YellowCraneTower'],
        'PotalaPalace' => (bool)$row['PotalaPalace']
    ];
    
    $response = [
        'status' => 'success',
        'data' => [
            'username' => $username,
            'progress' => $progress
        ]
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

