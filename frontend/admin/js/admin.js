/**
 * 管理后台 (jQuery版)
 */
let currentPage = 1, currentSearch = '', commentPage = 1, commentSearch = '';

const BUILDINGS = [
    { key: 'ForbiddenCity', name: '紫禁城' }, { key: 'GreatWall', name: '长城' },
    { key: 'TempleOfHeaven', name: '天坛' }, { key: 'YellowCraneTower', name: '黄鹤楼' }, { key: 'PotalaPalace', name: '布达拉宫' }
];

let api, esc;

const getCookie = name => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保 jQuery 已加载
    if (typeof $ === 'undefined') {
        console.error('jQuery 未加载');
        return;
    }
    
    api = (url, data) => $.ajax({
        url, method: data ? 'POST' : 'GET',
        data: data instanceof FormData ? data : data,
        processData: !(data instanceof FormData),
        contentType: data instanceof FormData ? false : 'application/x-www-form-urlencoded'
    });
    
    esc = text => $('<div>').text(text).html();
    
    checkAuth();
    loadUsers();
    bindEvents();
});

function checkAuth() {
    let tries = 0;
    (function attempt() {
        const val = getCookie('user_session');
        if (val) {
            try {
                const s = JSON.parse(decodeURIComponent(val));
                if (s.is_admin == true || s.is_admin == 1 || s.is_admin === 'true') {
                    $('#adminName').text(s.username);
                    return;
                }
                alert('您没有管理员权限'); location.href = '../login.html';
            } catch {}
        }
        if (++tries < 20) setTimeout(attempt, 500);
        else { alert('请先登录管理员账号'); location.href = '../login.html'; }
    })();
}

// ========== 用户管理 ==========
async function loadUsers(page = 1, search = '') {
    currentPage = page; currentSearch = search;
    try {
        const r = await api(`../../backend/api/admin/getUsers.php?page=${page}&search=${encodeURIComponent(search)}`);
        if (r.status !== 'success') throw new Error(r.message);
        const users = r.data.users || r.data.data || r.data || [];
        renderUsers(users, r.data);
    } catch (e) {
        $('#userList').html(`<div class="error">加载失败: ${e.message}</div>`);
        $('#pagination').hide();
    }
}

function renderUsers(users, info) {
    $('#clearSearchBtn').toggle(!!currentSearch);
    if (!users.length) { $('#userList').html('<div class="empty">暂无用户</div>'); $('#pagination').hide(); return; }
    
    const html = `<table class="user-table"><thead><tr><th>用户名</th><th>建筑进度</th><th>操作</th></tr></thead><tbody>
        ${users.map(u => `<tr>
            <td>${esc(u.username)}</td>
            <td class="progress-cell">${progressText(u.progress || {})}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="editUser('${esc(u.username)}')">修改</button>
                <button class="btn btn-success btn-small" onclick="editProgress('${esc(u.username)}')">修改进度</button>
                <button class="btn btn-danger btn-small" onclick="deleteUser('${esc(u.username)}')">删除</button>
            </td>
        </tr>`).join('')}
    </tbody></table>`;
    $('#userList').html(html);
    
    const { total = users.length, totalPages = 1, page = 1 } = info;
    if (totalPages > 1) {
        $('#pagination').show();
        $('#pageInfo').text(`第 ${page} 页 / 共 ${totalPages} 页（共 ${total} 个用户）`);
        $('#prevPageBtn').prop('disabled', page <= 1);
        $('#nextPageBtn').prop('disabled', page >= totalPages);
    } else $('#pagination').hide();
}

function progressText(p) {
    const unlocked = [], locked = [];
    BUILDINGS.forEach(b => (p[b.key] === true ? unlocked : locked).push(b.name));
    let text = '';
    if (unlocked.length) text += `<span style="color:#059669">✓ ${unlocked.join('、')}</span>`;
    if (locked.length) text += `${text ? '<br>' : ''}<span style="color:#9ca3af">✗ ${locked.join('、')}</span>`;
    return text || '无进度信息';
}

async function editUser(username) {
    const newName = prompt('新用户名（留空不修改）:', '');
    if (newName === null) return;
    if (newName && !/^[a-zA-Z0-9]{4,15}$/.test(newName)) return alert('用户名只能包含字母和数字，长度4-15位');
    
    const newPwd = prompt('新密码（留空不修改）:', '');
    if (newPwd === null) return;
    if (newPwd && !/^.{6,16}$/.test(newPwd)) return alert('密码必须为6-16位');
    if (!newName && !newPwd) return alert('请至少输入新用户名或新密码');
    
    const fd = new FormData();
    fd.append('old_username', username);
    if (newName) fd.append('new_username', newName);
    if (newPwd) fd.append('new_password', newPwd);
    
    try {
        const r = await api('../../backend/api/admin/updateUser.php', fd);
        alert(r.status === 'success' ? '修改成功' : `修改失败: ${r.message}`);
        loadUsers(currentPage, currentSearch);
    } catch (e) { alert(`修改失败: ${e.message}`); }
}

async function deleteUser(username) {
    if (!confirm(`确定删除用户 "${username}"？`)) return;
    const fd = new FormData(); fd.append('username', username);
    try {
        const r = await api('../../backend/api/admin/deleteUser.php', fd);
        alert(r.status === 'success' ? '删除成功' : `删除失败: ${r.message}`);
        loadUsers(currentPage, currentSearch);
    } catch (e) { alert(`删除失败: ${e.message}`); }
}

async function editProgress(username) {
    const unlock = prompt('输入要修改的建筑（逗号分隔）或"all"，然后再输入y/n解锁或锁定', 'all');
    if (!unlock) return;
    const action = prompt('解锁？(y/n)', 'y');
    if (action === null) return;
    const shouldUnlock = action.toLowerCase() === 'y';
    
    const fd = new FormData(); fd.append('username', username);
    const keys = unlock === 'all' ? BUILDINGS.map(b => b.key) : 
        unlock.split(',').map(n => BUILDINGS.find(b => b.name === n.trim())?.key).filter(Boolean);
    if (!keys.length) return alert('未找到有效建筑');
    keys.forEach(k => fd.append(k, shouldUnlock));
    
    try {
        const r = await api('../../backend/api/admin/updateUserProgress.php', fd);
        alert(r.status === 'success' ? '进度更新成功' : `更新失败: ${r.message}`);
        loadUsers(currentPage, currentSearch);
    } catch (e) { alert(`更新失败: ${e.message}`); }
}

// ========== 评论管理 ==========
async function loadComments(page = 1, search = '') {
    commentPage = page; commentSearch = search;
    $('#clearCommentSearchBtn').toggle(!!search);
    
    try {
        $('#commentList').html('<div class="loading">加载中...</div>');
        const r = await api(`../../backend/api/comment/getComments.php?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`);
        if (r.status !== 'success') throw new Error(r.message);
        const comments = r.data.comments || r.data.data || r.data || [];
        renderComments(comments, r.data);
    } catch (e) {
        $('#commentList').html(`<div class="error">加载失败: ${e.message}</div>`);
        $('#commentPagination').hide();
    }
}

function renderComments(comments, info) {
    if (!comments.length) { $('#commentList').html('<div class="empty">暂无评论</div>'); $('#commentPagination').hide(); return; }
    
    const html = `<table class="user-table"><thead><tr><th>ID</th><th>用户</th><th>关卡</th><th>内容</th><th>时间</th><th>操作</th></tr></thead><tbody>
        ${comments.map(c => `<tr>
            <td>${c.id}</td><td>${esc(c.username)}</td><td>${esc(c.level_id)}</td>
            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(c.content)}">${esc(c.content)}</td>
            <td>${c.send_time}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editComment(${c.id},'${esc(c.content).replace(/'/g,"\\'")}')">修改</button>
                <button class="btn btn-sm btn-danger" onclick="deleteComment(${c.id})">删除</button>
            </td>
        </tr>`).join('')}
    </tbody></table>`;
    $('#commentList').html(html);
    
    if (info.totalPages > 1) {
        $('#commentPagination').show();
        $('#commentPageInfo').text(`第 ${commentPage} / ${info.totalPages} 页 (共 ${info.total} 条)`);
        $('#prevCommentPageBtn').prop('disabled', commentPage <= 1);
        $('#nextCommentPageBtn').prop('disabled', commentPage >= info.totalPages);
    } else $('#commentPagination').hide();
}

async function editComment(id, content) {
    const newContent = prompt('新评论内容（20字以内）:', content);
    if (!newContent?.trim()) return;
    if (newContent.length > 20) return alert('评论不能超过20字');
    const fd = new FormData(); fd.append('comment_id', id); fd.append('content', newContent.trim());
    try {
        const r = await api('../../backend/api/comment/updateComment.php', fd);
        alert(r.status === 'success' ? '修改成功' : `修改失败: ${r.message}`);
        loadComments(commentPage, commentSearch);
    } catch (e) { alert(`修改失败: ${e.message}`); }
}

async function deleteComment(id) {
    if (!confirm('确定删除这条评论？')) return;
    const fd = new FormData(); fd.append('comment_id', id);
    try {
        const r = await api('../../backend/api/comment/deleteComment.php', fd);
        alert(r.status === 'success' ? '删除成功' : `删除失败: ${r.message}`);
        loadComments(commentPage, commentSearch);
    } catch (e) { alert(`删除失败: ${e.message}`); }
}

// ========== 事件绑定 ==========
function bindEvents() {
    // 导航
    $('.nav-btn').on('click', function() {
        $('.nav-btn').removeClass('active');
        $(this).addClass('active');
        const target = $(this).data('target');
        $('.view-section').hide();
        $(`#${target}`).show();
        if (target === 'comment-management') loadComments();
    });
    
    // 用户管理
    $('#addUserForm').on('submit', async function(e) {
        e.preventDefault();
        const u = $('#newUsername').val().trim(), p = $('#newPassword').val().trim();
        if (!/^[a-zA-Z0-9]{4,15}$/.test(u)) return $('#addMessage').css('color','#f44336').text('用户名必须为4-15位字母数字');
        if (!/^.{6,16}$/.test(p)) return $('#addMessage').css('color','#f44336').text('密码必须为6-16位');
        const fd = new FormData(); fd.append('username', u); fd.append('password', p);
        try {
            const r = await api('../../backend/api/admin/addUser.php', fd);
            $('#addMessage').css('color', r.status === 'success' ? '#4caf50' : '#f44336').text(r.message || (r.status === 'success' ? '添加成功' : '添加失败'));
            if (r.status === 'success') { this.reset(); loadUsers(currentPage, currentSearch); setTimeout(() => $('#addMessage').text(''), 3000); }
        } catch (e) { $('#addMessage').css('color','#f44336').text(`添加失败: ${e.message}`); }
    });
    
    $('#refreshBtn').on('click', () => loadUsers(currentPage, currentSearch));
    $('#searchBtn').on('click', () => loadUsers(1, $('#searchInput').val().trim()));
    $('#searchInput').on('keypress', e => e.key === 'Enter' && loadUsers(1, $('#searchInput').val().trim()));
    $('#clearSearchBtn').on('click', () => { $('#searchInput').val(''); loadUsers(1, ''); });
    $('#prevPageBtn').on('click', () => currentPage > 1 && loadUsers(currentPage - 1, currentSearch));
    $('#nextPageBtn').on('click', () => loadUsers(currentPage + 1, currentSearch));
    
    // 评论管理
    $('#refreshCommentsBtn').on('click', () => loadComments(commentPage, commentSearch));
    $('#searchCommentBtn').on('click', () => loadComments(1, $('#searchCommentInput').val().trim()));
    $('#searchCommentInput').on('keypress', e => e.key === 'Enter' && loadComments(1, $('#searchCommentInput').val().trim()));
    $('#clearCommentSearchBtn').on('click', () => { $('#searchCommentInput').val(''); loadComments(1, ''); });
    $('#prevCommentPageBtn').on('click', () => commentPage > 1 && loadComments(commentPage - 1, commentSearch));
    $('#nextCommentPageBtn').on('click', () => loadComments(commentPage + 1, commentSearch));
    
    $('#addCommentForm').on('submit', async function(e) {
        e.preventDefault();
        const level = $('#commentLevel').val(), content = $('#commentContent').val().trim();
        if (!content) return $('#addCommentMessage').css('color','#f44336').text('评论内容不能为空');
        const fd = new FormData(); fd.append('level_id', level); fd.append('content', content);
        try {
            const r = await api('../../backend/api/comment/addComment.php', fd);
            $('#addCommentMessage').css('color', r.status === 'success' ? '#4caf50' : '#f44336').text(r.message || (r.status === 'success' ? '发表成功' : '发表失败'));
            if (r.status === 'success') { this.reset(); loadComments(1, commentSearch); setTimeout(() => $('#addCommentMessage').text(''), 3000); }
        } catch (e) { $('#addCommentMessage').css('color','#f44336').text(`发表失败: ${e.message}`); }
    });
    
    // 退出登录
    $('#logoutBtn').on('click', () => {
        if (confirm('确定退出登录？')) {
            document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            location.href = '../login.html';
        }
    });
}
