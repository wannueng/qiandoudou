// pages/ai-chat/ai-chat.js
const app = getApp()

Page({
  data: {
    partner: {},
    wallet: {},
    userInfo: {},
    messages: [],
    inputMessage: '',
    scrollTop: 0,
    scrollIntoView: '',
    quickReplies: []
  },

  onLoad(options) {
    if (!app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    const walletId = options.walletId
    this.setData({
      userInfo: app.globalData.userInfo
    })

    this.loadWalletAndPartner(walletId)
    this.initChat()
  },

  // 加载钱包和AI伴侣信息
  loadWalletAndPartner(walletId) {
    // 演示数据
    const demoWallet = {
      id: walletId,
      name: 'AI情侣攒',
      balance: 8888.88,
      ai_partner_name: '小爱'
    }

    const demoPartner = {
      id: 1,
      name: '小爱',
      avatar: 'https://via.placeholder.com/60x60/ff69b4/ffffff?text=小爱',
      personality: '温柔体贴'
    }

    this.setData({
      wallet: demoWallet,
      partner: demoPartner
    })
  },

  // 初始化聊天
  initChat() {
    const welcomeMessages = [
      {
        id: 1,
        type: 'ai',
        content: '嗨～我是小爱！很高兴和你一起攒钱呀 💕',
        time: this.getCurrentTime()
      },
      {
        id: 2,
        type: 'ai', 
        content: '我们的小金库现在有¥8888.88了呢，今天想攒多少钱？',
        time: this.getCurrentTime()
      }
    ]

    this.setData({
      messages: welcomeMessages,
      quickReplies: ['今天攒100元', '查看攒钱进度', '设定攒钱目标', '夸夸我']
    })

    this.scrollToBottom()
  },

  // 输入消息
  onMessageInput(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputMessage.trim()
    if (!message) return

    this.addUserMessage(message)
    this.setData({ inputMessage: '' })
    
    // 模拟AI回复
    setTimeout(() => {
      this.generateAIReply(message)
    }, 1000)
  },

  // 快捷回复
  sendQuickReply(e) {
    const text = e.currentTarget.dataset.text
    this.addUserMessage(text)
    
    // 清除快捷回复
    this.setData({ quickReplies: [] })
    
    // 模拟AI回复
    setTimeout(() => {
      this.generateAIReply(text)
    }, 1000)
  },

  // 添加用户消息
  addUserMessage(content) {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content,
      time: this.getCurrentTime()
    }

    this.setData({
      messages: [...this.data.messages, newMessage]
    })
    
    this.scrollToBottom()
  },

  // 生成AI回复
  generateAIReply(userMessage) {
    let aiReply = ''
    let newQuickReplies = []

    if (userMessage.includes('攒') || userMessage.includes('100')) {
      aiReply = '好棒！100元已经存入我们的小金库了～现在余额是¥8988.88 🎉'
      newQuickReplies = ['继续攒钱', '查看详情', '设定目标']
    } else if (userMessage.includes('进度') || userMessage.includes('目标')) {
      aiReply = '我们这个月已经攒了2000元啦！距离10000元的目标还差8000元，加油！💪'
      newQuickReplies = ['太棒了', '再攒200元', '调整目标']
    } else if (userMessage.includes('夸')) {
      aiReply = '你真的很棒呢！坚持攒钱30天了，我为你感到骄傲～ 💕'
      newQuickReplies = ['谢谢小爱', '继续努力', '设定新目标']
    } else {
      const replies = [
        '我会一直陪着你攒钱的～',
        '今天也要好好攒钱哦！',
        '我们一起加油吧 💪',
        '你说得对呢～',
        '嗯嗯，我明白你的意思 😊'
      ]
      aiReply = replies[Math.floor(Math.random() * replies.length)]
      newQuickReplies = ['今天攒钱', '查看余额', '聊聊天']
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiReply,
      time: this.getCurrentTime()
    }

    this.setData({
      messages: [...this.data.messages, aiMessage],
      quickReplies: newQuickReplies
    })

    this.scrollToBottom()
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  // 滚动到底部
  scrollToBottom() {
    const messages = this.data.messages
    if (messages.length > 0) {
      const lastMessageId = `msg-${messages[messages.length - 1].id}`
      this.setData({
        scrollIntoView: lastMessageId
      })
    }
  }
})
