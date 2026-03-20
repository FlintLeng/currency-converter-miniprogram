// utils/exchangeApi.js
// 汇率API封装

/**
 * 获取实时汇率
 * 使用免费的汇率API
 */
function getRates(baseCurrency = 'CNY') {
  return new Promise((resolve, reject) => {
    // 使用 exchangerate-api.com 免费API
    // 注意：实际使用时需要替换为真实的API Key
    // 或者使用其他免费汇率API
    
    wx.request({
      url: 'https://api.exchangerate-api.com/v4/latest/CNY',
      method: 'GET',
      success(res) {
        if (res.statusCode === 200 && res.data.rates) {
          resolve(res.data.rates)
        } else {
          // 如果API失败，使用备用数据
          resolve(getFallbackRates())
        }
      },
      fail(err) {
        console.error('汇率API请求失败:', err)
        // 使用备用汇率数据
        resolve(getFallbackRates())
      }
    })
  })
}

/**
 * 备用汇率数据（当API不可用时使用）
 * 注意：这是示例数据，实际使用时应该从API获取
 */
function getFallbackRates() {
  return {
    CNY: 1,
    USD: 0.138,      // 1 CNY ≈ 0.138 USD
    HKD: 1.08,       // 1 CNY ≈ 1.08 HKD
    EUR: 0.127,      // 1 CNY ≈ 0.127 EUR
    JPY: 20.5,       // 1 CNY ≈ 20.5 JPY
    SGD: 0.186,      // 1 CNY ≈ 0.186 SGD
    KRW: 185.5       // 1 CNY ≈ 185.5 KRW
  }
}

/**
 * 获取特定货币对的汇率
 */
function getExchangeRate(fromCurrency, toCurrency) {
  return new Promise((resolve, reject) => {
    getRates('CNY').then(rates => {
      const fromRate = rates[fromCurrency] || 1
      const toRate = rates[toCurrency] || 1
      const exchangeRate = fromRate / toRate
      resolve(exchangeRate)
    }).catch(reject)
  })
}

module.exports = {
  getRates,
  getExchangeRate,
  getFallbackRates
}
