// pages/script-detail/script-detail.js
const { scriptAPI } = require('../../utils/api.js')

Page({
  data: {
    userId: null,
    walletId: null,
    selectedScript: null,
    selectedCategory: 1,
    categories: [
      { id: 1, name: '推荐' },
      { id: 2, name: '旅行' },
      { id: 3, name: '购物' },
      { id: 4, name: '学习' },
      { id: 5, name: '健身' }
    ],
    scripts: [],
    filteredScripts: [],
    
    // 剧本播放相关
    currentChapter: 1,
    chapterContent: null,
    userProgress: null,
    selectedChoice: null,
    transferButtonEnabled: false,
    
    // 章节选择器
    availableChapters: [],
    maxUnlockedChapter: 1,
    
    // 视频相关
    videoLoadError: false,
    videoContext: null,
    isFullscreen: false
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo')
    const walletId = options.walletId
    
    this.setData({
      userId: userInfo.id,
      walletId: walletId
    })

    // 加载剧本列表
    this.loadScripts()

    // 如果有scriptId参数，直接显示该剧本详情
    const scriptId = options.id
    if (scriptId) {
      this.loadScriptDetail(scriptId)
    }
  },

  onReady() {
    // 延迟创建视频上下文，确保DOM已完全渲染
    setTimeout(() => {
      const videoContext = wx.createVideoContext('chapterVideo', this)
      this.setData({
        videoContext: videoContext
      })
      console.log('视频上下文初始化完成')
    }, 200)
  },

  onShow() {
    // 页面显示时的处理
    console.log('页面显示，当前全屏状态:', this.data.isFullscreen)
  },

  onHide() {
    // 页面隐藏时，退出全屏状态
    if (this.data.isFullscreen && this.data.videoContext) {
      try {
        this.data.videoContext.exitFullScreen()
        console.log('页面隐藏时退出全屏')
      } catch (error) {
        console.error('页面隐藏时退出全屏失败:', error)
      }
    }
  },

  // 加载剧本列表
  async loadScripts() {
    try {
      wx.showLoading({ title: '加载中...' })
      const response = await scriptAPI.getScriptList(this.data.selectedCategory === 1 ? null : this.data.selectedCategory)
      
      if (response.code === 200) {
        this.setData({
          scripts: response.data,
          filteredScripts: response.data
        })
      }
    } catch (error) {
      console.error('加载剧本列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 加载剧本详情
  async loadScriptDetail(scriptId) {
    try {
      wx.showLoading({ title: '加载中...' })
      
      // 获取剧本详情
      const scriptResponse = await scriptAPI.getScriptDetail(scriptId)
      if (scriptResponse.code !== 200) {
        throw new Error('获取剧本详情失败')
      }

      // 获取或创建用户进度
      let progressResponse = await scriptAPI.getUserProgress(this.data.userId, scriptId)
      if (progressResponse.code !== 200 || !progressResponse.data) {
        // 开始新剧本
        const startResponse = await scriptAPI.startScript(this.data.userId, this.data.walletId, scriptId)
        if (startResponse.code === 200) {
          progressResponse = { code: 200, data: startResponse.data }
        }
      }

      const script = scriptResponse.data
      const progress = progressResponse.data

      // 生成可用章节列表
      const availableChapters = []
      for (let i = 1; i <= script.totalChapters; i++) {
        availableChapters.push({
          number: i,
          unlocked: i <= progress.currentChapter,
          current: i === progress.currentChapter
        })
      }

      this.setData({
        selectedScript: script,
        userProgress: progress,
        currentChapter: progress.currentChapter,
        availableChapters: availableChapters,
        maxUnlockedChapter: progress.currentChapter
      })

      // 加载当前章节内容
      this.loadChapterContent(scriptId, progress.currentChapter)

    } catch (error) {
      console.error('加载剧本详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 加载章节内容
  async loadChapterContent(scriptId, chapterNumber) {
    try {
      const response = await scriptAPI.getChapterContent(scriptId, chapterNumber)
      console.log('章节内容API响应:', response)
      
      if (response.code === 200) {
        const chapterData = response.data
        
        // 检查章节数据是否存在
        if (!chapterData) {
          console.error('章节数据为空，章节可能不存在:', scriptId, chapterNumber)
          wx.showToast({
            title: '章节数据不存在',
            icon: 'error'
          })
          return
        }
        
        // 解析choices JSON
        let choicesList = []
        if (chapterData.choices) {
          try {
            choicesList = JSON.parse(chapterData.choices)
          } catch (e) {
            console.error('解析choices失败:', e)
            choicesList = []
          }
        }
        
        chapterData.choicesList = choicesList
        console.log('章节数据处理完成:', chapterData)
        
        this.setData({
          chapterContent: chapterData,
          selectedChoice: null,
          transferButtonEnabled: false,
          videoLoadError: false
        })

        // 处理视频URL
        if (chapterData && chapterData.videoUrl) {
          console.log('原始视频URL:', chapterData.videoUrl)
          
          // 添加时间戳参数避免缓存问题
          const timestamp = new Date().getTime()
          const separator = chapterData.videoUrl.includes('?') ? '&' : '?'
          chapterData.videoUrl = chapterData.videoUrl + separator + 'v=' + timestamp
          
          console.log('添加防缓存参数后的视频URL:', chapterData.videoUrl)
          
          // 重置视频相关状态
          this.setData({
            videoContext: null,
            isFullscreen: false
          })
          
          console.log('准备初始化视频组件')
        }
      } else {
        console.error('获取章节内容失败，完整响应:', response)
        wx.showToast({
          title: response.message || '获取章节内容失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('加载章节内容失败:', error)
      wx.showToast({
        title: '加载章节失败',
        icon: 'error'
      })
    }
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id)
    this.setData({
      selectedCategory: categoryId
    })
    this.loadScripts()
  },

  // 选择剧本
  selectScript(e) {
    const script = e.currentTarget.dataset.script
    this.loadScriptDetail(script.id)
  },

  // 选择章节
  selectChapter(e) {
    const chapterNumber = parseInt(e.currentTarget.dataset.chapter)
    const { availableChapters, currentChapter } = this.data
    
    console.log('尝试切换到章节:', chapterNumber, '当前章节:', currentChapter)
    
    // 检查章节是否已解锁
    const chapter = availableChapters.find(c => c.number === chapterNumber)
    if (!chapter || !chapter.unlocked) {
      wx.showToast({
        title: '章节未解锁',
        icon: 'error'
      })
      return
    }

    // 如果是当前章节，不需要重新加载
    if (chapterNumber === currentChapter) {
      console.log('已经是当前章节，无需切换')
      return
    }

    // 更新章节选择器状态
    const updatedChapters = availableChapters.map(ch => ({
      ...ch,
      current: ch.number === chapterNumber
    }))

    this.setData({
      currentChapter: chapterNumber,
      availableChapters: updatedChapters
    })
    
    console.log('开始加载章节', chapterNumber, '的内容')
    this.loadChapterContent(this.data.selectedScript.id, chapterNumber)
  },

  // 选择剧情选项
  selectChoice(e) {
    const choice = e.currentTarget.dataset.choice
    this.setData({
      selectedChoice: choice,
      transferButtonEnabled: true
    })
  },

  // 向钱兜兜转入
  async transferToWallet() {
    const { selectedChoice, selectedScript, currentChapter, userId } = this.data
    
    if (!selectedChoice) {
      wx.showToast({
        title: '请先选择一个选项',
        icon: 'error'
      })
      return
    }

    try {
      // 解析选择项获取金额
      const choices = this.data.chapterContent.choicesList
      const choiceObj = choices.find(c => c.selection === selectedChoice)
      
      if (!choiceObj) {
        throw new Error('选择项无效')
      }

      const amount = choiceObj.cost

      wx.showModal({
        title: '确认转入',
        content: `您选择了"${selectedChoice}"，需要向钱兜兜转入¥${amount}元来解锁下一集`,
        confirmText: '确认转入',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.processChoice(selectedChoice, amount)
          }
        }
      })

    } catch (error) {
      console.error('转入处理失败:', error)
      wx.showToast({
        title: '处理失败',
        icon: 'error'
      })
    }
  },

  // 处理用户选择
  async processChoice(selectedChoice, amount) {
    try {
      wx.showLoading({ title: '处理中...' })

      const response = await scriptAPI.makeChoice(
        this.data.userId,
        this.data.selectedScript.id,
        this.data.currentChapter,
        selectedChoice,
        amount
      )

      if (response.code === 200 && response.success) {
        wx.showToast({
          title: response.message,
          icon: 'success'
        })

        // 更新进度和可用章节
        if (response.isCompleted) {
          wx.showModal({
            title: '恭喜',
            content: '您已完成整个剧本！',
            showCancel: false
          })
        } else {
          // 更新章节状态
          const { availableChapters } = this.data
          const updatedChapters = availableChapters.map(chapter => ({
            ...chapter,
            unlocked: chapter.number <= response.nextChapter,
            current: chapter.number === response.nextChapter
          }))

          this.setData({
            availableChapters: updatedChapters,
            maxUnlockedChapter: response.nextChapter,
            currentChapter: response.nextChapter
          })

          // 加载下一集内容
          this.loadChapterContent(this.data.selectedScript.id, response.nextChapter)
        }

        // 刷新用户进度
        this.refreshUserProgress()

      } else {
        throw new Error(response.message || '处理失败')
      }

    } catch (error) {
      console.error('处理选择失败:', error)
      wx.showToast({
        title: error.message || '处理失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 刷新用户进度
  async refreshUserProgress() {
    try {
      const response = await scriptAPI.getUserProgress(this.data.userId, this.data.selectedScript.id)
      if (response.code === 200) {
        this.setData({
          userProgress: response.data
        })
      }
    } catch (error) {
      console.error('刷新进度失败:', error)
    }
  },

  // 返回列表
  goBack() {
    this.setData({
      selectedScript: null,
      chapterContent: null,
      selectedChoice: null,
      transferButtonEnabled: false
    })
  },

  // 返回钱包
  goBackToWallet() {
    wx.navigateBack()
  },

  // 视频播放事件
  onVideoPlay(e) {
    console.log('视频开始播放:', e)
    console.log('当前视频上下文状态:', !!this.data.videoContext)
    console.log('当前全屏状态:', this.data.isFullscreen)
  },

  // 视频加载成功事件
  onVideoLoaded(e) {
    console.log('视频加载成功:', e)
    this.setData({
      videoLoadError: false
    })
  },

  // 视频可以播放事件
  onVideoCanPlay(e) {
    console.log('视频可以播放:', e)
    
    // 在视频可以播放时初始化上下文，这是最佳时机
    if (!this.data.videoContext) {
      console.log('视频可播放，初始化视频上下文')
      setTimeout(() => {
        const videoContext = wx.createVideoContext('chapterVideo', this)
        if (videoContext) {
          this.setData({
            videoContext: videoContext
          })
          console.log('视频上下文初始化完成，可以使用全屏功能')
        } else {
          console.error('视频上下文创建失败')
        }
      }, 300)
    } else {
      console.log('视频上下文已存在，无需重新创建')
    }
  },

  // 视频错误事件
  onVideoError(e) {
    console.error('视频播放错误详情:', e.detail)
    console.error('视频播放错误完整信息:', e)
    
    this.setData({
      videoLoadError: true
    })
    
    // 显示详细错误信息用于调试
    const errorMsg = e.detail ? JSON.stringify(e.detail) : '未知错误'
    console.log('当前视频路径:', this.data.chapterContent?.videoUrl)
    
    wx.showModal({
      title: '视频加载失败',
      content: `请检查视频文件是否存在\n路径: ${this.data.chapterContent?.videoUrl}\n错误: ${errorMsg}`,
      showCancel: false
    })
  },

  // 重试视频加载
  retryVideo() {
    this.setData({
      videoLoadError: false
    })
    
    // 重新初始化视频上下文并播放
    this.initVideoContext()
    
    // 延迟播放，确保上下文已初始化
    setTimeout(() => {
      if (this.data.videoContext) {
        try {
          this.data.videoContext.play()
        } catch (error) {
          console.error('重试播放失败:', error)
        }
      }
    }, 500)
  },

  // 全屏状态变化事件
  onFullscreenChange(e) {
    console.log('全屏状态变化:', e.detail)
    
    // 避免频繁的状态更新导致闪烁，只在状态真正改变时更新
    if (this.data.isFullscreen !== e.detail.fullScreen) {
      this.setData({
        isFullscreen: e.detail.fullScreen
      })
      
      if (e.detail.fullScreen) {
        console.log('进入全屏模式')
        // 全屏模式下的处理（暂时不做额外操作，避免API错误）
      } else {
        console.log('退出全屏模式')
        // 退出全屏模式下的处理
      }
    }
  },

  // 视频暂停事件
  onVideoPause(e) {
    console.log('视频暂停:', e.detail)
  },

  // 视频播放结束事件
  onVideoEnded(e) {
    console.log('视频播放结束:', e.detail)
  },

  // 视频缓冲事件
  onVideoWaiting(e) {
    console.log('视频缓冲中:', e.detail)
  },

  // 视频进度事件
  onVideoProgress(e) {
    console.log('视频缓冲进度:', e.detail)
  },

  // 视频时间更新事件
  onTimeUpdate(e) {
    // 可以用来跟踪播放进度
    // console.log('播放进度:', e.detail.currentTime, '/', e.detail.duration)
  },

  // 手动请求全屏（如果需要自定义全屏按钮）
  requestFullscreen() {
    console.log('尝试请求全屏，视频上下文状态:', !!this.data.videoContext)
    
    if (this.data.videoContext) {
      try {
        this.data.videoContext.requestFullScreen()
        console.log('全屏请求已发送')
      } catch (error) {
        console.error('请求全屏失败:', error)
        wx.showToast({
          title: '全屏功能暂不可用',
          icon: 'none'
        })
      }
    } else {
      console.error('视频上下文未初始化，尝试重新创建')
      // 如果上下文未初始化，尝试重新创建
      this.initVideoContext()
      
      // 延迟重试全屏
      setTimeout(() => {
        if (this.data.videoContext) {
          try {
            this.data.videoContext.requestFullScreen()
          } catch (error) {
            console.error('延迟全屏请求失败:', error)
          }
        }
      }, 300)
    }
  },

  // 退出全屏
  exitFullscreen() {
    if (this.data.videoContext) {
      try {
        this.data.videoContext.exitFullScreen()
      } catch (error) {
        console.error('退出全屏失败:', error)
      }
    } else {
      console.error('视频上下文未初始化')
    }
  },

  // 初始化视频上下文的独立方法
  initVideoContext() {
    setTimeout(() => {
      const videoContext = wx.createVideoContext('chapterVideo', this)
      if (videoContext) {
        this.setData({
          videoContext: videoContext
        })
        console.log('重新初始化视频上下文完成')
      }
    }, 200)
  },

  // 清除视频缓存并重新加载
  clearVideoCache() {
    console.log('清除视频缓存并重新加载')
    
    // 先停止当前视频
    if (this.data.videoContext) {
      try {
        this.data.videoContext.stop()
      } catch (error) {
        console.log('停止视频失败:', error)
      }
    }
    
    // 重置视频状态
    this.setData({
      videoContext: null,
      videoLoadError: false,
      isFullscreen: false
    })
    
    // 重新加载当前章节
    setTimeout(() => {
      this.loadChapterContent(this.data.selectedScript.id, this.data.currentChapter)
    }, 300)
  }
})