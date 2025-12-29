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

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `user_management` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- 使用数据库
USE `user_management`;

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `userAccount`
-- ----------------------------
DROP TABLE IF EXISTS `userAccount`;
CREATE TABLE `userAccount` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `ForbiddenCity` BOOL DEFAULT TRUE COMMENT '紫禁城',
  `GreatWall` BOOL DEFAULT FALSE COMMENT '长城',
  `TempleOfHeaven` BOOL DEFAULT FALSE COMMENT '天坛',
  `YellowCraneTower` BOOL DEFAULT FALSE COMMENT '黄鹤楼',
  `PotalaPalace` BOOL DEFAULT FALSE COMMENT '布达拉宫',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_userAccount_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `adminAccount`
-- ----------------------------
DROP TABLE IF EXISTS `adminAccount`;
CREATE TABLE `adminAccount` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `ForbiddenCity` BOOL DEFAULT TRUE COMMENT '紫禁城',
  `GreatWall` BOOL DEFAULT FALSE COMMENT '长城',
  `TempleOfHeaven` BOOL DEFAULT FALSE COMMENT '天坛',
  `YellowCraneTower` BOOL DEFAULT FALSE COMMENT '黄鹤楼',
  `PotalaPalace` BOOL DEFAULT FALSE COMMENT '布达拉宫',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_adminAccount_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of `userAccount`
-- ----------------------------
INSERT INTO `userAccount` VALUES ('1', 'lihua', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('2', 'wangwei', 'demopass', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('3', 'chenyu', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('4', 'zhaomin', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('5', 'zhangsan', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('6', 'lisi', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `userAccount` VALUES ('7', 'gaoyu', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);

-- ----------------------------
-- Records of `adminAccount`
-- ----------------------------
INSERT INTO `adminAccount` VALUES ('1', 'admin', '123456', TRUE, FALSE, FALSE, FALSE, FALSE);
INSERT INTO `adminAccount` VALUES ('2', 'admin2', '114514', TRUE, FALSE, FALSE, FALSE, FALSE);
