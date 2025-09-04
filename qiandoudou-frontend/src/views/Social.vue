<template>
  <div class="social-container">
    <!-- 社交圈头部 -->
    <div class="social-header">
      <h2>兜圈圈</h2>
      <el-button type="text" class="publish-btn" @click="showPublishDialog = true">
        <el-icon><Edit /></el-icon>
        发布
      </el-button>
    </div>

    <!-- 动态列表 -->
    <div class="posts-container" v-loading="loading">
      <div v-if="posts.length === 0" class="empty-state">
        <el-icon class="icon"><ChatDotSquare /></el-icon>
        <div class="text">还没有动态，快来分享你的理财心得吧！</div>
      </div>

      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card"
      >
        <!-- 动态头部 -->
        <div class="post-header">
          <el-avatar :src="post.user_avatar" :size="40">
            {{ post.user_nickname?.charAt(0) }}
          </el-avatar>
          <div class="post-user-info">
            <div class="post-username">{{ post.user_nickname }}</div>
            <div class="post-time">{{ formatTime(post.create_time) }}</div>
          </div>
          <el-dropdown v-if="post.user_id === currentUserId">
            <el-icon class="post-more"><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="deletePost(post.id)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 动态内容 -->
        <div class="post-content">
          <p>{{ post.content }}</p>
          
          <!-- 动态图片 -->
          <div v-if="post.images && post.images.length > 0" class="post-images">
            <el-image
              v-for="(image, index) in post.images"
              :key="index"
              :src="image"
              class="post-image"
              fit="cover"
              :preview-src-list="post.images"
            />
          </div>

          <!-- 交易信息 -->
          <div v-if="post.transaction_info" class="transaction-info">
            <div class="transaction-card">
              <el-icon class="transaction-icon">
                <Wallet />
              </el-icon>
              <div class="transaction-details">
                <div class="transaction-desc">{{ post.transaction_info.description }}</div>
                <div class="transaction-amount" :class="getAmountClass(post.transaction_info.type)">
                  {{ getAmountPrefix(post.transaction_info.type) }}¥{{ formatAmount(post.transaction_info.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 动态操作 -->
        <div class="post-actions">
          <el-button 
            type="text" 
            class="action-btn"
            :class="{ active: post.is_liked }"
            @click="toggleLike(post)"
          >
            <el-icon><Heart /></el-icon>
            {{ post.like_count }}
          </el-button>
          
          <el-button 
            type="text" 
            class="action-btn"
            @click="showComments(post)"
          >
            <el-icon><ChatDotRound /></el-icon>
            {{ post.comment_count }}
          </el-button>
          
          <el-button 
            type="text" 
            class="action-btn"
            @click="sharePost(post)"
          >
            分享
          </el-button>
        </div>

        <!-- 评论区 -->
        <div v-if="post.show_comments" class="comments-section">
          <!-- 评论输入 -->
          <div class="comment-input">
            <el-input
              v-model="post.comment_text"
              placeholder="说点什么..."
              size="small"
            >
              <template #append>
                <el-button @click="submitComment(post)">发布</el-button>
              </template>
            </el-input>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div 
              v-for="comment in post.comments" 
              :key="comment.id"
              class="comment-item"
              :class="{ 'ai-comment': comment.is_ai_comment }"
            >
              <el-avatar :src="comment.user_avatar" :size="24">
                {{ comment.user_nickname?.charAt(0) }}
              </el-avatar>
              <div class="comment-content">
                <div class="comment-user">
                  {{ comment.user_nickname }}
                  <span v-if="comment.is_ai_comment" class="ai-tag">AI</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                
                <!-- AI语音（如果有） -->
                <div v-if="comment.voice_url" class="comment-voice">
                  <el-button type="text" size="small" @click="playVoice(comment.voice_url)">
                    <el-icon><Microphone /></el-icon>
                    播放语音
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布动态对话框 -->
    <el-dialog 
      v-model="showPublishDialog" 
      title="发布动态" 
      width="90%"
      :close-on-click-modal="false"
    >
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="内容">
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的理财心得..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="图片">
          <el-upload
            v-model:file-list="publishForm.images"
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPublishDialog = false">取消</el-button>
          <el-button type="primary" @click="publishPost">发布</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Social',
  setup() {
    const store = useStore()
    
    const loading = ref(false)
    const posts = ref([])
    const showPublishDialog = ref(false)
    
    // 发布表单
    const publishForm = reactive({
      content: '',
      images: []
    })
    
    // 当前用户ID
    const currentUserId = computed(() => store.state.user?.id)
    
    // 格式化时间
    const formatTime = (time) => {
      const now = new Date()
      const postTime = new Date(time)
      const diff = now - postTime
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return postTime.toLocaleDateString()
    }
    
    // 格式化金额
    const formatAmount = (amount) => {
      return parseFloat(amount).toFixed(2)
    }
    
    // 获取金额样式类
    const getAmountClass = (type) => {
      switch (type) {
        case 1: return 'income'
        case 2: return 'expense'
        case 3: return 'script'
        default: return ''
      }
    }
    
    // 获取金额前缀
    const getAmountPrefix = (type) => {
      switch (type) {
        case 1: return '+'
        case 2: return '-'
        case 3: return '+'
        default: return ''
      }
    }
    
    // 切换点赞
    const toggleLike = (post) => {
      post.is_liked = !post.is_liked
      post.like_count += post.is_liked ? 1 : -1
      ElMessage.success(post.is_liked ? '点赞成功' : '取消点赞')
    }
    
    // 显示评论
    const showComments = (post) => {
      post.show_comments = !post.show_comments
      if (post.show_comments && !post.comments) {
        // 加载评论
        loadComments(post)
      }
    }
    
    // 加载评论
    const loadComments = (post) => {
      // 模拟评论数据
      post.comments = [
        {
          id: 1,
          user_nickname: '小红',
          user_avatar: '/img/avatars/user2.png',
          content: '加油！储蓄是个好习惯！',
          is_ai_comment: false
        },
        {
          id: 2,
          user_nickname: '小雅',
          user_avatar: '/img/ai_partners/xiaoya.png',
          content: '亲爱的，看到你这样努力储蓄，我真的很开心呢～继续加油哦！💕',
          voice_url: '/voice/ai_comment_1.mp3',
          is_ai_comment: true
        }
      ]
    }
    
    // 提交评论
    const submitComment = (post) => {
      if (!post.comment_text?.trim()) {
        ElMessage.warning('请输入评论内容')
        return
      }
      
      // 检查用户是否已登录
      if (!store.state.user) {
        ElMessage.error('请先登录')
        return
      }
      
      const newComment = {
        id: Date.now(),
        user_nickname: store.state.user.nickname || '匿名用户',
        user_avatar: store.state.user.avatar || '/img/avatars/default.png',
        content: post.comment_text,
        is_ai_comment: false
      }
      
      if (!post.comments) {
        post.comments = []
      }
      post.comments.push(newComment)
      post.comment_count++
      post.comment_text = ''
      
      ElMessage.success('评论发布成功')
    }
    
    // 分享动态
    const sharePost = (post) => {
      ElMessage.success('分享成功')
    }
    
    // 删除动态
    const deletePost = (postId) => {
      posts.value = posts.value.filter(p => p.id !== postId)
      ElMessage.success('删除成功')
    }
    
    // 播放语音
    const playVoice = (voiceUrl) => {
      ElMessage.info('播放语音功能开发中...')
    }
    
    // 发布动态
    const publishPost = () => {
      if (!publishForm.content.trim()) {
        ElMessage.warning('请输入动态内容')
        return
      }
      
      // 检查用户是否已登录
      if (!store.state.user) {
        ElMessage.error('请先登录')
        return
      }
      
      const newPost = {
        id: Date.now(),
        user_id: currentUserId.value,
        user_nickname: store.state.user.nickname || '匿名用户',
        user_avatar: store.state.user.avatar || '/img/avatars/default.png',
        content: publishForm.content,
        images: publishForm.images.map(img => img.url).filter(Boolean),
        like_count: 0,
        comment_count: 0,
        create_time: new Date().toISOString(),
        is_liked: false,
        show_comments: false,
        comment_text: ''
      }
      
      posts.value.unshift(newPost)
      
      // 重置表单
      publishForm.content = ''
      publishForm.images = []
      showPublishDialog.value = false
      
      ElMessage.success('动态发布成功')
    }
    
    // 加载动态列表
    const loadPosts = () => {
      loading.value = true
      
      // 模拟动态数据
      setTimeout(() => {
        posts.value = [
          {
            id: 1,
            user_id: 1,
            user_nickname: '小明',
            user_avatar: '/img/avatars/user1.png',
            content: '今天又存了50块钱！距离我的小目标又近了一步~',
            images: ['/img/posts/post1_1.jpg'],
            like_count: 3,
            comment_count: 2,
            create_time: new Date(Date.now() - 3600000).toISOString(),
            is_liked: false,
            show_comments: false,
            comment_text: '',
            transaction_info: {
              type: 1,
              amount: 50.00,
              description: '零花钱存入'
            }
          },
          {
            id: 2,
            user_id: 1,
            user_nickname: '小明',
            user_avatar: '/img/avatars/user1.png',
            content: '小雅今天鼓励我多存点钱，她说这样我们的未来会更美好💕',
            images: ['/img/posts/post2_1.jpg', '/img/posts/post2_2.jpg'],
            like_count: 8,
            comment_count: 5,
            create_time: new Date(Date.now() - 7200000).toISOString(),
            is_liked: true,
            show_comments: false,
            comment_text: '',
            transaction_info: {
              type: 1,
              amount: 200.00,
              description: '小雅鼓励我存的钱'
            }
          },
          {
            id: 3,
            user_id: 2,
            user_nickname: '小红',
            user_avatar: '/img/avatars/user2.png',
            content: '兼职赚的钱全部存起来，为了我的梦想努力！',
            images: ['/img/posts/post3_1.jpg'],
            like_count: 2,
            comment_count: 1,
            create_time: new Date(Date.now() - 14400000).toISOString(),
            is_liked: false,
            show_comments: false,
            comment_text: '',
            transaction_info: {
              type: 1,
              amount: 80.00,
              description: '兼职收入'
            }
          },
          {
            id: 4,
            user_id: 1,
            user_nickname: '小明',
            user_avatar: '/img/avatars/user1.png',
            content: '开始了新的剧本攒钱计划，这个时间循环的故事好有趣！',
            images: ['/img/posts/post4_1.jpg'],
            like_count: 5,
            comment_count: 3,
            create_time: new Date(Date.now() - 21600000).toISOString(),
            is_liked: false,
            show_comments: false,
            comment_text: '',
            transaction_info: {
              type: 3,
              amount: 5.00,
              description: '时间循环的储蓄密码-第1章'
            }
          }
        ]
        loading.value = false
      }, 1000)
    }
    
    onMounted(() => {
      loadPosts()
    })
    
    return {
      loading,
      posts,
      showPublishDialog,
      publishForm,
      currentUserId,
      formatTime,
      formatAmount,
      getAmountClass,
      getAmountPrefix,
      toggleLike,
      showComments,
      submitComment,
      sharePost,
      deletePost,
      playVoice,
      publishPost
    }
  }
}
</script>

<style scoped>
.social-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.social-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 10;
}

.social-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.publish-btn {
  color: #409eff !important;
  font-size: 14px;
}

.posts-container {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
}

.post-card {
  background: #fff;
  margin-bottom: 10px;
  padding: 15px 20px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.post-user-info {
  flex: 1;
  margin-left: 10px;
}

.post-username {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-more {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
}

.post-content {
  margin-bottom: 15px;
}

.post-content p {
  margin: 0 0 10px 0;
  line-height: 1.5;
  color: #606266;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
}

.transaction-info {
  margin-top: 10px;
}

.transaction-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.transaction-icon {
  color: #409eff;
  font-size: 20px;
}

.transaction-details {
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount.income {
  color: #67c23a;
}

.transaction-amount.expense {
  color: #f56c6c;
}

.transaction-amount.script {
  color: #409eff;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.action-btn {
  color: #909399 !important;
  font-size: 13px;
  padding: 5px 15px;
}

.action-btn.active {
  color: #f56c6c !important;
}

.comments-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
  margin-top: 15px;
}

.comment-input {
  margin-bottom: 15px;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-item.ai-comment {
  background: #f0f9ff;
  padding: 8px;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-tag {
  background: #409eff;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.comment-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 4px;
}

.comment-voice {
  margin-top: 8px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 414px) {
  .social-header {
    padding: 12px 15px;
  }
  
  .post-card {
    padding: 12px 15px;
  }
  
  .post-images {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
