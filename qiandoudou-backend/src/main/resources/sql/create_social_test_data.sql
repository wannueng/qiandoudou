-- 创建社交功能测试数据
-- 执行前请先执行 fix_notifications_table.sql 更新表结构

-- 确保 post_likes 表存在
CREATE TABLE IF NOT EXISTS `post_likes` (
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

-- 确保 user_follows 表存在
CREATE TABLE IF NOT EXISTS `user_follows` (
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

-- 确保 post_comments 表存在
CREATE TABLE IF NOT EXISTS `post_comments` (
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

-- 清理旧的测试数据
DELETE FROM post_comments WHERE user_id IN (1961688416014127105, 1961688416014127106, 1961688416014127107);
DELETE FROM post_likes WHERE user_id IN (1961688416014127105, 1961688416014127106, 1961688416014127107);
DELETE FROM user_follows WHERE follower_id IN (1961688416014127105, 1961688416014127106, 1961688416014127107) 
   OR following_id IN (1961688416014127105, 1961688416014127106, 1961688416014127107);
DELETE FROM notifications WHERE user_id IN (1961688416014127105, 1961688416014127106, 1961688416014127107);

-- 模拟用户关注关系
-- test2关注test
INSERT INTO user_follows (follower_id, following_id, create_time) 
VALUES (1961688416014127106, 1961688416014127105, NOW());

-- test关注test2  
INSERT INTO user_follows (follower_id, following_id, create_time) 
VALUES (1961688416014127105, 1961688416014127106, NOW());

-- 第三个用户关注test
INSERT INTO user_follows (follower_id, following_id, create_time) 
VALUES (1961688416014127107, 1961688416014127105, NOW());

-- 模拟点赞数据（假设有一些交易记录存在）
-- test2点赞test的交易
INSERT INTO post_likes (post_id, user_id, is_ai_like, create_time) 
VALUES 
(1, 1961688416014127106, 0, NOW()),
(3, 1961688416014127106, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 1961688416014127106, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- test点赞test2的交易
INSERT INTO post_likes (post_id, user_id, is_ai_like, create_time) 
VALUES 
(2, 1961688416014127105, 0, NOW()),
(4, 1961688416014127105, 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 第三个用户点赞test的交易
INSERT INTO post_likes (post_id, user_id, is_ai_like, create_time) 
VALUES 
(1, 1961688416014127107, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 1961688416014127107, 0, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- 模拟评论数据
-- test2评论test的交易
INSERT INTO post_comments (post_id, user_id, content, is_ai_comment, create_time) 
VALUES 
(1, 1961688416014127106, '那个...你也喜欢看战斗少女动画吗(bushi)', 0, NOW()),
(3, 1961688416014127106, '哇，攒钱好厉害！', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- test评论test2的交易
INSERT INTO post_comments (post_id, user_id, content, is_ai_comment, create_time) 
VALUES 
(2, 1961688416014127105, '一起加油💪', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 1961688416014127105, '好棒的存钱计划！', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 创建通知消息
-- test收到test2的点赞通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(1961688416014127105, 1961688416014127106, 1, '收到新点赞', '给你点赞', 1001, 1, '/images/img/bg.png', 0, NOW()),
(1961688416014127105, 1961688416014127106, 1, '收到新点赞', '给你点赞', 1001, 3, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- test收到test2的评论通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(1961688416014127105, 1961688416014127106, 2, '收到新评论', '那个...你也喜欢看战斗少女动画吗(bushi)', 1001, 1, '/images/img/bg.png', 0, NOW()),
(1961688416014127105, 1961688416014127106, 2, '收到新评论', '哇，攒钱好厉害！', 1001, 3, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- test2收到test的评论通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(1961688416014127106, 1961688416014127105, 2, '收到新评论', '一起加油💪', 1002, 2, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1961688416014127106, 1961688416014127105, 2, '收到新评论', '好棒的存钱计划！', 1002, 4, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- test收到第三个用户的关注通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(1961688416014127105, 1961688416014127107, 3, '新关注', '关注了你', NULL, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- test2收到test的点赞和关注通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(1961688416014127106, 1961688416014127105, 1, '收到新点赞', '给你点赞', 1002, 2, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(1961688416014127106, 1961688416014127105, 3, '新关注', '关注了你', NULL, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 查询验证数据
SELECT '=== 用户关注关系 ===' as info;
SELECT uf.*, 
       u1.nickname as follower_name,
       u2.nickname as following_name
FROM user_follows uf
LEFT JOIN users u1 ON uf.follower_id = u1.id  
LEFT JOIN users u2 ON uf.following_id = u2.id
WHERE uf.deleted = 0;

SELECT '=== 点赞数据 ===' as info;
SELECT pl.*, u.nickname as user_name
FROM post_likes pl
LEFT JOIN users u ON pl.user_id = u.id
WHERE pl.deleted = 0;

SELECT '=== 通知消息 ===' as info;
SELECT n.*, 
       u1.nickname as receiver_name,
       u2.nickname as sender_name
FROM notifications n
LEFT JOIN users u1 ON n.user_id = u1.id
LEFT JOIN users u2 ON n.sender_id = u2.id  
WHERE n.deleted = 0
ORDER BY n.create_time DESC;
