-- ======================================================
-- 删除除test账号之外的所有用户数据清理脚本
-- ======================================================
-- 警告：此脚本将永久删除数据，执行前请务必备份数据库！
-- 保留的账号：username 包含 'test' 的所有账号
-- ======================================================

-- 设置安全模式，防止意外的全表删除
SET SQL_SAFE_UPDATES = 0;

-- 开始事务，确保数据一致性
START TRANSACTION;

-- 1. 获取需要保留的test用户ID列表（用于验证）
SELECT 'Test用户列表（将被保留）：' as info;
SELECT id, username, nickname, create_time 
FROM users 
WHERE username LIKE '%test%' AND deleted = 0;

-- 2. 获取需要删除的用户ID列表（用于确认）
SELECT '即将删除的用户列表：' as info;
SELECT id, username, nickname, create_time 
FROM users 
WHERE username NOT LIKE '%test%' AND deleted = 0;

-- ======================================================
-- 开始数据清理（按照外键依赖关系的逆序删除）
-- ======================================================

-- 3. 删除消息通知数据
DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 4. 删除关注关系数据
DELETE FROM user_follows 
WHERE follower_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) OR following_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 5. 删除动态点赞数据
DELETE FROM post_likes 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 6. 删除动态评论数据
DELETE FROM post_comments 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 7. 删除社交动态数据
DELETE FROM social_posts 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 8. 删除用户剧本进度数据
DELETE FROM user_script_progress 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 9. 删除交易记录数据
DELETE FROM transactions 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 10. 删除钱包数据
DELETE FROM wallets 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);

-- 11. 最后删除用户数据（除了test用户）
DELETE FROM users 
WHERE username NOT LIKE '%test%' AND deleted = 0;

-- ======================================================
-- 数据清理完成后的验证和统计
-- ======================================================

-- 12. 验证剩余数据
SELECT '数据清理完成！剩余用户：' as info;
SELECT id, username, nickname, create_time 
FROM users 
WHERE deleted = 0;

SELECT '剩余钱包数量：' as info;
SELECT COUNT(*) as wallet_count FROM wallets WHERE deleted = 0;

SELECT '剩余交易记录数量：' as info;
SELECT COUNT(*) as transaction_count FROM transactions WHERE deleted = 0;

SELECT '剩余社交动态数量：' as info;
SELECT COUNT(*) as post_count FROM social_posts WHERE deleted = 0;

SELECT '剩余评论数量：' as info;
SELECT COUNT(*) as comment_count FROM post_comments WHERE deleted = 0;

SELECT '剩余点赞数量：' as info;
SELECT COUNT(*) as like_count FROM post_likes WHERE deleted = 0;

SELECT '剩余关注关系数量：' as info;
SELECT COUNT(*) as follow_count FROM user_follows WHERE deleted = 0;

SELECT '剩余消息通知数量：' as info;
SELECT COUNT(*) as notification_count FROM notifications WHERE deleted = 0;

SELECT '剩余用户剧本进度数量：' as info;
SELECT COUNT(*) as progress_count FROM user_script_progress WHERE deleted = 0;

-- 提交事务
COMMIT;

-- 恢复安全模式
SET SQL_SAFE_UPDATES = 1;

SELECT '数据清理脚本执行完成！' as final_message;

