// pages/temp/report/report.js
var api = require('../../siApi/siApi.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    report:{
        type: Object,
        value:'',
        observer:function(){

        }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currCash:0,
    currShop:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleBlock:function(e){

    }
  }
})
