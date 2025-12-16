/**
 * 中国古代建筑成就网站 - 登录页面JavaScript功能
 */

class LoginPage {
    constructor() {
        this.form = null;
        this.init();
    }

    init() {
        this.form = document.getElementById('loginForm');
        this.bindEvents();
        this.checkAutoLogin();
    }

    // 绑定事件
    bindEvents() {
        if (!this.form) return;

        // 表单提交事件
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 输入框验证事件
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (usernameInput) {
            usernameInput.addEventListener('blur', () => {
                this.validateField('username', usernameInput.value);
            });

            usernameInput.addEventListener('input', () => {
                this.clearFieldError('username');
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => {
                this.validateField('password', passwordInput.value);
            });

            passwordInput.addEventListener('input', () => {
                this.clearFieldError('password');
            });
        }

        // 记住我功能
        const rememberCheckbox = document.getElementById('remember');
        if (rememberCheckbox) {
            // 从localStorage恢复记住我状态
            const remembered = localStorage.getItem('rememberMe') === 'true';
            rememberCheckbox.checked = remembered;

            if (remembered) {
                const savedUsername = localStorage.getItem('savedUsername');
                if (savedUsername && usernameInput) {
                    usernameInput.value = savedUsername;
                }
            }
        }

        // 忘记密码链接
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    // 检查自动登录
    checkAutoLogin() {
        const remembered = localStorage.getItem('rememberMe') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');
        const userInfo = Auth.getUserInfo();

        if (remembered && savedUsername && userInfo) {
            // 如果已经登录，直接跳转到首页
            Utils.showMessage('自动登录成功');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    // 处理登录
    async handleLogin() {
        if (!this.form) return;

        // 获取表单数据
        const formData = new FormData(this.form);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        // 验证表单
        if (!this.validateForm(loginData)) {
            return;
        }

        // 显示加载状态
        this.setLoading(true);

        try {
            const response = await API.post('/user/login.php', loginData);

            if (response.success) {
                // 处理记住我
                const rememberCheckbox = document.getElementById('remember');
                if (rememberCheckbox && rememberCheckbox.checked) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('savedUsername', loginData.username);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('savedUsername');
                }

                // 保存用户信息
                Auth.setUserInfo(response.data);

                Utils.showMessage('登录成功！');

                // 跳转到首页或之前的页面
                const returnUrl = Utils.getUrlParam('return') || 'index.html';
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 1000);
            } else {
                throw new Error(response.message || '登录失败');
            }
        } catch (error) {
            console.error('登录失败:', error);
            Utils.showMessage(error.message || '登录失败，请重试', 'error');

            // 清空密码字段
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        } finally {
            this.setLoading(false);
        }
    }

    // 验证表单
    validateForm(data) {
        let isValid = true;

        // 验证用户名
        if (!this.validateField('username', data.username)) {
            isValid = false;
        }

        // 验证密码
        if (!this.validateField('password', data.password)) {
            isValid = false;
        }

        return isValid;
    }

    // 验证单个字段
    validateField(fieldName, value) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');

        if (!field || !errorElement) return false;

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'username':
                if (!value || value.trim() === '') {
                    errorMessage = '请输入用户名';
                    isValid = false;
                } else if (!/^[a-zA-Z][a-zA-Z0-9_]{5,17}$/.test(value)) {
                    errorMessage = '用户名格式不正确';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value || value.trim() === '') {
                    errorMessage = '请输入密码';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = '密码长度不能少于6位';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(fieldName, errorMessage);
        } else {
            this.clearFieldError(fieldName);
        }

        return isValid;
    }

    // 显示字段错误
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const formGroup = field.closest('.form-group');

        if (formGroup) {
            formGroup.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // 清除字段错误
    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const formGroup = field.closest('.form-group');

        if (formGroup) {
            formGroup.classList.remove('error');
        }

        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // 设置加载状态
    setLoading(loading) {
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');

        if (loading) {
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    // 处理忘记密码
    handleForgotPassword() {
        // 这里可以实现忘记密码功能
        // 暂时显示提示信息
        Utils.showMessage('请联系管理员重置密码', 'info');
    }

    // 检查登录状态
    checkLoginStatus() {
        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            Utils.showMessage('您已经登录，正在跳转到首页...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经登录
    const loginPage = new LoginPage();
    loginPage.checkLoginStatus();

    // 添加输入框回车提交
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const form = document.getElementById('loginForm');
            if (form && document.activeElement.tagName === 'INPUT') {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
});