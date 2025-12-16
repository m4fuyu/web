/**
 * 中国古代建筑成就网站 - 后台管理JavaScript功能
 */

class AdminPanel {
    constructor() {
        this.currentPage = 'dashboard';
        this.buildings = [];
        this.editingBuildingId = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.loadPage('dashboard');
    }

    // 检查管理员认证状态
    async checkAuth() {
        try {
            const response = await API.post('/admin/check-auth.php');
            if (!response.success) {
                window.location.href = '../login.html?return=admin/index.html';
                return;
            }

            // 更新管理员信息显示
            this.updateAdminInfo(response.data);
        } catch (error) {
            console.error('认证检查失败:', error);
            window.location.href = '../login.html?return=admin/index.html';
        }
    }

    // 更新管理员信息显示
    updateAdminInfo(adminData) {
        const adminNameEl = document.getElementById('adminName');
        const adminRoleEl = document.getElementById('adminRole');

        if (adminNameEl) {
            adminNameEl.textContent = adminData.real_name || adminData.username;
        }

        if (adminRoleEl) {
            adminRoleEl.textContent = adminData.role || '管理员';
        }
    }

    // 绑定事件
    bindEvents() {
        // 侧边栏导航
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.loadPage(page);
            });
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPage(this.currentPage);
        });

        // 帮助按钮
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelp();
        });

        // 侧边栏切换（移动端）
        document.querySelector('.sidebar-toggle')?.addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('show');
        });

        // 建筑管理相关事件
        this.bindBuildingEvents();

        // 模态框事件
        this.bindModalEvents();
    }

    // 绑定建筑管理事件
    bindBuildingEvents() {
        // 添加建筑按钮
        document.getElementById('addBuildingBtn')?.addEventListener('click', () => {
            this.openBuildingModal();
        });

        // 建筑表单提交
        document.getElementById('buildingForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBuilding();
        });

        // 搜索和筛选
        const searchInput = document.getElementById('buildingSearch');
        const categoryFilter = document.getElementById('categoryFilter');

        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.loadBuildings();
            }, 500));
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.loadBuildings();
            });
        }
    }

    // 绑定模态框事件
    bindModalEvents() {
        const modal = document.getElementById('buildingModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeBuildingModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeBuildingModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeBuildingModal();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeBuildingModal();
            }
        });
    }

    // 加载页面
    async loadPage(page) {
        // 更新导航状态
        this.updateNavigation(page);

        // 隐藏所有页面
        document.querySelectorAll('.page-content').forEach(el => {
            el.style.display = 'none';
        });

        // 显示目标页面
        const pageElement = document.getElementById(page + 'Page');
        if (pageElement) {
            pageElement.style.display = 'block';
        }

        // 更新页面标题
        const titles = {
            dashboard: '控制台',
            buildings: '建筑管理',
            categories: '分类管理',
            users: '用户管理',
            comments: '评论管理',
            settings: '系统设置'
        };

        const titleEl = document.getElementById('pageTitle');
        if (titleEl && titles[page]) {
            titleEl.textContent = titles[page];
        }

        this.currentPage = page;

        // 根据页面加载相应数据
        switch (page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'buildings':
                await this.loadBuildings();
                break;
            case 'categories':
                await this.loadCategories();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'comments':
                await this.loadComments();
                break;
            case 'settings':
                await this.loadSettings();
                break;
        }
    }

    // 更新导航状态
    updateNavigation(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    }

    // 加载控制台数据
    async loadDashboard() {
        try {
            // 加载统计数据
            await this.loadDashboardStats();

            // 加载最新建筑
            await this.loadRecentBuildings();

            // 加载最新评论
            await this.loadRecentComments();
        } catch (error) {
            console.error('加载控制台数据失败:', error);
        }
    }

    // 加载控制台统计
    async loadDashboardStats() {
        try {
            const response = await API.get('/admin/dashboard-stats.php');
            if (response.success) {
                this.animateNumber('totalBuildings', response.data.totalBuildings);
                this.animateNumber('totalUsers', response.data.totalUsers);
                this.animateNumber('totalComments', response.data.totalComments);
                this.animateNumber('totalViews', response.data.totalViews);
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    // 加载最新建筑
    async loadRecentBuildings() {
        try {
            const response = await API.get('/admin/recent-buildings.php', { limit: 5 });
            if (response.success) {
                this.renderRecentBuildings(response.data);
            }
        } catch (error) {
            console.error('加载最新建筑失败:', error);
        }
    }

    // 渲染最新建筑
    renderRecentBuildings(buildings) {
        const container = document.getElementById('recentBuildings');
        if (!container) return;

        if (buildings.length === 0) {
            container.innerHTML = '<p class="text-muted">暂无建筑数据</p>';
            return;
        }

        container.innerHTML = buildings.map(building => `
            <div class="recent-item">
                <div class="recent-info">
                    <h4>${building.name}</h4>
                    <p class="text-muted">${building.category_name} · ${building.location || '未知地点'}</p>
                </div>
                <div class="recent-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.editBuilding(${building.id})">
                        编辑
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 加载最新评论
    async loadRecentComments() {
        try {
            const response = await API.get('/admin/recent-comments.php', { limit: 5 });
            if (response.success) {
                this.renderRecentComments(response.data);
            }
        } catch (error) {
            console.error('加载最新评论失败:', error);
        }
    }

    // 渲染最新评论
    renderRecentComments(comments) {
        const container = document.getElementById('recentComments');
        if (!container) return;

        if (comments.length === 0) {
            container.innerHTML = '<p class="text-muted">暂无评论数据</p>';
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="recent-item">
                <div class="recent-info">
                    <h4>${comment.username}</h4>
                    <p class="text-muted">${comment.content}</p>
                    <small>${this.formatDate(comment.created_at)}</small>
                </div>
                <div class="recent-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminPanel.viewComment(${comment.id})">
                        查看
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 加载建筑列表
    async loadBuildings() {
        const container = document.querySelector('#buildingsTable tbody');
        if (container) {
            container.innerHTML = '<tr><td colspan="7" class="text-center">加载中...</td></tr>';
        }

        try {
            const params = this.getBuildingFilters();
            const response = await API.get('/admin/buildings.php', params);

            if (response.success) {
                this.buildings = response.data.buildings;
                this.renderBuildings(response.data.buildings);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('加载建筑列表失败:', error);
            this.showError('buildingsTable', '加载失败，请重试');
        }
    }

    // 获取建筑筛选参数
    getBuildingFilters() {
        const searchInput = document.getElementById('buildingSearch');
        const categoryFilter = document.getElementById('categoryFilter');

        const params = {};
        if (searchInput?.value) {
            params.keyword = searchInput.value.trim();
        }
        if (categoryFilter?.value) {
            params.category_id = categoryFilter.value;
        }

        return params;
    }

    // 渲染建筑列表
    renderBuildings(buildings) {
        const tbody = document.querySelector('#buildingsTable tbody');
        if (!tbody) return;

        if (buildings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">暂无数据</td></tr>';
            return;
        }

        tbody.innerHTML = buildings.map(building => `
            <tr>
                <td>${building.id}</td>
                <td>
                    <div class="building-name">
                        ${building.name}
                        ${building.status == 0 ? '<span class="status-badge status-inactive">草稿</span>' : ''}
                    </div>
                </td>
                <td>${building.category_name}</td>
                <td>${building.location || '-'}</td>
                <td>${this.formatDate(building.created_at)}</td>
                <td>
                    <span class="status-badge ${building.status == 1 ? 'status-active' : 'status-inactive'}">
                        ${building.status == 1 ? '已发布' : '草稿'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="adminPanel.editBuilding(${building.id})">
                            编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteBuilding(${building.id})">
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 打开建筑模态框
    openBuildingModal(buildingId = null) {
        const modal = document.getElementById('buildingModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('buildingForm');

        if (!modal || !form) return;

        this.editingBuildingId = buildingId;
        modalTitle.textContent = buildingId ? '编辑建筑' : '添加建筑';
        form.reset();

        if (buildingId) {
            this.loadBuildingForEdit(buildingId);
        }

        modal.classList.add('show');
    }

    // 关闭建筑模态框
    closeBuildingModal() {
        const modal = document.getElementById('buildingModal');
        if (modal) {
            modal.classList.remove('show');
        }

        this.editingBuildingId = null;
    }

    // 加载建筑数据用于编辑
    async loadBuildingForEdit(buildingId) {
        try {
            const response = await API.get(`/admin/building-detail.php?id=${buildingId}`);
            if (response.success) {
                this.populateBuildingForm(response.data);
            }
        } catch (error) {
            console.error('加载建筑数据失败:', error);
            Utils.showMessage('加载建筑数据失败', 'error');
        }
    }

    // 填充建筑表单
    populateBuildingForm(building) {
        document.getElementById('buildingName').value = building.name || '';
        document.getElementById('buildingCategory').value = building.category_id || '';
        document.getElementById('buildingLocation').value = building.location || '';
        document.getElementById('buildingDynasty').value = building.dynasty || '';
        document.getElementById('buildingDescription').value = building.description || '';
        document.getElementById('buildingContent').value = building.content || '';
        document.getElementById('buildingStatus').value = building.status || 1;
    }

    // 保存建筑
    async saveBuilding() {
        const form = document.getElementById('buildingForm');
        const formData = new FormData(form);

        try {
            const url = this.editingBuildingId ?
                `/admin/building.php?id=${this.editingBuildingId}` :
                '/admin/building.php';

            const response = await API.upload(url, formData);

            if (response.success) {
                Utils.showMessage(response.message || '保存成功');
                this.closeBuildingModal();
                this.loadBuildings();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('保存建筑失败:', error);
            Utils.showMessage(error.message || '保存失败', 'error');
        }
    }

    // 编辑建筑
    editBuilding(buildingId) {
        this.openBuildingModal(buildingId);
    }

    // 删除建筑
    async deleteBuilding(buildingId) {
        if (!confirm('确定要删除这个建筑吗？此操作不可恢复。')) {
            return;
        }

        try {
            const response = await API.delete(`/admin/building.php?id=${buildingId}`);

            if (response.success) {
                Utils.showMessage('删除成功');
                this.loadBuildings();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('删除建筑失败:', error);
            Utils.showMessage(error.message || '删除失败', 'error');
        }
    }

    // 查看评论
    viewComment(commentId) {
        // 实现查看评论功能
        console.log('查看评论:', commentId);
    }

    // 退出登录
    async handleLogout() {
        if (!confirm('确定要退出登录吗？')) {
            return;
        }

        try {
            await API.post('/admin/logout.php');
        } catch (error) {
            console.error('退出登录失败:', error);
        } finally {
            // 清除本地存储并跳转到登录页
            localStorage.removeItem('adminToken');
            window.location.href = '../login.html';
        }
    }

    // 显示帮助
    showHelp() {
        Utils.showMessage('帮助功能正在开发中', 'info');
    }

    // 数字动画
    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const startTime = performance.now();
        const startNumber = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);

            element.textContent = currentNumber.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('zh-CN');
    }

    // 显示错误
    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="${container.querySelectorAll('th').length}" class="text-center text-danger">
                        ${message}
                    </td>
                </tr>
            `;
        }
    }

    // 加载其他页面数据的占位方法
    async loadCategories() {
        console.log('加载分类数据...');
    }

    async loadUsers() {
        console.log('加载用户数据...');
    }

    async loadComments() {
        console.log('加载数据...');
    }

    async loadSettings() {
        console.log('加载设置数据...');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 隐藏登录检查遮罩
    const overlay = document.getElementById('loginCheckOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    // 初始化管理面板
    window.adminPanel = new AdminPanel();
});