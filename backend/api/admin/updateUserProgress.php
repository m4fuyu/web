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
$db_password = "";
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
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = [
        'status' => 'error',
        'message' => '只支持POST请求'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

// 获取5个建筑进度字段（可以是布尔值或字符串 'true'/'false'）
$forbidden_city = isset($_POST['ForbiddenCity']) ? $_POST['ForbiddenCity'] : null;
$great_wall = isset($_POST['GreatWall']) ? $_POST['GreatWall'] : null;
$temple_of_heaven = isset($_POST['TempleOfHeaven']) ? $_POST['TempleOfHeaven'] : null;
$yellow_crane_tower = isset($_POST['YellowCraneTower']) ? $_POST['YellowCraneTower'] : null;
$potala_palace = isset($_POST['PotalaPalace']) ? $_POST['PotalaPalace'] : null;

if (empty($username)) {
    $response = [
        'status' => 'error',
        'message' => '用户名不能为空'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 检查是否至少提供了一个进度字段
if ($forbidden_city === null && $great_wall === null && $temple_of_heaven === null 
    && $yellow_crane_tower === null && $potala_palace === null) {
    $response = [
        'status' => 'error',
        'message' => '至少需要提供一个要更新的进度字段'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 将输入值转换为布尔值的辅助函数
function convertToBoolean($value) {
    if ($value === true || $value === 1 || $value === '1' || $value === 'true' || $value === 'TRUE') {
        return true;
    }
    if ($value === false || $value === 0 || $value === '0' || $value === 'false' || $value === 'FALSE') {
        return false;
    }
    return null; // 无效值
}

try {
    $username_safe = mysqli_real_escape_string($conn, $username);
    
    // 检查用户是否存在
    $check_query = "SELECT username FROM userAccount WHERE username = '$username_safe'";
    $check_result = mysqli_query($conn, $check_query);
    
    if (!mysqli_fetch_assoc($check_result)) {
        $response = [
            'status' => 'error',
            'message' => '用户不存在'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    // 构建更新SQL语句
    $update_fields = [];
    
    if ($forbidden_city !== null) {
        $bool_value = convertToBoolean($forbidden_city);
        if ($bool_value !== null) {
            $update_fields[] = "ForbiddenCity = " . ($bool_value ? 'TRUE' : 'FALSE');
        }
    }
    
    if ($great_wall !== null) {
        $bool_value = convertToBoolean($great_wall);
        if ($bool_value !== null) {
            $update_fields[] = "GreatWall = " . ($bool_value ? 'TRUE' : 'FALSE');
        }
    }
    
    if ($temple_of_heaven !== null) {
        $bool_value = convertToBoolean($temple_of_heaven);
        if ($bool_value !== null) {
            $update_fields[] = "TempleOfHeaven = " . ($bool_value ? 'TRUE' : 'FALSE');
        }
    }
    
    if ($yellow_crane_tower !== null) {
        $bool_value = convertToBoolean($yellow_crane_tower);
        if ($bool_value !== null) {
            $update_fields[] = "YellowCraneTower = " . ($bool_value ? 'TRUE' : 'FALSE');
        }
    }
    
    if ($potala_palace !== null) {
        $bool_value = convertToBoolean($potala_palace);
        if ($bool_value !== null) {
            $update_fields[] = "PotalaPalace = " . ($bool_value ? 'TRUE' : 'FALSE');
        }
    }
    
    if (empty($update_fields)) {
        $response = [
            'status' => 'error',
            'message' => '提供的进度值无效，请使用 true/false 或 1/0'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }
    
    $update_query = "UPDATE userAccount SET " . implode(', ', $update_fields) . " WHERE username = '$username_safe'";
    
    if (mysqli_query($conn, $update_query)) {
        $response = [
            'status' => 'success',
            'message' => '用户进度更新成功'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('更新失败: ' . mysqli_error($conn));
    }
    
} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>

