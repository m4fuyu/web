// 古代建筑数据（中文）
const buildings = [
    {
        id: 1,
        name: "紫禁城",
        description: "位于北京中心的明清皇家宫殿群，建于 1406–1420 年，作为中国古代政治与礼仪中心延续五百余年，现为故宫博物院所在地。",
        image: "https://placehold.co/800x600/a83636/ffffff?text=%E7%B4%AB%E7%A6%8F%E5%9F%8E",
        unlocked: true // Default unlocked
    },
    {
        id: 2,
        name: "天坛",
        description: "北京古代祭祀建筑群，明清皇帝祈年祈谷之所，以圆形祈年殿为代表，体现“天圆地方”的宇宙观。",
        image: "https://placehold.co/800x600/4a3b2a/ffffff?text=%E5%A4%A9%E5%9D%9B",
        unlocked: false
    },
    {
        id: 3,
        name: "颐和园",
        description: "清代皇家园林，昆明湖与万寿山为主体，兼具自然山水与古典园林艺术，被誉为“皇家园林博物馆”。",
        image: "https://placehold.co/800x600/8c7b65/ffffff?text=%E9%A2%90%E5%92%8C%E5%9B%AD",
        unlocked: false
    },
    {
        id: 4,
        name: "黄鹤楼",
        description: "位于武汉蛇山之巅，历代重建，为中国“四大名楼”之一，诗词文化与楼阁建筑相辉映。",
        image: "https://placehold.co/800x600/a83636/ffffff?text=%E9%BB%84%E9%B9%A4%E6%A5%BC",
        unlocked: false
    },
    {
        id: 5,
        name: "佛光寺",
        description: "山西五台重要唐代佛教寺院，东大殿为中国仅存的早期木结构精品，建筑与文物价值极高。",
        image: "https://placehold.co/800x600/4a3b2a/ffffff?text=%E4%BD%9B%E5%85%89%E5%AF%BA",
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
                image: zh?.image ?? d.image
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

    // Game Logic
    playBtn.addEventListener('click', () => {
        const currentBuildings = getBuildings();
        const locked = currentBuildings.filter(b => !b.unlocked);

        if (locked.length === 0) {
            gameMsg.textContent = "已全部解锁！";
            return;
        }

        // Simulate game play... then unlock one
        playBtn.disabled = true;
        playBtn.textContent = "正在游玩…";
        gameMsg.textContent = "正在探索古代遗址…";

        setTimeout(() => {
            const toUnlock = locked[Math.floor(Math.random() * locked.length)];
            toUnlock.unlocked = true;
            
            // Update storage
            const newBuildings = currentBuildings.map(b => b.id === toUnlock.id ? toUnlock : b);
            saveBuildings(newBuildings);

            // Update UI
            gameMsg.textContent = `已解锁成就：${toUnlock.name}！`;
            playBtn.disabled = false;
            playBtn.textContent = "开始游玩";
            renderList();
        }, 1500);
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
    document.getElementById('detail-img').src = building.image;

    // Floating Window Logic
    const trigger = document.getElementById('ai-trigger');
    const windowEl = document.getElementById('ai-window');
    const closeBtn = document.getElementById('close-ai');

    trigger.addEventListener('click', () => {
        windowEl.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });
}

