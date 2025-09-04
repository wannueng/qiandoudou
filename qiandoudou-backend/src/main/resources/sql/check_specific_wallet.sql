-- =====================================================
-- 检查特定钱包数据状态的脚本
-- 钱包名称: test-钱包A
-- =====================================================

USE qiandoudou;

-- 设置目标钱包名称
SET @target_wallet_name = 'test-钱包A';

SELECT CONCAT('=== 检查钱包: ', @target_wallet_name, ' ===') as section;

-- 查找钱包基本信息
SELECT 
    w.id as wallet_id,
    w.name as wallet_name,
    w.type as wallet_type,
    w.balance,
    w.is_public,
    u.nickname as owner_nickname,
    ap.name as ai_partner_name,
    w.create_time,
    w.update_time,
    CASE WHEN w.deleted = 0 THEN '活跃' ELSE '已删除' END as status
FROM wallets w
LEFT JOIN users u ON w.user_id = u.id
LEFT JOIN ai_partners ap ON w.ai_partner_id = ap.id
WHERE w.name = @target_wallet_name;

-- 获取钱包ID用于后续查询
SET @wallet_id = (SELECT id FROM wallets WHERE name = @target_wallet_name LIMIT 1);

SELECT '' as separator;
SELECT '=== 相关数据统计 ===' as section;

-- 统计相关数据
SELECT 
    'transactions' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM transactions 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'social_posts' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM social_posts 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'post_comments' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM post_comments 
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id)
UNION ALL
SELECT 
    'post_likes' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM post_likes 
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id)
UNION ALL
SELECT 
    'user_script_progress' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM user_script_progress 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'notifications' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as deleted_count
FROM notifications 
WHERE wallet_id = @wallet_id 
   OR transaction_id IN (SELECT id FROM transactions WHERE wallet_id = @wallet_id);

SELECT '' as separator;
SELECT '=== 最近的交易记录 ===' as section;

-- 显示最近的交易记录（包括已删除的）
SELECT 
    t.id as transaction_id,
    t.type as transaction_type,
    t.amount,
    t.description,
    t.create_time,
    CASE WHEN t.deleted = 0 THEN '活跃' ELSE '已删除' END as status
FROM transactions t
WHERE t.wallet_id = @wallet_id
ORDER BY t.create_time DESC
LIMIT 10;

SELECT '' as separator;
SELECT '=== 相关社交动态 ===' as section;

-- 显示相关的社交动态
SELECT 
    sp.id as post_id,
    sp.content,
    sp.like_count,
    sp.comment_count,
    sp.create_time,
    CASE WHEN sp.deleted = 0 THEN '活跃' ELSE '已删除' END as status
FROM social_posts sp
WHERE sp.wallet_id = @wallet_id
ORDER BY sp.create_time DESC
LIMIT 5;
