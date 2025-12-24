<?php
header('Content-Type: application/json; charset=utf-8');

// 数据库配置
$servername = "localhost";
$db_username = "root";  // 请修改为你的数据库用户名
$db_password = "root";      // 请修改为你的数据库密码
$dbname = "user_management";

// 创建数据库连接
$conn = mysqli_connect($servername, $db_username, $db_password, $dbname);

// 检查连接是否成功
if (!$conn) {
    $response = [
        'status' => 'error',
        'message' => '数据库连接失败: ' . mysqli_connect_error()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// 设置字符集
mysqli_set_charset($conn, "utf8");


// 获取并验证输入数据
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    $response = [
        'status' => 'error',
        'message' => '用户名和密码不能为空'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 用户名验证：只允许字母和数字，长度4-15位
$username_pattern = '/^[a-zA-Z0-9]{4,15}$/';
if (!preg_match($username_pattern, $username)) {
    $response = [
        'status' => 'error',
        'message' => '用户名只能包含字母和数字，长度为4-15位'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

// 密码验证：6-16位,可以使用字母、数字和特殊符号
$password_pattern = '/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/';
if (!preg_match($password_pattern, $password)) {
    $response = [
        'status' => 'error',
        'message' => '密码必须为6-16位,可以使用字母、数字和特殊符号'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    mysqli_close($conn);
    exit();
}

try {
    // 检查用户名是否已存在（合并查询普通用户表和管理员表）
    $username_safe = mysqli_real_escape_string($conn, $username);
    $query = "SELECT username FROM userAccount WHERE username = '$username_safe'
              UNION
              SELECT username FROM adminAccount WHERE username = '$username_safe'";
    $result = mysqli_query($conn, $query);

    if (mysqli_fetch_assoc($result)) {
        $response = [
            'status' => 'error',
            'message' => '用户名已存在'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        mysqli_close($conn);
        exit();
    }

    // 插入新用户到普通用户表，初始化关卡进度（紫禁城默认true，其他默认false）
    $password_safe = mysqli_real_escape_string($conn, $password);
    $insert_query = "INSERT INTO userAccount (username, password, ForbiddenCity, GreatWall, TempleOfHeaven, YellowCraneTower, PotalaPalace) 
                     VALUES ('$username_safe', '$password_safe', TRUE, FALSE, FALSE, FALSE, FALSE)";

    if (mysqli_query($conn, $insert_query)) {
        $response = [
            'status' => 'success',
            'message' => '注册成功',
            'redirect' => 'login.html'  // 跳转到登录页面
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    } else {
        $response = [
            'status' => 'error',
            'message' => '注册失败: ' . mysqli_error($conn)
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    $response = [
        'status' => 'error',
        'message' => '注册过程中发生错误: ' . $e->getMessage()
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

mysqli_close($conn);
?>