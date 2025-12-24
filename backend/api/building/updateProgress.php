<?php
header('Content-Type: application/json; charset=utf-8');

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

// 尝试解析JSON
$user_session = json_decode($cookie_value, true);
if (!$user_session || !is_array($user_session)) {
    $decoded_value = urldecode($cookie_value);
    $user_session = json_decode($decoded_value, true);
}
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

// 获取要更新的建筑ID
$building_id = isset($_POST['building_id']) ? intval($_POST['building_id']) : 0;
$is_unlocked = isset($_POST['unlocked']) ? ($_POST['unlocked'] === 'true' || $_POST['unlocked'] === '1') : true;

if ($building_id <= 0) {
    $response = [
        'status' => 'error',
        'message' => '无效的建筑ID'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 映射 ID 到 数据库字段
$field_map = [
    1 => 'ForbiddenCity',
    2 => 'TempleOfHeaven',
    3 => 'PotalaPalace',
    4 => 'YellowCraneTower',
    5 => 'GreatWall'
];

if (!isset($field_map[$building_id])) {
    $response = [
        'status' => 'error',
        'message' => '未知的建筑ID'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

$field_name = $field_map[$building_id];
$value = $is_unlocked ? 1 : 0;

// 更新数据库
$username_safe = mysqli_real_escape_string($conn, $username);
$table_name = ($is_admin === true || $is_admin === 'true' || $is_admin === 1 || $is_admin === '1') ? 'adminAccount' : 'userAccount';

$query = "UPDATE {$table_name} SET {$field_name} = {$value} WHERE username = '$username_safe'";

if (mysqli_query($conn, $query)) {
    $response = [
        'status' => 'success',
        'message' => '进度更新成功',
        'updated_field' => $field_name,
        'new_value' => $value
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} else {
    $response = [
        'status' => 'error',
        'message' => '更新失败: ' . mysqli_error($conn)
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>