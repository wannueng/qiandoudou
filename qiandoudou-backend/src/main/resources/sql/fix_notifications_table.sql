-- 修复notifications表结构，添加缺失的字段
-- 请先备份数据库，然后执行此脚本

-- 添加发送者用户ID字段
ALTER TABLE `notifications` 
ADD COLUMN `sender_id` bigint(20) COMMENT '发送者用户ID' AFTER `user_id`;

-- 添加钱包ID字段
ALTER TABLE `notifications` 
ADD COLUMN `wallet_id` bigint(20) COMMENT '关联的钱包ID' AFTER `related_id`;

-- 添加交易ID字段
ALTER TABLE `notifications` 
ADD COLUMN `transaction_id` bigint(20) COMMENT '关联的交易ID' AFTER `wallet_id`;

-- 添加动态图片字段
ALTER TABLE `notifications` 
ADD COLUMN `post_image` varchar(500) COMMENT '动态图片URL' AFTER `transaction_id`;

-- 添加索引
ALTER TABLE `notifications` 
ADD INDEX `idx_sender_id` (`sender_id`),
ADD INDEX `idx_wallet_id` (`wallet_id`),
ADD INDEX `idx_transaction_id` (`transaction_id`);

-- 查看表结构确认
DESCRIBE notifications;
