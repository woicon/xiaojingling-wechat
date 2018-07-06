var api = require('../../siApi/siApi.js')
var base = require('../../utils/util.js')
const app = getApp()
Page({
    data: {
        checkMa: false,
        mrkList: ["撤销重新下单", "商品不合格"],
        mrkToggle: [false, false],
        mrk: false,
        savePwd: false,
    },
    onLoad: function(options) {
        try {
            let detail = wx.getStorageSync("refundDetail")
            let refKey = wx.getStorageSync("refKey")
            let userType = wx.getStorageSync("userType")
            const preAmt = detail.realAmt
            let data = {
                preAmt: preAmt,
                detail: detail,
                userType: userType
            }
            if (userType == 1 || userType == 4) {
                data.refKey = {}
                //data.savePwd = true
                data.refKey.managerLoginName = app.member("loginName")
            }
            if (refKey) {
                data.refKey = refKey
                data.savePwd = true
            }
            this.setData(data)
        } catch (error) {

        }
    },
    togglePwd: function() {
        this.setData({
            savePwd: !this.data.savePwd
        })
    },
    refInput: function(e) {
        console.log(e)
        console.log(e)
        let total = this.data.refAmt
        // console.log(typeof total, total)
        let num = e.detail.value
        // console.log(num)
        let decimalReg = /^\d{0,8}\.{0,1}(\d{1,2})?$/
        // let _total = `${total}${num}`
        // let nums = (num == "00" && total == "0") ? total : num
        // console.log(nums)
        let newTotal = decimalReg.test(num) ? num : total
        this.setData({
            refAmt: newTotal
        })
    },
    refundAll: function() {
        this.setData({
            refAmt: this.data.preAmt
        })
    },
    goRefund: function(e) {
        if (this.data.refAmt) {
            let refAmt = this.data.refAmt
            if (Number(refAmt).toFixed(2) > Number(this.data.preAmt).toFixed(2)) {
                wx.showToast({
                    title: '退款金额不能大于订单实收金额',
                    icon: 'none'
                })
            } else {
                this.setData({
                    checkMa: true
                })
            }
        } else {
            wx.showToast({
                title: '请输入退款金额',
                icon: 'none'
            })
        }
    },
    hideMa: function(e) {
        console.log(e)
        this.setData({
            checkMa: false
        })
    },
    refundReq: function(e) {
        console.log(e)
        let value = e.detail.value
        if (value.managerLoginName == '' || value.managerPassword == '') {
            wx.showToast({
                title: '请输入店长管理员账号密码',
                icon: 'none'
            })
        } else {
            console.log(this.data.refAmt)
            wx.showLoading({
                title: '退款中',
                mask: true
            })
            this.setData({
                checkMa: false
            })
            let detail = this.data.detail
            let refParmas = {
                cashierNo: detail.cashierNo,
                orderNo: this.data.detail.orderNo,
                codeName: app.member("codeName"),
                departmentNo: app.member("departmentNo"),
                cashierCn: detail.cashierName,
                refundAmt: Number(this.data.refAmt)
            }
            if (this.data.selMrk) {
                refParmas.refundRmk = this.data.selMrk
            }
            const parmas = Object.assign(refParmas, e.detail.value)
            api.refund(parmas)
                .then(res => {
                    wx.hideLoading()
                    console.log("::REFUND::", res)
                    let userType = wx.getStorageSync("userType")
                    if (this.data.savePwd) {
                        wx.setStorageSync('refKey', e.detail.value)
                        let refKey = {}

                        if (wx.getStorageSync("refKey")) {
                            refKey = e.detail.value
                        }
                        this.setData({
                            refKey: refKey,
                            savePwd: true
                        })
                    } else {
                        //wx.removeStorage("refKey")
                        wx.removeStorageSync("refKey")
                        let refKey = {}
                        if (userType == 1 || userType == 4) {
                            refKey.managerLoginName = app.member("loginName")
                        }
                        this.setData({
                            refKey: refKey
                        })
                    }
                    let nowDate = new Date().Format("yyyy-MM-dd hh:mm:ss")
                    let data = res.data
                    if (data.isSuccess == 'F') {
                        wx.showModal({
                            title: data.internalMsg,
                            content: data.message,
                            showCancel: false,
                        })
                    } else if (data.isSuccess == 'S') {
                        wx.showModal({
                            title: "提示",
                            content: data.internalMsg,
                            showCancel: false,
                            success: (res) => {
                                if (res.confirm) {
                                    wx.setStorageSync("refDate", nowDate)
                                    let detail = wx.getStorageSync("refundDetail")

                                    detail.refundAmt = Number(-this.data.refAmt)
                                    //detail.
                                    if (this.data.selMrk) {
                                        detail.refundRmk = this.data.selMrk
                                    }
                                    detail.gmtRefunded = nowDate
                                    wx.setStorageSync("refundDetail", detail)
                                    if (data.code == '000202') {
                                        wx.redirectTo({
                                            url: '/pages/orderDetail/orderDetail?isRef=true' //退款成功
                                        })
                                    } else if (data.code == '000203') {
                                        wx.redirectTo({
                                            url: '/pages/orderDetail/orderDetail?isRef=true&refundStatus=2' //检测
                                        })
                                    } else if (data.code == '000204') {
                                        wx.redirectTo({
                                            url: '/pages/orderDetail/orderDetail?isRef=true&refundStatus=3' //再次退款
                                        })
                                    }
                                }
                            }
                        })
                    }
                })
        }
    },

    refundApproval: function(parmas) {
        api.refundApproval(pramas)
            .then(res => {

            })
    },
    selMrk: function(e) {
        let mrkToggle = this.data.mrkToggle
        let mrkList = this.data.mrkList
        mrkToggle[e.target.dataset.index] = !mrkToggle[e.target.dataset.index]
        let selMrk = []
        for (let i in mrkToggle) {
            if (mrkToggle[i]) {
                selMrk.push(mrkList[i])
            }
        }
        const mrks = selMrk.join()
        this.setData({
            mrkToggle: mrkToggle,
            selMrk: mrks
        })
    },
    mrkSubmit: function() {
        this.setData({
            mrk: false
        })
    },
    selectMrk: function() {
        this.setData({
            mrk: true
        })
    },
    addMrk: function(e) {
        if (this.data.newMrk.length != 0) {
            let mrkList = this.data.mrkList
            let mrkToggle = this.data.mrkToggle
            mrkToggle[mrkToggle.length] = false
            mrkList.push(this.data.newMrk)
            this.setData({
                mrkList: mrkList,
                newMrk: '',
                mrkToggle: mrkToggle
            })

        }
    },
    mrkInput: function(e) {
        this.setData({
            newMrk: e.detail.value
        })
    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: '退款',
        })
    },
    onShow: function() {

    },

    onHide: function() {},

    onUnload: function() {

    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {

    }
})