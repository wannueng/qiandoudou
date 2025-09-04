-- =====================================================
-- 钱包数据清理脚本
-- 用途：删除所有钱包相关数据，包括社交互动信息、流水等
-- 注意：此脚本将永久删除数据，请谨慎使用！
-- =====================================================

USE qiandoudou;

-- 关闭外键检查（避免删除顺序问题）
SET FOREIGN_KEY_CHECKS = 0;

-- 开始事务
START TRANSACTION;

-- 1. 删除钱包相关的通知消息
DELETE FROM notifications WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

-- 2. 删除社交动态的点赞记录
DELETE FROM post_likes WHERE post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL
);

-- 3. 删除社交动态的评论记录
DELETE FROM post_comments WHERE post_id IN (
    SELECT id FROM social_posts WHERE wallet_id IS NOT NULL
);

-- 4. 删除钱包相关的社交动态
DELETE FROM social_posts WHERE wallet_id IS NOT NULL;

-- 5. 删除用户剧本进度（与钱包关联）
DELETE FROM user_script_progress WHERE wallet_id IS NOT NULL;

-- 6. 删除所有交易记录（流水）
DELETE FROM transactions;

-- 7. 删除所有钱包数据
DELETE FROM wallets;

-- 8. 删除所有AI伴侣数据（因为它们与钱包关联）
DELETE FROM ai_partners;

-- 重置自增ID（可选，如果希望ID从1重新开始）
-- ALTER TABLE wallets AUTO_INCREMENT = 1;
-- ALTER TABLE transactions AUTO_INCREMENT = 1;
-- ALTER TABLE social_posts AUTO_INCREMENT = 1;
-- ALTER TABLE post_comments AUTO_INCREMENT = 1;
-- ALTER TABLE post_likes AUTO_INCREMENT = 1;
-- ALTER TABLE user_script_progress AUTO_INCREMENT = 1;
-- ALTER TABLE ai_partners AUTO_INCREMENT = 1;
-- ALTER TABLE notifications AUTO_INCREMENT = 1;

-- 提交事务
COMMIT;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 显示清理结果
SELECT 
    'wallets' as table_name, 
    COUNT(*) as remaining_records 
FROM wallets
UNION ALL
SELECT 
    'transactions' as table_name, 
    COUNT(*) as remaining_records 
FROM transactions
UNION ALL
SELECT 
    'social_posts' as table_name, 
    COUNT(*) as remaining_records 
FROM social_posts
UNION ALL
SELECT 
    'post_comments' as table_name, 
    COUNT(*) as remaining_records 
FROM post_comments
UNION ALL
SELECT 
    'post_likes' as table_name, 
    COUNT(*) as remaining_records 
FROM post_likes
UNION ALL
SELECT 
    'user_script_progress' as table_name, 
    COUNT(*) as remaining_records 
FROM user_script_progress
UNION ALL
SELECT 
    'ai_partners' as table_name, 
    COUNT(*) as remaining_records 
FROM ai_partners
UNION ALL
SELECT 
    'notifications (wallet related)' as table_name, 
    COUNT(*) as remaining_records 
FROM notifications 
WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

SELECT '数据清理完成！' as message;
