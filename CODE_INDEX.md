# 项目代码索引 (Code Index)

本文档旨在提供项目文件结构的概览及各文件的功能说明，方便开发者快速了解项目结构。

## 目录结构

### 📂 backend (后端)
后端主要采用 PHP 开发，提供 RESTful API 接口供前端调用。

#### 📂 api
*   **📂 admin** (管理员相关接口)
    *   `addUser.php`: 添加新用户接口。
    *   `checkAdminAuth.php`: 检查管理员权限的公共函数库。
    *   `deleteUser.php`: 删除用户接口。
    *   `getUsers.php`: 获取用户列表接口（支持分页和搜索）。
    *   `updateUser.php`: 更新用户信息（密码等）接口。
    *   `updateUserProgress.php`: 管理员手动更新用户关卡进度的接口。
*   **📂 ai** (AI 交互接口)
    *   `chat.php`: 处理与 AI 模型的对话请求，读取本地文本作为上下文。
*   **📂 building** (建筑/关卡相关接口)
    *   `getProgress.php`: 获取当前登录用户的建筑解锁进度。
    *   `updateProgress.php`: 用户在前端解锁关卡后，同步进度到数据库的接口。
*   **📂 comment** (评论系统接口)
    *   `addComment.php`: 添加新评论。
    *   `getComments.php`: 获取评论列表。
*   **📂 user** (用户认证相关接口)
    *   `logincheck.php`: 用户登录验证接口（处理普通用户和管理员登录）。
    *   `register.php`: 用户注册接口。
*   **公共文件**
    *   `connectvars.php`: 数据库连接配置常量。
    *   `constants.php`: 项目通用常量定义。
    *   `function.php`: 通用辅助函数库（响应处理、数据库连接、用户认证）。

### 📂 database (数据库)
*   `user.sql`: 数据库初始化脚本，包含 `userAccount` 和 `adminAccount` 表结构及初始数据。

### 📂 frontend (前端)
前端采用原生 HTML/CSS/JavaScript 开发。

*   `index.html`: 网站首页，展示建筑列表和进入游戏的入口。
*   `detail.html`: 建筑详情页，展示建筑详细介绍和图片。
*   `login.html`: 用户登录页面。
*   `register.html`: 用户注册页面。
*   `styles.css`: 全局样式表，定义了页面的整体布局和视觉风格。
*   `script.js`: 核心业务逻辑脚本，包含：
    *   建筑数据定义。
    *   首页滚动和交互逻辑。
    *   详情页渲染逻辑。
    *   **关键功能**: `syncProgressWithBackend` (同步进度), `updateProgressToBackend` (保存进度), `updateAuthUI` (用户状态显示)。

#### 📂 admin (管理员后台前端)
*   `index.html`: 管理员后台主页。
*   **📂 css**
    *   `admin.css`: 管理员后台专用样式表。
*   **📂 js**
    *   `admin.js`: 管理员后台逻辑，包含用户列表加载、添加/删除用户、修改进度等功能的实现。

#### 📂 js (其他脚本)
*   `login-new.js`: 登录页面的逻辑脚本，处理登录请求、验证码校验及登录后的跳转（包含清除旧缓存逻辑）。
*   `register.js`: 注册页面的逻辑脚本，处理注册请求和验证码。

#### 📂 text (文本资源)
*   存放各建筑的详细描述文本文件，用于 AI 对话上下文。

### 📂 imgRes / gameImgRes (资源)
*   存放项目所需的图片资源（建筑图片、游戏素材等）。

## 关键逻辑说明

### 1. 用户认证与权限
*   **登录**: 前端通过 `login-new.js` 发送请求至 `logincheck.php`。成功后后端设置 `user_session` Cookie。
*   **状态保持**: 前端通过 `script.js` 中的 `getUserSession()` 解析 Cookie 显示用户信息。
*   **管理员权限**: 后端 API 通过 `checkAdminAuth.php` 验证 Cookie 中的管理员标识。

### 2. 关卡进度同步
*   **读取**: 用户访问首页时，`script.js` 调用 `getProgress.php`，将数据库中的进度同步到本地 `localStorage` 和页面显示。
*   **更新**: 用户在小游戏中解锁建筑后，`script.js` 调用 `updateProgress.php` 实时更新数据库。
*   **防冲突**: 用户登录时 (`login-new.js`) 会强制清除本地旧缓存，确保多用户环境下数据准确。
