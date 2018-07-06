
//MD5
var md5 = require('../libs/md5/md5.min.js')
function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    let d = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    }
    return [d.y, d.m, d.d].map(formatNumber).join('-') + ' ' + [d.h, d.m, d.s].map(formatNumber).join(':')
}
/*
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
*/
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt
}
const app = {
    appId: 'wxea7c589ca4c29bd4',
    appSecret: 'b4efb6054916e4f64c88ab390c19e256'
}
function formatDate(dates, types) {
    return new Date(dates || '').Format(types)
}
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
function getNowDate() {
    return formatTime(new Date());
}

//获取某个对象值
function getValue(obj, name) {
    let objValue = null
    function letVal(obj, name) {
        for (let i in obj) {
            if (obj[i] instanceof Object) {
                letVal(obj[i], name)
            } else if (i == name) {
                objValue = obj[i]
                break
            }
        }
        return objValue
    }
    return letVal(obj, name)
}

//随机获取五位数
function randomNum(num) {
    let rand = [];
    for (let i = 0; i <= num; i++) {
        rand.push(Math.floor(Math.random() * 10))
    }
    return rand.join('')
}
module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    getNowDate: getNowDate,
    randomNum: randomNum,
    getValue: getValue,
    app: app
}
