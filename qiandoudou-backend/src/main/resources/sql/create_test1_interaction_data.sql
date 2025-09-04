-- =====================================================
-- 为test1用户创建互动数据
-- test1用户ID: 1961688416014127106
-- 在钱包"test-钱包1"的账单动态下点赞、关注、评论
-- =====================================================

USE qiandoudou;

-- 开始事务
START TRANSACTION;

-- 设置用户ID
SET @test1_user_id = 1961688416014127106;

-- 查找test-钱包1的信息
SET @target_wallet_name = 'test-钱包1';
SET @target_wallet_id = (SELECT id FROM wallets WHERE name = @target_wallet_name AND deleted = 0 LIMIT 1);
SET @wallet_owner_id = (SELECT user_id FROM wallets WHERE id = @target_wallet_id LIMIT 1);

-- 显示钱包信息
SELECT 
    CASE 
        WHEN @target_wallet_id IS NULL THEN '警告：未找到名为 "test-钱包1" 的钱包！'
        ELSE CONCAT('找到钱包ID: ', @target_wallet_id, '，所有者ID: ', @wallet_owner_id)
    END as wallet_info;

-- 查找该钱包的一个交易记录用于点赞和评论
SET @target_transaction_id = (
    SELECT id FROM transactions 
    WHERE wallet_id = @target_wallet_id AND deleted = 0 
    ORDER BY create_time DESC 
    LIMIT 1
);

SELECT 
    CASE 
        WHEN @target_transaction_id IS NULL THEN '警告：该钱包没有交易记录！'
        ELSE CONCAT('找到交易ID: ', @target_transaction_id)
    END as transaction_info;

-- 清理test1用户的旧数据
DELETE FROM post_likes WHERE user_id = @test1_user_id;
DELETE FROM post_comments WHERE user_id = @test1_user_id;
DELETE FROM user_follows WHERE follower_id = @test1_user_id;
DELETE FROM notifications WHERE user_id = @wallet_owner_id AND sender_id = @test1_user_id;

-- 1. test1用户点赞该钱包的交易
INSERT INTO post_likes (post_id, user_id, is_ai_like, create_time) 
VALUES (@target_transaction_id, @test1_user_id, 0, NOW());

-- 2. test1用户关注该钱包的所有者
INSERT INTO user_follows (follower_id, following_id, create_time) 
VALUES (@test1_user_id, @wallet_owner_id, NOW());

-- 3. test1用户评论该交易
INSERT INTO post_comments (post_id, user_id, content, is_ai_comment, create_time) 
VALUES (@target_transaction_id, @test1_user_id, '这个记账很棒！我也要学习这样记账💪', 0, NOW());

-- 4. 为钱包所有者创建相应的通知消息
-- 点赞通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@wallet_owner_id, @test1_user_id, 1, '收到新点赞', '给你点赞', @target_wallet_id, @target_transaction_id, '/images/img/bg.png', 0, NOW());

-- 关注通知  
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@wallet_owner_id, @test1_user_id, 3, '新关注', '关注了你', @target_wallet_id, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 1 MINUTE));

-- 评论通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@wallet_owner_id, @test1_user_id, 2, '收到新评论', '这个记账很棒！我也要学习这样记账💪', @target_wallet_id, @target_transaction_id, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 30 SECOND));

-- 提交事务
COMMIT;

-- 验证数据
SELECT '=== test1用户的互动数据 ===' as section;

-- 验证点赞数据
SELECT 'post_likes' as table_name, COUNT(*) as count
FROM post_likes 
WHERE user_id = @test1_user_id AND deleted = 0;

-- 验证关注数据
SELECT 'user_follows' as table_name, COUNT(*) as count
FROM user_follows 
WHERE follower_id = @test1_user_id AND deleted = 0;

-- 验证评论数据
SELECT 'post_comments' as table_name, COUNT(*) as count
FROM post_comments 
WHERE user_id = @test1_user_id AND deleted = 0;

-- 验证通知数据
SELECT 'notifications' as table_name, COUNT(*) as count
FROM notifications 
WHERE sender_id = @test1_user_id AND deleted = 0;

-- 显示钱包所有者应该收到的通知
SELECT '=== 钱包所有者收到的通知 ===' as section;
SELECT n.*, u.nickname as sender_name
FROM notifications n
LEFT JOIN users u ON n.sender_id = u.id
WHERE n.user_id = @wallet_owner_id AND n.sender_id = @test1_user_id AND n.deleted = 0
ORDER BY n.create_time DESC;
