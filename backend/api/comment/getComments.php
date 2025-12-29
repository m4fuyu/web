<?php
require_once(__DIR__ . '/../function.php');

$conn = getDbConnection();

try {
    // 获取查询参数
    $level_id = isset($_GET['level_id']) ? trim($_GET['level_id']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $pageSize = isset($_GET['pageSize']) ? max(1, intval($_GET['pageSize'])) : 20;
    
    // 构建查询条件
    $where_clause = "1=1";
    if (!empty($level_id)) {
        if (!in_array($level_id, LEVEL_IDS)) {
            sendResponse('error', '无效的关卡ID');
        }
        $where_clause .= " AND level_id = '$level_id'";
    }

    if (!empty($search)) {
        $search = mysqli_real_escape_string($conn, $search);
        $where_clause .= " AND (username LIKE '%$search%' OR content LIKE '%$search%')";
    }
    
    // 先查询总数
    $count_query = "SELECT COUNT(*) as total FROM comments WHERE $where_clause";
    $count_result = mysqli_query($conn, $count_query);
    $total_row = mysqli_fetch_assoc($count_result);
    $total = intval($total_row['total']);
    
    // 计算分页
    $totalPages = ceil($total / $pageSize);
    $offset = ($page - 1) * $pageSize;
    
    // 查询评论列表（按时间升序）
    $query = "SELECT id, send_time, username, level_id, content FROM comments WHERE $where_clause ORDER BY send_time ASC LIMIT $pageSize OFFSET $offset";
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        throw new Exception('查询失败: ' . mysqli_error($conn));
    }
    
    $comments = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $comments[] = [
            'id' => intval($row['id']),
            'send_time' => $row['send_time'],
            'username' => $row['username'],
            'level_id' => $row['level_id'],
            'content' => $row['content']
        ];
    }
    
    sendResponse('success', '查询成功', [
        'comments' => $comments,
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

