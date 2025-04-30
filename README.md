# Dejavu 导航

一款基于 Chrome, Edge 扩展的快速导航工具。

## 功能特性

- 快速导入/导出多分组导航链接  
- 支持从另一插件的扁平 JSON 导出兼容导入  
- 动态生成响应式网格布局，支持触摸滑动切换标签  
- 异步存储到 `chrome.storage.local` 与 `localStorage`  
- 简洁绘图面板（Canvas 绘图）  
- 中英文界面、主题跟随系统或自定义切换  

## 安装方法

1. 克隆或下载本仓库：  
   ```bash
   git clone https://github.com/buynonsense/Dejavu.git
   cd Dejavu
   ```
2. 在 Chrome/Edge 浏览器中打开扩展管理页（`chrome://extensions/` 或 `edge://extensions/`）。  
3. 开启“开发者模式”，点击“加载已解压的扩展程序”，选择本项目根目录。  
4. 安装完成后，点击浏览器工具栏图标即可使用。

## 使用说明

1. 点击右上角 “导入” 按钮，选择符合格式的 JSON 文件。  
2. 在标签页间滑动或点击标签按钮切换分组。  
3. 点击链接图标打开对应 URL；支持在新标签页中打开。  
4. 点击右上角 “导出” 按钮，将当前导航数据导出为 JSON。  
5. 点击 “绘图” 按钮，可在 Canvas 上随意涂鸦并保存。

## 开发指南

- 目录结构  
  ```
  Dejavu/
  ├─ background.js    // 后台 Service Worker  
  ├─ popup.html       // 弹出页 HTML  
  ├─ popup.js         // 弹出页逻辑  
  ├─ style.css        // 弹出页样式  
  ├─ manifest.json    // 扩展清单  
  └─ icons/           // 图标资源  
  ```
- 本地调试：修改代码后在扩展管理页点击“刷新”即可。  
- 发布新版本：修改 `manifest.json` 中 `version` 字段，并在 Release Notes 中添加更新项。

## 许可证

MIT License 