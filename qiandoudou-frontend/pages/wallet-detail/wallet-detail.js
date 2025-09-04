// pages/wallet-detail/wallet-detail.js
const app = getApp()
const { walletAPI } = require('../../utils/api.js')

Page({
  data: {
    walletId: null,
    wallet: {},
    walletBackgroundStyle: '',
    transactions: [],
    showTransferModal: false,
    showBackgroundModal: false,
    transferType: 'in', // 'in' 或 'out'
    transferForm: {
      amount: '',
      description: ''
    },
    transferLoading: false,
    backgroundLoading: false,
    selectedBackground: '',
    activeTab: 'bill', // 'bill' 或 'stats'
    showPromoCard: true,
    showNameEditModal: false,
    editingName: '',
    showBackgroundHint: false,
    isOwnWallet: true, // 是否为自己的钱包
    fromSocial: false, // 是否来自社交圈
    showCommentModal: false, // 评论模态框
    currentTransaction: null, // 当前评论的交易
    currentComments: [], // 当前交易的评论列表
    commentText: '', // 评论输入内容
    commentLoading: false, // 评论发送中
    socialStats: { // 社交统计数据
      fansCount: 0,  // 初始值为0，等待从后端加载真实数据
      likesCount: 0, // 初始值为0，等待从后端加载真实数据
      viewsCount: 0  // 初始值为0，等待从后端加载真实数据
    },
    isFollowing: false, // 是否已关注
    // AI语音播放相关
    currentPlayingVoice: null, // 当前播放的语音
    voiceContext: null, // 语音上下文
    backgroundOptions: [
      { value: 'gradient1', name: '蓝紫渐变', gradient: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' },
      { value: 'gradient2', name: '粉红渐变', gradient: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);' },
      { value: 'gradient3', name: '绿色渐变', gradient: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);' },
      { value: 'gradient4', name: '橙色渐变', gradient: 'background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);' },
      { value: 'gradient5', name: '紫色渐变', gradient: 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);' },
      { value: 'gradient6', name: '金色渐变', gradient: 'background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);' }
    ]
  },

  onLoad(options) {
    if (!app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    const walletId = options.id
    const fromSocial = options.fromSocial === 'true'
    
    console.log('钱包详情页参数:', options);
    console.log('是否来自社交圈:', fromSocial);
    
    // 从URL参数中读取社交信息
    const socialInfo = fromSocial ? {
      owner_nickname: decodeURIComponent(options.ownerNickname || ''),
      title: decodeURIComponent(options.title || ''),
      fansCount: parseInt(options.fansCount || '0'),
      likeCount: parseInt(options.likeCount || '0')
    } : null
    
    console.log('从URL获取的社交信息:', socialInfo);
    
    if (walletId) {
      this.setData({ 
        walletId,
        fromSocial: fromSocial,
        socialInfo: socialInfo,
        isOwnWallet: !fromSocial // 如果来自社交圈，则不是自己的钱包
      })
      this.loadWalletDetail()
      this.loadTransactions()
      
      // 如果不是自己的钱包，检查关注状态
      if (!this.data.isOwnWallet) {
        this.checkFollowStatus()
      }
    }
  },

  onShow() {
    // 页面显示时更新背景样式和交易记录
    if (this.data.wallet && this.data.wallet.id) {
      this.updateBackgroundStyle()
      this.loadTransactions() // 刷新交易记录
    }
    
    // 如果不是自己的钱包，重新检查关注状态
    if (!this.data.isOwnWallet && this.data.walletId) {
      console.log('页面显示时重新检查关注状态')
      this.checkFollowStatus()
    }
    
    // 延迟输出状态，确保数据已加载
    setTimeout(() => {
      console.log('页面显示 - 当前状态:')
      console.log('isOwnWallet:', this.data.isOwnWallet)
      console.log('socialStats:', this.data.socialStats)
      console.log('isFollowing:', this.data.isFollowing)
    }, 1000)
  },

  // 加载钱包详情
  loadWalletDetail() {
    const walletId = this.data.walletId
    if (!walletId) {
      console.error('钱包ID不存在')
      return
    }

    console.log('加载自己的钱包详情，walletId:', walletId)

    walletAPI.getWalletDetail(walletId)
      .then(result => {
        const wallet = result.data
        if (!wallet) {
          wx.showToast({
            title: '钱包不存在',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
          return
        }
        
        console.log('从后端加载的钱包详情:', wallet)
        
        // 验证是否为自己的钱包
        const currentUserId = app.globalData.userInfo?.id
        const isOwnWallet = (wallet.userId == currentUserId || wallet.user_id == currentUserId)
        
        // 如果来自社交圈，需要获取钱包所有者的信息
        if (this.data.fromSocial && !isOwnWallet) {
          // 从公开钱包API获取的数据可能已经包含owner信息，直接使用
          console.log('来自社交圈的钱包，所有者信息:', {
            userId: wallet.userId || wallet.user_id,
            nickname: wallet.owner_nickname,
            avatar: wallet.owner_avatar
          })
        }
        
        // 如果来自社交圈，即使不是自己的钱包也要显示详情
        if (!isOwnWallet && !this.data.fromSocial) {
          console.log('这不是用户自己的钱包，跳转到用户详情页')
          wx.redirectTo({
            url: `/pages/user-profile/user-profile?userId=${wallet.userId || wallet.user_id}&walletId=${walletId}`
          })
          return
        }
        
        // 如果来自社交圈，显示为只读模式
        if (!isOwnWallet && this.data.fromSocial) {
          console.log('来自社交圈的他人钱包，显示为只读模式')
          
          // 使用URL参数传递的社交信息
          const socialInfo = this.data.socialInfo
          console.log('使用的社交信息:', socialInfo)
          
          if (socialInfo) {
            // 合并钱包数据和社交信息
            wallet.owner_nickname = socialInfo.owner_nickname
            wallet.followers_count = socialInfo.fansCount
            wallet.likes_count = socialInfo.likeCount
            wallet.comments_count = 0 // 暂时设为0
            
            // 设置社交统计数据，但仍然需要从后端获取完整的真实数据
            this.setData({
              socialStats: {
                fansCount: socialInfo.fansCount || 0,
                likesCount: socialInfo.likeCount || 0,
                viewsCount: socialInfo.viewsCount || 0  // 使用真实数据，不使用计算值
              },
              isFollowing: false // 默认未关注，实际应该从API获取
            })
            
            // 从后端重新获取最新的真实数据覆盖
            this.loadSocialStats()
          }
        } else if (isOwnWallet) {
          // 如果是自己的钱包，加载社交统计数据
          this.loadSocialStats()
        } else if (this.data.fromSocial) {
          // 如果来自社交圈但不是自己的钱包，也要加载钱包所有者的社交统计数据
          this.loadSocialStats()
        }
        
        // 如果来自社交圈但没有社交信息，从后端获取真实统计数据
        if (this.data.fromSocial && !this.data.socialInfo) {
          this.loadSocialStats()
        }
        
        this.setData({
          wallet,
          selectedBackground: wallet.backgroundImage || 'gradient1',
          isOwnWallet: isOwnWallet
        })
        
        // 更新背景样式
        this.updateBackgroundStyle()
      })
      .catch(error => {
        console.error('加载钱包详情失败:', error)
        wx.showToast({
          title: error.message || '加载钱包详情失败',
          icon: 'none'
        })
      })
  },

  // 加载交易记录
  loadTransactions() {
    const walletId = this.data.walletId
    if (!walletId) {
      return
    }

    walletAPI.getWalletTransactions(walletId)
      .then(result => {
        const transactions = result.data || []
        
        // 格式化交易记录
        const formattedTransactions = transactions.map((transaction, index) => {
          // 副标题是交易类型
          const subtitle = transaction.type === 1 ? '转入' : (transaction.type === 2 ? '转出' : '剧本攒钱')
          
          // 处理时间字段 - 确保正确解析
          let createTime = transaction.createTime || transaction.create_time
          let formattedTime = '未知时间'
          
          console.log(`交易${transaction.id}的原始时间数据:`, createTime, typeof createTime)
          
          if (createTime) {
            try {
              // 如果是字符串，直接解析；如果是时间戳，转换
              const timeObj = typeof createTime === 'string' ? new Date(createTime) : new Date(createTime)
              
              if (!isNaN(timeObj.getTime())) {
                formattedTime = this.formatTime(timeObj.getTime())
              } else {
                // 对于新创建的交易，使用当前时间
                formattedTime = '刚刚'
              }
            } catch (e) {
              console.error(`交易${transaction.id}时间解析失败:`, createTime, e)
              formattedTime = '刚刚'
            }
          } else {
            // 没有时间数据时使用当前时间
            formattedTime = '刚刚'
          }
          
          // 检查是否为AI伴侣交易
          const isAiTransaction = transaction.aiPartnerId || transaction.ai_partner_id || transaction.isAiTransaction
          
          return {
            ...transaction,
            createTime: formattedTime,
            create_time: formattedTime,
            amount: parseFloat(transaction.amount).toFixed(2),
            subtitle: subtitle, // 副标题（灰色显示，如"转入"）
            category: subtitle,
            // AI伴侣相关数据
            isAiTransaction: isAiTransaction,
            aiPartnerName: transaction.aiPartnerName || transaction.ai_partner_name,
            aiPartnerAvatar: transaction.aiPartnerAvatar || transaction.ai_partner_avatar,
            aiMessage: transaction.aiMessage || transaction.ai_message || transaction.description,
            voiceUrl: transaction.voiceUrl || transaction.voice_url,
            voiceDuration: transaction.voiceDuration || transaction.voice_duration || '12s',
            isPlaying: false,
            // 初始化社交互动数据，稍后从后端加载
            likeCount: 0,
            commentCount: 0,
            isLiked: false,
            comments: []
          }
        })
        
        console.log('从后端加载的交易记录:', formattedTransactions)
        
        this.setData({
          transactions: formattedTransactions
        })
        
        // 加载每个交易的真实社交数据（点赞状态、评论数等）
        this.loadTransactionsSocialData(formattedTransactions)
      })
      .catch(error => {
        console.error('加载交易记录失败:', error)
        // 如果加载失败，显示空数组
        this.setData({
          transactions: []
        })
      })
  },

  // 加载交易的社交数据
  loadTransactionsSocialData(transactions) {
    const currentUserId = app.globalData.userInfo?.id
    
    // 为每个交易并行加载社交数据
    const socialDataPromises = transactions.map(transaction => {
      return walletAPI.getTransactionSocialData(transaction.id, currentUserId)
        .then(response => {
          if (response.success && response.data) {
            return {
              transactionId: transaction.id,
              socialData: response.data
            }
          }
          return null
        })
        .catch(error => {
          console.error(`获取交易${transaction.id}社交数据失败:`, error)
          return null
        })
    })
    
    // 等待所有社交数据加载完成
    Promise.all(socialDataPromises).then(results => {
      const updatedTransactions = [...this.data.transactions]
      
      results.forEach(result => {
        if (result) {
          const index = updatedTransactions.findIndex(t => t.id === result.transactionId)
          if (index !== -1) {
            updatedTransactions[index].likeCount = result.socialData.likeCount || 0
            updatedTransactions[index].commentCount = result.socialData.commentCount || 0
            updatedTransactions[index].isLiked = result.socialData.isLiked || false
          }
        }
      })
      
      console.log('更新后的交易社交数据:', updatedTransactions.map(t => ({
        id: t.id,
        likeCount: t.likeCount,
        commentCount: t.commentCount,
        isLiked: t.isLiked
      })))
      
      this.setData({
        transactions: updatedTransactions
      })
    })
  },

  // 更新背景样式
  updateBackgroundStyle() {
    const wallet = this.data.wallet
    
    // 获取背景设置（兼容不同的字段名）
    let currentBackground = wallet.backgroundImage || wallet.background_image || 'gradient1'
    console.log(`钱包${wallet.id}当前背景:`, currentBackground)
    
    let backgroundStyle = ''
    
    if (!currentBackground) {
      backgroundStyle = wallet.type === 2 ? 
        'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);' : 
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
    } else if (currentBackground.startsWith('custom_bg_')) {
      // 自定义图片背景
      const customImages = wx.getStorageSync('custom_images') || {}
      const imagePath = customImages[currentBackground]
      if (imagePath) {
        backgroundStyle = `background-image: url('${imagePath}'); background-size: cover; background-position: center;`
        console.log('使用自定义图片背景:', imagePath)
      } else {
        // 图片不存在，使用默认背景
        backgroundStyle = wallet.type === 2 ? 
          'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);' : 
          'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
      }
    } else {
      // 预设渐变背景
      const bg = this.data.backgroundOptions.find(bg => bg.value === currentBackground)
      if (bg) {
        backgroundStyle = bg.gradient
        console.log('使用预设背景:', bg.gradient)
      } else {
        backgroundStyle = wallet.type === 2 ? 
          'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);' : 
          'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
      }
    }
    
    this.setData({
      walletBackgroundStyle: backgroundStyle
    })
  },

  // 获取钱包背景样式（兼容方法）
  getWalletBackgroundStyle() {
    return this.data.walletBackgroundStyle
  },

  // 显示转账对话框
  showTransferDialog(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      showTransferModal: true,
      transferType: type,
      transferForm: {
        amount: '',
        description: ''
      }
    })
  },

  // 隐藏转账对话框
  hideTransferModal() {
    this.setData({
      showTransferModal: false
    })
  },

  // 输入金额
  onAmountInput(e) {
    this.setData({
      'transferForm.amount': e.detail.value
    })
  },

  // 输入说明
  onDescriptionInput(e) {
    this.setData({
      'transferForm.description': e.detail.value
    })
  },

  // 处理转账
  handleTransfer() {
    const { transferType, transferForm, wallet } = this.data

    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }

    if (transferType === 'out' && parseFloat(transferForm.amount) > wallet.balance) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      })
      return
    }

    this.setData({ transferLoading: true })

    const amount = parseFloat(transferForm.amount)
    const description = transferForm.description || (transferType === 'in' ? '转入' : '转出')

    // 调用后端API（暂时不传递图片和备注，保持简单）
    const apiCall = transferType === 'in' ? 
      walletAPI.transferIn(wallet.id, amount, description, null, null) :
      walletAPI.transferOut(wallet.id, amount, description, null, null)

    apiCall
      .then(result => {
        wx.showToast({
          title: `${transferType === 'in' ? '转入' : '转出'}成功`,
          icon: 'success'
        })

        // 重新加载钱包详情和交易记录
        this.loadWalletDetail()
        this.loadTransactions()

        this.setData({
          showTransferModal: false,
          transferLoading: false,
          transferForm: {
            amount: '',
            description: ''
          }
        })
      })
      .catch(error => {
        console.error('转账失败:', error)
        wx.showToast({
          title: error.message || '转账失败',
          icon: 'none'
        })
        this.setData({ transferLoading: false })
      })
  },

  // 显示背景选择对话框
  showBackgroundModal() {
    const currentBackground = this.data.wallet.backgroundImage || this.data.wallet.background_image || 'gradient1'
    console.log('显示背景选择模态框 - 当前背景:', currentBackground)
    
    this.setData({
      showBackgroundModal: true,
      showBackgroundHint: false,
      selectedBackground: currentBackground
    })
  },

  // 隐藏背景选择对话框
  hideBackgroundModal() {
    this.setData({
      showBackgroundModal: false
    })
  },

  // 编辑钱包名称
  editWalletName() {
    this.setData({
      showNameEditModal: true,
      editingName: this.data.wallet.name || ''
    })
  },

  // 隐藏名称编辑对话框
  hideNameEditModal() {
    this.setData({
      showNameEditModal: false,
      editingName: ''
    })
  },

  // 钱包名称输入
  onNameInput(e) {
    this.setData({
      editingName: e.detail.value
    })
  },

  // 确认修改钱包名称
  confirmNameEdit() {
    const newName = this.data.editingName.trim()
    
    if (!newName) {
      wx.showToast({
        title: '钱包名称不能为空',
        icon: 'none'
      })
      return
    }

    if (newName === this.data.wallet.name) {
      this.hideNameEditModal()
      return
    }

    // 调用后端API更新钱包名称
    walletAPI.updateWalletName(this.data.wallet.id, newName)
      .then(result => {
        // 更新本地数据
        const updatedWallet = { ...this.data.wallet, name: newName }
        this.setData({
          wallet: updatedWallet,
          showNameEditModal: false,
          editingName: ''
        })

        // 通知首页刷新钱包列表
        const pages = getCurrentPages()
        if (pages.length > 1) {
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.loadWallets) {
            setTimeout(() => {
              prevPage.loadWallets()
            }, 100)
          }
        }

        wx.showToast({
          title: '钱包名称修改成功',
          icon: 'success'
        })
      })
      .catch(error => {
        console.error('修改钱包名称失败:', error)
        wx.showToast({
          title: error.message || '修改失败',
          icon: 'none'
        })
      })
  },

  // 选择背景
  selectBackground(e) {
    const value = e.currentTarget.dataset.value
    console.log('选择背景:', value)
    
    // 直接更新选中状态
    this.setData({
      selectedBackground: value
    })
    
    console.log('当前选中的背景:', this.data.selectedBackground)
  },

  // 上传自定义图片
  uploadCustomImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 使用压缩图片
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        console.log('选择的图片路径:', tempFilePath)
        
        // 显示加载提示
        wx.showLoading({
          title: '处理图片中...'
        })
        
        // 检查文件大小
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (fileInfo) => {
            console.log('文件大小:', fileInfo.size, 'bytes')
            
            // 如果文件大于4MB，提示用户
            if (fileInfo.size > 4 * 1024 * 1024) {
              wx.hideLoading()
              wx.showModal({
                title: '图片过大',
                content: '图片处理后仍然过大，请选择更小的图片或使用预设背景',
                showCancel: false,
                confirmText: '知道了'
              })
              return
            }
            
            // 使用base64编码存储图片（避免saveFile的限制）
            this.convertImageToBase64(tempFilePath)
          },
          fail: (error) => {
            console.error('获取文件信息失败:', error)
            // 如果获取文件信息失败，直接尝试转换
            this.convertImageToBase64(tempFilePath)
          }
        })
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  // 将图片转换为base64格式存储
  convertImageToBase64(filePath) {
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        const base64Data = 'data:image/jpeg;base64,' + res.data
        console.log('base64数据大小:', base64Data.length)
        
        // 检查base64数据大小（微信小程序存储限制）
        if (base64Data.length > 2 * 1024 * 1024) { // 2MB限制
          wx.hideLoading()
          wx.showModal({
            title: '图片过大',
            content: '图片处理后仍然过大，请选择更小的图片或使用预设背景',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        
        const customImageKey = `custom_bg_${this.data.walletId}_${Date.now()}`
        
        // 保存base64数据到缓存
        try {
          const customImages = wx.getStorageSync('custom_images') || {}
          customImages[customImageKey] = base64Data
          wx.setStorageSync('custom_images', customImages)
          
          // 更新钱包背景
          this.applyCustomBackground(customImageKey, base64Data)
          
          wx.hideLoading()
          wx.showToast({
            title: '背景设置成功',
            icon: 'success'
          })
          
          // 关闭模态框
          this.hideBackgroundModal()
        } catch (error) {
          console.error('存储图片失败:', error)
          wx.hideLoading()
          
          if (error.message && error.message.includes('exceed')) {
            wx.showModal({
              title: '存储空间不足',
              content: '本地存储空间不足，请清理一些数据或使用预设背景',
              showCancel: true,
              cancelText: '取消',
              confirmText: '清理数据',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.clearStorageData()
                }
              }
            })
          } else {
            wx.showToast({
              title: '图片保存失败',
              icon: 'error'
            })
          }
        }
      },
      fail: (error) => {
        console.error('读取图片失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: '图片处理失败',
          icon: 'error'
        })
      }
    })
  },

  // 清理存储数据
  clearStorageData() {
    wx.showActionSheet({
      itemList: ['清理自定义背景图片', '清理所有缓存数据'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 只清理自定义图片
          wx.removeStorageSync('custom_images')
          wx.showToast({
            title: '背景图片已清理',
            icon: 'success'
          })
        } else if (res.tapIndex === 1) {
          // 清理所有缓存
          wx.showModal({
            title: '确认清理',
            content: '这将清理所有本地数据，包括创建的钱包和设置，确定继续吗？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                try {
                  wx.clearStorageSync()
                  wx.showToast({
                    title: '数据已清理',
                    icon: 'success'
                  })
                  // 重新加载页面
                  setTimeout(() => {
                    wx.navigateBack()
                  }, 1500)
                } catch (error) {
                  console.error('清理数据失败:', error)
                  wx.showToast({
                    title: '清理失败',
                    icon: 'error'
                  })
                }
              }
            }
          })
        }
      }
    })
  },

  // 应用自定义背景
  applyCustomBackground(imageKey, base64Data) {
    const wallet = this.data.wallet
    
    // 调用后端API更新背景
    walletAPI.updateWalletBackground(wallet.id, imageKey)
      .then(result => {
        // 更新当前页面显示
        const updatedWallet = { ...wallet, backgroundImage: imageKey }
        this.setData({
          wallet: updatedWallet,
          selectedBackground: imageKey
        })
        this.updateBackgroundStyle()
        
        // 通知首页刷新
        const pages = getCurrentPages()
        if (pages.length > 1) {
          const prevPage = pages[pages.length - 2]
          if (prevPage.loadWallets) {
            setTimeout(() => {
              prevPage.loadWallets()
            }, 50)
          }
        }
      })
      .catch(error => {
        console.error('保存背景失败:', error)
        wx.showToast({
          title: '保存背景失败',
          icon: 'none'
        })
      })
  },

  // 更换背景
  changeBackground() {
    const { wallet, selectedBackground } = this.data
    
    // 如果没有选择新背景，使用当前背景
    const backgroundToSave = selectedBackground || wallet.backgroundImage || wallet.background_image || 'gradient1'
    
    console.log('开始更换背景 - 钱包ID:', wallet.id, '选择的背景:', backgroundToSave)
    console.log('当前钱包背景:', wallet.backgroundImage, wallet.background_image)
    
    this.setData({ backgroundLoading: true })
    
    walletAPI.updateWalletBackground(wallet.id, backgroundToSave)
      .then(result => {
        // 更新本地钱包数据
        const updatedWallet = { ...wallet, backgroundImage: backgroundToSave }
        
        this.setData({
          wallet: updatedWallet,
          showBackgroundModal: false,
          backgroundLoading: false
        })
        
        // 更新背景样式
        this.updateBackgroundStyle()

        // 通知首页刷新钱包列表
        const pages = getCurrentPages()
        console.log('当前页面栈:', pages.map(p => p.route || p.__route__))
        
        // 查找首页并强制刷新
        const homePage = pages.find(page => 
          (page.route && page.route.includes('home')) || 
          (page.__route__ && page.__route__.includes('home'))
        )
        
        if (homePage) {
          console.log('找到首页，强制刷新钱包列表')
          if (homePage.loadWallets) {
            homePage.loadWallets()
          }
          if (homePage.forceRefreshWallets) {
            homePage.forceRefreshWallets()
          }
        } else {
          console.log('未找到首页，尝试刷新上一页')
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            if (prevPage && prevPage.loadWallets) {
              prevPage.loadWallets()
            }
          }
        }

        wx.showToast({
          title: '背景更换成功',
          icon: 'success'
        })
      })
      .catch(error => {
        console.error('更换背景失败:', error)
        wx.showToast({
          title: error.message || '更换背景失败',
          icon: 'none'
        })
        this.setData({ backgroundLoading: false })
      })
  },

  // 跳转到转入页面
  goToTransferIn() {
    wx.navigateTo({
      url: `/pages/transfer-in/transfer-in?id=${this.data.walletId}`
    })
  },

  // 跳转到转出页面
  goToTransferOut() {
    wx.navigateTo({
      url: `/pages/transfer-out/transfer-out?id=${this.data.walletId}`
    })
  },

  // 跳转到剧本页面
  goToScripts() {
    wx.navigateTo({
      url: '/pages/script-detail/script-detail?walletId=' + this.data.walletId
    })
  },



  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 显示过滤选项
  showFilter() {
    wx.showActionSheet({
      itemList: ['全部', '转入', '转出', '剧本攒钱'],
      success: (res) => {
        console.log('选择过滤:', res.tapIndex)
        // TODO: 实现过滤逻辑
      }
    })
  },

  // 关闭推广卡片
  closePromo() {
    this.setData({
      showPromoCard: false
    })
  },



  // 切换点赞状态
  toggleLike(e) {
    // 只在来自社交圈时启用点赞功能
    if (!this.data.fromSocial) {
      return
    }

    const transaction = e.currentTarget.dataset.transaction
    const transactions = this.data.transactions
    const index = transactions.findIndex(t => t.id === transaction.id)
    
    if (index !== -1) {
      // 防止重复点击
      if (transactions[index].liking) {
        console.log('正在处理点赞请求，忽略重复点击')
        return
      }
      const isLiked = !transactions[index].isLiked
      const userId = app.globalData.userInfo?.id
      const transactionId = transaction.id
      
      // 设置loading状态
      transactions[index].liking = true
      
      // 先更新UI，提供即时反馈
      transactions[index].isLiked = isLiked
      transactions[index].likeCount = isLiked ? 
        (transactions[index].likeCount || 0) + 1 : 
        Math.max((transactions[index].likeCount || 0) - 1, 0)
      
      this.setData({ transactions })
      
      // 调用API同步到后端（后端会自动切换点赞状态）
      walletAPI.likeTransaction(userId, transactionId)
        .then(result => {
          // 重新获取交易的社交数据，确保数据同步
          walletAPI.getTransactionSocialData(transactionId, userId)
            .then(response => {
              if (response.success && response.data) {
                transactions[index].likeCount = response.data.likeCount || 0
                transactions[index].isLiked = response.data.isLiked || false
              }
            })
            .catch(error => {
              console.log('获取最新社交数据失败:', error)
            })
            .finally(() => {
              // 清除loading状态
              transactions[index].liking = false
              this.setData({ transactions })
            })
          
          wx.showToast({
            title: isLiked ? '已点赞' : '取消点赞',
            icon: 'none'
          })
        })
        .catch(error => {
          console.error('点赞操作失败:', error)
          // 如果API失败，回滚UI状态
          transactions[index].isLiked = !isLiked
          transactions[index].likeCount = isLiked ? 
            Math.max((transactions[index].likeCount || 0) - 1, 0) :
            (transactions[index].likeCount || 0) + 1
          // 清除loading状态
          transactions[index].liking = false
          this.setData({ transactions })
          
          // 如果是404错误，说明API接口不存在，使用模拟模式
          if (error.message && error.message.includes('404')) {
            wx.showToast({
              title: isLiked ? '已点赞' : '取消点赞',
              icon: 'none'
            })
            console.log('点赞API接口暂不可用，使用模拟模式')
          } else {
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
          }
        })
    }
  },

  // 显示评论
  showComments(e) {
    const transaction = e.currentTarget.dataset.transaction
    console.log('显示评论，交易ID:', transaction.id)
    
    // 从后端获取真实评论数据
    this.loadTransactionComments(transaction.id)
    
    this.setData({
      showCommentModal: true,
      currentTransaction: transaction,
      currentComments: [],
      commentText: ''
    })
  },

  // 加载交易评论
  loadTransactionComments(transactionId) {
    console.log('加载交易评论，ID:', transactionId)
    
    walletAPI.getTransactionComments(transactionId)
      .then(response => {
        console.log('获取评论成功:', response)
        if (response.success && response.data) {
          // 处理评论数据格式
          const comments = response.data.map(comment => ({
            id: comment.id,
            userName: comment.user_nickname || comment.userName || '匿名用户',
            content: comment.content,
            time: this.formatTime(comment.create_time || comment.createTime),
            userId: comment.user_id || comment.userId
          }))
          
          this.setData({
            currentComments: comments
          })
        } else {
          console.error('获取评论失败:', response.message)
          this.setData({
            currentComments: []
          })
        }
      })
      .catch(error => {
        console.error('获取评论出错:', error)
        this.setData({
          currentComments: []
        })
      })
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '刚刚'
    
    try {
      const commentTime = new Date(timeStr)
      const now = new Date()
      const diffMs = now - commentTime
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      
      return commentTime.toLocaleDateString()
    } catch (e) {
      return '刚刚'
    }
  },

  // 隐藏评论模态框
  hideCommentModal() {
    this.setData({
      showCommentModal: false,
      currentTransaction: null,
      currentComments: [],
      commentText: ''
    })
  },

  // 评论输入
  onCommentInput(e) {
    const value = e.detail.value
    console.log('评论输入:', value, '长度:', value.length)
    this.setData({
      commentText: value
    })
  },

  // 发送评论
  sendComment() {
    console.log('点击发送评论按钮')
    const { commentText, currentTransaction } = this.data
    
    console.log('评论文本:', commentText, '长度:', commentText.length)
    console.log('当前交易:', currentTransaction)
    
    if (!commentText || !commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }

    console.log('开始发送评论')
    this.setData({ commentLoading: true })

    const userId = app.globalData.userInfo?.id
    const transactionId = currentTransaction.id
    const content = commentText.trim()

    // 调用真实API发送评论
    walletAPI.commentTransaction(userId, transactionId, content)
      .then(response => {
        console.log('发送评论成功:', response)
        if (response.success) {
          const newComment = {
            id: response.data?.id || Date.now(),
            userName: app.globalData.userInfo?.nickname || '我',
            content: content,
            time: '刚刚',
            userId: userId
          }

          this.updateCommentData(newComment)
        } else {
          throw new Error(response.message || '发送评论失败')
        }
      })
      .catch(error => {
        console.error('发送评论失败:', error)
        this.setData({ commentLoading: false })
        wx.showToast({
          title: '发送评论失败',
          icon: 'error'
        })
      })
  },

  // 模拟评论发送
  simulateCommentSend(content) {
    setTimeout(() => {
      const newComment = {
        id: Date.now(),
        userName: app.globalData.userInfo?.nickname || '我',
        content: content,
        time: '刚刚'
      }
      this.updateCommentData(newComment)
    }, 1000)
  },

  // 更新评论数据
  updateCommentData(newComment) {
    const updatedComments = [...this.data.currentComments, newComment]
    const currentUserId = app.globalData.userInfo?.id
    const transactionId = this.data.currentTransaction.id
    
    // 从后端重新获取最新的社交数据，确保评论数量准确
    walletAPI.getTransactionSocialData(transactionId, currentUserId)
      .then(response => {
        if (response.success && response.data) {
          // 更新交易的评论数和点赞数
          const transactions = this.data.transactions
          const index = transactions.findIndex(t => t.id === transactionId)
          if (index !== -1) {
            transactions[index].commentCount = response.data.commentCount || 0
            transactions[index].likeCount = response.data.likeCount || 0
            transactions[index].isLiked = response.data.isLiked || false
            
            // 更新评论列表
            if (!transactions[index].comments) {
              transactions[index].comments = []
            }
            transactions[index].comments.push(newComment)
          }

          this.setData({
            currentComments: updatedComments,
            transactions: transactions,
            commentText: '',
            commentLoading: false,
            showCommentModal: false
          })
        }
      })
      .catch(error => {
        console.log('获取最新社交数据失败，使用本地计算:', error)
        
        // 如果API失败，使用本地计算
        const transactions = this.data.transactions
        const index = transactions.findIndex(t => t.id === transactionId)
        if (index !== -1) {
          transactions[index].commentCount = (transactions[index].commentCount || 0) + 1
          if (!transactions[index].comments) {
            transactions[index].comments = []
          }
          transactions[index].comments.push(newComment)
        }

        this.setData({
          currentComments: updatedComments,
          transactions: transactions,
          commentText: '',
          commentLoading: false,
          showCommentModal: false
        })
      })

    wx.showToast({
      title: '评论成功',
      icon: 'success'
    })
  },

  // 与AI聊天
  chatWithAI() {
    wx.navigateTo({
      url: '/pages/ai-chat/ai-chat?walletId=' + this.data.walletId
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 格式化时间
  formatTime(timestamp) {
    try {
      let date
      
      // 处理不同的时间格式
      if (typeof timestamp === 'string') {
        // 处理字符串格式的时间，如 "2024-01-15 10:30:00"
        date = new Date(timestamp.replace(/-/g, '/')) // 兼容iOS
      } else if (typeof timestamp === 'number') {
        // 处理时间戳
        date = new Date(timestamp)
      } else {
        // 如果已经是Date对象
        date = timestamp
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的时间格式:', timestamp)
        return '时间格式错误'
      }
      
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
      } else if (diff < 86400000 * 2) { // 昨天
        return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    } else {
        // 显示月日格式
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
    } catch (error) {
      console.error('时间格式化失败:', timestamp, error)
      return '时间解析失败'
    }
  },

  // 加载社交统计数据
  loadSocialStats() {
    const userId = this.data.wallet.userId || this.data.wallet.user_id || app.globalData.userInfo?.id
    
    if (!userId) {
      return
    }

    // 尝试从API获取真实数据
    walletAPI.getUserSocialStats(userId)
      .then(result => {
        const stats = result.data || {}
        const socialStats = {
          fansCount: stats.fansCount || 0,  // 使用真实数据，新用户为0
          likesCount: stats.likesCount || 0, // 使用真实数据，新用户为0
          viewsCount: stats.viewsCount || 0  // 使用真实数据，新用户为0
        }
        this.setData({ socialStats })
      })
      .catch(error => {
        console.log('获取社交统计失败，使用默认数据:', error)
        // API失败时使用真实的0值，不使用模拟数据
        const socialStats = {
          fansCount: 0,  // 新用户真实数据为0
          likesCount: 0, // 新用户真实数据为0
          viewsCount: 0  // 新用户真实数据为0
        }
        this.setData({ socialStats })
        
        // 如果是网络错误，给用户友好提示
        if (error.message && error.message.includes('网络')) {
          console.log('检测到网络错误，可能是后端服务未启动')
        }
      })
  },

  // 检查关注状态
  checkFollowStatus() {
    const currentUserId = app.globalData.userInfo?.id
    const walletId = this.data.walletId
    
    if (!currentUserId || !walletId) {
      this.setData({ isFollowing: false })
      return
    }
    
    console.log('检查关注状态: 当前用户=' + currentUserId + ', 钱包=' + walletId)
    
    // 先获取钱包所有者ID
    walletAPI.getWalletOwnerId(walletId)
      .then(result => {
        const walletOwnerId = result.data
        console.log('钱包所有者ID:', walletOwnerId)
        
        if (!walletOwnerId || walletOwnerId === currentUserId) {
          // 如果是自己的钱包
          console.log('这是自己的钱包，不显示关注按钮')
          this.setData({ 
            isFollowing: false,
            isOwnWallet: true
          })
          return
        }
        
        // 设置为别人的钱包
        console.log('这是别人的钱包，检查关注状态')
        this.setData({ isOwnWallet: false })
        
        // 检查是否已关注该用户
        console.log('调用关注状态检查API: currentUserId=' + currentUserId + ', targetUserId=' + walletOwnerId)
        return walletAPI.checkFollowStatus(currentUserId, walletOwnerId)
      })
      .then(result => {
        if (result) {
          const isFollowing = result.data || false
          console.log('API返回的关注状态:', result.data, '处理后:', isFollowing)
          this.setData({ isFollowing })
          console.log('关注状态设置完成，当前状态:', isFollowing)
        }
      })
      .catch(error => {
        console.error('检查关注状态失败:', error)
        this.setData({ isFollowing: false })
      })
  },

  // 切换关注状态
  toggleFollow() {
    if (this.data.isOwnWallet) {
      return // 不能关注自己
    }

    const currentUserId = app.globalData.userInfo?.id
    const walletUserId = this.data.wallet.userId || this.data.wallet.user_id

    if (!currentUserId || !walletUserId) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
      return
    }

    const isFollowing = this.data.isFollowing
    
    // 先更新UI状态，提供即时反馈
    const socialStats = { ...this.data.socialStats }
    socialStats.fansCount += isFollowing ? -1 : 1
    
    this.setData({
      isFollowing: !isFollowing,
      socialStats
    })

    const apiCall = isFollowing ? 
      walletAPI.unfollowWallet(currentUserId, this.data.walletId) :
      walletAPI.followWallet(currentUserId, this.data.walletId)

    apiCall
      .then(result => {
        wx.showToast({
          title: isFollowing ? '取消关注' : '关注成功',
          icon: 'success'
        })
        
        // 通知用户社交主页刷新关注列表
        this.notifyUserSocialPageRefresh()
      })
      .catch(error => {
        console.error('关注操作失败:', error)
        
        // 如果API失败，回滚UI状态
        const revertStats = { ...this.data.socialStats }
        revertStats.fansCount += isFollowing ? 1 : -1
        
        this.setData({
          isFollowing: isFollowing,
          socialStats: revertStats
        })
        
        // 如果是404错误，说明API接口不存在，使用模拟模式
        if (error.message && error.message.includes('404')) {
          wx.showToast({
            title: isFollowing ? '取消关注' : '关注成功',
            icon: 'success'
          })
          console.log('API接口暂不可用，使用模拟模式')
          
          // 即使是模拟模式，也要通知用户社交主页刷新
          this.notifyUserSocialPageRefresh()
        } else {
          wx.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        }
      })
  },

  // 通知用户社交主页刷新关注列表
  notifyUserSocialPageRefresh() {
    const pages = getCurrentPages()
    
    // 查找用户社交主页并刷新数据
    const userSocialPage = pages.find(page => 
      (page.route && page.route.includes('user-social-profile')) || 
      (page.__route__ && page.__route__.includes('user-social-profile'))
    )
    
    if (userSocialPage && userSocialPage.loadUserData) {
      console.log('找到用户社交主页，刷新关注列表')
      const userId = app.globalData.userInfo?.id
      if (userId) {
        userSocialPage.loadUserData(userId)
      }
    }
    
    // 如果当前关注操作成功，模拟添加到关注列表
    if (!this.data.isFollowing) { // 刚刚关注了
      const newFollowedWallet = {
        id: this.data.walletId,
        title: this.data.wallet.name || '未命名钱包',
        amount: parseFloat(this.data.wallet.balance || 0).toFixed(2),
        participantCount: 1,
        backgroundStyle: this.data.walletBackgroundStyle
      }
      
      // 将关注的钱包信息存储到本地，供用户社交主页使用
      const followedWallets = wx.getStorageSync('followedWallets') || []
      const existingIndex = followedWallets.findIndex(w => w.id === this.data.walletId)
      
      if (existingIndex === -1) {
        followedWallets.push(newFollowedWallet)
        wx.setStorageSync('followedWallets', followedWallets)
        console.log('已将钱包添加到关注列表:', newFollowedWallet)
      }
    } else { // 刚刚取消关注了
      const followedWallets = wx.getStorageSync('followedWallets') || []
      const filteredWallets = followedWallets.filter(w => w.id !== this.data.walletId)
      wx.setStorageSync('followedWallets', filteredWallets)
      console.log('已从关注列表移除钱包ID:', this.data.walletId)
    }
  },

  // 关注钱包（只读模式下使用）- 保持向后兼容
  followWallet() {
    this.toggleFollow()
  },

  // AI语音播放功能
  playAiVoice(e) {
    const transaction = e.currentTarget.dataset.transaction
    const transactionId = transaction.id
    
    // 如果当前有语音在播放，先停止
    if (this.data.currentPlayingVoice) {
      this.stopCurrentVoice()
    }
    
    // 检查是否有语音URL
    if (!transaction.voiceUrl || transaction.voiceUrl.startsWith('mock_voice_')) {
      // 如果没有语音URL或者是mock语音，直接使用模拟播放
      this.simulateVoicePlay(transaction)
      return
    }
    
    // 创建音频上下文
    const voiceContext = wx.createInnerAudioContext()
    
    voiceContext.src = transaction.voiceUrl
    voiceContext.autoplay = true
    voiceContext.loop = false
    
    // 更新UI状态
    this.updateTransactionPlayingState(transactionId, true)
    
    voiceContext.onPlay(() => {
      console.log('AI语音开始播放')
    })
    
    voiceContext.onEnded(() => {
      console.log('AI语音播放结束')
      this.updateTransactionPlayingState(transactionId, false)
      this.setData({
        currentPlayingVoice: null,
        voiceContext: null
      })
    })
    
    voiceContext.onError((error) => {
      console.error('AI语音播放失败:', error)
      wx.showToast({
        title: '语音播放失败',
        icon: 'none'
      })
      this.updateTransactionPlayingState(transactionId, false)
      this.setData({
        currentPlayingVoice: null,
        voiceContext: null
      })
    })
    
    this.setData({
      currentPlayingVoice: transactionId,
      voiceContext: voiceContext
    })
  },
  
  // 停止当前播放的语音
  stopCurrentVoice() {
    if (this.data.voiceContext) {
      this.data.voiceContext.stop()
      this.data.voiceContext.destroy()
    }
    
    if (this.data.currentPlayingVoice) {
      this.updateTransactionPlayingState(this.data.currentPlayingVoice, false)
    }
    
    this.setData({
      currentPlayingVoice: null,
      voiceContext: null
    })
  },
  
  // 更新交易的播放状态
  updateTransactionPlayingState(transactionId, isPlaying) {
    const transactions = this.data.transactions
    const index = transactions.findIndex(t => t.id === transactionId)
    
    if (index !== -1) {
      transactions[index].isPlaying = isPlaying
      this.setData({ transactions })
    }
  },
  
  // 生成AI语音（模拟功能）
  generateAiVoice(transaction) {
    wx.showToast({
      title: '正在生成语音...',
      icon: 'loading',
      duration: 1000
    })
    
    // 模拟语音生成过程
    setTimeout(() => {
      // 模拟语音播放
      this.simulateVoicePlay(transaction)
    }, 1000)
  },
  
  // 模拟语音播放
  simulateVoicePlay(transaction) {
    const transactionId = transaction.id
    
    // 更新UI显示正在播放
    this.updateTransactionPlayingState(transactionId, true)
    this.setData({ currentPlayingVoice: transactionId })
    
    wx.showToast({
      title: '语音播放中...',
      icon: 'none',
      duration: 1000
    })
    
    // 模拟播放时长（12秒）
    setTimeout(() => {
      this.updateTransactionPlayingState(transactionId, false)
      this.setData({ currentPlayingVoice: null })
      
      wx.showToast({
        title: '语音播放完成',
        icon: 'success',
        duration: 1000
      })
    }, 12000)
  },

  // 页面卸载时清理语音资源
  onUnload() {
    this.stopCurrentVoice()
  },

  // 页面隐藏时暂停语音
  onHide() {
    if (this.data.voiceContext) {
      this.data.voiceContext.pause()
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 返回钱包列表页面
  goBackToWalletList() {
    // 如果是自己的钱包，返回主页
    if (this.data.isOwnWallet) {
      wx.switchTab({
        url: '/pages/home/home'
      })
    } else {
      // 如果是从社交圈来的，返回社交圈
      if (this.data.fromSocial) {
        wx.navigateTo({
          url: '/pages/social/social'
        })
      } else {
        // 否则返回上一页
        wx.navigateBack({
          delta: 1
        })
      }
    }
  }

})