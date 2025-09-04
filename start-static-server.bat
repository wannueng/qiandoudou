@echo off
echo 启动静态文件服务器（禁用缓存）...
cd qiandoudou-frontend
echo 在 http://localhost:3001 启动静态文件服务器
echo 注意：已禁用缓存，确保播放最新的视频文件
npx http-server images -p 3001 --cors -c-1 --no-cache
pause
