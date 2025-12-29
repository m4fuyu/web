<?php
require_once(__DIR__ . '/../function.php');

requireAdminAuth();
$conn = getDbConnection();

// 获取并验证输入数据
$old_username = isset($_POST['old_username']) ? trim($_POST['old_username']) : '';
$new_username = isset($_POST['new_username']) ? trim($_POST['new_username']) : '';
$new_password = isset($_POST['new_password']) ? trim($_POST['new_password']) : '';

if (empty($old_username)) {
    sendResponse('error', '原用户名不能为空');
}

// 如果提供了新用户名，验证格式
if (!empty($new_username)) {
    $username_pattern = '/^[a-zA-Z0-9]{4,15}$/';
    if (!preg_match($username_pattern, $new_username)) {
        sendResponse('error', '新用户名只能包含字母和数字，长度为4-15位');
    }
}

// 如果提供了新密码，验证格式
if (!empty($new_password)) {
    $password_pattern = '/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/';
    if (!preg_match($password_pattern, $new_password)) {
        sendResponse('error', '新密码必须为6-16位，可以使用字母、数字和特殊符号');
    }
}

// 如果新用户名和新密码都为空，返回错误
if (empty($new_username) && empty($new_password)) {
    sendResponse('error', '新用户名和新密码至少需要提供一个');
}

// 检查原用户是否存在
if (!userExists($conn, $old_username)) {
    sendResponse('error', '用户不存在');
}

// 如果新用户名与原用户名不同，检查新用户名是否已存在
if (!empty($new_username) && $new_username !== $old_username) {
    if (userExists($conn, $new_username, true)) {
        sendResponse('error', '新用户名已存在');
    }
}

// 构建更新SQL语句
$update_fields = [];

if (!empty($new_username) && $new_username !== $old_username) {
    $update_fields[] = "username = '$new_username'";
}

if (!empty($new_password)) {
    $update_fields[] = "password = '$new_password'";
}

if (empty($update_fields)) {
    sendResponse('error', '没有需要更新的字段');
}

$update_query = "UPDATE userAccount SET " . implode(', ', $update_fields) . " WHERE username = '$old_username'";

if (mysqli_query($conn, $update_query)) {
    sendResponse('success', '用户信息更新成功');
} else {
    sendResponse('error', '更新失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>

