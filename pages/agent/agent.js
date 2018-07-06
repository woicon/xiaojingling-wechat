const app = getApp()
var api = require('../../siApi/siApi.js')
Page({

    data: {
        isPageLoad: true
    },

    onLoad: function(options) {

    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: '我的服务商',
        })
    },
    onShow: function() {
        const parmas = {
            codeName: app.member('codeName'),
            merchantNo: app.member('merchantNo')
        }
        api.getAgent(parmas)
            .then(res => {
                console.log(res)
                this.setData({
                    agent: res.data.obj,
                    isPageLoad: false
                })
            })
    },

    onHide: function() {

    },

    onUnload: function() {

    },
    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {

    }
})