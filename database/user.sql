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
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `adminAccount`
-- ----------------------------
DROP TABLE IF EXISTS `adminAccount`;
CREATE TABLE `adminAccount` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of `userAccount`
-- ----------------------------
INSERT INTO `userAccount` VALUES ('testuser', '123456');
INSERT INTO `userAccount` VALUES ('demo', 'demopass');
INSERT INTO `userAccount` VALUES ('user001', '123456');
INSERT INTO `userAccount` VALUES ('user002', '123456');
INSERT INTO `userAccount` VALUES ('zhangsan', '123456');
INSERT INTO `userAccount` VALUES ('lisi', '123456');

-- ----------------------------
-- Records of `adminAccount`
-- ----------------------------
INSERT INTO `adminAccount` VALUES ('admin', '123456');
INSERT INTO `adminAccount` VALUES ('admin2', '114514');
