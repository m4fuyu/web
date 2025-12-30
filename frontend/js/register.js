/**
 * 注册页面 (jQuery版)
 */
$(() => {
    const $code = $('#register-captcha-code'),
          $input = $('#register-captcha-input'),
          $msg = $('#message');
    
    let code = genCode();
    $code.text(code);
    
    function genCode() { return Math.random().toString().slice(2, 6); }
    
    function refreshCode() {
        code = genCode();
        $code.text(code);
        $input.val('');
    }
    
    function showMsg(text, type) {
        $msg.text(text).removeClass('success error').addClass(type).show();
    }
    
    $('#register-captcha-refresh').on('click', () => { refreshCode(); $msg.hide(); });
    
    $('#registerForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val().trim(),
              password = $('#password').val().trim(),
              captcha = $input.val().trim();
        
        if (!username || !password) return showMsg('用户名和密码不能为空', 'error');
        if (!captcha || captcha !== code) { refreshCode(); return showMsg('验证码错误', 'error'); }
        if (!/^[a-zA-Z0-9]{4,15}$/.test(username)) return showMsg('用户名只能包含字母和数字，长度4-15位', 'error');
        if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]{6,16}$/.test(password)) return showMsg('密码必须为6-16位', 'error');
        
        try {
            const fd = new FormData();
            fd.append('username', username);
            fd.append('password', password);
            
            const r = await $.ajax({ url: '../backend/api/user/register.php', method: 'POST', data: fd, processData: false, contentType: false });
            
            if (r.status === 'success') {
                showMsg(r.message, 'success');
                if (r.redirect) setTimeout(() => location.href = r.redirect, 1500);
            } else {
                showMsg(r.message || '注册失败', 'error');
                refreshCode();
            }
        } catch {
            showMsg('网络错误，请检查后端服务', 'error');
            refreshCode();
        }
    });
});
