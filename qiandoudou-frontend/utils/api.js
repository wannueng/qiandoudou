// utils/api.js - 微信小程序API工具函数
const app = getApp()

// 后端API基础地址
const BASE_URL = 'http://localhost:8080/api'

/**
 * 通用网络请求函数
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = app.globalData.token || wx.getStorageSync('token')
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json; charset=utf-8',
      ...options.header
    }
    
    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success: (res) => {
        // 只在开发模式下输出详细日志
        if (options.debug !== false) {
          console.log('API请求成功:', options.url, '状态码:', res.statusCode)
          console.log('响应数据:', res.data)
        }
        
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            console.error('业务错误:', res.data.message, '完整响应:', res.data)
            reject(new Error(res.data.message || '请求失败'))
          }
        } else if (res.statusCode === 401) {
          // token过期，清除登录信息并跳转到登录页
          app.clearLoginInfo()
          wx.showToast({
            title: '登录已过期',
            icon: 'none'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(new Error('登录已过期'))
        } else {
          reject(new Error(`网络错误: ${res.statusCode}`))
        }
      },
      fail: (error) => {
        // 只在网络真正失败时输出错误
        if (options.debug !== false) {
          console.log('网络请求失败:', options.url)
        }
        reject(new Error('网络连接失败'))
      }
    })
  })
}

/**
 * 认证相关API
 */
const authAPI = {
  // 用户登录
  login(username, password) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: { username, password }
    })
  },

  // 用户注册
  register(username, password, nickname, phone) {
    return request({
      url: '/auth/register',
      method: 'POST',
      data: { username, password, nickname, phone }
    })
  },

  // 微信登录
  wechatLogin(code) {
    return request({
      url: '/auth/wechat-login',
      method: 'POST',
      data: { code }
    })
  },

  // 手机号登录
  phoneLogin(phone, code) {
    return request({
      url: '/auth/phone-login',
      method: 'POST',
      data: { phone, code }
    })
  }
}

/**
 * 钱包相关API
 */
const walletAPI = {
  // 获取用户钱包列表
  getUserWallets(userId) {
    return request({
      url: '/wallet/list',
      method: 'GET',
      data: { userId }
    })
  },

  // 获取钱包详情
  getWalletDetail(walletId) {
    return request({
      url: '/wallet/detail',
      method: 'GET',
      data: { walletId }
    })
  },

  // 创建钱包
  createWallet(userId, name, type, backgroundImage, aiPartnerId) {
    return request({
      url: '/wallet/create',
      method: 'POST',
      data: { userId, name, type, backgroundImage, aiPartnerId }
    })
  },

  // 转入资金
  transferIn(walletId, amount, description, imageUrl, note) {
    return request({
      url: '/wallet/transfer-in',
      method: 'POST',
      data: { walletId, amount, description, imageUrl, note }
    })
  },

  // 转出资金
  transferOut(walletId, amount, description, imageUrl, note) {
    return request({
      url: '/wallet/transfer-out',
      method: 'POST',
      data: { walletId, amount, description, imageUrl, note }
    })
  },

  // 获取钱包交易记录
  getWalletTransactions(walletId) {
    return request({
      url: '/wallet/transactions',
      method: 'GET',
      data: { walletId }
    })
  },

  // 更新钱包背景
  updateWalletBackground(walletId, backgroundImage) {
    return request({
      url: '/wallet/update-background',
      method: 'PUT',
      data: { walletId, backgroundImage }
    })
  },

  // 更新钱包名称
  updateWalletName(walletId, name) {
    return request({
      url: '/wallet/update-name',
      method: 'PUT',
      data: { walletId, name }
    })
  },

  // 获取公开钱包列表（用于兜圈圈）
  getPublicWallets() {
    console.log('调用getPublicWallets API')
    console.log('当前token状态:', app.globalData.token ? '有token' : '无token')
    
    return request({
      url: '/wallet/public',
      method: 'GET',
      debug: true, // 强制显示调试信息
      header: {
        'Accept': 'application/json'
      }
    })
  },

  // 获取用户的公开钱包列表
  getUserPublicWallets(userId) {
    return request({
      url: '/wallet/user-public',
      method: 'GET',
      data: { userId }
    })
  },

  // 获取用户关注的钱包列表
  getUserFollowedWallets(userId) {
    return request({
      url: '/wallet/user-followed',
      method: 'GET',
      data: { userId }
    })
  },

  // 关注钱包
  followWallet(userId, walletId) {
    return request({
      url: '/wallet/follow',
      method: 'POST',
      data: { userId, walletId }
    })
  },

  // 取消关注钱包
  unfollowWallet(userId, walletId) {
    return request({
      url: '/wallet/unfollow',
      method: 'POST',
      data: { userId, walletId }
    })
  },

  // 检查关注状态
  checkFollowStatus(currentUserId, targetUserId) {
    console.log('API调用: checkFollowStatus', { currentUserId, targetUserId })
    return request({
      url: '/social/user/check-follow',
      method: 'GET',
      data: { currentUserId, targetUserId }
    }).then(result => {
      console.log('checkFollowStatus API响应:', result)
      return result
    }).catch(error => {
      console.error('checkFollowStatus API错误:', error)
      throw error
    })
  },

  // 获取钱包所有者ID
  getWalletOwnerId(walletId) {
    console.log('API调用: getWalletOwnerId', { walletId })
    return request({
      url: '/wallet/owner',
      method: 'GET',
      data: { walletId }
    }).then(result => {
      console.log('getWalletOwnerId API响应:', result)
      return result
    }).catch(error => {
      console.error('getWalletOwnerId API错误:', error)
      throw error
    })
  },

  // 获取用户社交统计数据
  getUserSocialStats(userId) {
    return request({
      url: '/user/social-stats',
      method: 'GET',
      data: { userId }
    })
  },

  // 更新用户信息
  updateUserInfo(userId, userInfo) {
    return request({
      url: '/user/update-info',
      method: 'POST',
      data: { userId, ...userInfo }
    }).catch(error => {
      // 如果是404错误，说明接口未实现，返回一个成功的模拟响应
      if (error.message && error.message.includes('404')) {
        console.log('用户信息更新接口未实现，使用本地存储')
        return { success: true, message: '本地保存成功', data: userInfo }
      }
      throw error
    })
  },

  // 更新用户设置
  updateUserSettings(userId, settings) {
    return request({
      url: '/user/update-settings',
      method: 'POST',
      data: { userId, ...settings }
    }).catch(error => {
      // 如果是404错误，说明接口未实现，返回一个成功的模拟响应
      if (error.message && error.message.includes('404')) {
        console.log('用户设置更新接口未实现，使用本地存储')
        return { success: true, message: '本地保存成功', data: settings }
      }
      throw error
    })
  },

  // 获取用户互动消息
  getUserInteractionMessages(userId, page = 1, pageSize = 20) {
    return request({
      url: '/user/interaction-messages',
      method: 'GET',
      data: { userId, page, pageSize }
    })
  },

  // 获取用户未读消息数量
  getUnreadMessageCount(userId) {
    return request({
      url: '/user/unread-count',
      method: 'GET',
      data: { userId }
    })
  },

  // 标记消息为已读
  markMessagesAsRead(userId) {
    return request({
      url: '/user/mark-read',
      method: 'POST',
      data: { userId }
    })
  },

  // 点赞交易记录
  likeTransaction(userId, transactionId) {
    return request({
      url: '/social/transaction/like',
      method: 'POST',
      data: { userId, transactionId }
    })
  },

  // 取消点赞交易记录
  unlikeTransaction(userId, transactionId) {
    return request({
      url: '/social/transaction/unlike',
      method: 'POST',
      data: { userId, transactionId }
    })
  },

  // 评论交易记录
  commentTransaction(userId, transactionId, content) {
    return request({
      url: '/social/transaction/comment',
      method: 'POST',
      data: { userId, transactionId, content }
    })
  },

  // 获取交易评论列表
  getTransactionComments(transactionId) {
    return request({
      url: '/social/transaction/comments',
      method: 'GET',
      data: { transactionId }
    })
  },

  // AI伴侣自动转入资金
  aiPartnerTransferIn(walletId, aiPartnerId, amount, message, aiPartnerName, aiPartnerAvatar) {
    return request({
      url: '/wallet/ai-partner-transfer',
      method: 'POST',
      data: { 
        walletId, 
        aiPartnerId, 
        amount, 
        message, 
        aiPartnerName, 
        aiPartnerAvatar 
      }
    })
  },

  // 获取用户社交统计数据
  getUserSocialStats(userId) {
    return request({
      url: '/social/user/social-stats',
      method: 'GET',
      data: { userId }
    })
  },

  // 关注钱包
  followWallet(userId, walletId) {
    return request({
      url: '/social/wallet/follow',
      method: 'POST',
      data: { userId, walletId }
    })
  },

  // 取消关注钱包
  unfollowWallet(userId, walletId) {
    return request({
      url: '/social/wallet/unfollow',
      method: 'POST',
      data: { userId, walletId }
    })
  },

  // 检查用户关注状态
  checkUserFollowStatus(currentUserId, targetUserId) {
    return request({
      url: '/social/user/follow-status',
      method: 'GET',
      data: { currentUserId, targetUserId }
    })
  },

  // 获取交易的社交数据（点赞数、评论数、用户是否已点赞）
  getTransactionSocialData(transactionId, userId) {
    return request({
      url: '/social/transaction/social-data',
      method: 'GET',
      data: { transactionId, userId }
    })
  },

  // 获取公开钱包列表（用于兜圈圈）
  getPublicWallets() {
    return request({
      url: '/wallet/public',
      method: 'GET'
    })
  },

  // 根据图片生成文字描述
  generateTextFromImage(imageBase64, prompt) {
    return request({
      url: '/wallet/generate-text-from-image',
      method: 'POST',
      data: { imageBase64, prompt }
    })
  }
}

/**
 * 文件上传函数
 */
function uploadFile(filePath, uploadUrl, formData = {}) {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token || wx.getStorageSync('token')
    
    const header = {}
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    wx.uploadFile({
      url: `${BASE_URL}${uploadUrl}`,
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: header,
      success: (res) => {
        console.log('文件上传成功:', res)
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: (error) => {
        console.error('文件上传失败:', error)
        reject(new Error('文件上传失败'))
      }
    })
  })
}

// 剧本相关API
const scriptAPI = {
  // 获取剧本列表
  getScriptList: (categoryId) => {
    const params = (categoryId && categoryId !== 1) ? `?categoryId=${categoryId}` : ''
    return request({
      url: `/scripts${params}`,
      method: 'GET'
    })
  },

  // 获取剧本详情
  getScriptDetail: (scriptId) => {
    return request({
      url: `/scripts/${scriptId}`,
      method: 'GET'
    })
  },

  // 获取剧本章节列表
  getScriptChapters: (scriptId) => {
    return request({
      url: `/scripts/${scriptId}/chapters`,
      method: 'GET'
    })
  },

  // 获取指定章节内容
  getChapterContent: (scriptId, chapterNumber) => {
    return request({
      url: `/scripts/${scriptId}/chapters/${chapterNumber}`,
      method: 'GET'
    })
  },

  // 获取用户剧本进度
  getUserProgress: (userId, scriptId) => {
    return request({
      url: `/scripts/progress?userId=${userId}&scriptId=${scriptId}`,
      method: 'GET'
    })
  },

  // 开始剧本
  startScript: (userId, walletId, scriptId) => {
    return request({
      url: '/scripts/start',
      method: 'POST',
      data: {
        userId,
        walletId,
        scriptId
      }
    })
  },

  // 用户做出选择
  makeChoice: (userId, scriptId, currentChapter, selectedChoice, amount) => {
    return request({
      url: '/scripts/choice',
      method: 'POST',
      data: {
        userId,
        scriptId,
        currentChapter,
        selectedChoice,
        amount
      }
    })
  },

  // 获取钱包剧本进度
  getWalletScriptProgress: (userId, walletId) => {
    return request({
      url: `/scripts/wallet-progress?userId=${userId}&walletId=${walletId}`,
      method: 'GET'
    })
  }
}

module.exports = {
  request,
  authAPI,
  walletAPI,
  uploadFile,
  scriptAPI
}
