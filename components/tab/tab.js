// components/tab/tab.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabBar:{
            type:'Array',
            value: [
                {
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
                }
            ]
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        tabCurr:0,
        isPX:false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        toggleTab:function(e){
            console.log(e)
            this.setData({
                tabCurr:e.target.dataset.id,
            })
            console.log(this)
            var goPageDetail = {} // detail对象，提供给事件监听函数
            var goPageOption = {} // 触发事件的选项
            this.triggerEvent('goPage', goPageDetail, goPageOption)
            //this.route = 
        }
    }
})
