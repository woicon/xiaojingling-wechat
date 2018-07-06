const app = getApp()
var base = require('../../utils/util.js')
var api = require('../../siApi/siApi.js')
Page({
    data: {
        pageLoading: false,
        isLogin: false,
        tabCurr: 0,
        reportTab: 1,
        page: "report",
        reportDate: "",
        disNext: true,
        prossLogin: false,
        tempOrderParmas: {},
        payStatusSel: 0,
        payTypeSel: 0,
        cancelSearch: true,
        report: {
            department: null,
            multiple: null,
            terminal: null,
            cashier: null,
            reTotal: null,
        },
        dayValue: 24 * 60 * 60 * 1000,
        order: {
            payType: ["现金", "银行卡", "支付宝", "微信", "会员", "红包", "自定义", "混合支付"],
            // orderStatus: ["已支付", "已作废", "未支付", "退款", "手动确认", "自动确认"],
            refundStatus: ["退款成功", "退款中", "退款失败"],
            orderStatus: [{
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
            receiveMethod: [{
                    receiveMethod: 0,
                    name: "全部支付方式"
                },
                {
                    receiveMethod: 4,
                    name: "支付宝支付"
                },
                {
                    receiveMethod: 5,
                    name: "微信支付"
                },
                {
                    receiveMethod: 6,
                    name: "会员卡支付"
                },
                {
                    receiveMethod: 2,
                    name: "银行支付"
                },
            ]
        },
        identity: ["管理员", "总经理", "财务", "店长", "收银员", "其它角色"],
        orderHasMore: true,
        isPageLoad: true,
        loginDisable: true,
        login: {},
        tabBar: [{
                name: "报表",
                icon: "report",
            },
            {
                name: "订单",
                icon: "orders",
            },
            {
                name: "收银",
                icon: "icos",
                link: '/pages/pos/pos'
            },
            {
                name: "我",
                icon: "member"
            },
        ]
    },
    onLoad: function(options) {
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#0EC695',
        })
        try {
            let UserInfo = wx.getStorageSync("userInfo")
            this.setData({
                userInfo: UserInfo
            })
        } catch (error) {
            console.log(error)
        }
    },
    formatDay: function(date) {
        return new Date(date).Format('yyyy-MM-dd')
    },
    focusInput: function(e) {
        this.setData({
            focus: e.currentTarget.dataset.index
        })
    },
    loginFocus:function(e){
        console.log(e)
    },
    loginBlur: function(e) {
        if (e.detail.value == '') {
            this.setData({
                isEmpty: e.target.id
            })
        }   
    },

    resReport: function(date) {
        that.getReport(date)
    },

    storeChange: function(e) {
        const storeModel = (e.detail.value == 0) ? false : true
        this.setData({
            selStore: e.detail.value,
            storeModel: storeModel,
            isPageLoad: true
        })
        this.getReport(this.data.reportDate)
    },

    loadReport: function() {
        const isCore = this.member("superiorMerchantId") == 10080941
        this.setData({
            isLogin: false,
            pageLoading: false,
            member: wx.getStorageSync("loginData"),
            isCore: isCore,
            page: 'report' || this.data.page,
        })
        this.getReport(this.data.reportDate)
        if (isCore) {
            this.getStore()
        }
    },
    resPage: function() {
        let that = this
        try {
            const currPage = wx.getStorageSync("page")
            const loginData = wx.getStorageSync("loginData")
            let bar = this.data.tabBar
            const isCore = this.member("superiorMerchantId") == 10080941
            wx.setStorageSync("isCore", isCore)
            let tabBar = this.data.tabBar
            let tab = isCore ? wx.getStorageSync("tabBar") : tabBar
            if (loginData) {
                this.setData({
                    isLogin: false,
                    tabCurr: currPage,
                    page: bar[currPage].icon,
                    member: loginData,
                    tabBar: tab,
                    userType: wx.getStorageSync("userType"),
                    isCore: isCore,
                    version: app.globalData.version
                })
                switch (currPage) {
                    case 0: //报表
                        this.getReport(this.data.reportDate)
                        if (isCore) {
                            this.getStore()
                        }
                        break
                    case 1: //订单
                        console.log("Order:::::")
                        this.getOrder()
                        break
                    case 2: //收银
                        let titles = "收银"
                        if (isCore) {
                            titles = "我"
                            this.setData({
                                userInfo: wx.getStorageSync("userInfo")
                            })
                        }
                        wx.setNavigationBarTitle({
                            title: titles,
                        })
                        break
                    case 3: //用户中心
                        wx.setNavigationBarTitle({
                            title: '我',
                        })
                        this.setData({
                            userInfo: wx.getStorageSync("userInfo")
                        })
                        break
                }
            } else {
                this.setData({
                    isLogin: true
                })
                wx.setNavigationBarColor({
                    frontColor: "#000000",
                    backgroundColor: '#ffffff',
                })
                wx.setNavigationBarTitle({
                    title: '登录收款小精灵',
                })
            }
        } catch (error) {
            console.log(error)
        }
    },
    onShow: function() {
        console.log("::SHOW PAGE::")
        const nowDate = new Date()
        const taday = this.formatDay(nowDate)
        const yestaday = this.formatDay(nowDate.getTime() - this.data.dayValue)
        this.setData({
            isPX: app.globalData.isPX,
            taday: taday,
            yestaday: yestaday,
            reportDate: this.data.searchDate || taday
        })

        this.resPage()
    },
    toggleReport: function(e) {
        let that = this
        let event = e.target.dataset
        let reportDate = that.data.reportDate


        if (event.index === 0) {
            that.getReport(that.data.taday)
        }
        let rDate = null
        switch (event.index) {
            case 0:
                that.getReport(that.data.yestaday)
                rDate = that.data.yestaday
                that.setData({
                    reportDate: that.data.yestaday,
                    searchDates: null,
                    searchDate: null,
                    disPrv: false,
                    disNext: false
                })
                break
            case 1:
                that.getReport(that.data.taday)
                that.setData({
                    reportDate: that.data.taday,
                    searchDates: null,
                    searchDate: null,
                    disPrv: false,
                    disNext: true
                })
                break
            case 2:
                wx.navigateTo({
                    url: '/pages/reportDate/reportDate',
                })
                break
        }
        that.setData({
            reportTab: e.target.dataset.index
        })
    },
    getUserInfo: function(e) {
        console.log(e.detail)
        const userInfo = e.detail
        wx.setStorageSync("userInfo", e.detail.userInfo)
        const authInfo = wx.getStorageSync("authInfo")

        this.setData({
            userInfo: e.detail.userInfo
        })
    },
    nextView: function(csTime) {
        let nowTime = new Date().getTime()
        const dayValue = this.data.dayValue
        let disNext = new Date().Format('yyyy-MM-dd') == new Date(csTime).Format('yyyy-MM-dd') ? true : false
        let reportTab = null
        if (nowTime > csTime) {
            reportTab = 2
        }
        if (new Date(nowTime - dayValue).Format('yyyy-MM-dd') == new Date(csTime).Format('yyyy-MM-dd')) {
            reportTab = 0
        }
        if (disNext) {
            reportTab = 1
        }
        console.log(new Date(nowTime - dayValue).Format('yyyy-MM-dd') + "<><><" + new Date(csTime).Format('yyyy-MM-dd'))
        this.setData({
            disNext: disNext,
            reportTab: reportTab
        })
    },
    stepDate: function(e) {
        let that = this
        let reportDate = that.data.reportDate
        const currDate = new Date(reportDate)
        const ms = that.data.dayValue
        let _prportDate = null
        const tadayMs = new Date().getTime()
        let disNext = that.data.disNext
        let activeDate = null
        if (e.target.id === 'next') {
            that.setData({
                isPageLoad: true
            })
            activeDate = currDate.getTime() + ms
            reportDate = base.formatDate(activeDate, 'yyyy-MM-dd')
            that.getReport(reportDate)
            that.nextView(activeDate)
        } else if (e.target.id === 'prev') {
            that.setData({
                isPageLoad: true
            })
            activeDate = currDate.getTime() - ms
            reportDate = base.formatDate(activeDate, 'yyyy-MM-dd')
            that.getReport(reportDate)
            that.nextView(activeDate)
        }
        that.setData({
            reportDate: reportDate
        })
    },
    whenDate: function(obj) {
        let dates = ["beginTime", "endTime"]
        let resDate = {}
        for (let i in dates) {
            resDate[dates[i]] = obj instanceof Object ? obj[i] : obj
        }
        return resDate
    },
    getStore: function() {
        const parmas = {
            codeName: this.member("codeName"),
            jobNo: this.member("jobNumber"),
            superiorMerchantId: this.member('merchantId')
        }
        //获取门店
        api.getStore(parmas).then((res) => {
            console.log(res)
            res.data.obj.unshift({
                fullNameCn: '全部门店'
            })
            this.setData({
                store: res.data.obj,
                storeModel: false,
                selStore: 0
            })
        })
    },
    getReport: function(reportTime, isShop) {
        let that = this
        const member = wx.getStorageSync("loginData")
        const arg = {
            codeName: that.member("codeName"),
            merchantNo: that.member("merchantNo")
        }
        const page = {
            page: 1,
            pageNum: 10
        }
        //款台收银详情
        var getDetail = obj => {
            let detail = []
            return detail
        }
        let reTotal = (re) => {
            let orderAmt = (re.wxAmt + re.zfbAmt - re.wxRefundAmt - re.zfbRefundAmt).toFixed(2) //订单金额
            let wxOrderAmt = (re.wxAmt - re.wxRefundAmt).toFixed(2) //微信结算金额
            let zfbOrderAmt = (re.zfbAmt - re.zfbRefundAmt).toFixed(2) //支付宝结算金额
            let refundAmt = (Number(re.wxRefundAmt) + Number(re.zfbRefundAmt)).toFixed(2) //退款金额
            let realAmt = (re.wxAmt + re.zfbAmt).toFixed(2) //实收金额
            let feesAmt = (re.wxFeesAmt + re.zfbFeesAmt).toFixed(2) //手续费
            let totalAmt = (realAmt - feesAmt).toFixed(2) //结算金额
            let refundNum = re.wxRefundNum + re.zfbRefundNum //退款数量
            let orderNum = re.wxNum + re.zfbNum //订单数量
            return {
                orderAmt: orderAmt, //订单金额
                realAmt: realAmt, //实收金额
                orderNum: orderNum, //订单数量
                refundAmt: refundAmt, //退款金额
                refundNum: refundNum, //退款数量
                feesAmt: feesAmt, //手续费
                totalAmt: totalAmt, //结算金额
                wxOrderAmt: wxOrderAmt,
                zfbOrderAmt: zfbOrderAmt
            }
        }
        const isCore = this.member("superiorMerchantId")
        if (reportTime instanceof Object) {
            var parmas = Object.assign(arg, reportTime)
        } else {
            var parmas = Object.assign(arg, that.whenDate(reportTime))
        }
        const pageParmas = Object.assign(parmas, page)
        const storeParmas = {
            codeName: this.member("codeName"),
            jobNo: this.member("jobNumber"),
            superiorMerchantId: this.member('merchantId')
        }

        let storesReport = (departmentNo) => {
            arg.departmentNo = departmentNo
            const report = [api.multiple(parmas), api.cashier(pageParmas), api.terminal(pageParmas)]
            Promise.all(report).then(res => {
                console.log(res)
                this.setData({
                    report: {
                        multiple: res[0].data.obj, //核心 管理员 总报表
                        cashier: res[1].data.obj.cashierStatisticsList, //收银员
                        terminal: res[2].data.obj.terminalStatisticsList, //款台
                        reTotal: reTotal(res[0].data.obj),
                    },
                    isPageLoad: false
                })
            })
        }

        if (isCore == 10080941) {
            console.log('：：：：核心 ：：：：')
            if (this.data.storeModel) {
                storesReport(this.data.store[this.data.selStore].codeName)
            } else {
                const report = [api.multiple(parmas), api.department(pageParmas)]
                Promise.all(report).then(data => {
                    console.log(data)
                    this.setData({
                        report: {
                            multiple: data[0].data.obj,
                            department: data[1].data.obj.departmentStatisticsList,
                            reTotal: reTotal(data[0].data.obj),
                        },
                        isPageLoad: false
                    })
                })
            }
        } else {
            switch (member.identity) {
                case 5: //收银员
                    console.log('：：：：收银员：：：：')
                    arg.cashierNo = that.member("jobNumber")
                    arg.departmentNo = that.member("departmentNo")
                    api.cashier(pageParmas).then((res) => {
                        console.log(res)
                        this.setData({
                            report: {
                                cashier: res.data.obj.cashierStatisticsList,
                            },
                            isPageLoad: false
                        })
                    })
                    break

                case 1: //管理员
                    storesReport(this.member("departmentNo"))
                    break
                case 4: //店长
                    storesReport(this.member("departmentNo"))
                    break
            }
        }
    },
    hidePageLoading: function() {
        this.setData({
            isPageLoad: false
        })
    },
    member: function(value) {
        try {
            let loginData = wx.getStorageSync("loginData")
            return base.getValue(loginData, value)
        } catch (error) {
            this.LoginError()
        }
    },
    //获取订单
    getOrder: function(arg, isSearch) {
        let that = this
        const endTime = new Date().Format('yyyy-MM-dd hh:mm:ss')
        const beginTime = new Date(new Date().getTime() - this.data.dayValue * 15).Format('yyyy-MM-dd hh:mm:ss')
        let orderParmas = {
            departmentNo: that.member("departmentNo"),
            pageCount: 15,
            pageNo: 1,
            beginTime: beginTime,
            endTime: endTime,
            codeName: app.member("codeName")
        }

        const parmas = isSearch ? orderParmas : Object.assign(orderParmas, this.data.tempOrderParmas)

        if (app.member("identity") == 5) {
            parmas.cashierNo = that.member("jobNumber")
        }
        if (typeof arg == "boolean") {
            parmas.pageNo = that.data.order.order.pageNo + 1
        } else {
            this.setData({
                orderLoading: true
            })
        }

        const signParmas = (typeof arg == "object") ? Object.assign(parmas, arg) : parmas

        if (wx.getStorageSync("isCore")) {
            this.getOrdersTittleSummary()
        } else {
            if (app.member("identity") != 5) {
                this.getOrdersTittleSummary({
                    departmentNo: this.member("departmentNo")
                })
            }
            let order = this.data.order
            api.getOrder(parmas).then((res) => {
                console.log("order:::", res)
                if (res.data.code == '000102') {
                    if (typeof arg == "boolean") {
                        order.order.pageNo = parmas.pageNo
                        const newList = order.order.orderList.concat(res.data.obj.orderList)
                        order.order.orderList = newList
                        this.setData({
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
                } else if (res.data.code == "000103" && res.data.obj.orderList == null && isSearch) {
                    order.order = res.data.obj
                    this.setData({
                        order: order,
                        isPageLoad: false,
                        orderLoading: false
                    })
                } else if (res.data.code == "000103") {
                    if (arg) {
                        this.setData({
                            orderHasMore: false,
                            orderLoading: false
                        })
                    }
                }
            })
        }
    },

    moreOrder: function(e) {
        if (this.data.order.order) {
            this.setData({
                orderIsBottm: true
            })
            if (this.data.orderHasMore) {
                this.getOrder(true)
            } else {
                // wx.showToast({
                //     title: '查询时间范围不能大于15天',
                //     icon: "none"
                // })
            }
        }
        if (this.data.order.summary) {
            this.setData({
                orderIsBottm: true
            })
            if (this.data.summaryHasMore) {
                this.getOrdersTittleSummary({
                    isMore: true
                })
            }
        }
    },
    orderStatus: function(e) {
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

    viewDetail: function(e) {
        console.log(e)
        wx.navigateTo({
            url: '/pages/orderDetail/orderDetail?orderNo=' + e.currentTarget.id + '&detail=' + JSON.stringify(e.currentTarget.dataset.detail)
        })
    },

    getOrdersTittleSummary: function(arg) {
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
            parmas.departmentNo = this.member("departmentNo")
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
    goPage: function(e) {
        let that = this
        const event = e.currentTarget.dataset
        if (event.url) {
            wx.navigateTo({
                url: event.url,
            })
        } else {
            wx.setStorageSync("page", event.id)
            that.setData({
                page: event.name,
                tabCurr: event.id,
                isPageLoad: true
            })
            wx.setNavigationBarTitle({
                title: event.title,
            })
            this.resPage()
        }
    },

    loginSi: function(e) {
        wx.clearStorage()
        let parmas = e.detail.value
        parmas.appType = "微信小程序"
        let tabBar = this.data.tabBar
        this.setData({
            prossLogin: true,
            focus:null
        })
        if (parmas.loginName == '' && parmas.loginName == '') {
            wx.showToast({
                title: '请输入账号密码',
                icon: 'none'
            })
            this.setData({
                prossLogin: false
            })
        } else {
            api.loginSi(parmas)
                .then((res) => {
                    console.log("::::LOGIN&SI::::", res)
                    let loginData = res.data
                    if (loginData.state == -1) {
                        wx.showToast({
                            title: loginData.obj,
                            icon: "none"
                        })
                    } else if (loginData.state == 1) {
                        wx.setStorageSync("loginData", loginData.obj)
                        wx.setStorageSync("key", res.data.partnerKey)
                        wx.setStorageSync("page", 0)
                        this.onShow()
                        let member = loginData.obj
                        let mname = member.commonLoginInfo.departmentName || member.commonLoginInfo.merchantName
                        wx.setStorageSync("storeName", mname)
                        wx.setStorageSync("userType", member.identity)
                        const isCore = this.member("superiorMerchantId") == 10080941

                        if (isCore) {
                            tabBar.splice(2, 1)
                        }
                        wx.setStorageSync("tabBar", tabBar)
                        wx.setNavigationBarTitle({
                            title: mname,
                        })
                        wx.setNavigationBarColor({
                            frontColor: '#ffffff',
                            backgroundColor: '#0ec695',
                        })
                        this.setData({
                            isLogin: false,
                            member: loginData.obj,
                            tabBar: tabBar
                        })
                    }
                    this.setData({
                        prossLogin: false,
                        tabCurr: 0,
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        }
    },
    loginInput: function(e) {
        const login = this.data.login
        login[e.target.id] = e.detail.value
        const loginDisable = (login.password && login.loginName) ? false : true
        this.setData({
            login: login,
            loginDisable: loginDisable
        })
    },
    clearInput:function(e){
        console.log(e)
        let login = this.data.login
        login[e.target.dataset.id] = ''
        this.setData({
            login:login
        })
    },
    exitSys: function() {
        wx.showModal({
            title: '提示',
            content: '是否确定退出',
            success: (res) => {
                if (res.confirm) {
                    wx.clearStorage()
                    wx.redirectTo({
                        url: '/pages/index/index',
                    })
                    this.setData({
                        isLogin: true,
                        page: 'login',
                        focus: false
                    })

                    wx.setNavigationBarColor({
                        frontColor: "#000000",
                        backgroundColor: '#ffffff',
                    })
                    wx.setNavigationBarTitle({
                        title: '登录收款小精灵',
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    toPayPlat: function() {
        wx.navigateTo({
            url: '/pages/payPlat/payPlat'
        })
    },
    toAgent: function() {
        wx.navigateTo({
            url: '/pages/agent/agent'
        })
    },
    orderPage: function(e) {
        console.log(e.currentTarget)
        wx.navigateTo({
            url: '/pages/order/order?id=' + e.currentTarget.id + "&departmentName=" + e.currentTarget.dataset.departmentname,
        })
    },
    callServ: function() {
        wx.makePhoneCall({
            phoneNumber: '4000122155'
        })
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {}
        let member = this.data.member
        let name = member.commonLoginInfo.departmentName || member.commonLoginInfo.merchantName
        return {
            title: "收款小精灵-" + name,
            path: 'pages/index/index'
        }
    },
    // searchFocus: function(e) {
    //     console.log(e)
    //     this.setData({
    //         cancelSearch: true
    //     })
    // },
    // searchBlur: function(e) {
    //     console.log(e)
    //     this.setData({
    //         cancelSearch: false
    //     })
    // },
    normalSearch: function(e) {
        this.getOrder()
        this.setData({
            searchValue: "",
            cancelSearch: true,
            showSearch: false
        })
    },

    //订单搜索
    searchOrder: function(e) {
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
    // orderScroll: function(e) {
    //     let searchTop = e.detail.scrollTop > 100 ? true : false
    //     this.setData({
    //         searchTop: searchTop
    //     })
    // },
    toggleSearch: function(e) {
        this.setData({
            showSearch: true
        })
    },
    onReady: function() {

    }
})