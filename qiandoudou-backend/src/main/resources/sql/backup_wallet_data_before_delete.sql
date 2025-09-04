-- =====================================================
-- 钱包数据备份脚本
-- 用途：在物理删除前备份所有钱包相关数据
-- 建议在执行物理删除脚本前先运行此备份脚本
-- =====================================================

USE qiandoudou;

-- 创建备份表的时间戳后缀
SET @backup_suffix = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');

-- 1. 备份钱包表
SET @sql = CONCAT('CREATE TABLE wallets_backup_', @backup_suffix, ' AS SELECT * FROM wallets');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 备份交易记录表
SET @sql = CONCAT('CREATE TABLE transactions_backup_', @backup_suffix, ' AS SELECT * FROM transactions');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 备份AI伴侣表
SET @sql = CONCAT('CREATE TABLE ai_partners_backup_', @backup_suffix, ' AS SELECT * FROM ai_partners');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 备份社交动态表
SET @sql = CONCAT('CREATE TABLE social_posts_backup_', @backup_suffix, ' AS SELECT * FROM social_posts');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. 备份动态评论表
SET @sql = CONCAT('CREATE TABLE post_comments_backup_', @backup_suffix, ' AS SELECT * FROM post_comments WHERE post_id IN (SELECT id FROM social_posts)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. 备份动态点赞表
SET @sql = CONCAT('CREATE TABLE post_likes_backup_', @backup_suffix, ' AS SELECT * FROM post_likes WHERE post_id IN (SELECT id FROM social_posts)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. 备份用户剧本进度表
SET @sql = CONCAT('CREATE TABLE user_script_progress_backup_', @backup_suffix, ' AS SELECT * FROM user_script_progress');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. 备份钱包相关通知
SET @sql = CONCAT('CREATE TABLE notifications_wallet_backup_', @backup_suffix, ' AS SELECT * FROM notifications WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 显示备份结果
SELECT '=== 备份完成统计 ===' as section;

SELECT 
    CONCAT('wallets_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM wallets) as backed_up_records
UNION ALL
SELECT 
    CONCAT('transactions_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM transactions) as backed_up_records
UNION ALL
SELECT 
    CONCAT('ai_partners_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM ai_partners) as backed_up_records
UNION ALL
SELECT 
    CONCAT('social_posts_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM social_posts) as backed_up_records
UNION ALL
SELECT 
    CONCAT('post_comments_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM post_comments WHERE post_id IN (SELECT id FROM social_posts)) as backed_up_records
UNION ALL
SELECT 
    CONCAT('post_likes_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM post_likes WHERE post_id IN (SELECT id FROM social_posts)) as backed_up_records
UNION ALL
SELECT 
    CONCAT('user_script_progress_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM user_script_progress) as backed_up_records
UNION ALL
SELECT 
    CONCAT('notifications_wallet_backup_', @backup_suffix) as backup_table,
    (SELECT COUNT(*) FROM notifications WHERE wallet_id IS NOT NULL OR transaction_id IS NOT NULL) as backed_up_records;

-- 生成恢复脚本的提示
SELECT '' as separator;
SELECT '=== 备份信息 ===' as section;
SELECT CONCAT('备份时间戳: ', @backup_suffix) as backup_info;
SELECT '备份表已创建，表名格式为: 原表名_backup_时间戳' as table_format;
SELECT '如需恢复数据，请手动重命名备份表或使用INSERT INTO语句恢复数据。' as recovery_note;

-- 显示清理备份表的SQL（供参考）
SELECT '' as separator;
SELECT '=== 清理备份表的SQL（供参考） ===' as section;
SELECT CONCAT('DROP TABLE IF EXISTS wallets_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS transactions_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS ai_partners_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS social_posts_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS post_comments_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS post_likes_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS user_script_progress_backup_', @backup_suffix, ';') as cleanup_sql
UNION ALL
SELECT CONCAT('DROP TABLE IF EXISTS notifications_wallet_backup_', @backup_suffix, ';') as cleanup_sql;

SELECT '✅ 钱包数据备份完成！现在可以安全执行物理删除操作。' as final_message;
