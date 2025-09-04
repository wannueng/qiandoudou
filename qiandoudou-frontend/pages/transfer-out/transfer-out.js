// pages/transfer-out/transfer-out.js
const app = getApp()
const { walletAPI } = require('../../utils/api.js')

Page({
  data: {
    walletId: null,
    wallet: {},
    transferAmount: '',
    transferNote: '',
    noteLength: 0,
    uploadedImage: '',
    selectedBankCard: 'pingan',
    availableAmount: '10000000.49',
    transferLoading: false,
    // 光标控制相关
    noteCursor: -1,
    noteSelectionStart: -1,
    noteSelectionEnd: -1,
    isUserTyping: false
  },

  onLoad(options) {
    console.log('转出页面 - onLoad参数:', options)
    const walletId = options.id || options.walletId
    console.log('转出页面 - 解析的钱包ID:', walletId)
    console.log('转出页面 - 当前token:', app.globalData.token)
    
    this.setData({
      walletId: walletId
    })
    
    this.loadWalletInfo()
    this.generateDefaultNote()
  },

  // 加载钱包信息
  loadWalletInfo() {
    const walletId = this.data.walletId
    if (!walletId) {
      console.error('钱包ID不存在')
      return
    }

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
        
        console.log('转出页面 - 从后端加载的钱包数据:', wallet)
        this.setData({
          wallet: wallet,
          availableAmount: wallet.balance
        })
      })
      .catch(error => {
        console.error('加载钱包信息失败:', error)
        wx.showToast({
          title: error.message || '加载钱包信息失败',
          icon: 'none'
        })
      })
  },

  // 生成默认备注
  generateDefaultNote() {
    const defaultNote = '山高水长，风景美如画。坐等仙女下凡，赐予我一片云彩，好飞到湖里泡个澡！'
    this.setData({
      transferNote: defaultNote,
      noteLength: defaultNote.length,
      noteCursor: defaultNote.length
    })
  },



  // 选择银行卡
  selectBankCard(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedBankCard: type
    })
  },

  // 金额输入
  onAmountInput(e) {
    const value = e.detail.value
    this.setData({
      transferAmount: value
    })
  },

  // 全部转出
  transferAll() {
    this.setData({
      transferAmount: this.data.availableAmount
    })
  },

  // 备注输入
  onNoteInput(e) {
    const value = e.detail.value
    const cursor = e.detail.cursor
    this.setData({
      transferNote: value,
      noteLength: value.length,
      noteCursor: cursor,
      isUserTyping: true
    })
  },

  // 备注获得焦点
  onNoteFocus(e) {
    console.log('备注获得焦点')
    this.setData({
      isUserTyping: true
    })
  },

  // 备注失去焦点
  onNoteBlur(e) {
    console.log('备注失去焦点')
    this.setData({
      isUserTyping: false
    })
  },

  // 重新生成备注
  retryNote() {
    // 如果用户正在输入，先提示
    if (this.data.isUserTyping) {
      wx.showToast({
        title: '请先完成当前输入',
        icon: 'none'
      })
      return
    }
    
    // 如果有上传的图片，调用AI接口生成文案
    if (this.data.uploadedImage) {
      this.generateNoteFromImage()
    } else {
      // 如果没有图片，使用默认的随机文案
      const notes = [
        '山高水长，风景美如画。坐等仙女下凡，赐予我一片云彩，好飞到湖里泡个澡！',
        '今天心情不错，决定转出一些资金用于其他投资。',
        '为了更好的理财规划，将部分资金转到其他账户。',
        '生活需要资金周转，转出部分金额应急使用。'
      ]
      const randomNote = notes[Math.floor(Math.random() * notes.length)]
      
      // 先清空，再设置新内容，并将光标设置到末尾
      this.setData({
        transferNote: '',
        noteLength: 0,
        noteCursor: -1
      })
      
      // 延迟设置新内容，确保光标正确定位
      setTimeout(() => {
        this.setData({
          transferNote: randomNote,
          noteLength: randomNote.length,
          noteCursor: randomNote.length
        })
      }, 50)
    }
  },

  // 根据图片生成文案
  generateNoteFromImage() {
    if (!this.data.uploadedImage) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '正在生成文案...',
      mask: true
    })

    // 将图片转换为base64
    this.convertImageToBase64(this.data.uploadedImage)
      .then(imageBase64 => {
        return walletAPI.generateTextFromImage(imageBase64, '你是一个朋友圈文案助手，根据图片生成朋友圈的文案，少于100字，不要生成其他内容,不要思考太久')
      })
      .then(result => {
        wx.hideLoading()
        const generatedText = result.data
        
        // 先清空，再设置新内容，并将光标设置到末尾
        this.setData({
          transferNote: '',
          noteLength: 0,
          noteCursor: -1
        })
        
        // 延迟设置新内容，确保光标正确定位
        setTimeout(() => {
          this.setData({
            transferNote: generatedText,
            noteLength: generatedText.length,
            noteCursor: generatedText.length
          })
        }, 50)
        
        wx.showToast({
          title: '文案生成成功',
          icon: 'success'
        })
      })
      .catch(error => {
        wx.hideLoading()
        console.error('生成文案失败:', error)
        wx.showToast({
          title: error.message || '生成文案失败',
          icon: 'none'
        })
        // 失败时使用默认文案
        const defaultNote = '山高水长，风景美如画。坐等仙女下凡，赐予我一片云彩，好飞到湖里泡个澡！'
        this.setData({
          transferNote: '',
          noteLength: 0,
          noteCursor: -1
        })
        setTimeout(() => {
          this.setData({
            transferNote: defaultNote,
            noteLength: defaultNote.length,
            noteCursor: defaultNote.length
          })
        }, 50)
      })
  },

  // 将图片转换为base64
  convertImageToBase64(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: imagePath,
        encoding: 'base64',
        success: (res) => {
          resolve(res.data)
        },
        fail: (error) => {
          reject(new Error('图片读取失败'))
        }
      })
    })
  },

  // 上传图片
  uploadImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          uploadedImage: tempFilePath
        })
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  // 确认转出
  confirmTransferOut() {
    const { transferAmount, transferNote, wallet } = this.data
    
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      wx.showToast({
        title: '请输入转出金额',
        icon: 'error'
      })
      return
    }

    if (!wallet || !wallet.id) {
      wx.showToast({
        title: '钱包信息错误',
        icon: 'error'
      })
      return
    }

    const amount = parseFloat(transferAmount)

    if (amount > wallet.balance) {
      wx.showToast({
        title: '转出金额不能超过余额',
        icon: 'error'
      })
      return
    }

    this.setData({ transferLoading: true })

    const description = transferNote || '转出'
    const imageUrl = this.data.uploadedImage || null
    const note = transferNote || null

    walletAPI.transferOut(wallet.id, amount, description, imageUrl, note)
      .then(result => {
        wx.showToast({
          title: `成功转出¥${amount}`,
          icon: 'success'
        })

        // 返回钱包详情页并刷新
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2]
            if (prevPage && prevPage.loadWalletDetail) {
              prevPage.loadWalletDetail()
            }
            if (prevPage && prevPage.loadTransactions) {
              prevPage.loadTransactions()
            }
          }
          // 同时刷新首页数据
          const homePage = pages.find(page => page.route === 'pages/home/home' || page.__route__ === 'pages/home/home')
          if (homePage && homePage.loadWallets) {
            homePage.loadWallets()
          }
          
          wx.navigateBack({
            delta: 1
          })
        }, 1500)

        this.setData({ transferLoading: false })
      })
      .catch(error => {
        console.error('转出失败:', error)
        wx.showToast({
          title: error.message || '转出失败',
          icon: 'none'
        })
        this.setData({ transferLoading: false })
      })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  }

})
