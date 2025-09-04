-- =====================================================
-- 钱包数据恢复脚本
-- 用途：恢复被软删除的钱包相关数据
-- 注意：只能恢复使用软删除脚本删除的数据
-- =====================================================

USE qiandoudou;

-- 开始事务
START TRANSACTION;

-- 1. 恢复AI伴侣数据
UPDATE ai_partners 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1;

-- 2. 恢复钱包数据
UPDATE wallets 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1;

-- 3. 恢复交易记录（流水）
UPDATE transactions 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1;

-- 4. 恢复用户剧本进度
UPDATE user_script_progress 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1;

-- 5. 恢复钱包相关的社交动态
UPDATE social_posts 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1 AND wallet_id IS NOT NULL;

-- 6. 恢复社交动态的评论记录
UPDATE post_comments 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1 AND post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL AND deleted = 0
);

-- 7. 恢复社交动态的点赞记录
UPDATE post_likes 
SET deleted = 0 
WHERE deleted = 1 AND post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL AND deleted = 0
);

-- 8. 恢复钱包相关的通知消息
UPDATE notifications 
SET deleted = 0, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 1 AND (wallet_id IS NOT NULL OR transaction_id IS NOT NULL);

-- 提交事务
COMMIT;

-- 显示恢复结果
SELECT 
    'wallets' as table_name, 
    COUNT(*) as active_records 
FROM wallets 
WHERE deleted = 0
UNION ALL
SELECT 
    'transactions' as table_name, 
    COUNT(*) as active_records 
FROM transactions 
WHERE deleted = 0
UNION ALL
SELECT 
    'social_posts' as table_name, 
    COUNT(*) as active_records 
FROM social_posts 
WHERE deleted = 0
UNION ALL
SELECT 
    'post_comments' as table_name, 
    COUNT(*) as active_records 
FROM post_comments 
WHERE deleted = 0
UNION ALL
SELECT 
    'post_likes' as table_name, 
    COUNT(*) as active_records 
FROM post_likes 
WHERE deleted = 0
UNION ALL
SELECT 
    'user_script_progress' as table_name, 
    COUNT(*) as active_records 
FROM user_script_progress 
WHERE deleted = 0
UNION ALL
SELECT 
    'ai_partners' as table_name, 
    COUNT(*) as active_records 
FROM ai_partners 
WHERE deleted = 0
UNION ALL
SELECT 
    'notifications (wallet related)' as table_name, 
    COUNT(*) as active_records 
FROM notifications 
WHERE (wallet_id IS NOT NULL OR transaction_id IS NOT NULL) AND deleted = 0;

SELECT '钱包数据恢复完成！' as message;
