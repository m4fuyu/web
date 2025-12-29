<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

// 从cookie中获取用户信息
$user_session = getUserFromCookie();
if (!$user_session) {
    sendResponse('error', '未登录或登录信息无效，请先登录');
}

$username = $user_session['username'];
$is_admin = $user_session['is_admin'] ?? false;

try {
    // 根据用户类型查询对应的表
    $table_name = ($is_admin === true) ? 'adminAccount' : 'userAccount';
    
    $fields = implode(', ', BUILDING_FIELDS);
    $query = "SELECT {$fields} FROM {$table_name} WHERE username = '$username'";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $row = mysqli_fetch_assoc($result);
    
    if (!$row) {
        sendResponse('error', '用户不存在');
    }
    
    // 将布尔值转换为布尔类型（MySQL返回的可能是0/1）
    $progress = [];
    foreach (BUILDING_FIELDS as $field) {
        $progress[$field] = (bool)$row[$field];
    }
    
    sendResponse('success', '查询成功', [
        'username' => $username,
        'progress' => $progress
    ]);
    
} catch (Exception $e) {
    sendResponse('error', $e->getMessage());
}

mysqli_close($conn);
?>

