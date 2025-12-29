<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

// 从cookie中获取用户信息
$user_session = getUserFromCookie();
if (!$user_session) {
    sendResponse('error', '未登录或登录信息无效，请先登录');
}

$username = $user_session['username'];

// 获取并验证输入数据
$level_id = isset($_POST['level_id']) ? trim($_POST['level_id']) : '';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

if (empty($level_id)) {
    sendResponse('error', '关卡ID不能为空');
}

if (empty($content)) {
    sendResponse('error', '评论内容不能为空');
}

// 评论长度限制（与数据库 VARCHAR(20) 保持一致）
$max_content_length = 20;
$content_length = function_exists('mb_strlen') ? mb_strlen($content, 'UTF-8') : strlen($content);
if ($content_length > $max_content_length) {
    sendResponse('error', '评论内容不能超过' . $max_content_length . '个字符');
}

// 验证关卡ID是否有效
if (!in_array($level_id, LEVEL_IDS)) {
    sendResponse('error', '无效的关卡ID');
}

// 获取当前时间
$send_time = date('Y-m-d H:i:s');

// 插入评论
$insert_query = "INSERT INTO comments (send_time, username, level_id, content) VALUES ('$send_time', '$username', '$level_id', '$content')";

if (mysqli_query($conn, $insert_query)) {
    sendResponse('success', '评论发表成功');
} else {
    sendResponse('error', '发表评论失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>

