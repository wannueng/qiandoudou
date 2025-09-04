<template>
  <div class="mobile-container">
    <!-- 头部 -->
    <div class="header">
      <el-icon class="back-btn" @click="$router.back()">
        <ArrowLeft />
      </el-icon>
      <div class="header-title">剧本攒钱</div>
      <div></div>
    </div>

    <!-- 剧本详情 -->
    <div class="script-detail">
      <div class="coming-soon">
        <el-icon class="icon"><Reading /></el-icon>
        <h2>剧本攒钱功能</h2>
        <p>精彩的互动剧本正在开发中...</p>
        <p>敬请期待！</p>
        
        <div class="feature-preview">
          <h3>功能预览：</h3>
          <ul>
            <li>📖 沉浸式剧本体验</li>
            <li>🎯 多结局互动选择</li>
            <li>💰 储蓄目标达成</li>
            <li>🤖 AI生成个性化内容</li>
            <li>🎨 精美插图配图</li>
          </ul>
        </div>
        
        <el-button type="primary" @click="$router.back()">
          返回钱包
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScriptDetail'
}
</script>

<style scoped>
.back-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #409eff;
}

.script-detail {
  padding: 40px 20px;
  text-align: center;
}

.coming-soon {
  max-width: 300px;
  margin: 0 auto;
}

.coming-soon .icon {
  font-size: 80px;
  color: #409eff;
  margin-bottom: 20px;
}

.coming-soon h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.coming-soon p {
  color: #909399;
  margin-bottom: 10px;
}

.feature-preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.feature-preview h3 {
  margin-top: 0;
  color: #303133;
  font-size: 16px;
}

.feature-preview ul {
  margin: 0;
  padding-left: 20px;
}

.feature-preview li {
  margin-bottom: 8px;
  color: #606266;
}
</style>
