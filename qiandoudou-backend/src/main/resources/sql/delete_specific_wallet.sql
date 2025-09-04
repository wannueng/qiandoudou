-- =====================================================
-- 删除特定钱包及其所有相关数据的脚本
-- 钱包名称: test-钱包A
-- 注意：此脚本将永久删除指定钱包的所有相关数据！
-- =====================================================

USE qiandoudou;

-- 开始事务
START TRANSACTION;

-- 首先查找目标钱包的ID
SET @target_wallet_name = 'test-钱包A';
SET @wallet_id = (SELECT id FROM wallets WHERE name = @target_wallet_name AND deleted = 0 LIMIT 1);

-- 检查钱包是否存在
SELECT 
    CASE 
        WHEN @wallet_id IS NULL THEN '警告：未找到名为 "test-钱包A" 的钱包！'
        ELSE CONCAT('找到钱包ID: ', @wallet_id, '，开始删除相关数据...')
    END as status;

-- 如果钱包存在，则执行删除操作
DELETE FROM notifications 
WHERE wallet_id = @wallet_id 
   OR transaction_id IN (SELECT id FROM transactions WHERE wallet_id = @wallet_id);

-- 删除该钱包相关的社交动态点赞
DELETE FROM post_likes 
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id);

-- 删除该钱包相关的社交动态评论
DELETE FROM post_comments 
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id);

-- 删除该钱包的社交动态
DELETE FROM social_posts WHERE wallet_id = @wallet_id;

-- 删除该钱包的剧本进度
DELETE FROM user_script_progress WHERE wallet_id = @wallet_id;

-- 删除该钱包的所有交易记录
DELETE FROM transactions WHERE wallet_id = @wallet_id;

-- 最后删除钱包本身
DELETE FROM wallets WHERE id = @wallet_id;

-- 显示删除结果
SELECT 
    @target_wallet_name as target_wallet,
    @wallet_id as wallet_id,
    ROW_COUNT() as last_affected_rows,
    '钱包及相关数据删除完成' as message;

-- 验证删除结果 - 确认相关数据已被删除
SELECT '=== 删除验证 ===' as section;

SELECT 
    'wallets' as table_name,
    COUNT(*) as remaining_records
FROM wallets 
WHERE name = @target_wallet_name AND deleted = 0
UNION ALL
SELECT 
    'transactions' as table_name,
    COUNT(*) as remaining_records
FROM transactions 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'social_posts' as table_name,
    COUNT(*) as remaining_records
FROM social_posts 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'user_script_progress' as table_name,
    COUNT(*) as remaining_records
FROM user_script_progress 
WHERE wallet_id = @wallet_id;

-- 提交事务
COMMIT;

SELECT 'test-钱包A 的所有相关数据删除完成！' as final_message;
