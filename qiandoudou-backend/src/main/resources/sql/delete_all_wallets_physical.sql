-- =====================================================
-- 物理删除所有钱包及其相关数据的脚本
-- 警告：此脚本将永久删除所有钱包相关数据，无法恢复！
-- 包括：钱包、交易记录、社交动态、评论、点赞、通知、AI伴侣、剧本进度等
-- =====================================================

USE qiandoudou;

-- 关闭外键检查（避免删除顺序问题）
SET FOREIGN_KEY_CHECKS = 0;

-- 开始事务
START TRANSACTION;

-- 显示删除前的数据统计
SELECT '=== 删除前数据统计 ===' as section;

SELECT 
    'wallets' as table_name,
    COUNT(*) as total_records
FROM wallets
UNION ALL
SELECT 
    'transactions' as table_name,
    COUNT(*) as total_records
FROM transactions
UNION ALL
SELECT 
    'ai_partners' as table_name,
    COUNT(*) as total_records
FROM ai_partners
UNION ALL
SELECT 
    'social_posts' as table_name,
    COUNT(*) as total_records
FROM social_posts
UNION ALL
SELECT 
    'post_comments' as table_name,
    COUNT(*) as total_records
FROM post_comments
UNION ALL
SELECT 
    'post_likes' as table_name,
    COUNT(*) as total_records
FROM post_likes
UNION ALL
SELECT 
    'user_script_progress' as table_name,
    COUNT(*) as total_records
FROM user_script_progress
UNION ALL
SELECT 
    'notifications (wallet related)' as table_name,
    COUNT(*) as total_records
FROM notifications 
WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

-- 1. 删除钱包相关的通知消息
DELETE FROM notifications 
WHERE wallet_id IS NOT NULL 
   OR transaction_id IS NOT NULL;

-- 2. 删除社交动态的点赞记录
DELETE FROM post_likes 
WHERE post_id IN (SELECT id FROM social_posts);

-- 3. 删除社交动态的评论记录  
DELETE FROM post_comments 
WHERE post_id IN (SELECT id FROM social_posts);

-- 4. 删除所有社交动态
DELETE FROM social_posts;

-- 5. 删除所有用户剧本进度
DELETE FROM user_script_progress;

-- 6. 删除所有交易记录
DELETE FROM transactions;

-- 7. 删除所有AI伴侣数据
DELETE FROM ai_partners;

-- 8. 最后删除所有钱包数据
DELETE FROM wallets;

-- 重置自增ID（让ID从1重新开始）
ALTER TABLE wallets AUTO_INCREMENT = 1;
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE ai_partners AUTO_INCREMENT = 1;
ALTER TABLE social_posts AUTO_INCREMENT = 1;
ALTER TABLE post_comments AUTO_INCREMENT = 1;
ALTER TABLE post_likes AUTO_INCREMENT = 1;
ALTER TABLE user_script_progress AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;

-- 显示删除后的数据统计
SELECT '' as separator;
SELECT '=== 删除后数据统计 ===' as section;

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
    'ai_partners' as table_name,
    COUNT(*) as remaining_records
FROM ai_partners
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
    'notifications (wallet related)' as table_name,
    COUNT(*) as remaining_records
FROM notifications 
WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

-- 显示删除汇总
SELECT '' as separator;
SELECT '=== 删除操作汇总 ===' as section;

SELECT 
    '钱包数据' as deleted_data,
    '已物理删除' as status,
    '包含钱包表、AI伴侣表' as details
UNION ALL
SELECT 
    '交易数据' as deleted_data,
    '已物理删除' as status,
    '包含所有交易记录和流水' as details
UNION ALL
SELECT 
    '社交数据' as deleted_data,
    '已物理删除' as status,
    '包含动态、评论、点赞' as details
UNION ALL
SELECT 
    '进度数据' as deleted_data,
    '已物理删除' as status,
    '包含用户剧本进度' as details
UNION ALL
SELECT 
    '通知数据' as deleted_data,
    '已物理删除' as status,
    '包含钱包相关通知' as details
UNION ALL
SELECT 
    '自增ID' as deleted_data,
    '已重置' as status,
    '所有表的自增ID已重置为1' as details;

-- 提交事务
COMMIT;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 最终确认消息
SELECT '' as separator;
SELECT '⚠️  所有钱包及其相关数据已被物理删除！数据无法恢复！' as final_warning;
SELECT '✅ 删除操作完成，数据库已清理干净。' as final_message;
