<?php
header('Content-Type: application/json; charset=utf-8');

// 引入管理员权限验证函数
require_once __DIR__ . '/checkAdminAuth.php';

// 验证管理员权限
$admin_session = checkAdminAuth();
if (!$admin_session) {
    $response = [
        'status' => 'error',
        'message' => '未登录或没有管理员权限，请先登录管理员账号'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 数据库配置
$servername = "localhost";
$db_username = "root";
$db_password = "root";
$dbname = "user_management";

// 创建数据库连接
$conn = mysqli_connect($servername, $db_username, $db_password, $dbname);

if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => '数据库连接失败: ' . mysqli_connect_error()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

mysqli_set_charset($conn, "utf8");

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $response = [
        'status' => 'error',
        'message' => '只支持GET请求'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    // 获取搜索参数和分页参数
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $pageSize = 6; // 每页显示6个用户
    
    // 构建查询条件
    $where_clause = "1=1";
    if (!empty($search)) {
        $search_safe = mysqli_real_escape_string($conn, $search);
        $where_clause .= " AND username LIKE '%{$search_safe}%'";
    }
    
    // 先查询总数
    $count_query = "SELECT COUNT(*) as total FROM userAccount WHERE {$where_clause}";
    $count_result = mysqli_query($conn, $count_query);
    $total_row = mysqli_fetch_assoc($count_result);
    $total = intval($total_row['total']);
    
    // 计算分页
    $totalPages = ceil($total / $pageSize);
    $offset = ($page - 1) * $pageSize;
    
    // 查询用户列表（分页），包含进度信息
    $query = "SELECT username, password, ForbiddenCity, GreatWall, TempleOfHeaven, YellowCraneTower, PotalaPalace FROM userAccount WHERE {$where_clause} ORDER BY username LIMIT {$pageSize} OFFSET {$offset}";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = [
            'username' => $row['username'],
            'password' => $row['password'],  // 注意：实际项目中不应该返回密码
            'progress' => [
                'ForbiddenCity' => (bool)$row['ForbiddenCity'],
                'GreatWall' => (bool)$row['GreatWall'],
                'TempleOfHeaven' => (bool)$row['TempleOfHeaven'],
                'YellowCraneTower' => (bool)$row['YellowCraneTower'],
                'PotalaPalace' => (bool)$row['PotalaPalace']
            ]
        ];
    }
    
    $response = [
        'status' => 'success',
        'data' => $users,
        'total' => $total,
        'page' => $page,
        'pageSize' => $pageSize,
        'totalPages' => $totalPages
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>

