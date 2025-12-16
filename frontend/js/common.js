/**
 * 中国古代建筑成就网站 - 通用JavaScript功能
 */

// API基础路径
const API_BASE_URL = '/backend/api';

// 通用工具函数
const Utils = {
    // 获取URL参数
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    },

    // 显示消息提示
    showMessage(message, type = 'success') {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast ${type}`;
        messageEl.textContent = message;

        // 添加样式
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            backgroundColor: type === 'success' ? '#28a745' :
                            type === 'error' ? '#dc3545' :
                            type === 'warning' ? '#ffc107' : '#17a2b8',
            color: 'white',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            transform: 'translateX(100%)'
        });

        document.body.appendChild(messageEl);

        // 显示动画
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 10);

        // 自动消失
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// API请求封装
const API = {
    // 基础请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(API_BASE_URL + url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },

    // GET请求
    get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl);
    },

    // POST请求
    post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // PUT请求
    put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // DELETE请求
    delete(url) {
        return this.request(url, {
            method: 'DELETE',
        });
    },

    // 文件上传
    upload(url, formData) {
        return this.request(url, {
            method: 'POST',
            body: formData,
            headers: {}, // 让浏览器自动设置Content-Type为multipart/form-data
        });
    }
};

// 认证管理
const Auth = {
    // 检查用户是否登录
    isLoggedIn() {
        return localStorage.getItem('userInfo') !== null;
    },

    // 获取用户信息
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    // 设置用户信息
    setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        this.updateUserInterface();
    },

    // 清除用户信息
    clearUserInfo() {
        localStorage.removeItem('userInfo');
        this.updateUserInterface();
    },

    // 更新用户界面
    updateUserInterface() {
        const userInfo = this.getUserInfo();
        const usernameEl = document.getElementById('username');
        const userMenu = document.querySelector('.user-menu');

        if (usernameEl && userMenu) {
            if (userInfo) {
                usernameEl.textContent = userInfo.username || userInfo.real_name || '用户';
                userMenu.innerHTML = `
                    <a href="#" onclick="Auth.logout()">退出登录</a>
                `;
            } else {
                usernameEl.textContent = '游客';
                userMenu.innerHTML = `
                    <a href="login.html" class="login-btn">登录</a>
                    <a href="register.html" class="register-btn">注册</a>
                `;
            }
        }
    },

    // 退出登录
    logout() {
        API.post('/user/logout.php')
            .then(response => {
                this.clearUserInfo();
                Utils.showMessage('退出登录成功');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            })
            .catch(error => {
                console.error('退出登录失败:', error);
                // 即使API调用失败，也要清除本地存储
                this.clearUserInfo();
                window.location.href = 'index.html';
            });
    }
};

// 表单验证
const FormValidator = {
    // 验证规则
    rules: {
        required: (value) => value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        username: (value) => /^[a-zA-Z][a-zA-Z0-9_]{5,17}$/.test(value),
        password: (value) => value.length >= 6,
        phone: (value) => /^1[3-9]\d{9}$/.test(value),
        minLength: (min) => (value) => value.length >= min,
        maxLength: (max) => (value) => value.length <= max,
    },

    // 验证单个字段
    validateField(name, value, rules) {
        const errors = [];

        for (const rule of rules) {
            if (typeof rule === 'string' && this.rules[rule]) {
                if (!this.rules[rule](value)) {
                    errors.push(this.getErrorMessage(name, rule));
                }
            } else if (typeof rule === 'object' && rule.rule && rule.message) {
                if (!this.rules[rule.rule](value)) {
                    errors.push(rule.message);
                }
            }
        }

        return errors;
    },

    // 获取错误消息
    getErrorMessage(fieldName, rule) {
        const messages = {
            required: `${fieldName}不能为空`,
            email: '邮箱格式不正确',
            username: '用户名必须是6-18位字母、数字或下划线，且以字母开头',
            password: '密码长度不能少于6位',
            phone: '手机号格式不正确',
            minLength: `${fieldName}长度不足`,
            maxLength: `${fieldName}长度超出限制`,
        };

        return messages[rule] || `${fieldName}格式不正确`;
    },

    // 验证整个表单
    validateForm(formData, schema) {
        const errors = {};

        for (const [fieldName, rules] of Object.entries(schema)) {
            const fieldErrors = this.validateField(fieldName, formData[fieldName] || '', rules);
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户界面
    Auth.updateUserInterface();

    // 返回顶部按钮
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        // 监听滚动事件
        window.addEventListener('scroll', Utils.throttle(function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 100));

        // 点击返回顶部
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 搜索功能（通用）
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        // 搜索按钮点击
        searchBtn.addEventListener('click', performSearch);

        // 回车键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        function performSearch() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                // 保存搜索关键词到localStorage
                localStorage.setItem('searchKeyword', keyword);
                // 如果在首页，触发搜索；否则跳转到首页
                if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                    window.location.reload();
                } else {
                    window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;
                }
            } else {
                Utils.showMessage('请输入搜索关键词', 'warning');
            }
        }
    }

    // 恢复搜索关键词
    const savedKeyword = localStorage.getItem('searchKeyword');
    if (searchInput && savedKeyword) {
        searchInput.value = savedKeyword;
        localStorage.removeItem('searchKeyword');
    }
});

// 导出工具函数和对象
window.Utils = Utils;
window.API = API;
window.Auth = Auth;
window.FormValidator = FormValidator;