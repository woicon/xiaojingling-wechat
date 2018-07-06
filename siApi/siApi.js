//const API = "http://192.168.19.102:8000/ShopCashier_SI/"
const sign = require('../libs/getSign/getSign.js')
//const API = "http://intsi.51ebill.com/ShopCashier_SI/" //
const API = "https://shopcashiersi.liantuobank.com/ShopCashier_SI/"  //
function ajax(url, parmas, method) {
    const key = wx.getStorageSync("key")
    const signParmas = sign.getSign(parmas, key)
    return new Promise((res, rej) => {
        wx.request({
            url: API + url,
            data: signParmas,
            method: method || 'GET',
            success: function(data) {
                res(data)
            },
            fail: function(error) {
                rej(error)
            }
        })
    }).catch(err => {
        console.log(err)
        wx.showModal({
            title: 'ERROR',
            content: JSON.stringify(err.errMsg),
        })
    })
}
module.exports = {
    //登录
    loginSi: parmas => ajax('android/login.in', parmas),
    //优惠券
    getCoupon: parmas => ajax('littleFairy/getKouBeiGoodsList.in', parmas),
    //订单 
    getOrder: parmas => ajax('littleFairy/getOrderList.in', parmas),

    orderQuery: parmas => ajax('orderQuery/getOrderAllInfo.in', parmas),
    
    //报表 查询核心或门店的总数据   //1管理员;2总经理;3财务;4店长;5收银员;6其它角色
    multiple: parmas => ajax('statistics/multipleStatistics.in', parmas),
    //收银员报表
    cashier: parmas => ajax('statistics/cashierStatistics.in', parmas),
    //报表款台
    terminal: parmas => ajax('statistics/terminalStatistics.in', parmas),
    //报表门店
    department: parmas => ajax('statistics/departmentStatistics.in', parmas),
    //核心下所有门店列表
    getStore: parmas => ajax('coreStore/getStoreList.in', parmas),
    //今日订单
    getOrdersTittleSummary: parmas => ajax('orderQuery/getOrdersTittleSummary.in', parmas),
    //签约信息
    getPayPlatFormNew: parmas => ajax('withDrawal/getPayPlatFormNew.in', parmas),
    //服务商
    getAgent: parmas => ajax('department/getAgent.in', parmas),
    //支付
    createOrderPayByQrcode: parmas => ajax('littleFairy/createOrderPayByQrcode.in', parmas),
    //会员支付
    memberPayByClubPayCode: parmas => ajax('member/memberPayByClubPayCode.in', parmas),
    //支付检测
    checkPay: parmas => ajax('android/payCheck.in', parmas),
    //退款检测
    refundQuery: parmas => ajax('littleFairy/refundQuery.in', parmas),
    //店长审批
    isStoreManager: parmas => ajax('android/isStoreManager.in', parmas),
    //提交退款
    refund: parmas => ajax('littleFairy/refund.in', parmas),
    //二次退款/littleFairy/refundAgain.in
    refundAgain: parmas => ajax('littleFairy/refundAgain.in', parmas),
    //会员卡退款
    refundApproval: parmas => ajax('orderRefund/refundApproval.in', parmas),
    //桌码绑码
    bindBarCode: parmas => ajax('android/bindBarCode.in', parmas),
    //查询绑码信息
    getBarCodeInfo: parmas => ajax('android/getBarCodeInfo.in', parmas),
    //获取桌号区域
    getDeskNoCategory: parmas => ajax('android/getDeskNoCategory.in', parmas),
}