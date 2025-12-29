<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', '只支持POST请求');
}

// 从cookie中获取用户信息
$user_session = getUserFromCookie();
if (!$user_session) {
    sendResponse('error', '未登录或登录信息无效，请先登录');
}

$username = $user_session['username'];
$is_admin = $user_session['is_admin'] ?? false;

// 获取要更新的建筑ID
$building_id = isset($_POST['building_id']) ? intval($_POST['building_id']) : 0;
$is_unlocked = isset($_POST['unlocked']) ? ($_POST['unlocked'] === 'true' || $_POST['unlocked'] === '1') : true;

if ($building_id <= 0) {
    sendResponse('error', '无效的建筑ID');
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
    sendResponse('error', '未知的建筑ID');
}

$field_name = $field_map[$building_id];
$value = $is_unlocked ? 1 : 0;

// 更新数据库
$username_safe = mysqli_real_escape_string($conn, $username);
$table_name = ($is_admin === true || $is_admin === 'true' || $is_admin === 1 || $is_admin === '1') ? 'adminAccount' : 'userAccount';

$query = "UPDATE {$table_name} SET {$field_name} = {$value} WHERE username = '$username_safe'";

if (mysqli_query($conn, $query)) {
    sendResponse('success', '进度更新成功', [
        'updated_field' => $field_name,
        'new_value' => $value
    ]);
} else {
    sendResponse('error', '更新失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>
