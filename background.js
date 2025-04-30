// 后台 Service Worker

// 扩展首次安装或更新时执行初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log("Dejavu 导航 Service Worker 已安装。");
  // 可在此设置默认存储或其他初始化逻辑
});

// 监听来自其他脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("后台收到消息:", message);
  if (message.type === 'CACHE_FAVICON_REQUEST') {
    // TODO: 实现 Favicon 缓存逻辑
    console.log(`收到缓存 ${message.url} Favicon 的请求（待实现）`);
    // 若后续为异步操作，需要 return true;
  }
});

console.log("Dejavu 导航 Service Worker 已运行。");