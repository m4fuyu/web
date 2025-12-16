/**
 * 中国古代建筑成就网站 - 注册页面JavaScript功能
 */

class RegisterPage {
    constructor() {
        this.form = null;
        this.passwordStrength = '';
        this.init();
    }

    init() {
        this.form = document.getElementById('registerForm');
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        if (!this.form) return;

        // 表单提交事件
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // 输入框验证事件
        this.bindFieldValidation();

        // 密码强度检测
        this.bindPasswordStrength();

        // 确认密码验证
        this.bindPasswordConfirm();

        // 用户协议和隐私政策链接
        this.bindTermsLinks();
    }

    // 绑定字段验证
    bindFieldValidation() {
        const fields = ['username', 'password', 'confirmPassword', 'realName', 'email'];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                // 失焦验证
                field.addEventListener('blur', () => {
                    this.validateField(fieldName, field.value);
                });

                // 输入时清除错误
                field.addEventListener('input', () => {
                    this.clearFieldError(fieldName);
                });

                // 特殊字段处理
                if (fieldName === 'username') {
                    field.addEventListener('input', Utils.debounce(() => {
                        this.checkUsernameAvailability(field.value);
                    }, 500));
                }

                if (fieldName === 'email') {
                    field.addEventListener('input', Utils.debounce(() => {
                        if (field.value && this.validateEmail(field.value)) {
                            this.checkEmailAvailability(field.value);
                        }
                    }, 500));
                }
            }
        });
    }

    // 绑定密码强度检测
    bindPasswordStrength() {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', () => {
                const password = passwordField.value;
                this.updatePasswordStrength(password);
            });
        }
    }

    // 绑定确认密码验证
    bindPasswordConfirm() {
        const passwordField = document.getElementById('password');
        const confirmField = document.getElementById('confirmPassword');

        if (passwordField && confirmField) {
            confirmField.addEventListener('input', () => {
                if (confirmField.value) {
                    this.validatePasswordMatch();
                }
            });

            passwordField.addEventListener('input', () => {
                if (confirmField.value) {
                    this.validatePasswordMatch();
                }
            });
        }
    }

    // 绑定用户协议链接
    bindTermsLinks() {
        const termsLink = document.querySelector('.terms-link');
        const privacyLink = document.querySelector('.privacy-link');

        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTermsModal();
            });
        }

        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacyModal();
            });
        }
    }

    // 处理注册
    async handleRegister() {
        if (!this.form) return;

        // 获取表单数据
        const formData = new FormData(this.form);
        const registerData = {
            username: formData.get('username'),
            password: formData.get('password'),
            realName: formData.get('realName'),
            gender: formData.get('gender'),
            email: formData.get('email')
        };

        // 验证表单
        const validationResult = this.validateRegisterForm(registerData);
        if (!validationResult.isValid) {
            this.showFormErrors(validationResult.errors);
            return;
        }

        // 检查是否同意协议
        const agreeCheckbox = document.getElementById('agree');
        if (!agreeCheckbox || !agreeCheckbox.checked) {
            Utils.showMessage('请阅读并同意用户协议和隐私政策', 'error');
            return;
        }

        // 显示加载状态
        this.setLoading(true);

        try {
            const response = await API.post('/user/register.php', registerData);

            if (response.success) {
                Utils.showMessage('注册成功！正在为您登录...');

                // 保存用户信息
                Auth.setUserInfo(response.data);

                // 延迟跳转到首页
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                throw new Error(response.message || '注册失败');
            }
        } catch (error) {
            console.error('注册失败:', error);
            Utils.showMessage(error.message || '注册失败，请重试', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // 验证注册表单
    validateRegisterForm(data) {
        const errors = {};
        let isValid = true;

        // 验证用户名
        if (!data.username || data.username.trim() === '') {
            errors.username = '请输入用户名';
            isValid = false;
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]{5,17}$/.test(data.username)) {
            errors.username = '用户名格式不正确';
            isValid = false;
        }

        // 验证密码
        if (!data.password || data.password.trim() === '') {
            errors.password = '请输入密码';
            isValid = false;
        } else if (data.password.length < 6) {
            errors.password = '密码长度不能少于6位';
            isValid = false;
        } else if (this.passwordStrength === 'weak') {
            errors.password = '密码强度太弱，请使用更复杂的密码';
            isValid = false;
        }

        // 验证确认密码
        if (!data.confirmPassword || data.confirmPassword.trim() === '') {
            errors.confirmPassword = '请确认密码';
            isValid = false;
        } else if (data.password !== data.confirmPassword) {
            errors.confirmPassword = '两次输入的密码不一致';
            isValid = false;
        }

        // 验证真实姓名（可选）
        if (data.realName && data.realName.trim() !== '') {
            if (data.realName.length < 2 || data.realName.length > 20) {
                errors.realName = '真实姓名长度应在2-20个字符之间';
                isValid = false;
            }
        }

        // 验证邮箱（可选）
        if (data.email && data.email.trim() !== '') {
            if (!this.validateEmail(data.email)) {
                errors.email = '邮箱格式不正确';
                isValid = false;
            }
        }

        return { isValid, errors };
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
                    errorMessage = '用户名必须是6-18位字母、数字或下划线，且以字母开头';
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

            case 'confirmPassword':
                if (!value || value.trim() === '') {
                    errorMessage = '请确认密码';
                    isValid = false;
                }
                break;

            case 'realName':
                if (value && (value.length < 2 || value.length > 20)) {
                    errorMessage = '真实姓名长度应在2-20个字符之间';
                    isValid = false;
                }
                break;

            case 'email':
                if (value && !this.validateEmail(value)) {
                    errorMessage = '邮箱格式不正确';
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

    // 验证邮箱格式
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // 检查用户名可用性
    async checkUsernameAvailability(username) {
        if (!username || username.length < 6) return;

        try {
            // 这里应该调用检查用户名可用性的API
            // const response = await API.get('/user/check-username.php', { username });
            // if (!response.available) {
            //     this.showFieldError('username', '用户名已被使用');
            // }

            // 暂时跳过API调用
        } catch (error) {
            console.error('检查用户名可用性失败:', error);
        }
    }

    // 检查邮箱可用性
    async checkEmailAvailability(email) {
        if (!email) return;

        try {
            // 这里应该调用检查邮箱可用性的API
            // const response = await API.get('/user/check-email.php', { email });
            // if (!response.available) {
            //     this.showFieldError('email', '邮箱已被注册');
            // }

            // 暂时跳过API调用
        } catch (error) {
            console.error('检查邮箱可用性失败:', error);
        }
    }

    // 更新密码强度
    updatePasswordStrength(password) {
        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2) {
            this.passwordStrength = 'weak';
            feedback = '弱';
        } else if (strength <= 4) {
            this.passwordStrength = 'medium';
            feedback = '中';
        } else {
            this.passwordStrength = 'strong';
            feedback = '强';
        }

        // 更新UI显示
        this.updatePasswordStrengthUI(strength, feedback);
    }

    // 更新密码强度UI
    updatePasswordStrengthUI(strength, feedback) {
        let strengthElement = document.getElementById('passwordStrength');
        let strengthTextElement = document.getElementById('passwordStrengthText');

        if (!strengthElement) {
            // 创建密码强度显示元素
            const passwordGroup = document.getElementById('password').closest('.form-group');
            strengthElement = document.createElement('div');
            strengthElement.id = 'passwordStrength';
            strengthElement.className = 'password-strength';
            passwordGroup.appendChild(strengthElement);

            strengthTextElement = document.createElement('div');
            strengthTextElement.id = 'passwordStrengthText';
            strengthTextElement.className = 'password-strength-text';
            passwordGroup.appendChild(strengthTextElement);
        }

        // 更新强度条
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';
        strengthBar.classList.add(this.passwordStrength);
        strengthElement.innerHTML = '';
        strengthElement.appendChild(strengthBar);

        // 更新强度文字
        const colors = {
            weak: '#dc3545',
            medium: '#ffc107',
            strong: '#28a745'
        };

        strengthTextElement.textContent = `密码强度：${feedback}`;
        strengthTextElement.style.color = colors[this.passwordStrength];
    }

    // 验证密码匹配
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirmPassword', '两次输入的密码不一致');
            return false;
        } else if (confirmPassword && password === confirmPassword) {
            this.clearFieldError('confirmPassword');
            return true;
        }

        return false;
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
            errorElement.style.display = 'block';
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
            errorElement.style.display = 'none';
        }
    }

    // 显示表单错误
    showFormErrors(errors) {
        Object.keys(errors).forEach(fieldName => {
            this.showFieldError(fieldName, errors[fieldName]);
        });

        // 滚动到第一个错误
        const firstErrorField = document.querySelector('.form-group.error');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // 设置加载状态
    setLoading(loading) {
        const registerBtn = document.getElementById('registerBtn');
        const btnText = registerBtn.querySelector('.btn-text');
        const btnLoading = registerBtn.querySelector('.btn-loading');

        if (loading) {
            registerBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            this.form.classList.add('submitting');
        } else {
            registerBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            this.form.classList.remove('submitting');
        }
    }

    // 显示用户协议模态框
    showTermsModal() {
        // 这里可以显示用户协议的模态框
        Utils.showMessage('用户协议功能正在开发中', 'info');
    }

    // 显示隐私政策模态框
    showPrivacyModal() {
        // 这里可以显示隐私政策的模态框
        Utils.showMessage('隐私政策功能正在开发中', 'info');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.registerPage = new RegisterPage();
});