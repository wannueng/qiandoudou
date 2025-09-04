-- =====================================================
-- 钱包数据清理脚本（安全版本 - 软删除）
-- 用途：软删除所有钱包相关数据，包括社交互动信息、流水等
-- 注意：使用软删除，数据不会被物理删除，可以恢复
-- =====================================================

USE qiandoudou;

-- 开始事务
START TRANSACTION;

-- 1. 软删除钱包相关的通知消息
UPDATE notifications 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

-- 2. 软删除社交动态的点赞记录
UPDATE post_likes 
SET deleted = 1 
WHERE post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL AND deleted = 0
);

-- 3. 软删除社交动态的评论记录
UPDATE post_comments 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL AND deleted = 0
);

-- 4. 软删除钱包相关的社交动态
UPDATE social_posts 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE wallet_id IS NOT NULL;

-- 5. 软删除用户剧本进度（与钱包关联）
UPDATE user_script_progress 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE wallet_id IS NOT NULL;

-- 6. 软删除所有交易记录（流水）
UPDATE transactions 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 0;

-- 7. 软删除所有钱包数据
UPDATE wallets 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 0;

-- 8. 软删除所有AI伴侣数据（因为它们与钱包关联）
UPDATE ai_partners 
SET deleted = 1, update_time = CURRENT_TIMESTAMP 
WHERE deleted = 0;

-- 提交事务
COMMIT;

-- 显示清理结果（只显示未删除的记录数）
SELECT 
    'wallets' as table_name, 
    COUNT(*) as remaining_active_records 
FROM wallets 
WHERE deleted = 0
UNION ALL
SELECT 
    'transactions' as table_name, 
    COUNT(*) as remaining_active_records 
FROM transactions 
WHERE deleted = 0
UNION ALL
SELECT 
    'social_posts' as table_name, 
    COUNT(*) as remaining_active_records 
FROM social_posts 
WHERE deleted = 0
UNION ALL
SELECT 
    'post_comments' as table_name, 
    COUNT(*) as remaining_active_records 
FROM post_comments 
WHERE deleted = 0
UNION ALL
SELECT 
    'post_likes' as table_name, 
    COUNT(*) as remaining_active_records 
FROM post_likes 
WHERE deleted = 0
UNION ALL
SELECT 
    'user_script_progress' as table_name, 
    COUNT(*) as remaining_active_records 
FROM user_script_progress 
WHERE deleted = 0
UNION ALL
SELECT 
    'ai_partners' as table_name, 
    COUNT(*) as remaining_active_records 
FROM ai_partners 
WHERE deleted = 0
UNION ALL
SELECT 
    'notifications (wallet related)' as table_name, 
    COUNT(*) as remaining_active_records 
FROM notifications 
WHERE (wallet_id IS NOT NULL OR transaction_id IS NOT NULL) AND deleted = 0;

SELECT '钱包数据软删除完成！数据已标记为删除但未物理删除，如需恢复请联系管理员。' as message;
