// 由于 popup 脚本在 DOM 准备就绪后运行，因此移除了 DOMContentLoaded 包装器

const importNavBtn = document.getElementById("import-nav-btn");
const exportNavBtn = document.getElementById("export-nav-btn");
const navContainer = document.getElementById("quick-nav-container");
const fileInput = document.getElementById("import-file-input");
const tabsContainer = document.getElementById("tabs-container");
const addTabBtn = document.getElementById("add-tab-btn");
const localStorageKey = "quickNavData"; // localStorage 的键
const quoteDisplayElement = document.getElementById("quote-display"); // 获取名言显示元素
const mainContentElement = document.querySelector(".main-content"); // 获取主内容区域元素
const quickNavGrid = document.getElementById("quick-nav-container"); // 获取网格元素
const drawButton = document.getElementById("draw-btn"); // 绘画按钮
const drawingOverlay = document.getElementById("drawing-overlay"); // 绘画覆盖层
const closeDrawButton = document.getElementById("close-draw-btn"); // 关闭绘画按钮
const drawingCanvas = document.getElementById("drawing-canvas"); // Canvas 元素

let appData = null; // 全局存储解析后的 JSON 数据
let currentSelectedGroup = null; // 跟踪当前选定的分组

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 50; // 最小滑动距离 (像素)
const swipeMaxVertical = 75; // 最大垂直滑动距离，以区分滚动

let ctx = null; // Canvas 2D 上下文
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// --- 名言数组 ---
const quotes = [
    "阿尔伯特·爱因斯坦： “想象力比知识更重要，因为知识是有限的，而想象力概括着世界上的一切，推动着进步，并且是知识进化的源泉。”",
    "巴勃罗·毕加索： “所有你能想象到的都是真实的。”",
    "史蒂夫·乔布斯： “创造力就是连接事物。”",
    "乔治·萧伯纳： “想象力是创造的开始。你想象你渴望的，你将想象的付诸行动，最终你创造了你所意愿的。”",
    "亨利·马蒂斯： “创造力需要勇气。”",
    "玛雅·安吉罗： “你无法用尽创造力。你用得越多，拥有的就越多。”",
    "布鲁斯·加拉布兰特： “创造力不会等待完美的时刻。它从平凡的瞬间塑造出自己的完美时刻。”",
    "托马斯·爱迪生： “要发明，你需要一个好的想象力和一堆废料。”",
    "约翰·杜威： “科学的每一次伟大进步都源于想象力的一种新的大胆尝试。”",
    "卡尔·荣格： “没有这种对幻想的玩味，任何创造性的工作都无法诞生。我们对想象力游戏的亏欠是无法估量的。”",
    "拿破仑·波拿巴： “想象力统治世界。”",
    "J·K·罗琳： “想象力不仅是人类独有的能力，能够构想出不存在的事物——因此也是所有发明和创新的源泉——而且在其最具变革性和启示性的能力方面，它也是使我们能够同情那些我们从未经历过的人类的力量。”",
    "文森特·梵高： “如果你听到内心的声音说‘你不能画画’，那么无论如何都要画，那个声音就会沉默。”",
    "沃尔特·迪士尼： “所有梦想都可以实现，只要我们有勇气去追求。”",
    "大卫·林奇： “消极是创造力的敌人。”",
    "厄休拉·勒古恩： “富有创造力的成年人是幸存下来的孩子。”",
    "安东尼·德·圣-埃克苏佩里： “岩石堆在一个人心中浮现出大教堂的形象的那一刻，就不再仅仅是岩石堆了。”",
    "塞思·戈丁： “如果你失败的次数比别人多，你就赢了。”",
    "史蒂芬·柯维： “活在你的想象中，而不是你的历史里。”",
    "亨利·沃德·比彻： “每一位艺术家都将自己的灵魂浸入画笔，并将自己的本性融入画作之中。”",
    "玛丽·卢·库克： “创造力就是发明、实验、成长、冒险、打破规则、犯错和享受乐趣。”",
    "弗兰克·卡普拉： “直觉是创造力试图告诉你一些事情。”",
    "多萝西·帕克： “创造力是狂野的头脑和有纪律的眼睛。”",
    "史蒂芬·斯皮尔伯格： “用好奇心取代恐惧。”",
    "西尔维娅·普拉斯： “创造力最大的敌人是自我怀疑。”",
    "史蒂夫· jobs： “创造力只是将事物联系起来。”",
    "米开朗琪罗： “每一块石头都有一座雕像在里面，雕塑家的任务就是去发现它。”",
    "尼尔·布卢门撒尔： “当好奇心被激发时，创造力就会流动。”",
    "文森特·梵高： “不要熄灭你的灵感和想象力；不要成为你模型的奴隶。”",
    "艾茵·兰德： “一个有创造力的人的动力来自于渴望成就，而不是渴望击败他人。”",
    "马尔科姆·格拉德威尔： “有远见的人从一张白纸开始，重新想象世界。”",
    "威廉·普洛默： “创造力是将看似不相关的事物联系起来的力量。”",
    "迪·霍克： “在你的头脑的任何角落创造一个空白的空间，创造力将立即填补它。”",
    "詹姆斯·惠斯勒： “艺术家不是为他的劳动而获得报酬，而是为他的远见。”",
    "卡尔·荣格： “你的愿景只有当你能够审视自己的内心时才会清晰。向外看的人在做梦；向内看的人才会觉醒。”",
    "罗伯特·德劳内： “愿景是真正的创造性节奏。”",
    "斯蒂芬·R·柯维： “万物皆被创造两次；先在脑海里；然后在物质世界里。创造力的关键在于从一开始就牢记最终目标，拥有愿景和所需结果的蓝图。”",
    "伊迪丝·华顿： “真正的原创性不在于新的方式，而在于新的视野。”",
    "马克·吐温： “当你的想象力不在状态时，你不能依赖你的眼睛。”",
    "吉尔伯特·K·切斯特顿： “云中城堡没有建筑规则。”",
    "亨利·大卫·梭罗： “这个世界不过是我们想象力的一块画布。”",
    "卡尔·萨根： “想象力常常会把我们带到从未存在过的世界。但没有它，我们将一无所获。”",
    "华莱士·史蒂文斯： “想象力是人类对自然的力量。”",
    "约翰·缪尔： “想象力的力量使我们无限。”",
    "尼尔·盖曼： “想象力是一块肌肉。如果不锻炼，它就会萎缩。”",
    "约瑟夫·茹贝尔： “有想象力而没有学问的人，好比鸟有翅膀而没有脚。”",
    "约瑟夫·艾迪生： “想象力为我们提供了愉悦的景象，并用新奇和惊喜来填补我们思想中的空隙，在那些感官不再活跃的时刻。”",
    "佛陀： “我们即是我们所想。我们的一切都源于我们的思想。有了我们的思想，我们创造了世界。”",
    "路易斯·布努埃尔： “幸运的是，在机遇和神秘之间存在着想象力，它是唯一能保护我们自由的东西，尽管人们一直在试图减少它或彻底消灭它。”",
    "理查德·费曼： “我们的想象力被发挥到了极致，不像小说那样，去想象那些并不真实存在的事物，而是仅仅去理解那些‘是’存在的事物。”",
    "维克多·雨果： “没有什么比一个时机已到的想法更强大了。”",
    "W·萨默塞特·毛姆： “想象力通过练习而增长，与普遍的看法相反，它在成熟的人身上比在年轻人身上更强大。”",
    "琳达·内曼： “白日梦是想象力翱翔的沃土。”",
    "马克思·普朗克： “开拓性的科学家必须拥有生动的直觉想象力，因为新思想不是通过演绎产生的，而是通过艺术性的创造性想象产生的。”",
    "J·K·罗琳： “想象力不仅是人类独有的能力，能够构想出不存在的事物——因此也是所有发明和创新的源泉——而且在其最具变革性和启示性的能力方面，它也是使我们能够同情那些我们从未经历过的人类的力量。”",
    "约瑟夫·康拉德： “只有在人类的想象中，每一项真理才能找到有效且无可否认的存在。想象力，而不是发明，是艺术和生活的至高无上的主人。”",
    "艾米丽·狄金森： “可能的缓慢导火索被点燃。通过想象力。”",
    "拉尔夫·瓦尔多·爱默生： “想象力不是某些人的天赋，而是每个人的健康。”",
    "歌德： “很少有人有想象力去面对现实。”",
    "塞缪尔·约翰逊： “想象力是心灵的眼睛。”",
    "约翰·济慈： “我确信的只有心灵的爱是神圣的，想象力的真实是永恒的。”",
    "查尔斯·F·凯特林： “我们的想象力是我们未来所能拥有的唯一限制。”",
    "温斯顿·丘吉尔： “你创造你自己的宇宙，边走边创造。你的想象力越强，你的宇宙就越丰富多彩。当你停止做梦时，宇宙就不复存在了。”",
    "萨缪尔·泰勒·柯勒律治： “我将主要的想象力视为所有人类感知的活生生的力量和主要动因，并且是有限的心灵中对无限的‘我是’中永恒创造行为的重复。”",
    "莱昂纳多·达·芬奇： “在黑暗中躺在床上，在想象中再次回顾先前研究过的形式的主要线条，或通过巧妙的推测构思的其他值得注意的事物，这绝非小益。”",
    "尤金·德拉克罗瓦： “天才的源泉唯有想象力。”",
    "菲尔·邓肯： “不可能只是想象力不足的产物。”",
    "拉尔夫·杰拉德： “理性可以回答问题，但想象力必须提出问题。”",
    "维克多·雨果： “永远不要被他人有限的想象力所限制。如果你采纳他们的态度，那么可能性将不复存在，因为你已经把它拒之门外了。”",
    "路易斯·巴斯德： “想象力拥抱整个世界，激发进步，孕育进化。”",
    "玛丽亚·蒙台梭利： “只有当人类拥有勇气和力量时，想象力才会变得伟大，并用它来创造。”",
    "谢尔·希尔弗斯坦： “如果你是一个梦想家，请进来。如果你是一个梦想家、一个愿望者、一个撒谎者。一个希望者、一个祈祷者、一个魔豆购买者。如果你是一个假装者，请坐在我的炉火旁。因为我们有一些亚麻色的金色故事要讲。进来！进来！”",
    "诺顿·贾斯特： “如果有什么东西在那里，你只能睁开眼睛才能看到它，但如果它不在那里，你闭上眼睛也能看得一样清楚。这就是为什么想象中的东西往往比真实的东西更容易看到。”",
    "朱尔斯·凡尔纳： “一个人能想象到的任何事情，其他人都能实现。”",
    "拉尔夫·艾利森： “当他们接近我时，他们只看到我的周围环境、他们自己或他们想象中的事物，的确，除了我之外的一切事物。”",
    "诺曼·文森特·皮尔： “在你的脑海中清晰地描绘出自己成功的景象，并牢牢地记住它。永远不要让它褪色。你的思想会努力发展这个景象……不要在你的想象中设置障碍。”",
    "莱蒙尼·斯尼克特： “偶尔望着窗外，胡思乱想并没有什么错，只要那些胡思乱想是你自己的。”",
    "L·M·蒙哥马利： “当你的想象成真时，真是令人愉快，不是吗？”",
    "扬·马特尔： “你越低落，你的思想就越想飞翔。”",
    "华盛顿·欧文： “没有什么比一个好老师更令人兴奋的了，他至少能在一刻钟内激起你的想象力；如果他能做到这一点，那么你就不必担心他会让你保持安静。”",
    "亨利·詹姆斯： “我称那些能够满足自己想象力的人为富有。”",
    "艾伦·图灵： “那些能想象任何事物的人，就能创造出不可能的事物。”",
    "阿兰（埃米尔-奥古斯特·沙提埃）： “人类的状况就是不断地质疑一个又一个神，一个又一个表象，或者更确切地说，一个又一个幻象，始终追求想象的真理，这与表象的真理不同。”",
    "阿诺德·汤因比： “冷漠可以用热情来克服，而热情只能通过两件事来激发：第一，一个能激起想象力的理想；第二，一个将这个理想付诸实践的明确可理解的计划。”",
    "巴鲁赫·斯宾诺莎： “只要一个人想象自己不能做这做那，只要他决心不做；因此，只要他不可能做到。”",
    "贝特朗·罗素： “哲学应该被研究，不是为了寻求任何确定的答案，因为通常情况下，没有确定的答案可以被认为是真实的，而是为了寻求问题本身；因为这些问题扩大了我们对可能性的概念，丰富了我们的智力想象力，并减少了……”",
    "布莱斯·帕斯卡： “想象力支配一切；它创造了美丽、正义和幸福，而这些就是这个世界的一切。”",
    "布伦达·韦兰： “所以你看，想象力需要细细琢磨——漫长、低效、快乐的闲逛、闲荡和修修补补。”",
    "卡尔·桑德堡： “除非我们先做梦，否则什么都不会发生。”",
    "科林·威尔逊： “当我早上睁开眼睛时，我面对的不是世界，而是一百万个可能的世界。”",
    "克里斯·贾米： “超越所有科学、哲学、神学和历史，一个孩子无情的询问才是真正需要的，它提醒我们，我们知道的并不像我们认为的那么多。”",
    "丹尼斯·莱弗托夫： “苦难更容易扼杀想象力，而不是激发它。”",
    "埃莉诺·罗斯福： “我对年轻人说：‘不要停止把生活看作是一场冒险。除非你能够勇敢地、激动地、富有想象力地生活，否则你没有任何安全感。’”",
    "约瑟夫·艾迪生： “想象力为我们提供了愉悦的景象，并用新奇和惊喜来填补我们思想中的空隙，在那些感官不再活跃的时刻。”",
    "约翰·洛克： “想象力是人类理解力的伟大工具。”",
    "伏尔泰： “想象力统治着人类，就像引力统治着物体一样。”",
    "简·奥斯汀： “想象力，是灵魂的精华，是洞察力、发现力和愉悦感的源泉。”",
    "威廉·莎士比亚： “想象力是诗人的眼睛，它能从天堂到地狱，从地球到天空，创造出各种各样的形象。”",
    "塞缪尔·约翰逊： “想象力是一种放荡不羁、漫无边际的能力，不受限制，不耐约束，它总是试图迷惑逻辑学家，混淆界限，打破规则。”",
    "勒内·笛卡尔： “理性离不开想象力。”",
    "塞内卡： “我们因想象而受的苦比因现实而受的苦更多。”",
];

// --- 函数：显示随机名言 ---
function displayRandomQuote() {
    if (quoteDisplayElement && quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteDisplayElement.textContent = quotes[randomIndex];
    } else if (quoteDisplayElement) {
        quoteDisplayElement.textContent = "未能加载名言。"; // 回退文本
    }
}

// --- LocalStorage 函数 ---
function saveDataToLocalStorage() {
    if (appData) {
        try {
            // 如果权限已授予，则使用 chrome.storage.local 存储扩展数据
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [localStorageKey]: appData }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("将数据保存到 chrome.storage.local 时出错:", chrome.runtime.lastError);
                        // 回退或提醒用户
                        alert("无法保存数据到插件存储。");
                    } else {
                        console.log("数据已保存到 chrome.storage.local。");
                    }
                    // 同步保存到 localStorage 作为快速回退
                    try {
                        localStorage.setItem(localStorageKey, JSON.stringify(appData));
                        console.log("数据已同步保存到 localStorage。");
                    } catch (e) {
                        console.error("同步保存到 localStorage 时出错:", e);
                    }
                });
            } else {
                // 如果 chrome.storage 不可用（例如，在扩展环境外测试），则回退到 localStorage
                localStorage.setItem(localStorageKey, JSON.stringify(appData));
                console.log("数据已保存到 localStorage (回退)。");
            }
        } catch (error) {
            console.error("保存数据时出错:", error);
            alert("无法保存数据，可能是存储空间已满或权限问题。");
        }
    }
}

// 修改 loadDataFromLocalStorage 以返回 Promise 并更新 appData
function loadDataFromLocalStorage() {
    return new Promise((resolve) => {
        // 首先尝试 chrome.storage.local
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(localStorageKey, (result) => {
                if (chrome.runtime.lastError) {
                    console.error("从 chrome.storage.local 加载数据时出错:", chrome.runtime.lastError);
                    // 尝试回退到 localStorage
                    loadFromLocalStorageFallback(resolve); // 传递 resolve
                } else if (result && result[localStorageKey]) {
                    try {
                        appData = result[localStorageKey]; // chrome.storage 已解析
                        // 确保顶层 groups 数组存在
                        if (!appData.groups) {
                            appData.groups = (appData.linkgroups?.groups || []).map(name => ({ name, items: [] }));
                            console.warn("Loaded appData missing 'groups', initialized from linkgroups.");
                            // Save updated appData to storage to persist groups
                            saveDataToLocalStorage();
                        }
                        console.log("从 chrome.storage.local 加载的数据:", appData);
                        resolve(true); // 表示成功
                    } catch (error) { // 使用 chrome.storage 不应发生，但这是良好实践
                        console.error("处理来自 chrome.storage.local 的数据时出错:", error);
                        chrome.storage.local.remove(localStorageKey); // 清除可能损坏的数据
                        resolve(false); // 表示失败
                    }
                } else {
                    // chrome.storage 中没有数据，尝试 localStorage 回退
                    loadFromLocalStorageFallback(resolve); // 传递 resolve
                }
            });
        } else {
            // chrome.storage 不可用，直接使用 localStorage 回退
            loadFromLocalStorageFallback(resolve); // 传递 resolve
        }
    });
}

// 回退函数：从标准 localStorage 加载
function loadFromLocalStorageFallback(resolve) { // 接收 resolve
    try {
        const storedData = localStorage.getItem(localStorageKey);
        if (storedData) {
            appData = JSON.parse(storedData);
            // 确保加载的数据也有 groups 数组
            if (!appData.groups) {
                appData.groups = [];
                console.warn("Loaded data was missing 'groups' array, initialized as empty.");
                // Persist updated appData to storage
                saveDataToLocalStorage();
            }
            console.log("从 localStorage (回退) 加载的数据:", appData);
            resolve(true); // 表示成功
        } else {
            console.log("在 localStorage (回退) 中未找到数据。");
            // 如果回退也失败，确保 appData 为 null 或默认值
            if (!appData) { // 只有在 appData 尚未被 chrome.storage 设置时才设置
                // 初始化包含 linkgroups 和空的 groups 数组
                appData = {
                    linkgroups: { groups: ["默认分组"], selected: "默认分组" },
                    groups: [{ name: "默认分组", items: [] }] // 同时初始化 groups
                };
                console.log("初始化默认 appData。");
                // Persist default appData to storage
                saveDataToLocalStorage();
            }
            resolve(false); // 表示未找到数据
        }
    } catch (error) {
        console.error("从 localStorage (回退) 加载或解析数据时出错:", error);
        localStorage.removeItem(localStorageKey); // 清除可能损坏的数据
        // 即使出错，也确保 appData 有一个默认值
        if (!appData) {
            // 初始化包含 linkgroups 和空的 groups 数组
            appData = {
                linkgroups: { groups: ["默认分组"], selected: "默认分组" },
                groups: [{ name: "默认分组", items: [] }] // 同时初始化 groups
            };
            console.log("初始化默认 appData (出错后)。");
            // Persist default appData to storage
            saveDataToLocalStorage();
        }
        resolve(false); // 表示失败
    }
}

// --- 辅助函数：从 URL 生成标题 ---
function generateTitleFromUrl(url) {
    try {
        // 处理 URL 可能无效或只是像 "#" 这样的占位符的情况
        if (!url || url === "#" || !url.startsWith('http')) {
            return url || "无效链接";
        }
        const urlObj = new URL(url);
        let title = urlObj.hostname.replace(/^www\./, "");
        return title;
    } catch (e) {
        console.error("用于生成标题的无效 URL:", url, e);
        return url.length > 30 ? url.substring(0, 27) + '...' : url || "无效链接";
    }
}

// --- 辅助：创建导航项元素 ---
function createNavItemElement(item) {
    const navItem = document.createElement("a");
    navItem.href = item.url;
    navItem.target = "_blank"; // 在新标签页中打开链接
    navItem.classList.add("nav-item");
    navItem.title = `${item.name}\n${item.url}`; // 鼠标悬停显示名称和链接

    const img = document.createElement("img");
    try {
        const domain = new URL(item.url).hostname;
        // 使用谷歌 S2 服务获取 favicon，替代 chrome://favicon
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        console.error(`Invalid URL for favicon: ${item.url}`, e);
        img.src = "icons/icon16.png"; // URL 无效时使用默认图标
    }
    img.alt = item.name;
    img.onerror = () => {
        // Fallback if the favicon service fails or no icon exists
        console.warn(`Favicon load failed for ${item.url}. Falling back to default.`);
        img.src = "icons/icon16.png"; // 使用本地默认图标
        img.style.width = '16px';
        img.style.height = '16px';
    };

    const nameSpan = document.createElement("span");
    let titleText = item.name;
    if (titleText.length > 12) titleText = titleText.slice(0, 12) + '...';
    nameSpan.textContent = titleText;

    navItem.appendChild(img);
    navItem.appendChild(nameSpan);

    navItem.addEventListener('touchstart', handleTouchStart, false);
    navItem.addEventListener('touchmove', handleTouchMove, false);
    navItem.addEventListener('touchend', () => handleTouchEnd(navItem, item), false);

    return navItem;
}

// --- 函数：渲染标签页 ---
function renderTabs() {
    if (!appData || !appData.linkgroups || !appData.linkgroups.groups) {
        console.warn("数据中未找到链接分组。");
        tabsContainer.innerHTML = ""; // 如果没有数据，清除标签
        tabsContainer.appendChild(addTabBtn); // 保留添加按钮
        return;
    }

    const groups = appData.linkgroups.groups;
    if (!currentSelectedGroup || !groups.includes(currentSelectedGroup)) {
        currentSelectedGroup = groups[0] || null;
        if (appData.linkgroups) {
            appData.linkgroups.selected = currentSelectedGroup;
        }
    }

    tabsContainer.innerHTML = "";

    groups.forEach((groupName) => {
        const tabElement = document.createElement("button");
        tabElement.classList.add("tab");
        tabElement.textContent = groupName;
        tabElement.dataset.groupName = groupName;

        if (groupName === currentSelectedGroup) {
            tabElement.classList.add("active");
        }

        tabElement.addEventListener("click", () =>
            switchTab(groupName, false)
        );
        tabsContainer.appendChild(tabElement);
    });

    tabsContainer.appendChild(addTabBtn);
}

// --- 函数：切换标签页 ---
async function switchTab(groupName, triggeredBySwipe = false) {
    if (groupName === currentSelectedGroup) return;

    const previousSelectedGroup = currentSelectedGroup;
    currentSelectedGroup = groupName;

    const tabs = tabsContainer.querySelectorAll(".tab");
    let activeTabElement = null;
    tabs.forEach((tab) => {
        if (tab.dataset.groupName === groupName) {
            tab.classList.add("active");
            activeTabElement = tab;
        } else {
            tab.classList.remove("active");
        }
    });

    if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (appData && appData.linkgroups) {
        appData.linkgroups.selected = groupName;
        saveDataToLocalStorage();
    }

    if (!triggeredBySwipe) {
        await renderNavItems(groupName);
    } else {
        console.log("标签由滑动切换，渲染由滑动逻辑处理。");
    }
}

// --- 函数：添加新分组 ---
async function addGroup() {
    const newGroupName = prompt("请输入新分组的名称:");
    if (newGroupName && newGroupName.trim() !== "") {
        const trimmedName = newGroupName.trim();

        await loadDataFromLocalStorage();

        if (!appData)
            appData = { linkgroups: { groups: [], selected: null } };
        if (!appData.linkgroups)
            appData.linkgroups = { groups: [], selected: null };
        if (!appData.linkgroups.groups) appData.linkgroups.groups = [];

        if (appData.linkgroups.groups.includes(trimmedName)) {
            alert(`分组 "${trimmedName}" 已存在！`);
            return;
        }

        appData.linkgroups.groups.push(trimmedName);
        if (!appData.groups) appData.groups = [];
        appData.groups.push({ name: trimmedName, items: [] });

        const tabElement = document.createElement("button");
        tabElement.classList.add("tab");
        tabElement.textContent = trimmedName;
        tabElement.dataset.groupName = trimmedName;
        tabElement.addEventListener("click", () =>
            switchTab(trimmedName, false)
        );
        tabsContainer.insertBefore(tabElement, addTabBtn);

        await switchTab(trimmedName);
    } else if (newGroupName !== null) {
        alert("分组名称不能为空！");
    }
}

// --- 接口：处理导入的 JSON 数据 ---
async function processImportedData(jsonData) {
    try {
        const parsedData = JSON.parse(jsonData);
        if (
            !parsedData ||
            typeof parsedData !== "object" ||
            !parsedData.linkgroups
        ) {
            throw new Error("无效的 JSON 结构：缺少 'linkgroups' 或格式无效。{}");
        }
        if (!Array.isArray(parsedData.groups) && parsedData.linkgroups.groups && Object.keys(parsedData).some(k => k.startsWith('link') && parsedData[k].parent)) {
            const rawLinks = [];
            Object.entries(parsedData).forEach(([key, val]) => {
                if (key.startsWith('link') && val && typeof val === 'object' && val.url) {
                    rawLinks.push({
                        name: val.title || generateTitleFromUrl(val.url),
                        url: val.url,
                        parent: val.parent,
                        order: typeof val.order === 'number' ? val.order : 0
                    });
                }
            });
            const groups = parsedData.linkgroups.groups.map(groupName => {
                const items = rawLinks
                    .filter(item => item.parent === groupName)
                    .sort((a, b) => a.order - b.order)
                    .map(item => ({ name: item.name, url: item.url }));
                return { name: groupName, items };
            });
            appData = {
                linkgroups: {
                    groups: parsedData.linkgroups.groups,
                    selected: parsedData.linkgroups.selected
                },
                groups
            };
        }
        if (!appData) {
            if (!Array.isArray(parsedData.groups)) {
                throw new Error("导入失败：JSON 文件缺少 'groups' 数组，请使用包含导航数据的正确导出文件。");
            }
            appData = parsedData;
        }
        console.log("导入的数据:", appData);

        currentSelectedGroup = appData.linkgroups.selected || appData.linkgroups.groups[0] || null;
        if (appData.linkgroups) {
            appData.linkgroups.selected = currentSelectedGroup;
        }

        saveDataToLocalStorage();

        renderTabs();
        await renderNavItems(currentSelectedGroup);

    } catch (error) {
        console.error("处理 JSON 数据时出错:", error);
        alert(
            `导入失败：${error.message || "无法解析 JSON 文件或文件格式错误。"
            }`
        );
        await loadDataFromLocalStorage();
        renderTabs();
        await renderNavItems(currentSelectedGroup);
    }
}

// --- 接口：导出 JSON 数据 ---
function handleExportNavigation() {
    if (!appData) {
        alert("无可导出的导航数据。");
        return;
    }
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dejavu-navigation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- 接口：触发文件选择 ---
function handleImportNavigation() {
    console.log("触发导入导航操作...");
    fileInput.value = null;
    fileInput.click();
}

// --- 文件选择事件处理 ---
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== "application/json") {
        alert("请选择一个有效的 JSON 文件 (.json)");
        return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => await processImportedData(e.target.result);
    reader.onerror = (e) => {
        console.error("读取文件时出错:", e);
        alert("读取文件时出错。");
    };
    reader.readAsText(file);
});

// --- 函数：调整网格列布局 ---
function adjustGridColumns() {
    const gridContainer = document.getElementById('quick-nav-container');
    if (gridContainer) {
        gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else {
        console.error('Could not find quick-nav-container to adjust columns.');
    }
}

// --- 函数：渲染导航项 ---
function renderNavItems(groupName) {
    if (!appData) {
        console.error("renderNavItems: appData is not initialized.");
        return;
    }
    if (!appData.groups) {
        appData.groups = (appData.linkgroups?.groups || []).map(name => ({ name, items: [] }));
        console.warn("renderNavItems: Initialized missing 'groups' from linkgroups.");
    }

    const group = appData.groups.find(g => g.name === groupName);
    if (!group) {
        console.warn(`Group "${groupName}" not found.`);
        navContainer.innerHTML = '<p class="info-message">此分组为空。</p>';
        navContainer.style.gridTemplateColumns = '';
        return;
    }

    currentSelectedGroup = groupName;
    navContainer.innerHTML = '';

    if (!group.items || group.items.length === 0) {
        navContainer.innerHTML = '<p class="info-message">此分组为空。</p>';
        navContainer.style.gridTemplateColumns = '';
        return;
    }

    group.items.forEach(item => {
        const navItemElement = createNavItemElement(item);
        navContainer.appendChild(navItemElement);
    });

    requestAnimationFrame(adjustGridColumns);
}

// --- 滑动切换标签页逻辑 ---
function handleTouchStart(event) {
    if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 1) {
        touchEndX = event.touches[0].clientX;
        touchEndY = event.touches[0].clientY;
    }
}

function handleTouchEnd(event) {
    if (!touchStartX || !touchEndX || !quickNavGrid) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (
        Math.abs(deltaX) > swipeThreshold &&
        Math.abs(deltaY) < swipeMaxVertical
    ) {
        const tabs = Array.from(tabsContainer.querySelectorAll(".tab"));
        if (tabs.length < 2) return;

        const currentIndex = tabs.findIndex((tab) =>
            tab.classList.contains("active")
        );
        if (currentIndex === -1) return;

        let nextIndex;
        const direction = deltaX < 0 ? "left" : "right";

        if (direction === "left") {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        const nextTab = tabs[nextIndex];
        const nextGroupName = nextTab?.dataset?.groupName;

        if (
            nextTab &&
            nextGroupName &&
            nextGroupName !== currentSelectedGroup
        ) {
            const slideOutClass =
                direction === "left" ? "slide-out-left" : "slide-out-right";
            quickNavGrid.classList.add(slideOutClass);

            quickNavGrid.addEventListener(
                "transitionend",
                async function handleSlideOutEnd(e) {
                    if (e.propertyName !== 'transform' || e.target !== quickNavGrid) {
                        return;
                    }

                    currentSelectedGroup = nextGroupName;
                    tabs.forEach(tab => {
                        if (tab.dataset.groupName === nextGroupName) {
                            tab.classList.add('active');
                        } else {
                            tab.classList.remove('active');
                        }
                    });
                    nextTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    await loadDataFromLocalStorage();
                    if (appData && appData.linkgroups) {
                        appData.linkgroups.selected = nextGroupName;
                        saveDataToLocalStorage();
                    }

                    await renderNavItems(nextGroupName);

                    const slideFromClass =
                        direction === "left"
                            ? "slide-from-right"
                            : "slide-from-left";
                    quickNavGrid.classList.add(slideFromClass);

                    void quickNavGrid.offsetWidth;

                    requestAnimationFrame(() => {
                        quickNavGrid.classList.remove(
                            "slide-out-left",
                            "slide-out-right",
                            "slide-from-left",
                            "slide-from-right"
                        );
                    });
                },
                { once: true }
            );
        }
    }

    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}

// --- 绘画功能 ---
function initializeCanvas() {
    if (!drawingCanvas) return;
    const overlayRect = drawingOverlay.getBoundingClientRect();
    drawingCanvas.width = overlayRect.width > 0 ? overlayRect.width : 300;
    drawingCanvas.height = overlayRect.height > 0 ? overlayRect.height : 400;

    ctx = drawingCanvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function startDrawing(e) {
    if (!ctx) return;
    isDrawing = true;
    const pos = getMousePos(drawingCanvas, e);
    [lastX, lastY] = [pos.x, pos.y];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function draw(e) {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    const pos = getMousePos(drawingCanvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    [lastX, lastY] = [pos.x, pos.y];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
}

function openDrawingOverlay() {
    if (drawingOverlay) {
        drawingOverlay.style.display = "block";
        requestAnimationFrame(initializeCanvas);
    }
}

function closeDrawingOverlay() {
    if (drawingOverlay) {
        drawingOverlay.style.display = "none";
    }
}

// --- 初始化和事件绑定 ---
async function initializeApp() {
    displayRandomQuote();

    const initialLoadSuccess = await loadDataFromLocalStorage();
    if (initialLoadSuccess) {
        console.log("初始数据加载成功。");
    } else {
        console.log("未找到现有数据或加载失败。已使用默认数据（如果适用）。");
    }
    renderTabs();
    if (appData && appData.linkgroups && appData.linkgroups.groups && !appData.linkgroups.groups.includes(appData.linkgroups.selected)) {
        currentSelectedGroup = appData.linkgroups.groups[0] || null;
        if (appData.linkgroups) appData.linkgroups.selected = currentSelectedGroup;
    } else if (appData && appData.linkgroups) {
        currentSelectedGroup = appData.linkgroups.selected;
    } else {
        currentSelectedGroup = null;
    }

    await renderNavItems(currentSelectedGroup);

    if (importNavBtn) {
        importNavBtn.addEventListener("click", handleImportNavigation);
    }
    if (exportNavBtn) {
        exportNavBtn.addEventListener("click", handleExportNavigation);
    }
    if (addTabBtn) {
        addTabBtn.addEventListener("click", addGroup);
    }

    if (mainContentElement) {
        mainContentElement.addEventListener(
            "touchstart",
            handleTouchStart,
            { passive: true }
        );
        mainContentElement.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        mainContentElement.addEventListener("touchend", handleTouchEnd);
    } else {
        console.warn("未找到用于滑动绑定的主内容元素。");
    }

    if (drawButton) {
        drawButton.addEventListener("click", openDrawingOverlay);
    } else {
        console.warn("未找到绘画按钮。");
    }
    if (closeDrawButton) {
        closeDrawButton.addEventListener("click", closeDrawingOverlay);
    } else {
        console.warn("未找到关闭绘画按钮。");
    }

    if (drawingCanvas) {
        drawingCanvas.addEventListener("touchstart", startDrawing, { passive: false });
        drawingCanvas.addEventListener("touchmove", draw, { passive: false });
        drawingCanvas.addEventListener("touchend", stopDrawing);
        drawingCanvas.addEventListener("touchcancel", stopDrawing);

        drawingCanvas.addEventListener("mousedown", startDrawing);
        drawingCanvas.addEventListener("mousemove", draw);
        drawingCanvas.addEventListener("mouseup", stopDrawing);
        drawingCanvas.addEventListener("mouseleave", stopDrawing);
    } else {
        console.warn("未找到绘画 canvas 元素。");
    }
}

initializeApp();
