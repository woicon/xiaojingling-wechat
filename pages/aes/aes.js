Page({
    data: {
        motto: 'Hello World'
    },
    onLoad: function(options) {
        var app = getApp()
        var Dec = require('../../libs/aes/public.js'); //引用封装好的加密解密js
        console.log("加密：：：",Dec.Encrypt("hello world"));
        console.log("解密：：：",Dec.Decrypt("19AF2A9A749542E97F9CAFB940D6DB6F"));
    },


    onReady: function() {

    },

    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})