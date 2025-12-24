<?php
require_once(__DIR__ . '/../function.php');

requireAdminAuth();
$conn = getDbConnection();

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

if (empty($username)) {
    sendResponse('error', '用户名不能为空');
}

// 将输入值转换为布尔值的辅助函数
function convertToBoolean($value) {
    if ($value === true || $value === 1 || $value === '1' || $value === 'true' || $value === 'TRUE') {
        return true;
    }
    if ($value === false || $value === 0 || $value === '0' || $value === 'false' || $value === 'FALSE') {
        return false;
    }
    return null;
}

// 检查用户是否存在
if (!userExists($conn, $username)) {
    sendResponse('error', '用户不存在');
}

// 构建更新SQL语句（使用常量循环处理）
$update_fields = [];
$has_valid_field = false;

foreach (BUILDING_FIELDS as $field) {
    if (isset($_POST[$field])) {
        $bool_value = convertToBoolean($_POST[$field]);
        if ($bool_value !== null) {
            $update_fields[] = "$field = " . ($bool_value ? 'TRUE' : 'FALSE');
            $has_valid_field = true;
        }
    }
}

if (!$has_valid_field) {
    sendResponse('error', '至少需要提供一个有效的进度字段，请使用 true/false 或 1/0');
}

$update_query = "UPDATE userAccount SET " . implode(', ', $update_fields) . " WHERE username = '$username'";

if (mysqli_query($conn, $update_query)) {
    sendResponse('success', '用户进度更新成功');
} else {
    sendResponse('error', '更新失败: ' . mysqli_error($conn));
}

mysqli_close($conn);
?>

