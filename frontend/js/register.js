/**
 * 生成验证码
 */
function createCaptcha(len = 4) {
    let s = '';
    for (let i = 0; i < len; i++) {
        s += Math.floor(Math.random() * 10);
    }
    return s;
}

// 页面加载时初始化验证码
let currentCaptchaCode = '';
document.addEventListener('DOMContentLoaded', function() {
    // 初始化验证码
    const codeEl = document.getElementById('register-captcha-code');
    const refreshBtn = document.getElementById('register-captcha-refresh');
    const inputEl = document.getElementById('register-captcha-input');
    
    if (codeEl && refreshBtn && inputEl) {
        currentCaptchaCode = createCaptcha();
        codeEl.textContent = currentCaptchaCode;
        
        // 刷新验证码按钮
        refreshBtn.addEventListener('click', () => {
            currentCaptchaCode = createCaptcha();
            codeEl.textContent = currentCaptchaCode;
            inputEl.value = '';
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.style.display = 'none';
            }
        });
    }
});

/**
 * 注册表单提交处理
 */
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const captchaInput = document.getElementById('register-captcha-input');
    const captcha = captchaInput ? captchaInput.value.trim() : '';
    
    // 基本验证
    if (!username || !password) {
        showMessage('用户名和密码不能为空', 'error');
        return;
    }
    
    // 验证码校验
    if (!captcha) {
        showMessage('请输入验证码', 'error');
        return;
    }
    
    if (captcha !== currentCaptchaCode) {
        showMessage('验证码错误，请重试', 'error');
        // 刷新验证码
        if (document.getElementById('register-captcha-code') && document.getElementById('register-captcha-input')) {
            currentCaptchaCode = createCaptcha();
            document.getElementById('register-captcha-code').textContent = currentCaptchaCode;
            document.getElementById('register-captcha-input').value = '';
        }
        return;
    }
    
    // 用户名格式验证：4-15位字母和数字
    const usernamePattern = /^[a-zA-Z0-9]{4,15}$/;
    if (!usernamePattern.test(username)) {
        showMessage('用户名只能包含字母和数字，长度为4-15位', 'error');
        return;
    }
    
    // 密码格式验证：6-16位，可以使用字母、数字和特殊符号
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/;
    if (!passwordPattern.test(password)) {
        showMessage('密码必须为6-16位，可以使用字母、数字和特殊符号', 'error');
        return;
    }
    
    // 使用FormData封装表单数据
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        // 发送POST请求
        const response = await fetch('../backend/api/user/register.php', {
            method: 'POST',
            body: formData
        });
        
        // 检查响应状态
        if (!response.ok) {
            let errorMessage = `服务器错误 (${response.status})`;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorResult = await response.json();
                    errorMessage = errorResult.message || errorMessage;
                }
            } catch (e) {
                console.error('读取错误响应失败:', e);
            }
            showMessage(errorMessage, 'error');
            return;
        }
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('服务器返回了非JSON响应:', text.substring(0, 200));
            showMessage('服务器响应格式错误，请检查后端服务', 'error');
            return;
        }
        
        const result = await response.json();
        
        // 处理响应
        if (result.status === 'success') {
            showMessage(result.message, 'success');
            
            // 延迟跳转，让用户看到成功消息
            if (result.redirect) {
                setTimeout(() => window.location.href = result.redirect, 1500);
            }
        } else {
            showMessage(result.message || '注册失败', 'error');
            // 刷新验证码
            if (document.getElementById('register-captcha-code') && document.getElementById('register-captcha-input')) {
                currentCaptchaCode = createCaptcha();
                document.getElementById('register-captcha-code').textContent = currentCaptchaCode;
                document.getElementById('register-captcha-input').value = '';
            }
        }
    } catch (error) {
        console.error('注册错误:', error);
        showMessage('网络错误，请检查后端服务是否正常运行', 'error');
        // 刷新验证码
        if (document.getElementById('register-captcha-code') && document.getElementById('register-captcha-input')) {
            currentCaptchaCode = createCaptcha();
            document.getElementById('register-captcha-code').textContent = currentCaptchaCode;
            document.getElementById('register-captcha-input').value = '';
        }
    }
});

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: 'success' | 'error' | 'info'
 */
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

