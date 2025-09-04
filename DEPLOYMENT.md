# 钱兜兜部署指南

## 环境准备

### 必需软件
1. **JDK 1.8** ✅ (您已安装)
2. **MySQL 8.0** ✅ (您已安装)  
3. **Maven** ✅ (您已安装)
4. **Node.js 16+** ✅ (您已安装)
5. **IntelliJ IDEA** ✅ (您已安装)

## 快速部署步骤

### 第一步：数据库初始化

1. **启动MySQL服务**
```bash
# Windows服务方式启动
net start mysql80
```

2. **创建数据库**
```sql
-- 使用MySQL客户端或Navicat等工具执行
CREATE DATABASE IF NOT EXISTS qiandoudou DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **执行数据库脚本**
```bash
# 依次执行以下SQL文件：
# 1. qiandoudou-backend/src/main/resources/sql/init.sql
# 2. qiandoudou-backend/src/main/resources/sql/sample_data.sql
```

### 第二步：后端服务启动

1. **使用IntelliJ IDEA打开后端项目**
```bash
# 打开文件夹：qiandoudou-backend
```

2. **配置数据库连接**
```yaml
# 编辑 qiandoudou-backend/src/main/resources/application.yml
spring:
  datasource:
    username: root
    password: 你的MySQL密码
```

3. **启动后端服务**
```bash
# 方式一：使用批处理文件
双击 start-backend.bat

# 方式二：使用IDEA
在IDEA中运行 QiandoudouApplication.java

# 方式三：命令行
cd qiandoudou-backend
mvn spring-boot:run
```

4. **验证后端服务**
访问：http://localhost:8080/api/auth/demo-login
看到JSON响应说明后端启动成功

### 第三步：前端服务启动

1. **安装前端依赖**
```bash
# 方式一：使用批处理文件
双击 install-frontend.bat

# 方式二：命令行
cd qiandoudou-frontend
npm install
```

2. **启动前端服务**
```bash
# 方式一：使用批处理文件
双击 start-frontend.bat

# 方式二：命令行
cd qiandoudou-frontend
npm run serve
```

3. **访问应用**
打开浏览器访问：http://localhost:3000

## 功能测试

### 登录测试
1. **演示登录**
   - 点击"演示登录"按钮
   - 应该能成功进入主页

2. **普通登录**
   - 用户名：demo_user
   - 密码：123456

### 功能验证
1. **钱包管理**
   - ✅ 查看钱包列表
   - ✅ 创建新钱包
   - ✅ 转入转出资金
   - ✅ 查看交易记录

2. **社交功能**
   - ✅ 查看动态列表
   - ✅ 发布新动态
   - ✅ 点赞评论互动

3. **AI伴侣**
   - ✅ 创建情侣钱包
   - ✅ 选择AI伴侣
   - ✅ 查看AI评论

## 常见问题

### 数据库连接问题
```
Error: Access denied for user 'root'@'localhost'
```
**解决方案：**
1. 检查MySQL服务是否启动
2. 确认用户名密码正确
3. 检查数据库是否创建成功

### 端口占用问题
```
Port 8080 was already in use
```
**解决方案：**
```bash
# Windows查找并结束占用进程
netstat -ano | findstr :8080
taskkill /pid [PID] /f
```

### 前端依赖安装失败
```
npm ERR! network timeout
```
**解决方案：**
```bash
# 切换npm镜像源
npm config set registry https://registry.npmmirror.com/
npm install
```

### 跨域问题
如果前端无法访问后端API，检查：
1. 后端是否在8080端口运行
2. 前端代理配置是否正确
3. 浏览器控制台是否有CORS错误

## 开发环境配置

### IDEA配置
1. **导入项目**
   - File -> Open -> 选择 qiandoudou-backend 文件夹

2. **Maven配置**
   - File -> Settings -> Build -> Build Tools -> Maven
   - 确认Maven home directory指向正确路径

3. **运行配置**
   - Run -> Edit Configurations
   - 添加Spring Boot配置
   - Main class: com.qiandoudou.QiandoudouApplication

### VSCode配置（可选）
如果使用VSCode开发前端：
1. 安装Vue相关插件
2. 安装ESLint插件
3. 配置代码格式化

## 生产环境部署

### 后端打包
```bash
cd qiandoudou-backend
mvn clean package -DskipTests
# 生成 target/qiandoudou-backend-1.0.0.jar
```

### 前端打包
```bash
cd qiandoudou-frontend
npm run build
# 生成 dist/ 目录
```

### 服务器部署
1. **后端部署**
```bash
# 上传jar包到服务器
java -jar qiandoudou-backend-1.0.0.jar
```

2. **前端部署**
```bash
# 将dist目录内容上传到Nginx或Apache
# 配置反向代理到后端API
```

## 监控和日志

### 应用监控
- 后端健康检查：http://localhost:8080/actuator/health
- 应用日志：qiandoudou-backend/logs/

### 数据库监控
```sql
-- 查看连接数
SHOW PROCESSLIST;

-- 查看数据表状态
SHOW TABLE STATUS;
```

## 备份策略

### 数据库备份
```bash
# 每日备份脚本
mysqldump -u root -p qiandoudou > backup_$(date +%Y%m%d).sql
```

### 代码备份
```bash
# 提交到Git仓库
git add .
git commit -m "部署版本 v1.0.0"
git push origin main
```

---

🎉 **恭喜！钱兜兜应用已成功部署完成！**

如遇到问题，请参考常见问题部分或联系技术支持。
