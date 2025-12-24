<?php
/**
 * 管理员权限验证函数
 * 返回: 如果验证通过返回用户信息数组，否则返回null
 */
function checkAdminAuth() {
    // 检查cookie中是否有user_session
    if (!isset($_COOKIE['user_session'])) {
        return null;
    }
    
    // 解析cookie值
    $cookie_value = $_COOKIE['user_session'];
    
    // 尝试解析JSON（cookie可能已经解码或未解码）
    $user_session = null;
    
    // 先尝试直接解析
    $user_session = json_decode($cookie_value, true);
    
    // 如果失败，尝试URL解码后再解析
    if (!$user_session || !is_array($user_session)) {
        $decoded_value = urldecode($cookie_value);
        $user_session = json_decode($decoded_value, true);
    }
    
    // 如果还是失败，可能cookie值被双重编码了
    if (!$user_session || !is_array($user_session)) {
        $decoded_value = urldecode(urldecode($cookie_value));
        $user_session = json_decode($decoded_value, true);
    }
    
    if (!$user_session || !is_array($user_session)) {
        return null;
    }
    
    // 检查是否为管理员（支持布尔值和字符串）
    $is_admin = $user_session['is_admin'] === true 
                || $user_session['is_admin'] === 'true' 
                || $user_session['is_admin'] === 1 
                || $user_session['is_admin'] === '1';
    
    if (!$is_admin) {
        return null;
    }
    
    return $user_session;
}

