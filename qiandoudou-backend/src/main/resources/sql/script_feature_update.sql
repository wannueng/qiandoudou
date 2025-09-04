-- 剧本功能数据库更新脚本

USE qiandoudou;

-- 更新剧本表，添加新字段
ALTER TABLE `scripts` 
ADD COLUMN `category_id` tinyint(1) DEFAULT 1 COMMENT '分类：1-推荐，2-旅行，3-购物，4-学习，5-健身' AFTER `description`,
ADD COLUMN `duration_days` int(11) DEFAULT 30 COMMENT '攒钱周期（天）' AFTER `target_amount`,
ADD COLUMN `daily_amount` decimal(10,2) DEFAULT 0.00 COMMENT '建议每日攒钱金额' AFTER `duration_days`,
ADD COLUMN `follower_count` int(11) DEFAULT 0 COMMENT '关注人数' AFTER `daily_amount`;

-- 更新剧本章节表，添加视频字段
ALTER TABLE `script_chapters`
ADD COLUMN `video_url` varchar(500) COMMENT '章节视频URL' AFTER `image_url`;

-- 插入初始剧本数据 - 超级玛丽多恋爱小事
INSERT INTO `scripts` (`id`, `title`, `description`, `category_id`, `cover_image`, `total_chapters`, `target_amount`, `duration_days`, `daily_amount`, `follower_count`, `status`) 
VALUES (1, '超级玛丽多恋爱小事', '浪漫的恋爱故事，跟随主角体验甜蜜的爱情旅程', 1, '/images/script/古风古情/cover.jpg', 3, 400.00, 100, 4.00, 50000, 1);

-- 插入剧本章节数据（基于需求文档中的JSON结构）
INSERT INTO `script_chapters` (`script_id`, `chapter_number`, `title`, `content`, `choices`, `video_url`) VALUES
(1, 1, '寻佳缘', NULL, '[{"selection": "A.星汉灿烂", "nextId": "2", "cost": 8}, {"selection": "B.星汉灿烂", "nextId": "2", "cost": 10}]', '/images/script/古风古情/寻佳缘.mp4'),
(1, 2, '星汉灿烂', NULL, '[{"selection": "A.好结局", "nextId": "3", "cost": 8}, {"selection": "B.好结局", "nextId": "3", "cost": 16}]', '/images/script/古风古情/星汉灿烂.mp4'),
(1, 3, '好结局', NULL, '[{"selection": "A.完美结局", "nextId": null, "cost": 8}, {"selection": "B.完美结局", "nextId": null, "cost": 12}]', '/images/script/古风古情/好结局.mp4');

-- 插入其他推荐剧本
INSERT INTO `scripts` (`id`, `title`, `description`, `category_id`, `cover_image`, `total_chapters`, `target_amount`, `duration_days`, `daily_amount`, `follower_count`, `status`) VALUES
(2, '模拟买房攒钱', '通过模拟买房过程，学会理财攒钱的重要性', 3, '/images/script/covers/house_saving.jpg', 10, 1300, 65, 20, 1500000, 1),
(3, '重新养小时候的自己', '回到童年，重新体验成长的美好时光', 4, '/images/script/covers/childhood.jpg', 10, 1300, 65, 20, 0, 1);
