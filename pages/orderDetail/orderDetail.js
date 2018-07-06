const app = getApp()
var base = require('../../utils/util.js')
var api = require('../../siApi/siApi.js')
Page({
    data: {
        isPageLoad: true
    },
    onLoad: function(options) {
        console.log("PAPGEURRENT:::::", getCurrentPages())
        console.log(options)
        if (options.detail) {
            const details = JSON.parse(options.detail)
            const member = wx.getStorageSync("loginData")
            wx.setStorageSync("refundDetail", details)
            console.log(member)
            const codeName = base.getValue(member, "loginData")
            const parmas = {
                orderNo: options.orderNo,
                codeName: member.merchant.codeName
            }
            const preAmt = Number(details.realAmt + details.refundAmt).toFixed(2)
            this.setData({
                preAmt: preAmt,
                detail: details,
                isCore: wx.getStorageSync("isCore"),
                isPageLoad: false
            })
        } else if (options.isPos) {
            let detail = wx.getStorageSync("pos")
            console.log(detail)
            this.setData({
                detail: detail.order,
                isPos: true,
                isCore: wx.getStorageSync("isCore"),
                isPageLoad: false
            })
        } else if (options.isRef) {
            let detail = wx.getStorageSync("refundDetail")
            console.log("::::RefDetail::::", detail)
            detail.approveStatus = 6
            if (options.refundStatus) {
                if (options.refundStatus == 2) {
                    detail.refundStatusCn = '退款中'
                    detail.refundStatus = 2
                    detail.approveStatus = 7
                } else if (options.refundStatus == 3) {
                    detail.refundStatusCn = '退款失败'
                    detail.approveStatus = 7
                    detail.refundStatus = 3
                }
            }
            // <!--refundStatus 第三方退款状态，只查询退款订单，1退款成功，2退款中，3退款失败 -- >
            let data = {
                detail: detail,
                isRef: true,
                isPageLoad: false,
                isCore: wx.getStorageSync("isCore"),
                refDate: wx.getStorageSync("refDate")
            }

            this.setData(data)
        }
    },

    clipOrderNo: function(e) {
        console.log(e)
        wx.setClipboardData({
            data: e.currentTarget.id,
            success: function(res) {
                wx.getClipboardData({
                    success: function(res) {
                        console.log(res.data)
                    }
                })
            }
        })
    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: '订单详情',
        })
    },
    onShow: function() {

    },
    refundQuery: function() {
        this.setData({
            btnLoading: true,
        })
        const detail = this.data.detail
        const parmas = {
            orderNo: detail.orderNo,
            codeName: app.member('codeName'),
            departmentNo: app.member('departmentNo')
        }
        api.refundQuery(parmas)
            .then(res => {
                wx.showToast({
                    title: res.data.message,
                    icon: "none"
                })
                this.setData({
                    btnLoading: false,
                })
            })
    },
    checkPay: function() {
        this.setData({
            btnLoading: true,
        })
        const detail = this.data.detail
        const parmas = {
            creatorNo: detail.creatorNo,
            orderNo: detail.orderNo,
            codeName: app.member('codeName'),
            creatorCn: detail.creatorCn
        }
        api.checkPay(parmas)
            .then(res => {
                if (res.data.state == -1) {
                    wx.showToast({
                        title: res.data.obj,
                        icon: "none",
                        success: () => {
                            this.setData({
                                btnLoading: false,
                                tryAgin: "重新检测"
                            })
                        }
                    })
                }
            })
    },
    refundAgain: function() {
        this.setData({
            btnLoading: true,
        })
        let parmas = {
            orderNo: this.data.detail.orderNo,
            codeName: app.member("codeName"),
            departmentNo: app.member("departmentNo")
        }
        wx.showModal({
            title: '提示',
            content: '是否确认退款',
            success: res => {
                if (res.confirm) {
                    api.refundAgain(parmas)
                        .then(res => {
                            console.log(res)
                            let data = res.data
                            let detail = this.data.detail
                            switch (data.isSuccess) {
                                // <!--refundStatus 第三方退款状态，只查询退款订单，1退款成功，2退款中，3退款失败 -- >
                                // <!--订单状态，默认查所有支付状态，0支付成功, 1已作废，2未支付，4退款，B手动确认，C自动确认-- >
                                case 'S':
                                    if (data.code == '000402') {
                                        detail.refundStatusCn = '退款成功'
                                        detail.gmtRefunded = new Date().Format("yyyy-MM-dd hh:mm:ss")
                                        detail.refundStatus = 1
                                        this.setData({
                                            detail: detail,
                                            btnLoading: false
                                        })
                                        wx.showToast({
                                            title: data.internalMsg,
                                            icon: "none"
                                        })
                                    } else if (data.code == '000403') {
                                        detail.refundStatusCn = '退款中'
                                        detail.refundStatus = 2
                                        detail.approveStatus = 7
                                        this.setData({
                                            detail: detail,
                                            btnLoading: false
                                        })
                                        wx.showToast({
                                            title: data.internalMsg,
                                            icon: "none"
                                        })
                                    } else if (data.code = '000404') {
                                        detail.refundStatusCn = '退款失败'
                                        detail.refundStatus = 3
                                        detail.approveStatus = 7
                                        this.setData({
                                            detail: detail,
                                            btnLoading: false
                                        })
                                        wx.showToast({
                                            title: data.internalMsg,
                                            icon: "none"
                                        })
                                    }
                                    break

                                case 'F':
                                    if (data.code == '000401') {
                                        detail.refundStatusCn = '退款失败'
                                        //detail.gmtRefunded = new Date().Format("yyyy-MM-dd hh:mm:ss")
                                        detail.refundStatus = 3

                                        this.setData({
                                            detail: detail,
                                            btnLoading: false
                                        })
                                    } else if (data.code == '000405') {
                                        wx.showModal({
                                            title: data.message,
                                            content: data.internalMsg,
                                        })
                                    }
                                    break
                            }
                        })
                }
            }
        })
    },
    goRefund: function(e) {
        console.log(this.data.detail)
        wx.setStorageSync("refundDetail", this.data.detail)
        wx.redirectTo({
            url: '/pages/refund/refund',
        })
    },

    onHide: function() {},

    onUnload: function() {}
})