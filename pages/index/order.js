function getOrdersTittleSummary(e) {
    const parmas = {
        merchantId: this.member("merchantId"),
        codeName: this.member("codeName"),
        page: 1,
        pageNum: 20,
        merchantNo: this.member("merchantNo"),
    }
    api.getOrdersTittleSummary(parmas).then(res => {
        let order = this.data.order
        console.log(res.data)
        order.summary = res.data.obj.tittleSummaryList
        this.setData({
            order: order,
            orderLoading: false
        })
    })
}

function getOrder(arg) {
    let that = this
    const endTime = new Date().Format('yyyy-MM-dd hh:mm:ss')
    const beginTime = new Date(new Date().getTime() - that.data.dayValue * 15).Format('yyyy-MM-dd hh:mm:ss')
    const parmas = {
        departmentNo: that.member("departmentNo"),
        pageCount: 15,
        pageNo: 1,
        beginTime: beginTime,
        endTime: endTime,
        codeName: that.member("codeName")
    }
    if (that.member("identity") == 5) {
        parmas.parmas = that.member("cashierNo")
    }

    if (typeof arg == "boolean") {
        parmas.pageNo = that.data.order.order.pageNo + 1
    }
    const signParmas = (typeof arg == "object") ? Object.assign(parmas, arg) : parmas

    api.getOrder(signParmas).then((res) => {
        console.log("order:::", res)
        if (res.data.isSuccess == 'S') {
            let order = that.data.order
            if (typeof arg == "boolean") {
                order.order.pageNo = parmas.pageNo
                const newList = order.order.orderList.concat(res.data.obj.orderList)
                order.order.orderList = newList
                that.setData({
                    order: order,
                })
            } else {
                order.order = res.data.obj
                this.setData({
                    order: order,

                })
            }
        } else if (res.data.isSuccess == 'F') {
            if (arg) {
                this.setData({
                    orderHasMore: false
                })
            }
        }
    })
    if (wx.getStorageSync("isCore")) {
        this.getOrdersTittleSummary()
    }
}

function moreOrder(e) {
    this.setData({
        orderIsBottm: true
    })
    if (this.data.orderHasMore) {
        this.getOrder(true)
    } else {
    }
}

module.exports = {
    getOrder: getOrder,
    moreOrder: moreOrder
}