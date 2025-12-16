-- 中国古代建筑成就网站数据库结构
-- 创建时间: 2025-12-10

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ancient_architecture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ancient_architecture;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
    real_name VARCHAR(50) COMMENT '真实姓名',
    gender ENUM('男', '女', '保密') DEFAULT '保密' COMMENT '性别',
    avatar VARCHAR(255) COMMENT '头像路径',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常，0禁用'
) COMMENT '用户表';

-- 管理员表
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '管理员用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
    real_name VARCHAR(50) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常，0禁用',
    role ENUM('超级管理员', '普通管理员') DEFAULT '普通管理员' COMMENT '管理员角色'
) COMMENT '管理员表';

-- 建筑分类表
CREATE TABLE building_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用'
) COMMENT '建筑分类表';

-- 建筑信息表
CREATE TABLE buildings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '建筑名称',
    category_id INT NOT NULL COMMENT '分类ID',
    description TEXT COMMENT '建筑描述',
    content TEXT COMMENT '详细介绍',
    image VARCHAR(255) COMMENT '主图片',
    images JSON COMMENT '多张图片(JSON格式)',
    location VARCHAR(200) COMMENT '地理位置',
    dynasty VARCHAR(50) COMMENT '朝代',
    year_built VARCHAR(50) COMMENT '建造年份',
    architect VARCHAR(100) COMMENT '建筑师',
    features JSON COMMENT '建筑特色(JSON格式)',
    history TEXT COMMENT '历史沿革',
    protection_level VARCHAR(50) COMMENT '保护级别',
    visit_info TEXT COMMENT '参观信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1发布，0草稿',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    author_id INT COMMENT '创建者ID(管理员)',
    FOREIGN KEY (category_id) REFERENCES building_categories(id),
    FOREIGN KEY (author_id) REFERENCES admins(id)
) COMMENT '建筑信息表';

-- 评论表
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id INT NOT NULL COMMENT '建筑ID',
    user_id INT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id INT DEFAULT 0 COMMENT '父评论ID(用于回复)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常，0隐藏',
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT '评论表';

-- 点赞表
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL COMMENT '目标ID(建筑或评论)',
    target_type ENUM('building', 'comment') NOT NULL COMMENT '目标类型',
    user_id INT NOT NULL COMMENT '用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY unique_like (target_id, target_type, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT '点赞表';

-- 系统配置表
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(255) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '系统配置表';

-- 插入基础数据

-- 插入建筑分类
INSERT INTO building_categories (name, description, sort_order) VALUES
('民居', '中国传统民居建筑，包括四合院、土楼等', 1),
('官府', '古代政府办公场所，如衙门、府邸等', 2),
('皇宫', '古代帝王居住和处理政务的场所', 3),
('桥梁', '古代桥梁建筑，展现古代工程技术', 4);

-- 插入默认管理员账号
INSERT INTO admins (username, password, real_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '超级管理员', '超级管理员');

-- 插入系统配置
INSERT INTO settings (config_key, config_value, description) VALUES
('site_name', '中国古代建筑成就', '网站名称'),
('site_description', '探索中国古代建筑的魅力与智慧', '网站描述'),
('admin_per_page', '20', '后台每页显示数量'),
('front_per_page', '12', '前台每页显示数量');

-- 创建索引
CREATE INDEX idx_buildings_category ON buildings(category_id);
CREATE INDEX idx_buildings_status ON buildings(status);
CREATE INDEX idx_buildings_created ON buildings(created_at);
CREATE INDEX idx_comments_building ON comments(building_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_admins_username ON admins(username);