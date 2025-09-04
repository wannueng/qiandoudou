-- 更新notifications表，添加缺失的字段
-- 执行前请先备份数据库

-- 检查表是否存在
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'notifications';

-- 添加发送者用户ID字段（如果不存在）
ALTER TABLE `notifications` 
ADD COLUMN IF NOT EXISTS `sender_id` bigint(20) COMMENT '发送者用户ID' AFTER `user_id`,
ADD INDEX IF NOT EXISTS `idx_sender_id` (`sender_id`);

-- 添加钱包ID字段（如果不存在）
ALTER TABLE `notifications` 
ADD COLUMN IF NOT EXISTS `wallet_id` bigint(20) COMMENT '关联的钱包ID' AFTER `related_id`,
ADD INDEX IF NOT EXISTS `idx_wallet_id` (`wallet_id`);

-- 添加交易ID字段（如果不存在）
ALTER TABLE `notifications` 
ADD COLUMN IF NOT EXISTS `transaction_id` bigint(20) COMMENT '关联的交易ID' AFTER `wallet_id`,
ADD INDEX IF NOT EXISTS `idx_transaction_id` (`transaction_id`);

-- 添加动态图片字段（如果不存在）
ALTER TABLE `notifications` 
ADD COLUMN IF NOT EXISTS `post_image` varchar(500) COMMENT '动态图片URL' AFTER `transaction_id`;

-- 插入一些测试数据
INSERT INTO `notifications` 
(`user_id`, `sender_id`, `type`, `title`, `content`, `wallet_id`, `transaction_id`, `post_image`, `is_read`, `create_time`) 
VALUES 
-- test用户收到test2用户的点赞
(1961688416014127105, 1961688416014127106, 1, '收到新点赞', '给你点赞', 1001, 12345, '/images/img/bg.png', 0, NOW()),
-- test用户收到test2用户的评论
(1961688416014127105, 1961688416014127106, 2, '收到新评论', '那个...你也喜欢看战斗少女动画吗(bushi)', 1002, 12346, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
-- test用户收到其他用户的关注
(1961688416014127105, 1961688416014127107, 3, '新关注', '关注了你', NULL, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));
