const base = require('./utils/util.js')
App({
    onLaunch: function(options) {
        //适配iPhone X
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.isPX = (res.model.indexOf("iPhone X") != -1) ? true : false
            }
        })
        this.login()
        // 获取小程序更新机制兼容
        if (wx.canIUse("getUpdateManager")) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function() {
                        wx.showModal({
                            title: "更新提示",
                            content: "新版本已经准备好， 是否重启应用？",
                            success: function(res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function() {
                        // 新的版本下载失败
                        wx.showModal({
                            title: "已经有新版本可用",
                            content: "新版本已经上线，请您删除当前小程序， 重新搜索打开。",
                        })
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: "提示",
                content: "当前微信版本过低， 无法使用该功能， 请升级到最新微信版本后重试。"
            })
        }
    },
    login: function() {
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
                    console.log('获取用户登录态失败！', data.errMsg)
                }
            }
        })
    },
    url: {
        getOpenId: 'https://club.liantuobank.com/api/wechatAppOpenId.htm'
    },
    member: function(value) {
        try {
            let loginData = wx.getStorageSync("loginData")
            return base.getValue(loginData, value)
        } catch (error) {
            this.LoginError()
        }
    },
    key: null,
    globalData: {
        version: "1.0.3"
    }
})