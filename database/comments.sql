/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50617
Source Host           : localhost:3306
Source Database       : user_management

Target Server Type    : MYSQL
Target Server Version : 50617
File Encoding         : 65001

Date: 2024-12-17 10:00:00
*/

-- 使用数据库
USE `user_management`;

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `comments`
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT '评论ID',
  `send_time` DATETIME NOT NULL COMMENT '发送时间',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `level_id` varchar(50) NOT NULL COMMENT '关卡ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_level_id` (`level_id`),
  INDEX `idx_send_time` (`send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of `comments` (示例数据)
-- ----------------------------
INSERT INTO `comments` VALUES (1, '2024-12-17 10:00:00', 'testuser', 'ForbiddenCity', '紫禁城真是太壮观了！');
INSERT INTO `comments` VALUES (2, '2024-12-17 10:05:00', 'demo', 'GreatWall', '万里长城，中华民族的骄傲！');
INSERT INTO `comments` VALUES (3, '2024-12-17 10:10:00', 'user001', 'TempleOfHeaven', '天坛的建筑设计非常精美。');

