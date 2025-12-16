<?php
/**
 * 数据库配置文件
 * 中国古代建筑成就网站
 */

// 数据库连接配置
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'ancient_architecture';

// 创建数据库连接
$conn = new mysqli($host, $username, $password, $database);

// 检查连接是否成功
if ($conn->connect_error) {
    // 如果连接失败，返回JSON错误信息
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => '数据库连接失败: ' . $conn->connect_error
    ]);
    exit();
}

// 设置字符集
$conn->set_charset("utf8mb4");

/**
 * 执行数据库查询并返回JSON格式结果的通用函数
 * @param string $sql SQL查询语句
 * @param string $successMessage 成功时的消息
 * @param string $errorMessage 失败时的消息
 */
function executeQuery($conn, $sql, $successMessage = "操作成功", $errorMessage = "操作失败") {
    $result = $conn->query($sql);

    header('Content-Type: application/json');

    if ($result) {
        // 如果是SELECT查询，返回数据
        if (strpos(strtoupper($sql), 'SELECT') === 0) {
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode([
                'success' => true,
                'message' => $successMessage,
                'data' => $data
            ]);
        } else {
            // 如果是INSERT/UPDATE/DELETE查询
            echo json_encode([
                'success' => true,
                'message' => $successMessage
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => $errorMessage . ': ' . $conn->error
        ]);
    }
}

/**
 * 验证用户是否已登录
 * @return array|false 用户信息或false
 */
function checkUserLogin() {
    session_start();
    return isset($_SESSION['user_id']) ? $_SESSION : false;
}

/**
 * 验证管理员是否已登录
 * @return array|false 管理员信息或false
 */
function checkAdminLogin() {
    session_start();
    return isset($_SESSION['admin_id']) ? $_SESSION : false;
}

/**
 * 处理文件上传
 * @param array $file $_FILES数组中的文件信息
 * @param string $targetDir 目标目录
 * @param array $allowedTypes 允许的文件类型
 * @return array 上传结果
 */
function handleFileUpload($file, $targetDir, $allowedTypes = ['jpg', 'jpeg', 'png', 'gif']) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => '文件上传失败'];
    }

    $fileName = basename($file['name']);
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $fileSize = $file['size'];

    // 检查文件类型
    if (!in_array($fileType, $allowedTypes)) {
        return ['success' => false, 'message' => '不支持的文件类型'];
    }

    // 检查文件大小 (5MB限制)
    if ($fileSize > 5 * 1024 * 1024) {
        return ['success' => false, 'message' => '文件大小不能超过5MB'];
    }

    // 生成唯一文件名
    $newFileName = time() . '_' . mt_rand(1000, 9999) . '.' . $fileType;
    $targetPath = $targetDir . '/' . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => true, 'fileName' => $newFileName];
    } else {
        return ['success' => false, 'message' => '文件保存失败'];
    }
}
?>