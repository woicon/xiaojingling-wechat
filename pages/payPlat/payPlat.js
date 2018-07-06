
const app = getApp()
var api = require('../../siApi/siApi.js')
Page({

    data: {
        isPageLoad: true
    },

    onLoad: function (options) {

    },
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '签约信息',
        })
    },
    onShow: function () {
        const parmas = {
            codeName: app.member('codeName'),
            merchantNo: app.member('merchantNo')
        }
        if (!wx.getStorageSync("isCore")) {
            parmas.departmentNo=app.member('departmentNo')
        }

        api.getPayPlatFormNew(parmas)
            .then(res => {
                console.log(res)

                let plat = res.data.obj
                for (let i in plat) {

                    plat[i].rate = Number(plat[i].rate / 10).toFixed(2) + '％'
                }

                this.setData({
                    plat: plat,
                    isPageLoad: false
                })
            })
    },

    onHide: function () {

    },

    onUnload: function () {

    },
    onPullDownRefresh: function () {

    },

    onReachBottom: function () {

    },

    onShareAppMessage: function () {

    }
})