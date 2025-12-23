/**
 * 管理员用户管理界面
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员权限（从cookie读取）
    checkAdminAuth();
    
    // 加载用户列表
    loadUserList();
    
    // 绑定事件
    bindEvents();
});

/**
 * 检查管理员权限
 */
function checkAdminAuth() {
    // 读取cookie中的用户信息
    const cookies = document.cookie.split(';');
    let userSession = null;
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'user_session') {
            try {
                userSession = JSON.parse(decodeURIComponent(value));
            } catch (e) {
                console.error('解析cookie失败:', e);
            }
            break;
        }
    }
    
    if (!userSession || !userSession.is_admin) {
        alert('您没有管理员权限，即将跳转到登录页面');
        window.location.href = '../login.html';
        return;
    }
    
    // 显示管理员名称
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl && userSession.username) {
        adminNameEl.textContent = userSession.username;
    }
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 添加用户表单提交
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadUserList);
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * 加载用户列表
 */
async function loadUserList() {
    const userListDiv = document.getElementById('userList');
    if (!userListDiv) return;
    
    userListDiv.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await fetch('../../backend/api/admin/getUsers.php');
        const result = await response.json();
        
        if (result.status === 'success') {
            displayUserList(result.data);
        } else {
            userListDiv.innerHTML = `<div class="message error">${result.message || '加载失败'}</div>`;
        }
    } catch (error) {
        console.error('加载用户列表错误:', error);
        userListDiv.innerHTML = '<div class="message error">网络错误，请检查后端服务</div>';
    }
}

/**
 * 显示用户列表
 */
function displayUserList(users) {
    const userListDiv = document.getElementById('userList');
    if (!userListDiv) return;
    
    if (!users || users.length === 0) {
        userListDiv.innerHTML = '<div class="empty-state">暂无用户数据</div>';
        return;
    }
    
    // 创建表格
    let tableHTML = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>序号</th>
                    <th>用户名</th>
                    <th>密码</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach((user, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.password)}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser('${escapeHtml(user.username)}')">删除</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
        <div style="margin-top: 15px; color: #666;">共 ${users.length} 个用户</div>
    `;
    
    userListDiv.innerHTML = tableHTML;
}

/**
 * 处理添加用户
 */
async function handleAddUser(e) {
    e.preventDefault();
    
    const usernameEl = document.getElementById('newUsername');
    const passwordEl = document.getElementById('newPassword');
    const messageDiv = document.getElementById('addMessage');
    
    if (!usernameEl || !passwordEl || !messageDiv) return;
    
    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();
    
    // 清除消息
    messageDiv.className = 'message';
    messageDiv.style.display = 'none';
    
    // 基本验证
    if (!username || !password) {
        showMessage('addMessage', '用户名和密码不能为空', 'error');
        return;
    }
    
    // 用户名格式验证
    const usernamePattern = /^[a-zA-Z0-9]{4,15}$/;
    if (!usernamePattern.test(username)) {
        showMessage('addMessage', '用户名只能包含字母和数字，长度为4-15位', 'error');
        return;
    }
    
    // 密码格式验证：6-16位，可以使用字母、数字和特殊符号
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/;
    if (!passwordPattern.test(password)) {
        showMessage('addMessage', '密码必须为6-16位，可以使用字母、数字和特殊符号', 'error');
        return;
    }
    
    // 使用FormData封装数据
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        const response = await fetch('../../backend/api/admin/addUser.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showMessage('addMessage', result.message, 'success');
            // 清空表单
            const addUserForm = document.getElementById('addUserForm');
            if (addUserForm) {
                addUserForm.reset();
            }
            // 刷新用户列表
            setTimeout(() => loadUserList(), 500);
        } else {
            showMessage('addMessage', result.message || '添加失败', 'error');
        }
    } catch (error) {
        console.error('添加用户错误:', error);
        showMessage('addMessage', '网络错误，请检查后端服务', 'error');
    }
}

/**
 * 删除用户（全局函数，供按钮调用）
 */
async function deleteUser(username) {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复！`)) {
        return;
    }
    
    // 使用FormData封装数据
    const formData = new FormData();
    formData.append('username', username);
    
    try {
        const response = await fetch('../../backend/api/admin/deleteUser.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert(result.message);
            // 刷新用户列表
            loadUserList();
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除用户错误:', error);
        alert('网络错误，请检查后端服务');
    }
}

/**
 * 处理退出登录
 */
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除cookie
        document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // 跳转到登录页
        window.location.href = '../login.html';
    }
}

/**
 * 显示消息
 */
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

/**
 * HTML转义，防止XSS攻击
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

