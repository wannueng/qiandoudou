-- =====================================================
-- 软删除特定钱包及其所有相关数据的脚本（安全版本）
-- 钱包名称: test-钱包A
-- 注意：使用软删除，数据可以恢复
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
        WHEN @wallet_id IS NULL THEN '警告：未找到名为 "test-钱包A" 的活跃钱包！'
        ELSE CONCAT('找到钱包ID: ', @wallet_id, '，开始软删除相关数据...')
    END as status;

-- 如果钱包存在，则执行软删除操作
UPDATE notifications 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE wallet_id = @wallet_id 
   OR transaction_id IN (SELECT id FROM transactions WHERE wallet_id = @wallet_id AND deleted = 0);

-- 软删除该钱包相关的社交动态点赞
UPDATE post_likes 
SET deleted = 1
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id AND deleted = 0);

-- 软删除该钱包相关的社交动态评论
UPDATE post_comments 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE post_id IN (SELECT id FROM social_posts WHERE wallet_id = @wallet_id AND deleted = 0);

-- 软删除该钱包的社交动态
UPDATE social_posts 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE wallet_id = @wallet_id;

-- 软删除该钱包的剧本进度
UPDATE user_script_progress 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE wallet_id = @wallet_id;

-- 软删除该钱包的所有交易记录
UPDATE transactions 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE wallet_id = @wallet_id;

-- 最后软删除钱包本身
UPDATE wallets 
SET deleted = 1, update_time = CURRENT_TIMESTAMP
WHERE id = @wallet_id;

-- 显示删除结果
SELECT 
    @target_wallet_name as target_wallet,
    @wallet_id as wallet_id,
    '钱包及相关数据软删除完成' as message;

-- 验证软删除结果 - 确认相关数据已被标记为删除
SELECT '=== 软删除验证 ===' as section;

SELECT 
    'wallets' as table_name,
    COUNT(*) as active_records,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as soft_deleted_records
FROM wallets 
WHERE id = @wallet_id OR name = @target_wallet_name
UNION ALL
SELECT 
    'transactions' as table_name,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_records,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as soft_deleted_records
FROM transactions 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'social_posts' as table_name,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_records,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as soft_deleted_records
FROM social_posts 
WHERE wallet_id = @wallet_id
UNION ALL
SELECT 
    'user_script_progress' as table_name,
    COUNT(CASE WHEN deleted = 0 THEN 1 END) as active_records,
    COUNT(CASE WHEN deleted = 1 THEN 1 END) as soft_deleted_records
FROM user_script_progress 
WHERE wallet_id = @wallet_id;

-- 提交事务
COMMIT;

SELECT 'test-钱包A 的所有相关数据软删除完成！数据已标记为删除但未物理删除。' as final_message;
