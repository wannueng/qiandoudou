-- =====================================================
-- 为test1用户创建他应该收到的互动消息
-- test1用户ID: 1961688416014127106
-- 让其他用户对test1的钱包和交易进行互动
-- =====================================================

USE qiandoudou;

-- 开始事务
START TRANSACTION;

-- 设置用户ID
SET @test1_user_id = 1961688416014127106;

-- 查找test1用户的钱包
SET @test1_wallet_id = (SELECT id FROM wallets WHERE user_id = @test1_user_id AND deleted = 0 LIMIT 1);
SET @test1_wallet_name = (SELECT name FROM wallets WHERE id = @test1_wallet_id);

-- 查找test1用户钱包的一个交易记录
SET @test1_transaction_id = (
    SELECT id FROM transactions 
    WHERE wallet_id = @test1_wallet_id AND deleted = 0 
    ORDER BY create_time DESC 
    LIMIT 1
);

-- 设置其他用户ID（模拟其他用户）
SET @other_user_id1 = 1961688416014127105;  -- test用户
SET @other_user_id2 = 1961688416014127107;  -- 第三个用户

-- 显示信息
SELECT 
    CONCAT('test1用户ID: ', @test1_user_id) as info
UNION ALL
SELECT 
    CONCAT('test1钱包ID: ', IFNULL(@test1_wallet_id, 'NULL'), ', 名称: ', IFNULL(@test1_wallet_name, 'NULL'))
UNION ALL
SELECT 
    CONCAT('test1交易ID: ', IFNULL(@test1_transaction_id, 'NULL'));

-- 清理相关的旧数据
DELETE FROM notifications WHERE user_id = @test1_user_id;
DELETE FROM post_likes WHERE post_id = @test1_transaction_id AND user_id IN (@other_user_id1, @other_user_id2);
DELETE FROM post_comments WHERE post_id = @test1_transaction_id AND user_id IN (@other_user_id1, @other_user_id2);
DELETE FROM user_follows WHERE follower_id IN (@other_user_id1, @other_user_id2) AND following_id = @test1_user_id;

-- 1. 其他用户点赞test1的交易
INSERT INTO post_likes (post_id, user_id, is_ai_like, create_time) 
VALUES 
(@test1_transaction_id, @other_user_id1, 0, NOW()),
(@test1_transaction_id, @other_user_id2, 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 2. 其他用户关注test1
INSERT INTO user_follows (follower_id, following_id, create_time) 
VALUES 
(@other_user_id1, @test1_user_id, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@other_user_id2, @test1_user_id, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 3. 其他用户评论test1的交易
INSERT INTO post_comments (post_id, user_id, content, is_ai_comment, create_time) 
VALUES 
(@test1_transaction_id, @other_user_id1, '记账很棒！学习了👍', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(@test1_transaction_id, @other_user_id2, '这个支出分类很合理', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE));

-- 4. 为test1用户创建相应的通知消息
-- 点赞通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@test1_user_id, @other_user_id1, 1, '收到新点赞', '给你点赞', @test1_wallet_id, @test1_transaction_id, '/images/img/bg.png', 0, NOW()),
(@test1_user_id, @other_user_id2, 1, '收到新点赞', '给你点赞', @test1_wallet_id, @test1_transaction_id, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 关注通知  
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@test1_user_id, @other_user_id1, 3, '新关注', '关注了你', @test1_wallet_id, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@test1_user_id, @other_user_id2, 3, '新关注', '关注了你', @test1_wallet_id, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 评论通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@test1_user_id, @other_user_id1, 2, '收到新评论', '记账很棒！学习了👍', @test1_wallet_id, @test1_transaction_id, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(@test1_user_id, @other_user_id2, 2, '收到新评论', '这个支出分类很合理', @test1_wallet_id, @test1_transaction_id, '/images/img/bg.png', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE));

-- 额外添加一些系统通知
INSERT INTO notifications 
(user_id, sender_id, type, title, content, wallet_id, transaction_id, post_image, is_read, create_time) 
VALUES 
(@test1_user_id, NULL, 4, '系统通知', '欢迎使用钱兜兜记账！', NULL, NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 提交事务
COMMIT;

-- 验证数据
SELECT '=== test1用户收到的通知消息 ===' as section;
SELECT n.*, u.nickname as sender_name
FROM notifications n
LEFT JOIN users u ON n.sender_id = u.id
WHERE n.user_id = @test1_user_id AND n.deleted = 0
ORDER BY n.create_time DESC;
