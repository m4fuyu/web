<?php
// 引入数据库配置
require_once(__DIR__ . '/connectvars.php');

// ==================== 常量 ====================
// 关卡ID列表
define('LEVEL_IDS', ['ForbiddenCity', 'GreatWall', 'TempleOfHeaven', 'YellowCraneTower', 'PotalaPalace']);

// 建筑进度字段列表
define('BUILDING_FIELDS', ['ForbiddenCity', 'GreatWall', 'TempleOfHeaven', 'YellowCraneTower', 'PotalaPalace']);

// ==================== 响应辅助函数 ====================

function sendResponse($status, $message, $data = null, $redirect = null) {
    header('Content-Type: application/json; charset=utf-8');
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) $response['data'] = $data;
    if ($redirect !== null) $response['redirect'] = $redirect;
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// ==================== 数据库连接辅助函数 ====================

function getDbConnection() {
    $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    if (!$conn) {
        sendResponse('error', '数据库连接失败: ' . mysqli_connect_error());
    }
    mysqli_set_charset($conn, "utf8");
    return $conn;
}

// ==================== 认证辅助函数 ====================

function getUserFromCookie($requireAdmin = false) {
    $cookie_value = $_COOKIE['user_session'] ?? '';
    if (empty($cookie_value)) {
        return null;
    }
    
    $user_session = json_decode($cookie_value, true);
    if (!is_array($user_session) || !isset($user_session['username'])) {
        return null;
    }
    
    // 如果需要管理员权限，检查是否为管理员
    if ($requireAdmin && (!isset($user_session['is_admin']) || $user_session['is_admin'] !== true)) {
        return null;
    }
    
    return $user_session;
}

function requireAdminAuth() {
    $admin = getUserFromCookie(true);
    if (!$admin) {
        sendResponse('error', '未登录或没有管理员权限，请先登录管理员账号');
    }
    return $admin;
}

// ==================== 用户相关辅助函数 ====================
function userExists($conn, $username, $checkAdmin = false) {
    $query = "SELECT username FROM userAccount WHERE username = '$username'";
    if ($checkAdmin) {
        $query .= " UNION SELECT username FROM adminAccount WHERE username = '$username'";
    }
    $result = mysqli_query($conn, $query);
    return mysqli_fetch_assoc($result) !== null;
}

?>

