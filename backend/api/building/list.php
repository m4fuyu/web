<?php
/**
 * 建筑列表接口
 * 请求方法: GET
 * 请求参数: category, page, limit, keyword
 */

// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理OPTIONS预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 只允许GET请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '只支持GET请求'
    ]);
    exit();
}

// 引入数据库配置
require_once '../../config/database.php';

// 获取请求参数
$category = $_GET['category'] ?? '';
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(1, intval($_GET['limit'] ?? 12)));
$keyword = $_GET['keyword'] ?? '';
$offset = ($page - 1) * $limit;

try {
    // 构建基础SQL查询
    $sql = "SELECT b.*, c.name as category_name
            FROM buildings b
            LEFT JOIN building_categories c ON b.category_id = c.id
            WHERE b.status = 1";

    $params = [];
    $types = '';

    // 添加分类筛选
    if (!empty($category)) {
        $sql .= " AND c.name = ?";
        $params[] = $category;
        $types .= 's';
    }

    // 添加关键词搜索
    if (!empty($keyword)) {
        $sql .= " AND (b.name LIKE ? OR b.description LIKE ? OR b.location LIKE ?)";
        $search_term = '%' . $keyword . '%';
        $params[] = $search_term;
        $params[] = $search_term;
        $params[] = $search_term;
        $types .= 'sss';
    }

    // 添加排序
    $sql .= " ORDER BY b.created_at DESC";

    // 添加分页
    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    // 准备并执行查询
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $buildings = [];
    while ($row = $result->fetch_assoc()) {
        // 处理图片路径
        if (!empty($row['image'])) {
            $row['image_url'] = '/backend/uploads/buildings/' . $row['image'];
        } else {
            $row['image_url'] = '/frontend/images/default-building.jpg';
        }

        // 解析JSON字段
        if (!empty($row['images'])) {
            $row['images'] = json_decode($row['images'], true);
        } else {
            $row['images'] = [];
        }

        if (!empty($row['features'])) {
            $row['features'] = json_decode($row['features'], true);
        } else {
            $row['features'] = [];
        }

        // 格式化创建时间
        $row['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($row['created_at']));

        $buildings[] = $row;
    }

    // 获取总数（用于分页）
    $count_sql = "SELECT COUNT(*) as total
                  FROM buildings b
                  LEFT JOIN building_categories c ON b.category_id = c.id
                  WHERE b.status = 1";

    $count_params = [];
    $count_types = '';

    if (!empty($category)) {
        $count_sql .= " AND c.name = ?";
        $count_params[] = $category;
        $count_types .= 's';
    }

    if (!empty($keyword)) {
        $count_sql .= " AND (b.name LIKE ? OR b.description LIKE ? OR b.location LIKE ?)";
        $search_term = '%' . $keyword . '%';
        $count_params[] = $search_term;
        $count_params[] = $search_term;
        $count_params[] = $search_term;
        $count_types .= 'sss';
    }

    $count_stmt = $conn->prepare($count_sql);
    if (!empty($count_params)) {
        $count_stmt->bind_param($count_types, ...$count_params);
    }
    $count_stmt->execute();
    $total_result = $count_stmt->get_result();
    $total = $total_result->fetch_assoc()['total'];

    // 计算分页信息
    $total_pages = ceil($total / $limit);

    echo json_encode([
        'success' => true,
        'message' => '获取成功',
        'data' => [
            'buildings' => $buildings,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $total_pages,
                'total_items' => $total,
                'per_page' => $limit,
                'has_next' => $page < $total_pages,
                'has_prev' => $page > 1
            ]
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '系统错误: ' . $e->getMessage()
    ]);
}

$conn->close();
?>