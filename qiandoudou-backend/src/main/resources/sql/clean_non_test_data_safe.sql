-- ======================================================
-- 安全版本：删除除test账号之外的所有用户数据清理脚本
-- ======================================================
-- 警告：此脚本将永久删除数据，执行前请务必备份数据库！
-- 保留的账号：username 包含 'test' 的所有账号
-- ======================================================

-- 执行前检查清单：
-- □ 1. 已备份数据库
-- □ 2. 确认当前环境是开发/测试环境，非生产环境
-- □ 3. 确认test账号确实存在且需要保留
-- □ 4. 已与团队确认此操作

-- ======================================================
-- 第一步：数据安全检查和预览
-- ======================================================

-- 检查数据库连接和权限
SELECT 'Step 1: 数据库连接检查' as step, NOW() as timestamp;

-- 显示当前数据库名称
SELECT DATABASE() as current_database;

-- 检查test用户是否存在
SELECT 'Test用户检查：' as info;
SELECT COUNT(*) as test_user_count 
FROM users 
WHERE username LIKE '%test%' AND deleted = 0;

-- 如果没有test用户，停止执行
-- 注意：在实际执行时，如果没有test用户，请手动停止脚本执行

-- 显示将被保留的test用户
SELECT 'Step 2: 将被保留的Test用户列表：' as info;
SELECT id, username, nickname, phone, create_time 
FROM users 
WHERE username LIKE '%test%' AND deleted = 0
ORDER BY create_time;

-- 显示将被删除的用户（预览）
SELECT 'Step 3: 即将删除的用户列表（预览）：' as info;
SELECT id, username, nickname, phone, create_time 
FROM users 
WHERE username NOT LIKE '%test%' AND deleted = 0
ORDER BY create_time;

-- 统计将被删除的数据量
SELECT 'Step 4: 数据删除量统计：' as info;

SELECT 'Users to delete:' as type, COUNT(*) as count 
FROM users WHERE username NOT LIKE '%test%' AND deleted = 0
UNION ALL
SELECT 'Wallets to delete:' as type, COUNT(*) as count 
FROM wallets WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Transactions to delete:' as type, COUNT(*) as count 
FROM transactions WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Social posts to delete:' as type, COUNT(*) as count 
FROM social_posts WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Comments to delete:' as type, COUNT(*) as count 
FROM post_comments WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Likes to delete:' as type, COUNT(*) as count 
FROM post_likes WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Follows to delete:' as type, COUNT(*) as count 
FROM user_follows WHERE follower_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0) 
    OR following_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'Notifications to delete:' as type, COUNT(*) as count 
FROM notifications WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0)
UNION ALL
SELECT 'User script progress to delete:' as type, COUNT(*) as count 
FROM user_script_progress WHERE user_id NOT IN (SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0);

-- ======================================================
-- 警告提示：请仔细检查上述信息，确认无误后再继续
-- ======================================================

SELECT '=======================================' as separator;
SELECT '警告：请仔细检查上述信息！' as warning_message;
SELECT '如果确认无误，请手动执行下面的删除脚本' as instruction;
SELECT '=======================================' as separator;

-- ======================================================
-- 第二步：执行数据删除（需要手动确认后执行）
-- ======================================================

-- 取消注释下面的代码来执行实际删除操作
-- 注意：请在确认上述预览信息无误后，再取消下面代码的注释

/*
-- 设置安全模式
SET SQL_SAFE_UPDATES = 0;

-- 开始事务
START TRANSACTION;

SELECT 'Step 5: 开始执行数据删除...' as info, NOW() as timestamp;

-- 删除消息通知数据
DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted notifications:', ROW_COUNT() as deleted_count;

-- 删除关注关系数据
DELETE FROM user_follows 
WHERE follower_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
) OR following_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted follows:', ROW_COUNT() as deleted_count;

-- 删除动态点赞数据
DELETE FROM post_likes 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted likes:', ROW_COUNT() as deleted_count;

-- 删除动态评论数据
DELETE FROM post_comments 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted comments:', ROW_COUNT() as deleted_count;

-- 删除社交动态数据
DELETE FROM social_posts 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted posts:', ROW_COUNT() as deleted_count;

-- 删除用户剧本进度数据
DELETE FROM user_script_progress 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted script progress:', ROW_COUNT() as deleted_count;

-- 删除交易记录数据
DELETE FROM transactions 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted transactions:', ROW_COUNT() as deleted_count;

-- 删除钱包数据
DELETE FROM wallets 
WHERE user_id NOT IN (
    SELECT id FROM users WHERE username LIKE '%test%' AND deleted = 0
);
SELECT 'Deleted wallets:', ROW_COUNT() as deleted_count;

-- 删除用户数据（除了test用户）
DELETE FROM users 
WHERE username NOT LIKE '%test%' AND deleted = 0;
SELECT 'Deleted users:', ROW_COUNT() as deleted_count;

SELECT 'Step 6: 数据删除完成！' as info, NOW() as timestamp;

-- ======================================================
-- 第三步：验证删除结果
-- ======================================================

SELECT 'Step 7: 验证删除结果...' as info;

-- 验证剩余用户
SELECT '剩余用户列表：' as info;
SELECT id, username, nickname, create_time 
FROM users 
WHERE deleted = 0;

-- 统计剩余数据
SELECT 'Remaining users:' as type, COUNT(*) as count FROM users WHERE deleted = 0
UNION ALL
SELECT 'Remaining wallets:' as type, COUNT(*) as count FROM wallets WHERE deleted = 0
UNION ALL
SELECT 'Remaining transactions:' as type, COUNT(*) as count FROM transactions WHERE deleted = 0
UNION ALL
SELECT 'Remaining posts:' as type, COUNT(*) as count FROM social_posts WHERE deleted = 0
UNION ALL
SELECT 'Remaining comments:' as type, COUNT(*) as count FROM post_comments WHERE deleted = 0
UNION ALL
SELECT 'Remaining likes:' as type, COUNT(*) as count FROM post_likes WHERE deleted = 0
UNION ALL
SELECT 'Remaining follows:' as type, COUNT(*) as count FROM user_follows WHERE deleted = 0
UNION ALL
SELECT 'Remaining notifications:' as type, COUNT(*) as count FROM notifications WHERE deleted = 0
UNION ALL
SELECT 'Remaining script progress:' as type, COUNT(*) as count FROM user_script_progress WHERE deleted = 0;

-- 提交事务
COMMIT;

-- 恢复安全模式
SET SQL_SAFE_UPDATES = 1;

SELECT 'Step 8: 数据清理脚本执行完成！' as final_message, NOW() as timestamp;
*/

-- ======================================================
-- 使用说明
-- ======================================================
-- 1. 首先运行上半部分的预览脚本，检查将要删除的数据
-- 2. 确认无误后，取消下半部分删除脚本的注释
-- 3. 再次执行完整脚本来实际删除数据
-- 4. 建议分步执行，每次执行一个DELETE语句并检查结果
-- ======================================================

