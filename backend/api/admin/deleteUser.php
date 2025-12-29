<?php
require_once(__DIR__ . '/../function.php');

requireAdminAuth();
$conn = getDbConnection();

// 获取用户名
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

if (empty($username)) {
    sendResponse('error', '用户名不能为空');
}

// 检查用户是否存在
if (!userExists($conn, $username)) {
    sendResponse('error', '用户不存在');
}

// 删除用户
$delete_query = "DELETE FROM userAccount WHERE username = '$username'";

if (mysqli_query($conn, $delete_query)) {
    sendResponse('success', '用户删除成功');
} else {
    sendResponse('error', '删除失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>

