
const base = require('./utils/util.js')
App({
  onLaunch: function (options) {
    //适配iPhone X
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.isPX = (res.model.indexOf("iPhone X") != -1) ? true : false
      }
    })

    // e7QA3FWob8EbzLDP7I6fCtcY
    // 17d90e1974d0bcb31725245f96718e73 

    this.login()
  },
  login: function () {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: this.url.getOpenId,
            data: {
              appid: base.app.appId,
              secret: base.app.appSecret,
              code: res.code
            },
            success: (data) => {
                wx.setStorageSync("sessionKey", data.data.wechatVo.sessionKey)
            },
            fail: (error) => {
              console.log(error)
              wx.hideLoading()
            }
          })
        } else {
          console.log('获取用户登录态失败！',data.errMsg)
        }
      }
    })
  },
  url: {
    getOpenId: 'https://club.liantuobank.com/api/wechatAppOpenId.htm'
  },
  member: function (value) {
      try {
          let loginData = wx.getStorageSync("loginData")
          return base.getValue(loginData, value)
      } catch (error) {
          this.LoginError()
      }
  },
  key: null,
  globalData: {
  }
})