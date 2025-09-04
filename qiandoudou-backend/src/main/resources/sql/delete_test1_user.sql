-- ======================================================
-- 删除test1用户的所有数据清理脚本
-- ======================================================
-- 警告：此脚本将永久删除test1用户的所有数据！
-- ======================================================

-- 设置安全模式，防止意外的全表删除
SET SQL_SAFE_UPDATES = 0;

-- 开始事务，确保数据一致性
START TRANSACTION;

-- ======================================================
-- 第一步：数据安全检查和预览
-- ======================================================

-- 检查数据库连接和权限
SELECT 'Step 1: 数据库连接检查' as step, NOW() as timestamp;

-- 显示当前数据库名称
SELECT DATABASE() as current_database;

-- 检查test1用户是否存在
SELECT 'Test1用户检查：' as info;
SELECT COUNT(*) as test1_user_count 
FROM users 
WHERE username = 'test1' AND deleted = 0;

-- 显示test1用户信息
SELECT 'Step 2: Test1用户信息：' as info;
SELECT id, username, nickname, phone, create_time 
FROM users 
WHERE username = 'test1' AND deleted = 0;

-- 获取test1用户ID（用于后续删除操作）
SET @test1_user_id = (SELECT id FROM users WHERE username = 'test1' AND deleted = 0 LIMIT 1);

-- 显示test1用户相关数据统计
SELECT 'Step 3: Test1用户数据统计：' as info;

SELECT 'Test1 Wallets:' as type, COUNT(*) as count 
FROM wallets WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Transactions:' as type, COUNT(*) as count 
FROM transactions WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Social Posts:' as type, COUNT(*) as count 
FROM social_posts WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Comments:' as type, COUNT(*) as count 
FROM post_comments WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Likes:' as type, COUNT(*) as count 
FROM post_likes WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Follows:' as type, COUNT(*) as count 
FROM user_follows WHERE follower_id = @test1_user_id OR following_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Notifications:' as type, COUNT(*) as count 
FROM notifications WHERE user_id = @test1_user_id AND deleted = 0
UNION ALL
SELECT 'Test1 Script Progress:' as type, COUNT(*) as count 
FROM user_script_progress WHERE user_id = @test1_user_id AND deleted = 0;

-- ======================================================
-- 第二步：开始数据清理（按照外键依赖关系的逆序删除）
-- ======================================================

-- 如果test1用户不存在，跳过删除操作
-- 注意：在实际执行时，如果没有test1用户，请手动停止脚本执行

-- 4. 删除test1用户的消息通知数据
DELETE FROM notifications 
WHERE user_id = @test1_user_id;

-- 5. 删除test1用户的关注关系数据
DELETE FROM user_follows 
WHERE follower_id = @test1_user_id OR following_id = @test1_user_id;

-- 6. 删除test1用户的动态点赞数据
DELETE FROM post_likes 
WHERE user_id = @test1_user_id;

-- 7. 删除test1用户的动态评论数据
DELETE FROM post_comments 
WHERE user_id = @test1_user_id;

-- 8. 删除test1用户的社交动态数据
DELETE FROM social_posts 
WHERE user_id = @test1_user_id;

-- 9. 删除test1用户的剧本进度数据
DELETE FROM user_script_progress 
WHERE user_id = @test1_user_id;

-- 10. 删除test1用户的交易记录数据
DELETE FROM transactions 
WHERE user_id = @test1_user_id;

-- 11. 删除test1用户的钱包数据
DELETE FROM wallets 
WHERE user_id = @test1_user_id;

-- 12. 最后删除test1用户账户
DELETE FROM users 
WHERE username = 'test1' AND deleted = 0;

-- ======================================================
-- 数据清理完成后的验证和统计
-- ======================================================

-- 13. 验证test1用户是否已被删除
SELECT 'Test1用户删除验证：' as info;
SELECT COUNT(*) as remaining_test1_users 
FROM users 
WHERE username = 'test1' AND deleted = 0;

-- 14. 显示剩余的所有用户
SELECT '剩余用户列表：' as info;
SELECT id, username, nickname, create_time 
FROM users 
WHERE deleted = 0
ORDER BY create_time;

-- 15. 统计剩余数据
SELECT '剩余数据统计：' as info;

SELECT 'Total Users:' as type, COUNT(*) as count FROM users WHERE deleted = 0
UNION ALL
SELECT 'Total Wallets:' as type, COUNT(*) as count FROM wallets WHERE deleted = 0
UNION ALL
SELECT 'Total Transactions:' as type, COUNT(*) as count FROM transactions WHERE deleted = 0
UNION ALL
SELECT 'Total Social Posts:' as type, COUNT(*) as count FROM social_posts WHERE deleted = 0
UNION ALL
SELECT 'Total Comments:' as type, COUNT(*) as count FROM post_comments WHERE deleted = 0
UNION ALL
SELECT 'Total Likes:' as type, COUNT(*) as count FROM post_likes WHERE deleted = 0
UNION ALL
SELECT 'Total Follows:' as type, COUNT(*) as count FROM user_follows WHERE deleted = 0
UNION ALL
SELECT 'Total Notifications:' as type, COUNT(*) as count FROM notifications WHERE deleted = 0
UNION ALL
SELECT 'Total Script Progress:' as type, COUNT(*) as count FROM user_script_progress WHERE deleted = 0;

-- 提交事务
COMMIT;

-- 恢复安全模式
SET SQL_SAFE_UPDATES = 1;

SELECT 'Test1用户数据删除脚本执行完成！' as final_message;

