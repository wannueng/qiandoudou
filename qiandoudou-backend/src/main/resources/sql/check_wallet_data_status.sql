-- =====================================================
-- 钱包数据状态检查脚本
-- 用途：查看钱包相关数据的当前状态
-- =====================================================

USE qiandoudou;

SELECT '=== 钱包数据统计 ===' as section;

-- 钱包数据统计
SELECT 
    '钱包表 (wallets)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM wallets
UNION ALL
-- 交易记录统计
SELECT 
    '交易记录表 (transactions)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM transactions
UNION ALL
-- AI伴侣统计
SELECT 
    'AI伴侣表 (ai_partners)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM ai_partners
UNION ALL
-- 社交动态统计
SELECT 
    '社交动态表 (social_posts)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM social_posts
UNION ALL
-- 动态评论统计
SELECT 
    '动态评论表 (post_comments)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM post_comments
UNION ALL
-- 动态点赞统计
SELECT 
    '动态点赞表 (post_likes)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM post_likes
UNION ALL
-- 用户剧本进度统计
SELECT 
    '用户剧本进度表 (user_script_progress)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM user_script_progress
UNION ALL
-- 钱包相关通知统计
SELECT 
    '钱包相关通知 (notifications)' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_records
FROM notifications 
WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL;

SELECT '' as separator;
SELECT '=== 活跃钱包详情 ===' as section;

-- 显示活跃钱包的详细信息
SELECT 
    w.id as wallet_id,
    w.name as wallet_name,
    w.type as wallet_type,
    w.balance,
    u.nickname as owner_nickname,
    ap.name as ai_partner_name,
    w.create_time
FROM wallets w
LEFT JOIN users u ON w.user_id = u.id
LEFT JOIN ai_partners ap ON w.ai_partner_id = ap.id
WHERE w.deleted = 0
ORDER BY w.create_time DESC;

SELECT '' as separator;
SELECT '=== 最近交易记录 ===' as section;

-- 显示最近的交易记录
SELECT 
    t.id as transaction_id,
    w.name as wallet_name,
    u.nickname as user_nickname,
    t.type as transaction_type,
    t.amount,
    t.description,
    t.create_time
FROM transactions t
LEFT JOIN wallets w ON t.wallet_id = w.id
LEFT JOIN users u ON t.user_id = u.id
WHERE t.deleted = 0
ORDER BY t.create_time DESC
LIMIT 10;
