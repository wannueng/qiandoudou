-- 为交易记录表添加AI伴侣相关字段的更新脚本
-- 如果数据库已经存在，运行此脚本来添加新字段

ALTER TABLE `transactions` 
ADD COLUMN `ai_partner_id` bigint(20) COMMENT 'AI伴侣ID（AI伴侣交易专用）',
ADD COLUMN `ai_partner_name` varchar(100) COMMENT 'AI伴侣名称',
ADD COLUMN `ai_partner_avatar` varchar(500) COMMENT 'AI伴侣头像URL',
ADD COLUMN `ai_message` text COMMENT 'AI伴侣消息内容',
ADD COLUMN `voice_url` varchar(500) COMMENT '语音URL（AI伴侣专用）',
ADD COLUMN `voice_duration` varchar(20) COMMENT '语音时长',
ADD KEY `idx_ai_partner_id` (`ai_partner_id`);
