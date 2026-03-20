// pages/index/index.js
const exchangeApi = require('../../utils/exchangeApi')

// 货币配置
const CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥', icon: '¥', iconClass: 'icon-cny' },
  { code: 'USD', name: '美元', symbol: '$', icon: '$', iconClass: 'icon-usd' },
  { code: 'HKD', name: '港币', symbol: 'HK$', icon: '港', iconClass: 'icon-hkd' },
  { code: 'EUR', name: '欧元', symbol: '€', icon: '€', iconClass: 'icon-eur' },
  { code: 'JPY', name: '日元', symbol: '¥', icon: '円', iconClass: 'icon-jpy' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', icon: '新', iconClass: 'icon-sgd' },
  { code: 'KRW', name: '韩元', symbol: '₩', icon: '₩', iconClass: 'icon-krw' }
]

Page({
  data: {
    currencies: CURRENCIES,
    fromCurrency: CURRENCIES[0], // 默认人民币
    toCurrency: CURRENCIES[1],   // 默认美元
    fromAmount: '',
    toAmount: '',
    rates: {},
    rateInfo: '',
    updateTime: '',
    loading: false,
    showFromPicker: false,
    showToPicker: false
  },

  onLoad() {
    this.fetchExchangeRates()
  },

  // 获取实时汇率
  async fetchExchangeRates() {
    this.setData({ loading: true })
    
    try {
      const rates = await exchangeApi.getRates('CNY')
      const updateTime = this.formatTime(new Date())
      
      this.setData({ 
        rates: rates,
        updateTime: updateTime,
        loading: false
      })
      
      // 如果已有输入金额，重新计算
      if (this.data.fromAmount) {
        this.calculateExchange()
      }
    } catch (error) {
      console.error('获取汇率失败:', error)
      wx.showToast({
        title: '获取汇率失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 输入金额
  onAmountInput(e) {
    const value = e.detail.value
    this.setData({ fromAmount: value })
    
    if (value) {
      this.calculateExchange()
    } else {
      this.setData({ toAmount: '', rateInfo: '' })
    }
  },

  // 计算汇率转换
  calculateExchange() {
    const { fromCurrency, toCurrency, fromAmount, rates } = this.data
    
    if (!fromAmount || !rates[fromCurrency.code] || !rates[toCurrency.code]) {
      return
    }

    // 获取相对于CNY的汇率
    const fromRate = rates[fromCurrency.code] // 1单位外币 = ?人民币
    const toRate = rates[toCurrency.code]
    
    // 转换逻辑：先转成人民币，再转成目标货币
    // fromAmount * fromRate = 人民币金额
    // 人民币金额 / toRate = 目标货币金额
    const cnyAmount = parseFloat(fromAmount) * fromRate
    const toAmount = cnyAmount * toRate
    
    // 计算汇率信息
    const exchangeRate = toRate / fromRate
    const rateInfo = `1 ${fromCurrency.code} = ${exchangeRate.toFixed(6)} ${toCurrency.code}`
    
    this.setData({ 
      toAmount: toAmount.toFixed(2),
      rateInfo: rateInfo
    })
  },

  // 交换货币
  swapCurrency() {
    const { fromCurrency, toCurrency } = this.data
    
    this.setData({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
      fromAmount: this.data.toAmount
    }, () => {
      this.calculateExchange()
    })
    
    // 添加动画效果
    wx.vibrateShort()
  },

  // 显示源货币选择器
  showFromCurrencyPicker() {
    this.setData({ showFromPicker: true })
  },

  // 显示目标货币选择器
  showToCurrencyPicker() {
    this.setData({ showToPicker: true })
  },

  // 选择源货币
  selectFromCurrency(e) {
    const code = e.currentTarget.dataset.code
    const currency = CURRENCIES.find(c => c.code === code)
    
    if (currency && currency.code !== this.data.toCurrency.code) {
      this.setData({ 
        fromCurrency: currency,
        showFromPicker: false 
      })
      this.calculateExchange()
    } else if (currency.code === this.data.toCurrency.code) {
      wx.showToast({
        title: '请选择不同的货币',
        icon: 'none'
      })
    }
  },

  // 选择目标货币
  selectToCurrency(e) {
    const code = e.currentTarget.dataset.code
    const currency = CURRENCIES.find(c => c.code === code)
    
    if (currency && currency.code !== this.data.fromCurrency.code) {
      this.setData({ 
        toCurrency: currency,
        showToPicker: false 
      })
      this.calculateExchange()
    } else if (currency.code === this.data.fromCurrency.code) {
      wx.showToast({
        title: '请选择不同的货币',
        icon: 'none'
      })
    }
  },

  // 关闭选择器
  closePicker() {
    this.setData({ 
      showFromPicker: false,
      showToPicker: false 
    })
  },

  // 刷新汇率
  refreshRates() {
    this.fetchExchangeRates()
    wx.vibrateShort()
  },

  // 复制结果
  copyResult() {
    const { toAmount, toCurrency } = this.data
    if (toAmount) {
      wx.setClipboardData({
        data: `${toAmount} ${toCurrency.code}`,
        success: () => {
          wx.showToast({
            title: '已复制',
            icon: 'success'
          })
        }
      })
    }
  }
})
