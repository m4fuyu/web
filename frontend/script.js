// 古代建筑数据（中文）
const buildings = [
    {
        id: 1,
        name: "紫禁城",
        description: "清两朝二十四位皇帝的皇宫。故宫始建于明成祖永乐四年（1406年），以南京故宫为蓝本营建，永乐十八年（1420年）落成。位于北京中轴线中心的故宫，占地面积72万平方米，建筑面积约15万平方米，有大小宫殿七十多座。房屋九千余间。是世界上现存规模最大、最完整的宫殿型建筑。北京故宫是第一批全国重点文物保护单位、第一批国家5A级旅游景区，1987年被选入《世界文化遗产》名录，亦为2024年7月27日所入选另一项世界遗产“北京中轴线——中国理想都城秩序的杰作”的一部分。故宫现为故宫博物院，藏品主要以明、清两代宫廷收藏为基础，是国家一级博物馆。故宫南北长961米，东西宽753米，四面围有高10米的城墙，外有59米宽的护城河环绕。有四座城门，南面为午门，北面为神武门，东面为东华门，西面为西华门。城墙的四角，各有一座风姿绰约的角楼，民间有九梁十八柱七十二条脊之说，来形容其结构的复杂。城内的建筑分为外朝和内廷两部分。外朝的中心为太和殿、中和殿、保和殿，统称三大殿，是国家举行大典礼的地方。三大殿左右两翼辅以文华殿、武英殿两组建筑。内廷的中心是乾清宫、交泰殿、坤宁宫，统称后三宫，是皇帝和皇后居住的正宫。其后为御花园。后三宫两侧排列着东、西六宫，是后妃们居住休息的地方。东六宫东侧是天穹宝殿等佛堂建筑，西六宫西侧是中正殿等佛堂建筑。外朝、内廷之外还有外东路、外西路两部分建筑。",
        image: "../imgRes/紫禁城1.png",        // 滚动栏使用（标记1）
        detailImage: "../imgRes/紫禁城2.png", // 详情页使用（标记2）
        unlocked: true // Default unlocked
    },
    {
        id: 2,
        name: "天坛",
        description: "天坛，位于北京市东城区，是明清两朝皇帝祭天、祈谷和祈雨的场所。天坛始建于明成祖永乐十八年（公元1420年），原名“天地坛”，明嘉靖九年（公元1530年）在北京北郊另建祭祀地神的地坛，并改名为“天坛”。天坛占地约273万平方米，是故宫面积的四倍，是现存中国古代规模最大、伦理等级最高的祭祀建筑群。1961年，天坛被国务院公布为第一批全国重点文物保护单位之一。1998年，“北京皇家祭坛—天坛”被列为世界文化遗产，亦为2024年7月27日所入选的另一项世界遗产“北京中轴线——中国理想都城秩序的杰作”的一部分。现时天坛公园还包括九坛八庙中的祈谷坛。[1]天坛布局严谨，建筑结构独特，装饰瑰丽，巧妙地运用力学、声学和几何学等原理，在历史、科学和文化上均有重要意义。[2]",
        image: "../imgRes/天坛1.png",
        detailImage: "../imgRes/天坛2.png",
        unlocked: false
    },
    {
        id: 3,
        name: "布达拉宫",
        description: "布达拉宫坐落在中华人民共和国西藏自治区首府拉萨市区西北的玛布日山（红山）上，是一座规模宏大的宫殿式建筑群，最初是吐蕃王朝赞普松赞干布兴建。于17世纪重建后，成为历代达赖喇嘛的冬宫居所，为西藏政教合一的统治中心。整座宫殿具有鲜明的藏族风格，依山而建，气势雄伟。宫中收藏了无数的珍宝，为一座艺术殿堂。1961年纳入中华人民共和国国务院第一批全国重点文物保护单位。1994年，布达拉宫列入世界文化遗产。布达拉宫依山垒砌，蜿蜒直至山顶，宫域几乎占据了整座山峰。宫内群楼耸峙，殿宇巍峨，金顶辉煌，气势雄伟，充分体现了藏式建筑的特色。主楼高117.2米，东西长360米，南北宽140米。从外观看有十三层，实际只有九层，下方的四层是由岩石向上砌筑的地垅墙，起支撑作用。整座布达拉宫有房屋近万间，全部为木石结构，建筑面积约13万平方米。宫殿外墙用大块花岗石砌筑，厚度2至5米，部分墙体夹层内还灌注铁汁，更加坚固。布达拉宫的主体建筑由三部分组成。红宫居中，东连白宫，西接扎厦，三者相互贯通，浑然一体。宫殿在平面上是由许多矩形房屋拼合而成的，结构十分复杂。在纵向上，各种房屋高低错落，前后参差有致，主次分明。建筑的外部都用红、白、黄三色粉刷，象征威严、恬静和圆满，色彩和样式都具有鲜明的藏传佛教特征。白宫因外墙为白色而得名。它是达赖喇嘛生活、起居的场所，共有七层。最顶层是达赖喇嘛的寝宫“日光殿”，殿内有一部分屋顶敞开，阳光可以射入，晚上再用蓬布遮住，因此得名。日光殿分东西两部分，西日光殿（尼悦索朗列吉）是原殿，东日光殿（甘丹朗色）是后来仿造的，两者布局相仿，分别是十三世和十四世达赖喇嘛的寝宫，也是他们处理政务的地方。这里等级森严，只有高级僧俗官员才被允许进入。殿内包括朝拜堂、经堂、习经室和卧室等，陈设均十分豪华。红宫位于布达拉宫的中央位置，外墙为红色。宫殿采用了曼荼罗布局，围绕着历代达赖的灵塔殿建造了许多经堂、佛殿，从而与白宫连为一体。最初是尺尊公主从尼泊尔带来的工匠设计建造的。",
        image: "../imgRes/布达拉宫1.jpg",
        detailImage: "../imgRes/布达拉宫2.jpg",
        unlocked: false
    },
    {
        id: 4,
        name: "黄鹤楼",
        description: "黄鹤楼位于中华人民共和国湖北省武汉市武昌蛇山上，与湖南岳阳楼、江西滕王阁合称江南三大名楼，是中国国家旅游胜地四十佳之一。黄鹤楼被称为“天下绝景”，这一称谓源自宋徽宗的一幅画“天下绝景黄鹤楼”。始建于三国时代吴黄武二年（公元223年），自初代开始，距今已有1800年历史，历代屡修屡毁，上一代为三层式，毁于1884年，黄鹤楼原址靠近江边，被选用为武汉长江公铁两用大桥的引桥起点，现在的黄鹤楼是于1985年异址重建的。最新一代版黄鹤楼共5层，高51.4米。黄鹤楼原址在湖北省武昌蛇山黄鹤矶头，始建于三国时代东吴黄武二年（223年）。《元和郡县图志》记载：孙权始筑夏口故城，“城西临大江，江南角因矶为楼，名黄鹤楼。”是为了军事目的而建。而据《极恩录》记载说原为辛氏开设的酒店[1]。唐永泰元年（765年），黄鹤楼已具规模，然而兵火频繁，黄鹤楼屡建屡废，仅在明清两代，就被毁7次，重建和维修了10次。有“国运昌则楼运盛”之说。明洪武四年至十四年（1371~1381），江夏侯周德兴主持湖广时重建黄鹤楼。成化年间，都御史吴琛修葺。嘉靖四十五年（1566），楼毁于火灾。隆庆五年（1571），都御史刘悫重建黄鹤楼。[2]清康熙二十年（1681），楼遭雷击起火，被及时扑灭。康熙四十一年（1702），楼再遭雷击后坍塌，后总督喻成龙、巡抚刘殿衡主持重建。后有多次修葺。咸丰六年（1856），黄鹤楼毁于太平军战火。同治七年（1868），总督官文、李瀚章，巡抚郭伯荫主持重建黄鹤楼。光绪十年（1884），黄鹤楼火灾被焚，仅存攒尖铜顶。[2]黄鹤楼从北宋至1950年代，还曾作为道教的名山圣地，是吕洞宾传道、修行、教化的道场。《道藏·历世真仙体道通鉴》言 ：“吕祖以五月二十日登黄鹤楼，午刻升天而去。故留成仙圣迹。”《全真晚坛课功经》中称其为“黄鹤楼头留圣迹”。古黄鹤楼“凡三层，计高九丈二尺，加铜顶七尺，共成九九之数”。1957年建长江大桥武昌引桥时，拆除黄鹤楼遗址上废墟，并占用了黄鹤楼旧址作为桥基，1981年10月武汉市政府决定根据历史资料重建黄鹤楼，专家决定在距旧址约1千米左右的蛇山峰岭上重建新的黄鹤楼。1985年6月，经百年后又重新落成，成为武汉市的标志性建筑。新楼共五层，加5米高的葫芦形宝顶，高51.4米，攒尖顶，层层飞檐，比古楼高出将近20米。古楼底层“各宽15米”，而新楼底层则是各宽30米。现代版本整个楼体都是用钢筋混凝土建成的仿古建筑，内有电梯方便老弱残疾。新黄鹤楼的楼层内外绘有以仙鹤为主体，云纹、花草、龙凤等为陪衬的图案。第一层大厅的正面墙壁，是一幅以“白云黄鹤”为主题的巨大陶瓷壁画。两旁立柱上悬挂着长7米的楹联：爽气西来，云雾扫开天地撼；大江东去，波涛洗净古今愁。第二层是用大理石镌刻的《黄鹤楼记》，记述了楼的兴废沿革和名人轶事。此外还有“孙权筑城”、“周瑜设宴”等壁画。第三层大厅内是“绣画像”壁画，描绘了中国古代诗人李白、白居易、陆游、岳飞等人的形像，摘录了他们吟咏黄鹤楼的名句。现在的黄鹤楼被改建为黄鹤楼公园，在主楼周围还建有胜象宝塔、碑廊、山门等建筑，占地约150亩。楼前牌坊上写“三楚一楼”四个大字，楼台基旁立有两座碑亭，石碑上记载着重建黄鹤楼的业绩与今人写的“重修黄鹤楼记”。2003年2月，黄鹤楼开始进行1985年重建以来的首次大规模整修。此次整修主要是对楼顶的四块牌匾进行维修，在保持字迹不变的情况下对牌匾重新复制。黄鹤楼游客如欲参观黄鹤楼，需缴付入场费。2017年时入场费为人民币80元。 2023年7月，成人票价：70元，提前一天手机购票65元。学生、60-65岁老人、6-18岁儿童半价35元。65岁以上老人，6岁以下儿童免票。现存版本黄鹤楼于2023年被列入“第六批武汉市文物保护单位推荐申报名录”[3]，但最终未列入第六批武汉市文物保护单位[4]。",
        image: "../imgRes/黄鹤楼1.png",
        detailImage: "../imgRes/黄鹤楼2.png",
        unlocked: false
    },
    {
        id: 5,
        name: "长城",
        description: "长城是在中国大陆华北一带历朝修筑的大规模军用隔离墙的统称，在古代曾抵御不同时期来自塞北的游牧帝国和部落联盟的侵袭。长城并非单一结构，而是分成多节矗立于险要之处，并设有多个关口，实际上亦是帝国边境经济贸易的重要一环[2][3]，东西段与前后关卡加总起来可绵延上万华里（约4500-6000公里），因此又称作万里长城。现存的长城遗迹主要为始建于14世纪的明长城，西起嘉峪关，东至虎山长城，长城遗址跨越吉林、辽宁、北京、天津、山西、陕西、宁夏、甘肃等15个省市自治区，总计有43,721处长城遗产，长城也是自人类文明以来最巨大的建筑物。1961年起，一批长城重要点段被陆续公布为全国重点文物保护单位。1987年，长城被联合国教科文组织列为世界文化遗产，该遗产目前不仅包含上述15个省、市、自治区境内的长城，还额外包括了湖南和四川境内的苗疆长城（南长城）等[4]。2012年，国家文物局完成了长城资源认定工作，将春秋战国至明朝等各时代修筑的长城墙体、敌楼、壕堑、关隘、城堡以及烽火台等相关历史遗存认定为长城资源，将其他具备长城特征的文化遗产纳入《长城保护条例》的保护范畴。根据认定结论，各时代长城资源分布于北京、天津、河北、山西、内蒙古、辽宁、吉林、黑龙江、山东、河南、陕西、甘肃、青海、宁夏、新疆15个省（自治区、直辖市）404个县（市/区）。认定数据如下：各类长城资源遗存总数43,721处（座/段），其中墙体10,051段，壕堑/界壕1,764段，单体建筑29,510座，关、堡2,211座，其他遗存185处。墙壕遗存总长度21,196.18千米。[5]",
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

// Sync progress with backend
async function syncProgressWithBackend() {
    try {
        const response = await fetch('../backend/api/building/getProgress.php');
        if (!response.ok) return false;
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return false;
        
        const result = await response.json();
        if (result.status === 'error') return false;

        // Get progress data from response structure
        // Structure is: { status: 'success', data: { username: '...', progress: { ... } } }
        const progressData = result.data && result.data.progress ? result.data.progress : result;

        // Map backend fields to IDs
        const mapping = {
            'ForbiddenCity': 1,
            'TempleOfHeaven': 2,
            'PotalaPalace': 3,
            'YellowCraneTower': 4,
            'GreatWall': 5
        };

        const currentBuildings = getBuildings();
        let changed = false;

        for (const [key, id] of Object.entries(mapping)) {
            if (progressData[key] !== undefined) {
                // Handle various boolean representations (1, "1", true, "true")
                const val = progressData[key];
                const isUnlocked = (val == 1 || val === 'true' || val === true);
                
                const building = currentBuildings.find(b => b.id === id);
                if (building && building.unlocked !== isUnlocked) {
                    building.unlocked = isUnlocked;
                    changed = true;
                }
            }
        }

        if (changed) {
            saveBuildings(currentBuildings);
            return true;
        }
    } catch (e) {
        console.error('Failed to sync progress:', e);
    }
    return false;
}

// Cookie Helpers
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getUserSession() {
    let cookieValue = getCookie('user_session');
    if (!cookieValue) return null;
    try {
        // Try decoding once
        let decoded = decodeURIComponent(cookieValue);
        // Try parsing
        try {
            return JSON.parse(decoded);
        } catch (e) {
            // Try decoding again (double encoded)
            return JSON.parse(decodeURIComponent(decoded));
        }
    } catch (e) {
        console.error('Error parsing user session:', e);
        return null;
    }
}

function updateAuthUI() {
    const authLink = document.querySelector('.auth-link');
    if (!authLink) return;

    const session = getUserSession();
    if (session && session.username) {
        authLink.textContent = `您好(${session.username})_点击退出`;
        authLink.href = "#";
        
        // Remove any existing event listeners by cloning (simple way) or just setting onclick
        // Since this runs once on init, onclick is fine.
        authLink.onclick = (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                // Clear cookie
                document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                // Also try clearing with /code/ path just in case, or current path
                const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                document.cookie = `user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
                
                window.location.reload();
            }
        };
    }
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

// Update progress to backend
async function updateProgressToBackend(buildingId, isUnlocked) {
    try {
        const formData = new FormData();
        formData.append('building_id', buildingId);
        formData.append('unlocked', isUnlocked);

        const response = await fetch('../backend/api/building/updateProgress.php', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Progress saved to backend:', result);
        }
    } catch (e) {
        console.error('Failed to save progress to backend:', e);
    }
}

function initHomePage() {
    updateAuthUI();
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

    // Sync with backend and re-render if needed
    syncProgressWithBackend().then(changed => {
        if (changed) {
            renderList();
        }
    });

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

            // Update backend
            updateProgressToBackend(toUnlock.id, true);

            // Update UI - 保持地图显示，只更新解锁状态
            playBtn.disabled = false;
            renderList();
        }, 2000);
    });
}

function setupAutoScroll(repeats = 2) {
    const container = document.getElementById('building-list');
    if (!container) return;

    const originalHeight = container.scrollHeight / repeats;
    const resetAt = originalHeight * (repeats - 1);
    let speed = 0.6; // 每帧滚动像素（约 60fps）
    let rafId;

    function step() {
        container.scrollTop += speed;
        if (container.scrollTop >= resetAt) {
            container.scrollTop = 0;
        }
        rafId = requestAnimationFrame(step);
    }

    if (rafId) cancelAnimationFrame(rafId);
    step();

    // 悬停暂停，移出继续
    container.addEventListener('mouseenter', () => { speed = 0; });
    container.addEventListener('mouseleave', () => { speed = 0.6; });
}

async function initDetailPage() {
    // Sync with backend first to ensure we have the latest unlock status
    await syncProgressWithBackend();

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

    // Chat Logic
    const chatInput = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const messagesContainer = document.getElementById('ai-messages');

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, true);
        chatInput.value = '';

        // Send to AI
        // Get current building ID from URL
        const params = new URLSearchParams(window.location.search);
        const buildingId = parseInt(params.get('id')) || 0;
        
        await sendToAI(text, buildingId);
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
}

// Send message to AI Backend
async function sendToAI(text, buildingId) {
    const messagesContainer = document.getElementById('ai-messages');
    if (!messagesContainer) return;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.textContent = "正在思考...";
    loadingDiv.id = 'ai-loading';
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch('../backend/api/ai/chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                building_id: buildingId
            })
        });

        // Remove loading
        const loadingEl = document.getElementById('ai-loading');
        if (loadingEl) loadingEl.remove();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        
        if (result.status === 'success') {
            msgDiv.textContent = result.reply;
        } else {
            msgDiv.textContent = "抱歉，AI 暂时无法回答: " + (result.message || "未知错误");
            msgDiv.style.color = "#a83636";
        }
        
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (e) {
        console.error('AI Chat Error:', e);
        // Remove loading if still exists
        const loadingEl = document.getElementById('ai-loading');
        if (loadingEl) loadingEl.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        msgDiv.textContent = "网络连接失败，请检查后端服务。";
        msgDiv.style.color = "#a83636";
        messagesContainer.appendChild(msgDiv);
    }
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
