<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    sendResponse('error', '用户名和密码不能为空');
}

// 用户名验证：只允许字母和数字，长度4-15位
$username_pattern = '/^[a-zA-Z0-9]{4,15}$/';
if (!preg_match($username_pattern, $username)) {
    sendResponse('error', '用户名只能包含字母和数字，长度为4-15位');
}

// 密码验证：6-16位,可以使用字母、数字和特殊符号
$password_pattern = '/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/';
if (!preg_match($password_pattern, $password)) {
    sendResponse('error', '密码必须为6-16位,可以使用字母、数字和特殊符号');
}

// 检查用户名是否已存在
if (userExists($conn, $username, true)) {
    sendResponse('error', '用户名已存在');
}

// 插入新用户到普通用户表，初始化关卡进度（紫禁城默认true，其他默认false）
$insert_query = "INSERT INTO userAccount (username, password, ForbiddenCity, GreatWall, TempleOfHeaven, YellowCraneTower, PotalaPalace) 
                 VALUES ('$username', '$password', TRUE, FALSE, FALSE, FALSE, FALSE)";

if (mysqli_query($conn, $insert_query)) {
    sendResponse('success', '注册成功', null, 'login.html');
} else {
    sendResponse('error', '注册失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>