const app = getApp()
var base = require('../../utils/util.js')
var api = require('../../siApi/siApi.js')
Page({

    data: {
        showCat: false,
        isPageLoad: true
    },
    onLoad: function(options) {
        this.deskCats()
        wx.setNavigationBarTitle({
            title: '桌码设置',
        })
    },
    deskCats: function(args) {
        let arg = args || {}
        let parmas = {
            departNo: app.member('codeName'),
            codeName: app.member('codeName')
        }
        api.getDeskNoCategory(parmas)
            .then(res => {
                console.log("deskCategory::", res.data)
                let desk = res.data.obj
                console.log(res.data.obj instanceof Object)
                if (res.data.state == 1 && res.data.obj instanceof Object) {
                    //筛选出分类
                    let category = []
                    for (let i in desk) {
                        let status = true
                        for (let s in category) {
                            if (category[s].pid == desk[i].pid) {
                                status = false
                            }
                        }
                        if (status && desk[i].pid != null) {
                            category.push({
                                pid: desk[i].pid,
                                pName: desk[i].pName
                            })
                        }
                    }
                    let currentCat = category[0].pid

                    this.setData({
                        desk: desk,
                        category: category,
                        currentCat: this.data.currentCat || currentCat,
                        catId: this.data.catId || null,
                        isPageLoad: false
                    })
                    if (args) {
                        wx.showToast({
                            title: '绑定成功',
                            icon: "ok"
                        })
                    }
                    wx.hideLoading()
                } else {
                    this.setData({
                        isEmpty: true,
                        isPageLoad: false
                    })
                }
            })
    },
    toggleDesk: function(e) {
        console.log(e)
        this.setData({
            currentCat: e.target.id,
            showCat: false,
            catId: e.target.dataset.id
        })
    },
    chooseRect: function(e) {
        this.setData({
            showCat: !this.data.showCat
        })
    },
    bindAgain: function() {
        this.scanCode(this.data.desk[this.data.currentIndex])
    },
    bindCode: function(e) {
        console.log(e)
        let status = e.currentTarget.dataset.status
        let index = e.currentTarget.dataset.index
        if (status == 0) {
            this.scanCode(this.data.desk[index])
        } else if (status == 1) {
            let parmas = {
                deskNo: this.data.desk[index].name,
                codeName: app.member("codeName"), //	EW_N7606110358
                departmentNo: app.member("departmentNo"), //	EW_N7606110358
                type: 0,
                categoryId: this.data.desk[index].pid,
            }
            api.getBarCodeInfo(parmas)
                .then(res => {
                    console.log(res)
                    this.setData({
                        info: res.data.obj,
                        bindStatus: true,
                        currentIndex: e.currentTarget.dataset.index,
                    })

                })
        }
    },
    scanCode: function(e) {
        wx.scanCode({
            scanType: 'qrCode',
            fail: error => {
                console.log(error)
                wx.showToast({
                    title: error,
                    icon: "none"
                })
            },
            success: res => {
                console.log(res)
                let url = res.result
                var num = url.indexOf("?")
                if (num != -1) {
                    let str = url.substr(num + 1)
                    //  console.log(str)
                    let barCode
                    try {
                        var arr = str.split("=")
                        barCode = arr[1]
                    } catch (err) {
                        console.log(err)
                    }
                    wx.showLoading({
                        title: "绑定中"
                    })
                    let parmas = {
                        deskNo: e.name,
                        modifyName: app.member("operatorCn"),
                        modifyNo: app.member("operatorId"),
                        shortUrl: res.result,
                        codeName: app.member("codeName"),
                        departmentNo: app.member("departmentNo"),
                        type: 0,
                        categoryId: e.pid,
                        barCode: barCode || null
                    }
                    api.bindBarCode(parmas)
                        .then(data => {
                            console.log("bindResult", data)
                            if (data.data.state == 1) {
                                let desk = this.data.desk
                                wx.showToast({
                                    title: data.data.obj,
                                    icon: "ok"
                                })
                                this.setData({
                                    bindStatus: false
                                })
                                this.deskCats(true)
                            } else {
                                wx.showToast({
                                    title: data.data.obj,
                                    icon: "none"
                                })
                            }
                        })
                } else {
                    wx.showToast({
                        title: '二维码不存在',
                        icon: "none"
                    })
                }
            }
        })
    },
    closeInfo: function() {
        this.setData({
            bindStatus: false
        })
    },
    onReady: function() {
        try {
            wx.createSelectorQuery().select('#widths').boundingClientRect(rect => {
                this.setData({
                    deskHeight: rect.width
                })
            }).exec()
        } catch (err) {
            console.log(err)
        }
    },

    onShow: function() {
        console.log("onShow")
    }


})