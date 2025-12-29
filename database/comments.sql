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
  `id` INT(11) AUTO_INCREMENT NOT NULL COMMENT '评论ID',
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
-- Records of `comments` 
-- ----------------------------
INSERT INTO `comments` VALUES (1, '2024-12-17 10:00:00', 'lihua', 'ForbiddenCity', '紫禁城真是太壮观了！');
INSERT INTO `comments` VALUES (2, '2024-12-17 10:05:00', 'wangwei', 'GreatWall', '万里长城，中华民族的骄傲！');
INSERT INTO `comments` VALUES (3, '2024-12-17 10:10:00', 'chenyu', 'TempleOfHeaven', '天坛的建筑设计非常精美。');
INSERT INTO `comments` VALUES (4, '2024-12-17 10:12:00', 'zhaomin', 'YellowCraneTower', '黄鹤楼登高望远，景色太美了。');
INSERT INTO `comments` VALUES (5, '2024-12-17 10:15:00', 'zhangsan', 'PotalaPalace', '布达拉宫气势恢宏，震撼！');
INSERT INTO `comments` VALUES (6, '2024-12-17 10:18:00', 'lisi', 'GreatWall', '走到城墙上才知道什么叫“雄伟”。');
INSERT INTO `comments` VALUES (7, '2024-12-17 10:20:00', 'lihua', 'TempleOfHeaven', '祈年殿真的很有历史感。');
INSERT INTO `comments` VALUES (8, '2024-12-17 10:22:00', 'wangwei', 'ForbiddenCity', '建筑细节满满，越看越喜欢。');
INSERT INTO `comments` VALUES (9, '2024-12-17 10:25:00', 'chenyu', 'YellowCraneTower', '古诗里的意境一下就出来了。');
INSERT INTO `comments` VALUES (10, '2024-12-17 10:28:00', 'zhaomin', 'PotalaPalace', '光线和天空配色绝了，拍照很出片。');
INSERT INTO `comments` VALUES (11, '2024-12-17 10:30:00', 'zhangsan', 'ForbiddenCity', '从午门走到太和殿一路都很震撼。');
INSERT INTO `comments` VALUES (12, '2024-12-17 10:35:00', 'lisi', 'GreatWall', '建议带点水，路程还是挺累的。');

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `level_id` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `send_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES ('1', 'lihua', 'ForbiddenCity', '紫禁城真壮观！', '2024-12-29 10:00:00');
INSERT INTO `comments` VALUES ('2', 'wangwei', 'GreatWall', '不到长城非好汉！', '2024-12-29 10:05:00');
INSERT INTO `comments` VALUES ('3', 'admin', 'TempleOfHeaven', '天坛的建筑工艺令人惊叹。', '2024-12-29 11:00:00');
