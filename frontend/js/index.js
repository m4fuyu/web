/**
 * 中国古代建筑成就网站 - 首页JavaScript功能
 */

class HomePage {
    constructor() {
        this.currentPage = 1;
        this.currentCategory = '';
        this.currentKeyword = '';
        this.perPage = 12;
        this.totalPages = 1;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.loadInitialData();
        this.bindEvents();
        this.startImageSlider();
    }

    // 加载初始数据
    async loadInitialData() {
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        this.currentCategory = urlParams.get('category') || '';
        this.currentKeyword = urlParams.get('search') || '';

        // 设置筛选标签状态
        this.updateFilterTabs();

        // 加载建筑列表
        await this.loadBuildings();

        // 加载统计数据
        this.loadStatistics();
    }

    // 绑定事件
    bindEvents() {
        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setCategory(category);
            });
        });

        // 导航链接事件
        document.querySelectorAll('.nav-link[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.setCategory(category);
            });
        });

        // 分页按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            }
        });

        // 搜索功能
        this.bindSearchEvents();
    }

    // 绑定搜索事件
    bindSearchEvents() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput && searchBtn) {
            // 使用防抖优化搜索
            const debouncedSearch = Utils.debounce(() => {
                const keyword = searchInput.value.trim();
                if (keyword !== this.currentKeyword) {
                    this.currentKeyword = keyword;
                    this.currentPage = 1;
                    this.loadBuildings();
                }
            }, 500);

            searchInput.addEventListener('input', debouncedSearch);
        }
    }

    // 设置分类筛选
    setCategory(category) {
        if (this.currentCategory !== category) {
            this.currentCategory = category;
            this.currentPage = 1;
            this.currentKeyword = '';

            // 更新URL
            const url = new URL(window.location);
            if (category) {
                url.searchParams.set('category', category);
            } else {
                url.searchParams.delete('category');
            }
            url.searchParams.delete('search');
            window.history.replaceState({}, '', url);

            // 更新界面
            this.updateFilterTabs();
            this.clearSearchInput();

            // 重新加载数据
            this.loadBuildings();
        }
    }

    // 跳转到指定页面
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && !this.isLoading) {
            this.currentPage = page;

            // 更新URL
            const url = new URL(window.location);
            if (page > 1) {
                url.searchParams.set('page', page);
            } else {
                url.searchParams.delete('page');
            }
            window.history.replaceState({}, '', url);

            // 滚动到顶部
            window.scrollTo({
                top: document.querySelector('.buildings-section').offsetTop - 100,
                behavior: 'smooth'
            });

            // 加载数据
            this.loadBuildings();
        }
    }

    // 加载建筑列表
    async loadBuildings() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = {
                page: this.currentPage,
                limit: this.perPage
            };

            if (this.currentCategory) {
                params.category = this.currentCategory;
            }

            if (this.currentKeyword) {
                params.keyword = this.currentKeyword;
            }

            const response = await API.get('/building/list.php', params);

            if (response.success) {
                this.renderBuildings(response.data.buildings);
                this.renderPagination(response.data.pagination);
                this.totalPages = response.data.pagination.total_pages;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('加载建筑列表失败:', error);
            this.showError('加载失败，请稍后重试');
        } finally {
            this.isLoading = false;
        }
    }

    // 渲染建筑列表
    renderBuildings(buildings) {
        const container = document.getElementById('buildingsGrid');

        if (buildings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏛️</div>
                    <h3 class="empty-state-title">暂无相关建筑</h3>
                    <p class="empty-state-desc">试试其他分类或搜索关键词</p>
                </div>
            `;
            return;
        }

        container.innerHTML = buildings.map(building => `
            <div class="building-card" onclick="homePage.viewBuildingDetail(${building.id})">
                <div class="building-image">
                    <img src="${building.image_url}" alt="${building.name}"
                         onerror="this.src='/frontend/images/default-building.jpg'">
                </div>
                <div class="building-content">
                    <h3 class="building-title">${building.name}</h3>
                    <span class="building-category">${building.category_name}</span>
                    <p class="building-description">${building.description}</p>
                    <div class="building-meta">
                        <span class="building-location">${building.location || '未知地点'}</span>
                        <span class="building-date">${this.formatDate(building.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 渲染分页
    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        const { current_page, total_pages, has_prev, has_next } = pagination;

        if (total_pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 上一页
        if (has_prev) {
            paginationHTML += `<button class="page-btn" data-page="${current_page - 1}">上一页</button>`;
        }

        // 页码按钮
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === current_page ? 'active' : '';
            paginationHTML += `<button class="page-btn ${isActive}" data-page="${i}">${i}</button>`;
        }

        if (endPage < total_pages) {
            if (endPage < total_pages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" data-page="${total_pages}">${total_pages}</button>`;
        }

        // 下一页
        if (has_next) {
            paginationHTML += `<button class="page-btn" data-page="${current_page + 1}">下一页</button>`;
        }

        container.innerHTML = paginationHTML;
    }

    // 更新筛选标签状态
    updateFilterTabs() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const category = btn.dataset.category;
            if (category === this.currentCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 更新导航链接状态
        document.querySelectorAll('.nav-link[data-category]').forEach(link => {
            const category = link.dataset.category;
            if (category === this.currentCategory) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 清空搜索输入
    clearSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    // 显示加载状态
    showLoading() {
        const container = document.getElementById('buildingsGrid');
        container.innerHTML = '<div class="loading">加载中...</div>';
    }

    // 显示错误状态
    showError(message) {
        const container = document.getElementById('buildingsGrid');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3 class="empty-state-title">加载失败</h3>
                <p class="empty-state-desc">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">重新加载</button>
            </div>
        `;
    }

    // 加载统计数据
    async loadStatistics() {
        try {
            // 这里可以调用统计数据的API
            // 暂时使用模拟数据
            this.animateNumber('totalBuildings', 156);
            this.animateNumber('totalViews', 28590);
            this.animateNumber('totalComments', 342);
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    // 数字动画效果
    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 2000; // 2秒
        const startTime = performance.now();
        const startNumber = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);

            element.textContent = currentNumber.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // 查看建筑详情
    viewBuildingDetail(buildingId) {
        // 这里可以跳转到详情页或者显示详情模态框
        console.log('查看建筑详情:', buildingId);
        // window.location.href = `building-detail.html?id=${buildingId}`;
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '昨天';
        } else if (days < 7) {
            return `${days}天前`;
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            return `${weeks}周前`;
        } else if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months}个月前`;
        } else {
            const years = Math.floor(days / 365);
            return `${years}年前`;
        }
    }

    // 启动图片轮播
    startImageSlider() {
        // 这里可以实现图片轮播功能
        // 暂时保持静态
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.homePage = new HomePage();
});