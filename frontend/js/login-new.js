/**
 * 新登录页面处理（带验证码）
 */

// 生成验证码
function createCaptcha(len = 4) {
    let s = '';
    for (let i = 0; i < len; i++) {
        s += Math.floor(Math.random() * 10);
    }
    return s;
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

/**
 * 初始化登录页面
 */
function initLoginPage() {
    const codeEl = document.getElementById('login-captcha-code');
    const refreshBtn = document.getElementById('login-captcha-refresh');
    const inputEl = document.getElementById('login-captcha-input');
    const loginBtn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    
    if (!codeEl || !refreshBtn || !inputEl || !loginBtn || !usernameEl || !passwordEl) {
        console.error('登录页面元素未找到');
        return;
    }
    
    let currentCode = createCaptcha();
    codeEl.textContent = currentCode;
    
    // 刷新验证码
    refreshBtn.addEventListener('click', () => {
        currentCode = createCaptcha();
        codeEl.textContent = currentCode;
        inputEl.value = '';
        errorEl.textContent = '';
    });
    
    // 登录按钮点击事件
    loginBtn.addEventListener('click', async () => {
        errorEl.textContent = '';
        errorEl.style.color = ''; // 重置颜色
        
        // 获取表单数据
        const username = usernameEl.value.trim();
        const password = passwordEl.value.trim();
        const captcha = inputEl.value.trim();
        
        // 基本验证
        if (!username || !password) {
            errorEl.textContent = '用户名和密码不能为空';
            return;
        }
        
        // 验证码校验
        if (captcha !== currentCode) {
            errorEl.textContent = '验证码错误，请重试';
            // 刷新验证码
            currentCode = createCaptcha();
            codeEl.textContent = currentCode;
            inputEl.value = '';
            return;
        }
        
        // 禁用登录按钮，防止重复提交
        loginBtn.disabled = true;
        const originalText = loginBtn.textContent;
        loginBtn.textContent = '登录中...';
        
        try {
            // 使用FormData封装表单数据
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            // 发送POST请求到后端
            const response = await fetch('../backend/api/user/logincheck.php', {
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
                errorEl.textContent = errorMessage;
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
                // 刷新验证码
                currentCode = createCaptcha();
                codeEl.textContent = currentCode;
                inputEl.value = '';
                return;
            }
            
            // 检查响应内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('服务器返回了非JSON响应:', text.substring(0, 200));
                errorEl.textContent = '服务器响应格式错误，请检查后端服务';
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
                // 刷新验证码
                currentCode = createCaptcha();
                codeEl.textContent = currentCode;
                inputEl.value = '';
                return;
            }
            
            const result = await response.json();
            
            // 处理响应
            if (result.status === 'success') {
                // 登录成功，清除旧的本地进度缓存，防止多用户数据冲突
                localStorage.removeItem('ancient_buildings_progress');

                // 显示成功消息
                errorEl.style.color = '#4caf50';
                errorEl.textContent = `${result.message} - 用户: ${result.user_info.username}${result.user_info.is_admin ? ' (管理员)' : ' (普通用户)'}`;
                
                // 延迟跳转，让用户看到成功消息
                setTimeout(() => {
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        // 如果没有指定跳转地址，根据用户类型跳转
                        window.location.href = result.user_info.is_admin ? 'admin/index.html' : 'index.html';
                    }
                }, 1000);
            } else {
                // 登录失败，显示错误信息
                errorEl.textContent = result.message || '登录失败';
                loginBtn.disabled = false;
                loginBtn.textContent = originalText;
                // 刷新验证码
                currentCode = createCaptcha();
                codeEl.textContent = currentCode;
                inputEl.value = '';
            }
        } catch (error) {
            console.error('登录错误:', error);
            errorEl.textContent = '网络错误，请检查后端服务是否正常运行';
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
            // 刷新验证码
            currentCode = createCaptcha();
            codeEl.textContent = currentCode;
            inputEl.value = '';
        }
    });
}

