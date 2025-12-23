// 古代建筑数据（中文）
const buildings = [
    {
        id: 1,
        name: "紫禁城",
        description: "位于北京中心的明清皇家宫殿群，建于 1406–1420 年，作为中国古代政治与礼仪中心延续五百余年，现为故宫博物院所在地。",
        image: "../imgRes/紫禁城1.png",        // 滚动栏使用（标记1）
        detailImage: "../imgRes/紫禁城2.png", // 详情页使用（标记2）
        unlocked: true // Default unlocked
    },
    {
        id: 2,
        name: "天坛",
        description: "北京古代祭祀建筑群，明清皇帝祈年祈谷之所，以圆形祈年殿为代表，体现\"天圆地方\"的宇宙观。",
        image: "../imgRes/天坛1.png",
        detailImage: "../imgRes/天坛2.png",
        unlocked: false
    },
    {
        id: 3,
        name: "布达拉宫",
        description: "位于西藏拉萨的藏式古建筑群，始建于7世纪，是藏传佛教的圣地，世界文化遗产，融合了藏、汉、尼泊尔等建筑风格。",
        image: "../imgRes/布达拉宫1.jpg",
        detailImage: "../imgRes/布达拉宫2.jpg",
        unlocked: false
    },
    {
        id: 4,
        name: "黄鹤楼",
        description: "位于武汉蛇山之巅，历代重建，为中国\"四大名楼\"之一，诗词文化与楼阁建筑相辉映。",
        image: "../imgRes/黄鹤楼1.png",
        detailImage: "../imgRes/黄鹤楼2.png",
        unlocked: false
    },
    {
        id: 5,
        name: "长城",
        description: "中国古代军事防御工程，始建于春秋战国，现存主要为明长城，总长度超过两万公里，被誉为世界文化遗产和人类文明史上的奇迹。",
        image: "../imgRes/长城1.jpg",
        detailImage: "../imgRes/长城2.jpg",
        unlocked: false
    }
];

// Key for localStorage
const STORAGE_KEY = 'ancient_buildings_progress';

// Helper to get data
function getBuildings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        // 将旧数据名称/描述更新为中文，保留解锁状态
        const zhMap = new Map(buildings.map(b => [b.id, b]));
        return data.map(d => {
            const zh = zhMap.get(d.id);
            return {
                ...d,
                name: zh?.name ?? d.name,
                description: zh?.description ?? d.description,
                image: zh?.image ?? d.image,
                detailImage: zh?.detailImage ?? d.detailImage ?? zh?.image ?? d.image
            };
        });
    }
    return buildings;
}

// Helper to save data
function saveBuildings(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Initialize data if not present
if (!localStorage.getItem(STORAGE_KEY)) {
    saveBuildings(buildings);
}

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');

    if (page === 'home') {
        initHomePage();
    } else if (page === 'detail') {
        initDetailPage();
    } else if (page === 'login') {
        initLoginPage();
    } else if (page === 'register') {
        initRegisterPage();
    }
});

function initHomePage() {
    const scrollContainer = document.getElementById('building-list');
    const playBtn = document.getElementById('play-btn');
    const gameMsg = document.getElementById('game-msg');
    let clickBound = false;
    const REPEATS = 10;

    function renderList() {
        const currentBuildings = getBuildings();
        scrollContainer.innerHTML = ''; // Clear

        currentBuildings.forEach(b => {
            const card = document.createElement('div');
            card.className = `building-card ${b.unlocked ? '' : 'locked'}`;
            card.dataset.id = String(b.id);
            
            // Image area
            const img = document.createElement('img');
            img.className = 'building-img';
            img.src = b.image;
            img.alt = b.name;
            // 添加图片加载错误处理，避免图片加载失败影响页面显示
            img.onerror = function() {
                // 如果图片加载失败，使用占位符
                this.src = `https://placehold.co/150x120/a83636/ffffff?text=${encodeURIComponent(b.name)}`;
            };

            // Name
            const name = document.createElement('div');
            name.className = 'building-name';
            name.textContent = b.name;

            card.appendChild(img);
            card.appendChild(name);

            // Locked Mask
            if (!b.unlocked) {
                const mask = document.createElement('div');
                mask.className = 'mask';
                mask.textContent = '未解锁';
                card.appendChild(mask);
            }

            scrollContainer.appendChild(card);
        });

        const originalCards = Array.from(scrollContainer.children);
        for (let i = 1; i < REPEATS; i++) {
            originalCards.forEach(node => {
                const clone = node.cloneNode(true);
                scrollContainer.appendChild(clone);
            });
        }

        // 委托点击（克隆卡片也可点击）
        if (!clickBound) {
            scrollContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.building-card');
                if (!card || card.classList.contains('locked')) return;
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `detail.html?id=${id}`;
                }
            });
            clickBound = true;
        }

        setupAutoScroll(REPEATS);
    }

    // Initial render
    renderList();

    // Reset Button Logic (for testing)
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('确定要重置所有游戏进度吗？这将清空所有解锁的建筑。')) {
                localStorage.removeItem(STORAGE_KEY);
                // 重新初始化数据
                saveBuildings(buildings);
                // 重新渲染列表
                renderList();
                // 重置游戏区域
                const gamePlaceholder = document.getElementById('game-placeholder');
                const gameMap = document.getElementById('game-map');
                const playBtn = document.getElementById('play-btn');
                if (gamePlaceholder) gamePlaceholder.classList.remove('hidden');
                if (gameMap) gameMap.style.display = 'none';
                if (playBtn) {
                    playBtn.style.display = 'block';
                    playBtn.disabled = false;
                    playBtn.textContent = "开始游玩";
                }
                const gameMsg = document.getElementById('game-msg');
                if (gameMsg) gameMsg.textContent = "游玩小游戏以解锁建筑成就！";
                alert('游戏进度已重置！');
            }
        });
    }

    // Game Logic
    const gameMap = document.getElementById('game-map');
    const gamePlaceholder = document.getElementById('game-placeholder');

    playBtn.addEventListener('click', () => {
        const currentBuildings = getBuildings();
        const locked = currentBuildings.filter(b => !b.unlocked);

        if (locked.length === 0) {
            gameMsg.textContent = "已全部解锁！";
            return;
        }

        // 显示游戏地图，隐藏占位文本和按钮
        gamePlaceholder.classList.add('hidden');
        playBtn.style.display = 'none';
        gameMap.style.display = 'block';

        // Simulate game play... then unlock one
        playBtn.disabled = true;

        setTimeout(() => {
            const toUnlock = locked[Math.floor(Math.random() * locked.length)];
            toUnlock.unlocked = true;
            
            // Update storage
            const newBuildings = currentBuildings.map(b => b.id === toUnlock.id ? toUnlock : b);
            saveBuildings(newBuildings);

            // Update UI - 保持地图显示，只更新解锁状态
            playBtn.disabled = false;
            renderList();
        }, 2000);
    });
}

function setupAutoScroll(repeats = 2) {
    const container = document.getElementById('building-list');
    if (!container) return;

    const originalWidth = container.scrollWidth / repeats;
    const resetAt = originalWidth * (repeats - 1);
    let speed = 0.6; // 每帧滚动像素（约 60fps）
    let rafId;

    function step() {
        container.scrollLeft += speed;
        if (container.scrollLeft >= resetAt) {
            container.scrollLeft = 0;
        }
        rafId = requestAnimationFrame(step);
    }

    if (rafId) cancelAnimationFrame(rafId);
    step();

    // 悬停暂停，移出继续
    container.addEventListener('mouseenter', () => { speed = 0; });
    container.addEventListener('mouseleave', () => { speed = 0.6; });
}

function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const currentBuildings = getBuildings();
    const building = currentBuildings.find(b => b.id === id);

    if (!building || !building.unlocked) {
        document.body.innerHTML = '<h1>未找到建筑或尚未解锁。</h1><a href="index.html">返回首页</a>';
        return;
    }

    // Fill Content
    document.getElementById('detail-title').textContent = building.name;
    document.getElementById('detail-desc').textContent = building.description;
    const detailImg = document.getElementById('detail-img');
    // 详情页使用标记为2的图片
    detailImg.src = building.detailImage || building.image;
    // 添加图片加载错误处理
    detailImg.onerror = function() {
        // 如果图片加载失败，使用占位符
        this.src = `https://placehold.co/800x600/a83636/ffffff?text=${encodeURIComponent(building.name)}`;
    };

    // Floating Window Logic
    const trigger = document.getElementById('ai-trigger');
    const windowEl = document.getElementById('ai-window');
    const closeBtn = document.getElementById('close-ai');

    trigger.addEventListener('click', () => {
        windowEl.classList.add('active');
        // 添加类到body，用于兼容不支持:has()的浏览器
        document.body.classList.add('ai-window-open');
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
        // 移除类，恢复内容位置
        document.body.classList.remove('ai-window-open');
    });
}

function createCaptcha(len = 4) {
    let s = '';
    for (let i = 0; i < len; i++) {
        s += Math.floor(Math.random() * 10);
    }
    return s;
}

function initLoginPage() {
    const codeEl = document.getElementById('login-captcha-code');
    const refreshBtn = document.getElementById('login-captcha-refresh');
    const inputEl = document.getElementById('login-captcha-input');
    const loginBtn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');
    if (!codeEl || !refreshBtn || !inputEl || !loginBtn) return;
    let currentCode = createCaptcha();
    codeEl.textContent = currentCode;
    refreshBtn.addEventListener('click', () => {
        currentCode = createCaptcha();
        codeEl.textContent = currentCode;
        inputEl.value = '';
        errorEl.textContent = '';
    });
    loginBtn.addEventListener('click', () => {
        errorEl.textContent = '';
        alert('演示页面：未接入后端');
    });
}

function initRegisterPage() {
    const codeEl = document.getElementById('register-captcha-code');
    const refreshBtn = document.getElementById('register-captcha-refresh');
    const inputEl = document.getElementById('register-captcha-input');
    const regBtn = document.getElementById('register-btn');
    const errorEl = document.getElementById('register-error');
    if (!codeEl || !refreshBtn || !inputEl || !regBtn) return;
    let currentCode = createCaptcha();
    codeEl.textContent = currentCode;
    refreshBtn.addEventListener('click', () => {
        currentCode = createCaptcha();
        codeEl.textContent = currentCode;
        inputEl.value = '';
        errorEl.textContent = '';
    });
    regBtn.addEventListener('click', () => {
        errorEl.textContent = '';
        const val = (inputEl.value || '').trim();
        if (val !== currentCode) {
            errorEl.textContent = '验证码错误，请重试';
            return;
        }
        alert('注册成功（演示），已通过验证码校验');
    });
}
