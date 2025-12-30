/**
 * 古代建筑成就 - 主逻辑 (jQuery版)
 */

// 音效
const sounds = {
    click: new Audio('sound/click.mp3'),
    success: new Audio('sound/success.mp3'),
    correct: new Audio('sound/答对题.mp3'),
    wrong: new Audio('sound/答错题.mp3'),
    bgm: new Audio('sound/背景音乐.mp3')
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;

const playSound = name => {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(() => {});
    }
};

// 建筑数据
const buildings = [
    { id: 1, name: "紫禁城", description: "清两朝二十四位皇帝的皇宫。故宫始建于明成祖永乐四年（1406年），以南京故宫为蓝本营建，永乐十八年（1420年）落成。位于北京中轴线中心的故宫，占地面积72万平方米，建筑面积约15万平方米，有大小宫殿七十多座。房屋九千余间。是世界上现存规模最大、最完整的宫殿型建筑。", image: "../imgRes/紫禁城1.png", detailImage: "../imgRes/紫禁城2.png", unlocked: true },
    { id: 2, name: "天坛", description: "天坛，位于北京市东城区，是明清两朝皇帝祭天、祈谷和祈雨的场所。天坛始建于明成祖永乐十八年（公元1420年），原名『天地坛』，是现存中国古代规模最大、伦理等级最高的祭祀建筑群。", image: "../imgRes/天坛1.png", detailImage: "../imgRes/天坛2.png", unlocked: false },
    { id: 3, name: "布达拉宫", description: "布达拉宫坐落在中华人民共和国西藏自治区首府拉萨市区西北的玛布日山（红山）上，是一座规模宏大的宫殿式建筑群，最初是吐蕃王朝赞普松赞干布兴建。整座宫殿具有鲜明的藏族风格，依山而建，气势雄伟。", image: "../imgRes/布达拉宫1.jpg", detailImage: "../imgRes/布达拉宫2.jpg", unlocked: false },
    { id: 4, name: "黄鹤楼", description: "黄鹤楼位于中华人民共和国湖北省武汉市武昌蛇山上，与湖南岳阳楼、江西滕王阁合称江南三大名楼，是中国国家旅游胜地四十佳之一。始建于三国时代吴黄武二年（公元223年），距今已有1800年历史。", image: "../imgRes/黄鹤楼1.png", detailImage: "../imgRes/黄鹤楼2.png", unlocked: false },
    { id: 5, name: "长城", description: "长城是在中国大陆华北一带历朝修筑的大规模军用隔离墙的统称，在古代曾抵御不同时期来自塞北的游牧帝国和部落联盟的侵袭。现存的长城遗迹主要为始建于14世纪的明长城，1987年被联合国教科文组织列为世界文化遗产。", image: "../imgRes/长城1.jpg", detailImage: "../imgRes/长城2.jpg", unlocked: false }
];

const STORAGE_KEY = 'ancient_buildings_progress';
const LEVEL_MAP = { 1: 'ForbiddenCity', 2: 'TempleOfHeaven', 3: 'PotalaPalace', 4: 'YellowCraneTower', 5: 'GreatWall' };
const LEVEL_NAME = { ForbiddenCity: '紫禁城', GreatWall: '长城', TempleOfHeaven: '天坛', YellowCraneTower: '黄鹤楼', PotalaPalace: '布达拉宫' };

let barrageComments = [];
let currentGame = { building: null, questions: [], currentIndex: 0, score: 0, isOver: false };

// ========== 工具函数 ==========
const getBuildings = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return buildings;
    const data = JSON.parse(saved);
    const zhMap = new Map(buildings.map(b => [b.id, b]));
    return data.map(d => ({ ...d, ...zhMap.get(d.id), unlocked: d.unlocked }));
};

const saveBuildings = data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const getCookie = name => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
};

const getUserSession = () => {
    const val = getCookie('user_session');
    if (!val) return null;
    try { return JSON.parse(decodeURIComponent(val)); } 
    catch { try { return JSON.parse(decodeURIComponent(decodeURIComponent(val))); } catch { return null; } }
};

const api = (url, data) => $.ajax({
    url, method: data ? 'POST' : 'GET',
    data: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    contentType: data instanceof FormData ? false : (data ? 'application/json' : undefined),
    processData: !(data instanceof FormData || data)
});

// ========== 初始化 ==========
if (!localStorage.getItem(STORAGE_KEY)) saveBuildings(buildings);

$(() => {
    const page = $('body').data('page');
    if (page === 'home') initHomePage();
    else if (page === 'detail') initDetailPage();
});

// ========== 主页 ==========
function initHomePage() {
    updateAuthUI();
    initBarrage();
    renderList();
    
    // 点击页面后播放背景音乐
    $(document).one('click', () => sounds.bgm.play().catch(() => {}));
    
    // 同步后端进度
    syncProgress().then(changed => changed && renderList());
    
    // 卡片点击
    $('#building-list').on('click', '.building-card:not(.locked)', function() {
        playSound('click');
        location.href = `detail.html?id=${$(this).data('id')}`;
    });
    
    // 开始游戏
    $('#play-btn').on('click', function() { playSound('click'); startGame(); });
    
    // 重置进度
    $('#reset-btn').on('click', async function() {
        if (!confirm('确定要重置所有游戏进度吗？')) return;
        await api('../backend/api/building/resetProgress.php', new FormData()).catch(() => {});
        localStorage.removeItem(STORAGE_KEY);
        saveBuildings(buildings);
        renderList();
        $('.game-area').html(`
            <div class="game-placeholder-text" id="game-placeholder"><h2>古代建筑小游戏</h2><p>游玩小游戏以解锁建筑成就！</p></div>
            <button id="play-btn" class="play-btn">开始游玩</button>
        `);
        $('#play-btn').on('click', startGame);
        alert('游戏进度已重置！');
    });
}

function updateAuthUI() {
    const session = getUserSession();
    if (session?.username) {
        $('.auth-link').text(`您好(${session.username})_点击退出`).attr('href', '#').on('click', e => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                document.cookie = 'user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                location.reload();
            }
        });
    }
}

async function syncProgress() {
    try {
        const result = await api('../backend/api/building/getProgress.php');
        if (result.status !== 'success') return false;
        const progress = result.data?.progress || result;
        const mapping = { ForbiddenCity: 1, TempleOfHeaven: 2, PotalaPalace: 3, YellowCraneTower: 4, GreatWall: 5 };
        const data = getBuildings();
        let changed = false;
        for (const [key, id] of Object.entries(mapping)) {
            if (progress[key] !== undefined) {
                const unlocked = progress[key] == 1 || progress[key] === true;
                const b = data.find(x => x.id === id);
                if (b && b.unlocked !== unlocked) { b.unlocked = unlocked; changed = true; }
            }
        }
        if (changed) saveBuildings(data);
        return changed;
    } catch { return false; }
}

function renderList() {
    const $container = $('#building-list').empty();
    getBuildings().forEach(b => {
        const $card = $(`<div class="building-card ${b.unlocked ? '' : 'locked'}" data-id="${b.id}">
            <img class="building-img" src="${b.image}" alt="${b.name}">
            <div class="building-name">${b.name}</div>
            ${b.unlocked ? '' : '<div class="mask">未解锁</div>'}
        </div>`);
        $card.find('img').on('error', function() { this.src = `https://placehold.co/150x120/a83636/fff?text=${encodeURIComponent(b.name)}`; });
        $container.append($card);
    });
    // 复制实现无限滚动
    for (let i = 1; i < 10; i++) $container.append($container.children().clone(true));
    setupAutoScroll();
}

function setupAutoScroll() {
    const $c = $('#building-list');
    if ($c.data('rafId')) cancelAnimationFrame($c.data('rafId'));
    const h = $c[0].scrollHeight / 10, resetAt = h * 9;
    let speed = 0.6;
    (function step() {
        $c[0].scrollTop += speed;
        if ($c[0].scrollTop >= resetAt) $c[0].scrollTop = 0;
        $c.data('rafId', requestAnimationFrame(step));
    })();
    $c.off('mouseenter mouseleave').on('mouseenter', () => speed = 0).on('mouseleave', () => speed = 0.6);
}

// ========== 详情页 ==========
async function initDetailPage() {
    await syncProgress();
    const id = +new URLSearchParams(location.search).get('id');
    const b = getBuildings().find(x => x.id === id);
    if (!b?.unlocked) { $('body').html('<h1>未找到建筑或尚未解锁。</h1><a href="index.html">返回首页</a>'); return; }
    
    $('#detail-title').text(b.name);
    $('#detail-desc').text(b.description);
    $('#detail-img').attr('src', b.detailImage || b.image).on('error', function() {
        this.src = `https://placehold.co/800x600/a83636/fff?text=${encodeURIComponent(b.name)}`;
    });
    
    // AI窗口
    $('#ai-trigger').on('click', () => { $('#ai-window').addClass('active'); $('body').addClass('ai-window-open'); });
    $('#close-ai').on('click', () => { $('#ai-window').removeClass('active'); $('body').removeClass('ai-window-open'); });
    
    // 聊天
    const addMsg = (text, isUser) => {
        $('#ai-messages').append(`<div class="message ${isUser ? 'user-message' : 'ai-message'}">${text}</div>`);
        $('#ai-messages')[0].scrollTop = $('#ai-messages')[0].scrollHeight;
    };
    
    const sendChat = async () => {
        const text = $('#ai-input').val().trim();
        if (!text) return;
        addMsg(text, true);
        $('#ai-input').val('');
        addMsg('正在思考...', false);
        try {
            const r = await api('../backend/api/ai/chat.php', { message: text, building_id: id });
            $('#ai-messages .ai-message:last').text(r.status === 'success' ? r.reply : '抱歉，AI暂时无法回答');
        } catch { $('#ai-messages .ai-message:last').text('网络连接失败').css('color', '#a83636'); }
    };
    
    $('#ai-send-btn').on('click', sendChat);
    $('#ai-input').on('keypress', e => e.key === 'Enter' && sendChat());
}

// ========== 弹幕 ==========
async function initBarrage() {
    if (!$('#barrage-container').length) return;
    try {
        const r = await api('../backend/api/comment/getComments.php?pageSize=100');
        if (r.status === 'success') barrageComments = r.data?.comments || r.data?.data || r.data || [];
    } catch {}
    if (!barrageComments.length) barrageComments = [
        { username: '系统', level_id: 'ForbiddenCity', content: '欢迎来到古代建筑成就！' },
        { username: '游客', level_id: 'GreatWall', content: '长城是世界奇迹！' }
    ];
    (function spawn() {
        setTimeout(() => { spawnBarrage(); spawn(); }, 750 + Math.random() * 750);
    })();
}

function spawnBarrage() {
    if (!barrageComments.length) return;
    const c = barrageComments[Math.floor(Math.random() * barrageComments.length)];
    const $item = $('<div class="barrage-item"></div>')
        .text(`${c.username || '匿名'} 在 ${LEVEL_NAME[c.level_id] || '未知'} 留言：${c.content}`)
        .css({ fontSize: 20 + Math.random() * 10, top: Math.random() * 90 + '%', animationDuration: 11 + Math.random() * 9 + 's' })
        .appendTo('#barrage-container')
        .on('animationend', function() { $(this).remove(); });
}

// ========== 游戏 ==========
function startGame() {
    $('#game-placeholder, #play-btn, #game-map').hide();
    renderLevelMap();
}

function renderLevelMap() {
    const data = getBuildings();
    const layout = [
        { id: 3, pos: 'up', name: '布达拉宫' }, { id: 2, pos: 'center', name: '天坛' },
        { id: 1, pos: 'down', name: '紫禁城' }, { id: 4, pos: 'left', name: '黄鹤楼' }, { id: 5, pos: 'right', name: '长城' }
    ];
    const $c = $('<div class="level-map-container"></div>');
    layout.forEach(({ id, pos, name }) => {
        const b = data.find(x => x.id === id);
        const $node = $(`<div class="level-node ${pos} ${b?.unlocked ? 'unlocked' : 'locked'}"><div>${b?.unlocked ? name : '尚未解锁'}</div></div>`);
        if (b?.unlocked) $node.on('click', () => { playSound('click'); enterLevel(b); });
        $c.append($node);
    });
    $('.game-area').html($c);
}

async function enterLevel(building) {
    currentGame = { building, questions: [], currentIndex: 0, score: 0, isOver: false };
    $('.game-area').html(`
        <div class="game-quiz-container">
            <div class="game-quiz-header"><h2>挑战：${building.name}</h2><button class="back-to-map-btn">×</button></div>
            <div id="g-loading"><div class="spinner"></div><p>正在生成题目...</p></div>
            <div id="g-quiz" style="display:none">
                <div class="progress-bar"><div id="g-progress" class="progress-fill"></div></div>
                <div class="question-container">
                    <h3 id="g-question"></h3>
                    <p id="g-hint" class="hint-text" style="display:none"></p>
                    <button id="g-hint-btn" class="btn-text">查看提示</button>
                </div>
                <div id="g-options" class="options-grid"></div>
            </div>
            <div id="g-result" style="display:none">
                <div id="g-success" style="display:none">
                    <h3 class="success-text">恭喜通关！</h3><p>解锁了新的建筑！</p>
                    <div class="comment-section"><h4>留下感言：</h4>
                    <textarea id="g-comment" placeholder="写下评论..."></textarea>
                    <button id="g-submit" class="btn btn-primary">提交评论并解锁下一关</button></div>
                </div>
                <div id="g-fail" style="display:none">
                    <h3 class="fail-text">胜败乃兵家常事</h3><p>少侠请重新来过！</p>
                    <button id="g-retry" class="btn btn-secondary">重试</button>
                    <button id="g-back" class="btn btn-text">返回地图</button>
                </div>
            </div>
        </div>
    `);
    $('.back-to-map-btn, #g-back').on('click', renderLevelMap);
    $('#g-hint-btn').on('click', () => $('#g-hint').show());
    $('#g-submit').on('click', submitComment);
    $('#g-retry').on('click', () => enterLevel(building));
    
    try {
        const r = await api('../backend/api/ai/generateQuestions.php', { building_name: building.name });
        currentGame.questions = r.status === 'success' ? r.data : getMockQuestions(building.name);
    } catch { currentGame.questions = getMockQuestions(building.name); }
    
    $('#g-loading').hide();
    $('#g-quiz').show();
    renderQuestion(0);
}

function getMockQuestions(name) {
    return [
        { question: `关于${name}，以下哪个描述是正确的？`, options: ["始建于明朝", "始建于唐朝", "始建于清朝", "始建于宋朝"], correctIndex: 0, hint: "提示：明成祖时期开始修建。" },
        { question: `${name}的主要建筑特色是什么？`, options: ["哥特式风格", "巴洛克风格", "中国传统木结构", "古罗马风格"], correctIndex: 2, hint: "提示：使用大量木材，斗拱结构。" },
        { question: `${name}在历史上的主要用途是？`, options: ["平民居住", "皇家宫殿/祭祀/防御", "商业中心", "工业基地"], correctIndex: 1, hint: "提示：与皇帝或军事防御有关。" }
    ];
}

function renderQuestion(idx) {
    if (idx >= currentGame.questions.length) return finishGame();
    const q = currentGame.questions[idx];
    $('#g-progress').css('width', idx / currentGame.questions.length * 100 + '%');
    $('#g-question').text(`${idx + 1}. ${q.question}`);
    $('#g-hint').text(q.hint).hide();
    $('#g-options').html(q.options.map((opt, i) => `<button class="option-btn" data-idx="${i}">${opt}</button>`).join(''));
    $('#g-options').off('click').on('click', '.option-btn', function() {
        if (currentGame.isOver) return;
        const i = $(this).data('idx'), correct = q.correctIndex === i;
        playSound(correct ? 'correct' : 'wrong');
        $('.option-btn').prop('disabled', true);
        $(this).addClass(correct ? 'correct' : 'wrong');
        if (!correct) $(`.option-btn[data-idx="${q.correctIndex}"]`).addClass('correct');
        if (correct) currentGame.score++;
        setTimeout(() => renderQuestion(++currentGame.currentIndex), 1000);
    });
}

function finishGame() {
    currentGame.isOver = true;
    $('#g-quiz').hide();
    $('#g-result').show();
    const win = currentGame.score === currentGame.questions.length;
    if (win) playSound('success');
    $(win ? '#g-success' : '#g-fail').show();
    $(win ? '#g-fail' : '#g-success').hide();
}

async function submitComment() {
    const content = $('#g-comment').val().trim();
    if (!content) return alert('请写下感言');
    const levelId = LEVEL_MAP[currentGame.building.id];
    const fd = new FormData();
    fd.append('level_id', levelId);
    fd.append('content', content);
    try {
        await api('../backend/api/comment/addComment.php', fd);
        unlockNext(currentGame.building.id);
        alert('恭喜！已解锁下一关！');
        renderList();
        renderLevelMap();
    } catch { alert('提交失败，请重试'); }
}

function unlockNext(id) {
    const data = getBuildings(), next = data.find(b => b.id === id + 1);
    if (next && !next.unlocked) {
        next.unlocked = true;
        saveBuildings(data);
        api('../backend/api/building/updateProgress.php', (() => { const fd = new FormData(); fd.append('building_id', id + 1); fd.append('unlocked', true); return fd; })());
    }
}
