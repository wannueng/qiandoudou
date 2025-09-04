-- 古风古情剧本数据插入脚本
-- 基于剧本攒功能需求文档.md中的JSON数据生成

USE qiandoudou;

-- 清理现有古风古情剧本数据，避免主键冲突
DELETE FROM user_script_progress WHERE script_id = 1;
DELETE FROM script_chapters WHERE script_id = 1;
DELETE FROM scripts WHERE id = 1;

-- 插入古风古情剧本基础信息
INSERT INTO `scripts` (`id`, `title`, `description`, `category_id`, `cover_image`, `total_chapters`, `target_amount`, `duration_days`, `daily_amount`, `follower_count`, `status`) 
VALUES (1, '古风古情', '浪漫的恋爱故事，跟随主角体验甜蜜的爱情旅程', 1, 'https://via.placeholder.com/200x120/ff9a9e/ffffff?text=古风古情', 3, 400.00, 100, 4.00, 50000, 1);

-- 插入章节数据（基于JSON结构）
INSERT INTO `script_chapters` (`script_id`, `chapter_number`, `title`, `content`, `choices`, `video_url`) VALUES
-- 第1集：寻佳缘
(1, 1, '寻佳缘', NULL, '[{"selection": "A.星汉灿烂", "nextId": "2", "cost": 8}, {"selection": "B.星汉灿烂", "nextId": "2", "cost": 10}]', '/images/script/古风古情/寻佳缘.mp4'),

-- 第2集：星汉灿烂  
(1, 2, '星汉灿烂', NULL, '[{"selection": "A.好结局", "nextId": "3", "cost": 8}, {"selection": "B.好结局", "nextId": "3", "cost": 16}]', '/images/script/古风古情/星汉灿烂.mp4'),

-- 第3集：好结局
(1, 3, '好结局', NULL, '[{"selection": "A.完美结局", "nextId": null, "cost": 8}, {"selection": "B.完美结局", "nextId": null, "cost": 12}]', '/images/script/古风古情/好结局.mp4');

-- 验证插入结果
SELECT '=== 古风古情剧本信息 ===' as info;
SELECT * FROM scripts WHERE id = 1;

SELECT '=== 章节信息 ===' as info;
SELECT id, script_id, chapter_number, title, choices, video_url FROM script_chapters WHERE script_id = 1 ORDER BY chapter_number;

