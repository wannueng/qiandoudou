-- SQL语法测试脚本
-- 用于验证数据清理脚本的语法正确性

-- 测试查询语法（不执行实际删除）
SELECT 'SQL语法测试开始' as test_info;

-- 测试子查询语法
SELECT COUNT(*) as test_count
FROM users 
WHERE username LIKE '%test%' AND deleted = 0;

-- 测试DELETE语法（使用LIMIT 0避免实际删除）
EXPLAIN DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM user_follows 
WHERE follower_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) OR following_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM post_likes 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM post_comments 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM social_posts 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM user_script_progress 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM transactions 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM wallets 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) LIMIT 0;

EXPLAIN DELETE FROM users 
WHERE username NOT LIKE '%test%' AND deleted = 0
LIMIT 0;

SELECT 'SQL语法测试完成 - 所有语句语法正确' as test_result;

