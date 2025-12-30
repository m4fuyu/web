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

$current_username = $user_session['username'];
$is_admin = isset($user_session['is_admin']) && ($user_session['is_admin'] === true || $user_session['is_admin'] === 'true' || $user_session['is_admin'] === 1);

// 获取参数
$comment_id = isset($_POST['comment_id']) ? intval($_POST['comment_id']) : 0;

if ($comment_id <= 0) {
    sendResponse('error', '无效的评论ID');
}

// 查询评论是否存在以及归属者
$comment_id_safe = mysqli_real_escape_string($conn, $comment_id);
$query = "SELECT username FROM comments WHERE id = '$comment_id_safe'";
$result = mysqli_query($conn, $query);

if (!$result || mysqli_num_rows($result) === 0) {
    sendResponse('error', '评论不存在');
}

$row = mysqli_fetch_assoc($result);
$owner_username = $row['username'];

// 权限检查：必须是评论拥有者或者是管理员
if ($current_username !== $owner_username && !$is_admin) {
    sendResponse('error', '无权删除该评论');
}

// 执行删除
$delete_query = "DELETE FROM comments WHERE id = '$comment_id_safe'";
if (mysqli_query($conn, $delete_query)) {
    sendResponse('success', '评论删除成功');
} else {
    sendResponse('error', '删除失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>