/**
 * 登录页面 (jQuery版)
 */
$(() => {
    const $code = $('#login-captcha-code'),
          $input = $('#login-captcha-input'),
          $error = $('#login-error'),
          $btn = $('#login-btn');
    
    let code = genCode();
    $code.text(code);
    
    function genCode() { return Math.random().toString().slice(2, 6); }
    
    function refreshCode() {
        code = genCode();
        $code.text(code);
        $input.val('');
        $error.text('').css('color', '');
    }
    
    $('#login-captcha-refresh').on('click', refreshCode);
    
    $btn.on('click', async () => {
        const username = $('#username').val().trim(),
              password = $('#password').val().trim(),
              captcha = $input.val().trim();
        
        $error.text('').css('color', '');
        
        if (!username || !password) return $error.text('用户名和密码不能为空');
        if (captcha !== code) { refreshCode(); return $error.text('验证码错误'); }
        
        $btn.prop('disabled', true).text('登录中...');
        
        try {
            const fd = new FormData();
            fd.append('username', username);
            fd.append('password', password);
            
            const r = await $.ajax({ url: '../backend/api/user/logincheck.php', method: 'POST', data: fd, processData: false, contentType: false });
            
            if (r.status === 'success') {
                localStorage.removeItem('ancient_buildings_progress');
                $error.css('color', '#4caf50').text(`${r.message} - ${r.data.username}${r.data.is_admin ? ' (管理员)' : ''}`);
                setTimeout(() => location.href = r.redirect || (r.data.is_admin ? 'admin/index.html' : 'index.html'), 1000);
            } else {
                $error.text(r.message || '登录失败');
                $btn.prop('disabled', false).text('登录');
                refreshCode();
            }
        } catch (e) {
            $error.text('网络错误，请检查后端服务');
            $btn.prop('disabled', false).text('登录');
            refreshCode();
        }
    });
});
