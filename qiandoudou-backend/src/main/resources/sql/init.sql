-- 创建数据库
CREATE DATABASE IF NOT EXISTS qiandoudou DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE qiandoudou;

-- 用户表
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `phone` varchar(20) UNIQUE COMMENT '手机号',
  `nickname` varchar(100) NOT NULL COMMENT '昵称',
  `avatar` varchar(500) COMMENT '头像URL',
  `openid` varchar(100) UNIQUE COMMENT '微信openid',
  `gender` tinyint(1) DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birthday` date COMMENT '生日',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_phone` (`phone`),
  KEY `idx_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 钱包表
CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '钱包ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `name` varchar(100) NOT NULL COMMENT '钱包名称',
  `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '钱包类型：1-个人钱包，2-情侣钱包',
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  `background_image` varchar(500) COMMENT '背景图片URL',
  `ai_partner_id` bigint(20) COMMENT 'AI伴侣ID（情侣钱包专用）',
  `is_public` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否公开到社交圈：0-否，1-是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包表';

-- AI伴侣表
CREATE TABLE `ai_partners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'AI伴侣ID',
  `name` varchar(100) NOT NULL COMMENT 'AI伴侣名称',
  `gender` tinyint(1) NOT NULL COMMENT '性别：1-男，2-女',
  `avatar` varchar(500) NOT NULL COMMENT '头像URL',
  `personality` text COMMENT '性格设定',
  `voice_type` varchar(50) COMMENT '语音类型',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI伴侣表';

-- 交易记录表
CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '交易ID',
  `wallet_id` bigint(20) NOT NULL COMMENT '钱包ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` tinyint(1) NOT NULL COMMENT '交易类型：1-转入，2-转出，3-剧本攒钱',
  `amount` decimal(10,2) NOT NULL COMMENT '交易金额',
  `balance_after` decimal(10,2) NOT NULL COMMENT '交易后余额',
  `description` varchar(500) COMMENT '交易描述',
  `image_url` varchar(500) COMMENT '交易图片URL',
  `note` text COMMENT '交易备注',
  `script_chapter_id` bigint(20) COMMENT '关联的剧本章节ID（剧本攒钱专用）',
  `ai_partner_id` bigint(20) COMMENT 'AI伴侣ID（AI伴侣交易专用）',
  `ai_partner_name` varchar(100) COMMENT 'AI伴侣名称',
  `ai_partner_avatar` varchar(500) COMMENT 'AI伴侣头像URL',
  `ai_message` text COMMENT 'AI伴侣消息内容',
  `voice_url` varchar(500) COMMENT '语音URL（AI伴侣专用）',
  `voice_duration` varchar(20) COMMENT '语音时长',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_wallet_id` (`wallet_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_ai_partner_id` (`ai_partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';

-- 剧本表
CREATE TABLE `scripts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '剧本ID',
  `title` varchar(200) NOT NULL COMMENT '剧本标题',
  `description` text COMMENT '剧本描述',
  `cover_image` varchar(500) COMMENT '封面图片URL',
  `total_chapters` int(11) NOT NULL DEFAULT 0 COMMENT '总章节数',
  `target_amount` decimal(10,2) NOT NULL COMMENT '目标攒钱金额',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本表';

-- 剧本章节表
CREATE TABLE `script_chapters` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '章节ID',
  `script_id` bigint(20) NOT NULL COMMENT '剧本ID',
  `chapter_number` int(11) NOT NULL COMMENT '章节序号',
  `title` varchar(200) NOT NULL COMMENT '章节标题',
  `content` text NOT NULL COMMENT '章节内容',
  `image_url` varchar(500) COMMENT '章节图片URL',
  `choices` json COMMENT '选择项（JSON格式）',
  `unlock_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '解锁所需金额',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_script_id` (`script_id`),
  KEY `idx_chapter_number` (`chapter_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='剧本章节表';

-- 用户剧本进度表
CREATE TABLE `user_script_progress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '进度ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `wallet_id` bigint(20) NOT NULL COMMENT '钱包ID',
  `script_id` bigint(20) NOT NULL COMMENT '剧本ID',
  `current_chapter` int(11) NOT NULL DEFAULT 1 COMMENT '当前章节',
  `total_paid` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '已支付金额',
  `choices_made` json COMMENT '已做选择（JSON格式）',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态：1-进行中，2-已完成，3-已放弃',
  `start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `complete_time` datetime COMMENT '完成时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_wallet_script` (`user_id`, `wallet_id`, `script_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_script_id` (`script_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户剧本进度表';

-- 社交动态表
CREATE TABLE `social_posts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '动态ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `wallet_id` bigint(20) NOT NULL COMMENT '钱包ID',
  `transaction_id` bigint(20) NOT NULL COMMENT '关联的交易ID',
  `content` text COMMENT '动态内容',
  `images` json COMMENT '图片列表（JSON格式）',
  `like_count` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(11) NOT NULL DEFAULT 0 COMMENT '评论数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_wallet_id` (`wallet_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社交动态表';

-- 动态评论表
CREATE TABLE `post_comments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` bigint(20) NOT NULL COMMENT '动态ID',
  `user_id` bigint(20) NOT NULL COMMENT '评论用户ID',
  `content` text NOT NULL COMMENT '评论内容',
  `images` json COMMENT '评论图片（JSON格式）',
  `voice_url` varchar(500) COMMENT '语音URL（AI伴侣专用）',
  `is_ai_comment` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否AI评论：0-否，1-是',
  `ai_partner_id` bigint(20) COMMENT 'AI伴侣ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态评论表';

-- 动态点赞表
CREATE TABLE `post_likes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `post_id` bigint(20) NOT NULL COMMENT '动态ID',
  `user_id` bigint(20) NOT NULL COMMENT '点赞用户ID',
  `is_ai_like` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否AI点赞：0-否，1-是',
  `ai_partner_id` bigint(20) COMMENT 'AI伴侣ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态点赞表';

-- 关注表
CREATE TABLE `user_follows` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '关注ID',
  `follower_id` bigint(20) NOT NULL COMMENT '关注者ID',
  `following_id` bigint(20) NOT NULL COMMENT '被关注者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follower_following` (`follower_id`, `following_id`),
  KEY `idx_follower_id` (`follower_id`),
  KEY `idx_following_id` (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注表';

-- 消息通知表
CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` bigint(20) NOT NULL COMMENT '接收用户ID',
  `sender_id` bigint(20) COMMENT '发送者用户ID',
  `type` tinyint(1) NOT NULL COMMENT '通知类型：1-点赞，2-评论，3-关注，4-系统通知',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `related_id` bigint(20) COMMENT '关联ID（动态ID、评论ID等）',
  `wallet_id` bigint(20) COMMENT '关联的钱包ID',
  `transaction_id` bigint(20) COMMENT '关联的交易ID',
  `post_image` varchar(500) COMMENT '动态图片URL',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0-否，1-是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否，1-是',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_wallet_id` (`wallet_id`),
  KEY `idx_transaction_id` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息通知表';
