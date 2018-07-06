const app = getApp()
var base = require('../../utils/util.js')
var api = require('../../siApi/siApi.js')
Page({
    data: {
        dayValue: 24 * 60 * 60 * 1000,
        tempOrderParmas: {},
        payStatusSel: 0,
        payTypeSel: 0,
        order: {
            payType: ["现金", "银行卡", "支付宝", "微信", "会员", "红包", "自定义", "混合支付"],
            // orderStatus: ["已支付", "已作废", "未支付", "退款", "手动确认", "自动确认"],
            refundStatus: ["退款成功", "退款中", "退款失败"],
            orderStatus: [
                {
                    status: 0,
                    name: '全部支付状态',
                },
                {
                    status: 0,
                    name: '已支付',
                },
                {
                    status: 2,
                    name: '未支付',
                },
                {
                    approveStatus: 6,
                    name: "已退款"
                },
                {
                    refundStatus: 3,
                    name: "退款失败"
                },
                {
                    refundStatus: 2,
                    name: "退款中"
                },
                {
                    status: 6,
                    name: '已关单',
                },

            ],
            receiveMethod: [
                { receiveMethod: 0, name: "全部支付方式" },
                { receiveMethod: 4, name: "支付宝支付" },
                { receiveMethod: 5, name: "微信支付" },
                { receiveMethod: 6, name: "会员卡支付" },
                { receiveMethod: 2, name: "银行支付" },
            ],
            orderList:{
                pageCount: 15,
                pageNo: 0
            }
        },
        orderHasMore: true,
        isPageLoad: true
    },
    onLoad: function (options) {
      console.log(options)
        this.data.departmentNo = options.id
        this.getOrder()
        this.getOrdersTittleSummary({
            departmentNo: this.data.departmentNo
        })
        wx.setNavigationBarTitle({
            title: options.departmentName,
        })
    },
    member: function (value) {
        try {
            let loginData = wx.getStorageSync("loginData")
            return base.getValue(loginData, value)
        } catch (error) {
            this.LoginError()
        }
    },
    orderStatus: function (e) {
        console.log(e)
        this.setData({
            orderIsBottm: false,
            orderLoading: true
        })
        const id = e.target.id
        const index = e.detail.value
        const payStatus = this.data.order.orderStatus
        const payType = this.data.order.receiveMethod
        let temp = this.data.tempOrderParmas
        let getval = obj => {
            let status = {}
            for (let i in obj) {
                if (i !== 'name') {
                    status[i] = obj[i]
                }
            }
            return Object.assign(temp, status)
        }
        let nodes = null
        if (id === 'payStatus') {
            delete temp.status
            delete temp.approveStatus
            delete temp.refundStatus
            const obj = payStatus[index]
            nodes = index == 0 ? getval({}) : getval(obj)
        } else if (id === "payType") {
            const obj = payType[index]
            if (index == 0) {
                delete temp.receiveMethod
                nodes = getval({})
            } else {
                nodes = getval(obj)
            }
        }
        let order = this.data.order.order
        order.pageNo = 0
        this.data.orderHasMore = true
        this.setData({
            tempOrderParmas: nodes,
            [id + 'Sel']: index
        })
        this.getOrder(nodes)
    },
    //获取订单
    getOrder: function (arg) {
        let that = this
        const endTime = new Date().Format('yyyy-MM-dd hh:mm:ss')
        const beginTime = new Date(new Date().getTime() - this.data.dayValue * 15).Format('yyyy-MM-dd hh:mm:ss')
        let orderParmas = {
            departmentNo: this.data.departmentNo,
            pageCount: 15,
            pageNo: 1,
            beginTime: beginTime,
            endTime: endTime,
            codeName: app.member("codeName")
        }
        const parmas = Object.assign(orderParmas, this.data.tempOrderParmas)
        if (that.member("identity") == 5) {
            parmas.parmas = that.member("cashierNo")
        }
        if (typeof arg == "boolean") {
            parmas.pageNo = that.data.order.order.pageNo + 1
        }

        const signParmas = (typeof arg == "object") ? Object.assign(parmas, arg) : parmas
        api.getOrder(parmas).then((res) => {
            console.log("order:::", res)
            let order = that.data.order
            if (res.data.code == '000102') {
                if (typeof arg == "boolean") {
                    order.order.pageNo = parmas.pageNo
                    const newList = order.order.orderList.concat(res.data.obj.orderList)
                    order.order.orderList = newList
                    that.setData({
                        order: order,
                        isPageLoad: false,
                        orderLoading: false
                    })
                } else {
                    order.order = res.data.obj
                    this.setData({
                        order: order,
                        isPageLoad: false,
                        orderLoading: false
                    })
                }
            } else if (res.data.code == '000103' && res.data.obj.orderList == null) {
                order.order = res.data.obj
                    this.setData({
                        order: order,
                        isPageLoad: false,
                        orderLoading: false
                    })
                
            }else if (res.data.code == '000103') {
                if (arg) {
                    this.setData({
                        orderHasMore: false
                    })
                }
            }
        })

    },
    getOrdersTittleSummary: function (arg) {
        const args = arg || {}
        let order = this.data.order
        const parmas = {
            merchantId: this.member("merchantId"),
            codeName: this.member("codeName"),
            page: 1,
            pageNum: 20,
            merchantNo: this.member("merchantNo"),
        }
        if (args.isMore) {
            parmas.page = order.page + 1
        }
        if (args.departmentNo) {
            parmas.departmentNo = this.data.departmentNo
        }
        api.getOrdersTittleSummary(parmas).then(res => {
            let summaryList = res.data.obj.tittleSummaryList
            if (!args.isMore) {
                order.page = 1
                if (args.departmentNo) {
                    order.summarys = summaryList
                } else {
                    order.summary = summaryList
                }
            } else {
                order.page = parmas.page

                order.summary = order.summary.concat(summaryList)
            }
            let summaryHasMore = (summaryList.length == 0) ? false : true
            this.setData({
                order: order,
                orderLoading: false,
                isPageLoad: false,
                summaryHasMore: summaryHasMore
            })
        })
    },
    // searchFocus:function(e){
    //     console.log(e)
    //     this.setData({
    //         cancelSearch:true
    //     })
    // },
    // searchBlur:function(e){
    //     this.setData({
    //         cancelSearch: false
    //     })
    // },
    normalSearch:function(e){
        this.getOrder()
        this.setData({
            searchValue: ""
        })
    },
    //订单搜索
    searchOrder: function (e) {
        console.log(e.detail.value)
        if (e.detail.value != '') {
            this.setData({
                orderIsBottm: false
            })
            this.getOrder({
                orderNo: e.detail.value
            }, true)
        }
    },
    orderScroll: function (e) {
        console.log(e)
        let searchTop = e.detail.scrollTop > 100 ? true : false
        this.setData({
            searchTop: searchTop
        })
    },
    moreOrder: function (e) {
        this.setData({
            orderIsBottm: true
        })
        if (this.data.orderHasMore) {
            this.getOrder(true)
        } else {
        }
    },
    viewDetail: function (e) {
        console.log(e)
        wx.navigateTo({
            url: '/pages/orderDetail/orderDetail?orderNo=' + e.currentTarget.id + '&detail=' + JSON.stringify(e.currentTarget.dataset.detail)
        })
    },
    onReady: function () {

    },

    onShow: function () {

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