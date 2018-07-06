//MD5
var md5 = require('../../libs/md5/md5.min.js')
const app = getApp()

//对象排序
function sortObj(obj) {
    var arr = [];
    for (var i in obj) {
        arr.push([i, obj[i]])
    };
    arr.sort();
    var len = arr.length,
        obj = {};
    for (var i = 0; i < len; i++) {
        obj[arr[i][0]] = arr[i][1]
    }
    return obj;
}

//转URL参数
function parseParam(obj, encode) {
    function toQueryPair(key, value) {
        if (typeof value == 'undefined') {
            return key;
        }
        if (encode) {
            return key + '=' + encodeURIComponent(value === null ? '' : String(value));
        } else {
            return key + '=' + (value === null ? '' : String(value));
        }
    }
    var ret = [];
    for (var key in obj) {
        key = encode ? encodeURIComponent(key) : key;
        var values = obj[key];
        if (values && values.constructor == Array) {
            //数组
            var queryValues = [];
            for (var i = 0, len = values.length, value; i < len; i++) {
                value = values[i];
                queryValues.push(toQueryPair(key, value));
            }
            ret = ret.concat(queryValues);
            console.log(ret);
        } else { //字符串
            ret.push(toQueryPair(key, values));
        }
    }
    return ret.join('&');
}

module.exports = {
    getSign: (parmas, key) => {
        delete parmas.sign
        let _parmas = parseParam(sortObj(parmas)) 
        //url
        const sign = md5(_parmas + '&' + key)
        //Si
        const MD5 = sign.toUpperCase()
        let MD5_array = MD5.split('')
        let convertMD5 = chars => {
            return String.fromCharCode(chars.charCodeAt() ^ 't'.charCodeAt())
        }
        parmas.sign = MD5_array.map(convertMD5).join('')
        return parmas
    }
}
