# 中国古代建筑成就网站

## 项目介绍

本项目是一个展示中国古代建筑文化的网站，涵盖了民居、官府、皇宫、桥梁四大类建筑。网站采用前后端分离的架构，为用户提供丰富的建筑文化内容和良好的交互体验。

## 技术栈

### 前端技术
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript ES6+** - 交互功能
- **响应式设计** - 适配多种设备

### 后端技术
- **PHP** - 服务器端开发
- **MySQL** - 数据存储
- **RESTful API** - 前后端数据交互

## 功能特性

### 用户功能
- ✅ 用户注册与登录
- ✅ 建筑展示与分类浏览
- ✅ 建筑搜索功能
- ✅ 分页浏览
- ✅ 响应式设计

### 管理功能
- ✅ 管理员登录
- ✅ 建筑信息管理（增删改查）
- ✅ 数据统计面板
- ✅ 用户管理（预留）

## 项目结构

```
ancient-chinese-architecture/
├── frontend/                 # 前端文件
│   ├── index.html           # 首页
│   ├── login.html           # 登录页
│   ├── register.html        # 注册页
│   ├── admin/               # 管理后台
│   │   └── index.html       # 管理首页
│   ├── css/                 # 样式文件
│   │   ├── common.css       # 通用样式
│   │   ├── index.css        # 首页样式
│   │   ├── auth.css         # 认证页面样式
│   │   └── admin.css        # 后台样式
│   ├── js/                  # JavaScript文件
│   │   ├── common.js        # 通用功能
│   │   ├── index.js         # 首页功能
│   │   ├── login.js         # 登录功能
│   │   ├── register.js      # 注册功能
│   │   └── admin/           # 后台功能
│   │       └── admin.js     # 管理后台功能
│   └── images/              # 图片资源
│
├── backend/                 # 后端文件
│   ├── config/              # 配置文件
│   │   └── database.php     # 数据库配置
│   ├── api/                 # API接口
│   │   ├── user/            # 用户相关接口
│   │   ├── building/        # 建筑相关接口
│   │   └── admin/           # 管理员接口
│   ├── includes/            # 公共函数
│   └── uploads/             # 上传文件
│
├── database/                # 数据库文件
│   ├── create_tables.sql    # 建表SQL
│   └── sample_data.sql      # 示例数据
│
└── docs/                    # 项目文档
```

## 快速开始

### 1. 环境要求
- PHP 7.4+
- MySQL 5.7+
- Apache/Nginx Web服务器
- 支持PHP的Web环境（如XAMPP、WAMP等）

### 2. 安装步骤

#### 步骤1：配置Web环境
1. 安装XAMPP或WAMP等集成环境
2. 启动Apache和MySQL服务

#### 步骤2：创建数据库
```sql
-- 创建数据库
CREATE DATABASE ancient_architecture;

-- 使用数据库
USE ancient_architecture;

-- 执行建表SQL文件
SOURCE database/create_tables.sql;

-- 插入示例数据
SOURCE database/sample_data.sql;
```

#### 步骤3：配置数据库连接
编辑 `backend/config/database.php` 文件，修改数据库连接信息：
```php
$host = 'localhost';          // 数据库主机
$username = 'root';          // 数据库用户名
$password = '';              // 数据库密码
$database = 'ancient_architecture';  // 数据库名
```

#### 步骤4：部署项目
1. 将整个项目文件夹复制到Web服务器根目录
2. 确保服务器有写入权限（用于文件上传）
3. 访问 `http://localhost/ancient-chinese-architecture/`

### 3. 默认账户
- **管理员账号**: admin
- **管理员密码**: password
- **普通用户**: testuser / password

## 主要页面

### 前台页面
1. **首页** (`index.html`) - 建筑展示和搜索
2. **登录页** (`login.html`) - 用户登录
3. **注册页** (`register.html`) - 用户注册

### 后台页面
1. **管理首页** (`admin/index.html`) - 数据统计和管理入口
2. **建筑管理** - 建筑信息的增删改查
3. **用户管理** - 用户信息管理（预留）
4. **评论管理** - 评论内容管理（预留）

## API接口

### 用户相关接口
- `POST /api/user/register.php` - 用户注册
- `POST /api/user/login.php` - 用户登录
- `GET /api/user/profile.php` - 获取用户信息

### 建筑相关接口
- `GET /api/building/list.php` - 获取建筑列表
- `GET /api/building/detail.php` - 获取建筑详情
- `GET /api/building/categories.php` - 获取建筑分类

### 管理员接口
- `POST /api/admin/login.php` - 管理员登录
- `GET /api/admin/buildings.php` - 获取建筑列表（管理用）
- `POST /api/admin/building.php` - 添加/编辑建筑
- `DELETE /api/admin/building.php` - 删除建筑

## 数据库设计

### 主要数据表
- `users` - 用户表
- `admins` - 管理员表
- `buildings` - 建筑信息表
- `building_categories` - 建筑分类表
- `comments` - 评论表
- `likes` - 点赞表

### 建筑分类
1. **民居** - 四合院、土楼等传统民居
2. **官府** - 衙门、府邸等官方建筑
3. **皇宫** - 紫禁城等皇家建筑
4. **桥梁** - 赵州桥等古代桥梁

## 开发规范

### 前端开发
- 使用ES6+语法
- 采用模块化编程
- 遵循响应式设计原则
- 注重用户体验

### 后端开发
- 使用面向对象编程
- 遵循RESTful API设计
- 注重安全性（SQL注入、XSS防护）
- 统一返回JSON格式数据

### 代码规范
- 使用有意义的变量名
- 添加必要的注释
- 保持代码整洁
- 遵循MVC架构模式

## 安全特性

- 密码使用bcrypt加密存储
- SQL注入防护
- XSS攻击防护
- CSRF攻击防护
- 文件上传安全检查
- 用户输入验证

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目作者：[您的姓名]
- 邮箱：[您的邮箱]
- 项目链接：[项目地址]

## 更新日志

### v1.0.0 (2025-12-10)
- 完成基础功能开发
- 实现用户注册登录
- 实现建筑展示和搜索
- 实现后台管理功能
- 完成响应式设计

---

**注意**: 这是一个学习项目，主要用于课程设计演示。在实际生产环境中使用前，请确保进行充分的安全测试和性能优化。