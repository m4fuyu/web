<?php
require_once(__DIR__ . '/../function.php');

requireAdminAuth();
$conn = getDbConnection();

try {
    // 获取搜索参数和分页参数
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $pageSize = 6; // 每页显示6个用户
    
    // 构建查询条件
    $where_clause = "1=1";
    if (!empty($search)) {
        $where_clause .= " AND username LIKE '%{$search}%'";
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
    $fields = implode(', ', BUILDING_FIELDS);
    $query = "SELECT username, {$fields} FROM userAccount WHERE {$where_clause} ORDER BY username LIMIT {$pageSize} OFFSET {$offset}";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $progress = [];
        foreach (BUILDING_FIELDS as $field) {
            $progress[$field] = (bool)$row[$field];
        }
        $users[] = [
            'username' => $row['username'],
            'progress' => $progress
        ];
    }
    
    sendResponse('success', '查询成功', [
        'users' => $users,
        'total' => $total,
        'page' => $page,
        'pageSize' => $pageSize,
        'totalPages' => $totalPages
    ]);
    
} catch (Exception $e) {
    sendResponse('error', $e->getMessage());
}

mysqli_close($conn);
?>

