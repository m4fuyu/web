/**
 * 管理员用户管理界面
 */

// 全局变量：当前搜索关键词和页码
let currentSearch = '';
let currentPage = 1;
let currentCommentPage = 1;
let currentCommentSearch = '';

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员权限（必须是管理员账号登录才能使用），带重试机制
    checkAdminAuthWithRetry();
    
    // 加载用户列表
    loadUserList();
    
    // 绑定事件
    bindEvents();
    bindNavEvents();
});

/**
 * 读取Cookie的工具函数
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim(); // 使用 trim 去除空格
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

/**
 * 检查管理员权限（带重试机制，10秒后仍未读取到才提示错误）
 */
function checkAdminAuthWithRetry() {
    let retryCount = 0;
    const maxRetries = 20; // 总共尝试20次（10秒 = 20 * 500ms）
    const retryInterval = 500; // 每次间隔500毫秒
    
    function attemptAuth() {
        const userSession = checkAdminAuth();
        
        if (userSession) {
            // 验证成功，显示管理员名称
            const adminNameEl = document.getElementById('adminName');
            if (adminNameEl && userSession.username) {
                adminNameEl.textContent = userSession.username;
            }
            return; // 成功，停止重试
        }
        
        // 未成功，继续重试
        retryCount++;
        if (retryCount < maxRetries) {
            setTimeout(attemptAuth, retryInterval);
        } else {
            // 10秒后仍未读取到cookie，提示错误
            alert('未登录或登录信息未生效，请先登录管理员账号');
            window.location.href = '../login.html';
        }
    }
    
    // 开始第一次尝试
    attemptAuth();
}

/**
 * 检查管理员权限（单次尝试）
 * 返回: 如果验证通过返回用户信息对象，否则返回null
 */
function checkAdminAuth() {
    // 读取cookie中的用户信息
    let cookieValue = getCookie('user_session');
    
    // 如果第一次读取失败，尝试备用方法
    if (!cookieValue) {
        const allCookies = document.cookie;
        const match = allCookies.match(/(?:^|;\s*)user_session=([^;]*)/);
        if (match && match[1]) {
            cookieValue = match[1];
        }
    }
    
    // 如果还是没有cookie值，返回null（让重试机制处理）
    if (!cookieValue) {
        return null;
    }
    
    let userSession = null;
    
    try {
        // 尝试直接解析
        userSession = JSON.parse(cookieValue);
    } catch (e) {
        // 如果失败，尝试URL解码后再解析
        try {
            const decodedValue = decodeURIComponent(cookieValue);
            userSession = JSON.parse(decodedValue);
        } catch (e2) {
            // 解析失败，返回null（让重试机制处理）
            return null;
        }
    }
    
    // 如果没有用户信息，返回null
    if (!userSession || !userSession.username) {
        return null;
    }
    
    // 检查 is_admin 字段（支持布尔值和字符串），必须是管理员
    const isAdmin = userSession.is_admin === true || userSession.is_admin === 'true' || userSession.is_admin === 1 || userSession.is_admin === '1';
    
    if (!isAdmin) {
        // 不是管理员，立即返回错误（不重试）
        alert('您没有管理员权限，只有管理员账号才能访问此页面');
        window.location.href = '../login.html';
        return null;
    }
    
    // 验证成功，返回用户信息
    return userSession;
}

/**
 * 加载用户列表（支持搜索和分页）
 */
async function loadUserList(page = 1, search = '') {
    const userListEl = document.getElementById('userList');
    
    // 更新全局变量
    currentPage = page;
    currentSearch = search;
    
    // 构建请求URL
    let url = '../../backend/api/admin/getUsers.php?';
    const params = new URLSearchParams();
    if (search) {
        params.append('search', search);
    }
    params.append('page', page);
    url += params.toString();
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // 兼容多种返回格式：
            // 1. { data: { users: [...] } } - 新标准格式
            // 2. { data: { data: [...] } } - 旧格式
            // 3. { data: [...] } - 简单数组格式
            const users = result.data.users || result.data.data || (Array.isArray(result.data) ? result.data : []);
            displayUserList(users, result.data);
        } else {
            userListEl.innerHTML = `<div class="error">加载失败: ${result.message || '未知错误'}</div>`;
            document.getElementById('pagination').style.display = 'none';
        }
    } catch (error) {
        console.error('加载用户列表失败:', error);
        userListEl.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        document.getElementById('pagination').style.display = 'none';
    }
}

/**
 * 显示用户列表（支持分页信息）
 */
function displayUserList(users, paginationInfo = {}) {
    const userListEl = document.getElementById('userList');
    const paginationEl = document.getElementById('pagination');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (!users || users.length === 0) {
        userListEl.innerHTML = '<div class="empty">暂无用户</div>';
        paginationEl.style.display = 'none';
        return;
    }
    
    // 如果有搜索关键词，显示清除搜索按钮
    if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearch ? 'inline-block' : 'none';
    }
    
    let html = '<table class="user-table"><thead><tr><th>用户名</th><th>建筑进度</th><th>操作</th></tr></thead><tbody>';
    
    users.forEach(user => {
        // 显示进度信息
        const progress = user.progress || {};
        const progressText = getProgressText(progress);
        
        html += `
            <tr>
                <td>${escapeHtml(user.username)}</td>
                <td class="progress-cell">${progressText}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editUser('${escapeHtml(user.username)}')">修改</button>
                    <button class="btn btn-success btn-small" onclick="editUserProgress('${escapeHtml(user.username)}')">修改进度</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${escapeHtml(user.username)}')">删除</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    userListEl.innerHTML = html;
    
    // 显示分页信息
    const total = paginationInfo.total || users.length;
    const totalPages = paginationInfo.totalPages || 1;
    const currentPageNum = paginationInfo.page || 1;
    
    if (totalPages > 1) {
        paginationEl.style.display = 'flex';
        const pageInfoEl = document.getElementById('pageInfo');
        pageInfoEl.textContent = `第 ${currentPageNum} 页 / 共 ${totalPages} 页（共 ${total} 个用户）`;
        
        // 更新翻页按钮状态
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        prevBtn.disabled = currentPageNum <= 1;
        nextBtn.disabled = currentPageNum >= totalPages;
    } else {
        paginationEl.style.display = 'none';
    }
}

/**
 * 修改用户
 */
async function editUser(username) {
    // 创建修改对话框
    const newUsername = prompt('请输入新用户名（留空则不修改）:', '');
    if (newUsername === null) return; // 用户点击了取消
    
    // 验证新用户名（如果提供了）
    if (newUsername.trim() !== '') {
        const usernamePattern = /^[a-zA-Z0-9]{4,15}$/;
        if (!usernamePattern.test(newUsername.trim())) {
            alert('用户名只能包含字母和数字，长度为4-15位');
            return;
        }
    }
    
    const newPassword = prompt('请输入新密码（留空则不修改）:', '');
    if (newPassword === null) return; // 用户点击了取消
    
    // 验证新密码（如果提供了）
    if (newPassword.trim() !== '') {
        const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/;
        if (!passwordPattern.test(newPassword.trim())) {
            alert('密码必须为6-16位，可以使用字母、数字和特殊符号');
            return;
        }
    }
    
    // 如果都为空，提示用户
    if (newUsername.trim() === '' && newPassword.trim() === '') {
        alert('请至少输入新用户名或新密码');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('old_username', username);
        if (newUsername.trim() !== '') {
            formData.append('new_username', newUsername.trim());
        }
        if (newPassword.trim() !== '') {
            formData.append('new_password', newPassword.trim());
        }
        
        const response = await fetch('../../backend/api/admin/updateUser.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('修改成功');
            loadUserList(currentPage, currentSearch); // 重新加载列表，保持当前搜索和页码
        } else {
            alert(`修改失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('修改用户失败:', error);
        alert(`修改失败: ${error.message}`);
    }
}

/**
 * 删除用户
 */
async function deleteUser(username) {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可撤销。`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('username', username);
        
        const response = await fetch('../../backend/api/admin/deleteUser.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('删除成功');
            // 如果当前页没有数据了，回到上一页
            loadUserList(currentPage, currentSearch); // 重新加载列表，保持当前搜索和页码
        } else {
            alert(`删除失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        alert(`删除失败: ${error.message}`);
    }
}

/**
 * 获取进度文本显示
 */
function getProgressText(progress) {
    const buildingNames = {
        'ForbiddenCity': '紫禁城',
        'GreatWall': '长城',
        'TempleOfHeaven': '天坛',
        'YellowCraneTower': '黄鹤楼',
        'PotalaPalace': '布达拉宫'
    };
    
    const unlocked = [];
    const locked = [];
    
    Object.keys(buildingNames).forEach(key => {
        if (progress[key] === true) {
            unlocked.push(buildingNames[key]);
        } else {
            locked.push(buildingNames[key]);
        }
    });
    
    let text = '';
    if (unlocked.length > 0) {
        text += '<span style="color: #059669;">✓ ' + unlocked.join('、') + '</span>';
    }
    if (locked.length > 0) {
        if (text) text += '<br>';
        text += '<span style="color: #9ca3af;">✗ ' + locked.join('、') + '</span>';
    }
    
    return text || '无进度信息';
}

/**
 * 修改用户进度
 */
async function editUserProgress(username) {
    // 建筑名称映射
    const buildings = [
        { key: 'ForbiddenCity', name: '紫禁城' },
        { key: 'GreatWall', name: '长城' },
        { key: 'TempleOfHeaven', name: '天坛' },
        { key: 'YellowCraneTower', name: '黄鹤楼' },
        { key: 'PotalaPalace', name: '布达拉宫' }
    ];
    
    // 先获取当前用户信息
    try {
        const response = await fetch(`../../backend/api/admin/getUsers.php?search=${encodeURIComponent(username)}&page=1`);
        const result = await response.json();
        
        let currentProgress = {};
        if (result.status === 'success' && result.data && result.data.length > 0) {
            const user = result.data.find(u => u.username === username);
            if (user && user.progress) {
                currentProgress = user.progress;
            }
        }
        
        // 构建选择对话框
        let message = `请选择要修改的建筑进度（当前状态）：\n\n`;
        buildings.forEach(building => {
            const isUnlocked = currentProgress[building.key] === true;
            message += `${building.name}: ${isUnlocked ? '✓ 已解锁' : '✗ 未解锁'}\n`;
        });
        message += `\n请输入要修改的建筑（用逗号分隔），或输入"all"修改全部：`;
        
        const buildingInput = prompt(message, 'all');
        if (buildingInput === null) return; // 用户取消
        
        const selectedBuildings = buildingInput.trim().toLowerCase();
        if (!selectedBuildings) {
            alert('请至少选择一个建筑');
            return;
        }
        
        // 询问解锁状态
        const unlockInput = prompt('是否解锁？(输入 "y" 或 "yes" 表示解锁，其他表示锁定)', 'y');
        if (unlockInput === null) return; // 用户取消
        
        const shouldUnlock = unlockInput.trim().toLowerCase() === 'y' || unlockInput.trim().toLowerCase() === 'yes';
        
        // 构建表单数据
        const formData = new FormData();
        formData.append('username', username);
        
        if (selectedBuildings === 'all') {
            // 修改全部
            buildings.forEach(building => {
                formData.append(building.key, shouldUnlock ? 'true' : 'false');
            });
        } else {
            // 修改指定的建筑
            const selected = selectedBuildings.split(',').map(s => s.trim());
            const buildingMap = {};
            buildings.forEach(building => {
                buildingMap[building.name.toLowerCase()] = building.key;
            });
            
            let hasValidBuilding = false;
            selected.forEach(buildingName => {
                const key = buildingMap[buildingName.toLowerCase()];
                if (key) {
                    formData.append(key, shouldUnlock ? 'true' : 'false');
                    hasValidBuilding = true;
                }
            });
            
            if (!hasValidBuilding) {
                alert('未找到有效的建筑名称，请使用中文名称，如：紫禁城、长城、天坛、黄鹤楼、布达拉宫');
                return;
            }
        }
        
        // 发送更新请求
        const updateResponse = await fetch('../../backend/api/admin/updateUserProgress.php', {
            method: 'POST',
            body: formData
        });
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.status === 'success') {
            alert('进度更新成功');
            loadUserList(currentPage, currentSearch); // 重新加载列表
        } else {
            alert(`进度更新失败: ${updateResult.message || '未知错误'}`);
        }
        
    } catch (error) {
        console.error('修改用户进度失败:', error);
        alert(`修改失败: ${error.message}`);
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 添加用户表单提交
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const messageEl = document.getElementById('addMessage');
            
            // 验证用户名：4-15位字母和数字
            const usernamePattern = /^[a-zA-Z0-9]{4,15}$/;
            if (!usernamePattern.test(username)) {
                messageEl.style.color = '#f44336';
                messageEl.textContent = '用户名必须为4-15位字母和数字';
                return;
            }
            
            // 验证密码：6-16位,可以使用字母、数字和特殊符号
            const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]{6,16}$/;
            if (!passwordPattern.test(password)) {
                messageEl.style.color = '#f44336';
                messageEl.textContent = '密码必须为6-16位,可以使用字母、数字和特殊符号';
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
                
                const response = await fetch('../../backend/api/admin/addUser.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    messageEl.style.color = '#4caf50';
                    messageEl.textContent = result.message || '添加成功';
                    
                    // 清空表单
                    addUserForm.reset();
                    
                    // 重新加载用户列表，保持当前搜索和页码
                    loadUserList(currentPage, currentSearch);
                    
                    // 3秒后清除消息
                    setTimeout(() => {
                        messageEl.textContent = '';
                    }, 3000);
                } else {
                    messageEl.style.color = '#f44336';
                    messageEl.textContent = result.message || '添加失败';
                }
            } catch (error) {
                console.error('添加用户失败:', error);
                messageEl.style.color = '#f44336';
                messageEl.textContent = `添加失败: ${error.message}`;
            }
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadUserList(currentPage, currentSearch);
        });
    }
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // 搜索按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            loadUserList(1, searchTerm); // 搜索时重置到第一页
        });
    }
    
    // 搜索框回车事件
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                loadUserList(1, searchTerm); // 搜索时重置到第一页
            }
        });
    }
    
    // 清除搜索按钮
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            loadUserList(1, ''); // 清除搜索，回到第一页
        });
    }
    
    // 上一页按钮
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                loadUserList(currentPage - 1, currentSearch);
            }
        });
    }
    
    // 下一页按钮
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            loadUserList(currentPage + 1, currentSearch);
        });
    }
    
    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('确定要退出登录吗？')) {
                // 删除cookie
                document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/code/;';
                // 跳转到登录页
                window.location.href = '../login.html';
            }
        });
    }
}

/**
 * HTML转义函数，防止XSS攻击
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


/**
 * 绑定导航事件
 */
function bindNavEvents() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 切换按钮状态
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 切换视图
            const targetId = btn.getAttribute('data-target');
            views.forEach(view => {
                if (view.id === targetId) {
                    view.style.display = 'block';
                } else {
                    view.style.display = 'none';
                }
            });

            // 如果切换到评论管理，加载评论列表
            if (targetId === 'comment-management') {
                loadCommentList();
            }
        });
    });

    // 评论刷新按钮
    const refreshCommentsBtn = document.getElementById('refreshCommentsBtn');
    if (refreshCommentsBtn) {
        refreshCommentsBtn.addEventListener('click', () => loadCommentList(currentCommentPage, currentCommentSearch));
    }

    // 评论分页按钮
    const prevBtn = document.getElementById('prevCommentPageBtn');
    const nextBtn = document.getElementById('nextCommentPageBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => loadCommentList(currentCommentPage - 1, currentCommentSearch));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => loadCommentList(currentCommentPage + 1, currentCommentSearch));
    }

    // 评论搜索功能
    const searchCommentInput = document.getElementById('searchCommentInput');
    const searchCommentBtn = document.getElementById('searchCommentBtn');
    const clearCommentSearchBtn = document.getElementById('clearCommentSearchBtn');

    if (searchCommentBtn) {
        searchCommentBtn.addEventListener('click', () => {
            const searchTerm = searchCommentInput.value.trim();
            loadCommentList(1, searchTerm);
        });
    }

    if (searchCommentInput) {
        searchCommentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchCommentInput.value.trim();
                loadCommentList(1, searchTerm);
            }
        });
    }

    if (clearCommentSearchBtn) {
        clearCommentSearchBtn.addEventListener('click', () => {
            searchCommentInput.value = '';
            loadCommentList(1, '');
        });
    }

    // 添加评论表单
    const addCommentForm = document.getElementById('addCommentForm');
    if (addCommentForm) {
        addCommentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const levelId = document.getElementById('commentLevel').value;
            const content = document.getElementById('commentContent').value.trim();
            const messageEl = document.getElementById('addCommentMessage');

            if (!content) {
                messageEl.style.color = '#f44336';
                messageEl.textContent = '评论内容不能为空';
                return;
            }

            try {
                const formData = new FormData();
                formData.append('level_id', levelId);
                formData.append('content', content);

                const response = await fetch('../../backend/api/comment/addComment.php', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();

                if (result.status === 'success') {
                    messageEl.style.color = '#4caf50';
                    messageEl.textContent = result.message || '评论发表成功';
                    addCommentForm.reset();
                    loadCommentList(1, currentCommentSearch); // Reload list
                    setTimeout(() => { messageEl.textContent = ''; }, 3000);
                } else {
                    messageEl.style.color = '#f44336';
                    messageEl.textContent = result.message || '发表失败';
                }
            } catch (error) {
                console.error('发表评论失败:', error);
                messageEl.style.color = '#f44336';
                messageEl.textContent = `发表失败: ${error.message}`;
            }
        });
    }
}

/**
 * 加载评论列表
 */
async function loadCommentList(page = 1, search = '') {
    const commentListEl = document.getElementById('commentList');
    const clearSearchBtn = document.getElementById('clearCommentSearchBtn');
    
    currentCommentPage = page;
    currentCommentSearch = search;

    // 显示/隐藏清除按钮
    if (clearSearchBtn) {
        clearSearchBtn.style.display = search ? 'inline-block' : 'none';
    }

    // 构建请求URL
    let url = `../../backend/api/comment/getComments.php?page=${page}&pageSize=20`;
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }

    try {
        commentListEl.innerHTML = '<div class="loading">加载中...</div>';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // 兼容多种返回格式
            const comments = result.data.comments || result.data.data || (Array.isArray(result.data) ? result.data : []);
            displayCommentList(comments, result.data);
        } else {
            commentListEl.innerHTML = `<div class="error">加载失败: ${result.message || '未知错误'}</div>`;
            document.getElementById('commentPagination').style.display = 'none';
        }
    } catch (error) {
        console.error('加载评论列表失败:', error);
        commentListEl.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        document.getElementById('commentPagination').style.display = 'none';
    }
}

/**
 * 显示评论列表
 */
function displayCommentList(comments, paginationInfo = {}) {
    const commentListEl = document.getElementById('commentList');
    const paginationEl = document.getElementById('commentPagination');
    
    if (!comments || comments.length === 0) {
        commentListEl.innerHTML = '<div class="empty">暂无评论</div>';
        paginationEl.style.display = 'none';
        return;
    }
    
    let html = '<table class="user-table"><thead><tr><th>ID</th><th>用户</th><th>关卡ID</th><th>内容</th><th>时间</th></tr></thead><tbody>';
    
    comments.forEach(comment => {
        html += `
            <tr>
                <td>${comment.id}</td>
                <td>${escapeHtml(comment.username)}</td>
                <td>${escapeHtml(comment.level_id)}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(comment.content)}">${escapeHtml(comment.content)}</td>
                <td>${comment.send_time}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    commentListEl.innerHTML = html;
    
    // 更新分页控件
    if (paginationInfo.totalPages > 1) {
        paginationEl.style.display = 'flex';
        const prevBtn = document.getElementById('prevCommentPageBtn');
        const nextBtn = document.getElementById('nextCommentPageBtn');
        const pageInfo = document.getElementById('commentPageInfo');
        
        prevBtn.disabled = currentCommentPage <= 1;
        nextBtn.disabled = currentCommentPage >= paginationInfo.totalPages;
        pageInfo.textContent = `第 ${currentCommentPage} / ${paginationInfo.totalPages} 页 (共 ${paginationInfo.total} 条)`;
    } else {
        paginationEl.style.display = 'none';
    }
}
