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

// 更新数据库：重置所有进度
// 紫禁城(ForbiddenCity) 默认为 1 (解锁)，其他为 0 (锁定)
$username_safe = mysqli_real_escape_string($conn, $username);
$table_name = ($is_admin === true || $is_admin === 'true' || $is_admin === 1 || $is_admin === '1') ? 'adminAccount' : 'userAccount';

$query = "UPDATE {$table_name} SET 
    ForbiddenCity = 1, 
    TempleOfHeaven = 0, 
    PotalaPalace = 0, 
    YellowCraneTower = 0, 
    GreatWall = 0 
    WHERE username = '$username_safe'";

if (mysqli_query($conn, $query)) {
    sendResponse('success', '进度已重置');
} else {
    sendResponse('error', '重置失败: ' . mysqli_error($conn));
}
?>
