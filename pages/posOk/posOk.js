// pages/posOk/posOk.js
Page({
    data: {
        audio: [
            "zero.mp3",
            "one.mp3",
            "two.mp3",
            "three.mp3",
            "four.mp3",
            "five.mp3",
            "six.mp3",
            "seven.mp3",
            "eight.mp3",
            "nine.mp3",
            "ten.mp3",
            "dot.mp3"
        ],
        unit: [
            "ten_thousand.mp3", //万
            "thousand.mp3", //千
            "hundred.mp3", //百
            "ten.mp3" //拾
        ],
        base: [
            "zfbsk.mp3",
            "wxsk.mp3",
            "hyksk.mp3",
            "xjl.mp3",
            "yuan.mp3",
        ]
    },

    onLoad: function(options) {
        let detail = wx.getStorageSync("pos")
        console.log("POSDETAIL:::::", detail)
        const audio = this.data.audio
        const unit = this.data.unit
        const base = this.data.base
        this.setData({
            detail: detail.order
        })
        // 支付方式，0：未支付，1：现金，2：POS，4：支付宝，5：微信，6：会员卡，7红包支付，8：自定义支付，9：混合支付
        let order = detail.order
        let audioList = []
        if (order.receiveMethod == 4) {
            audioList[0] = base[0]
        } else if (order.receiveMethod == 5) {
            audioList[0] = base[1]
        } else if (order.receiveMethod == 6) {
            audioList[0] = base[2]
        }
        const nums = order.realAmt
        let i = 0
        let audoList = []
        console.log(nums)
        let strList = (nums).toString()
        let list = strList.split('')
        
        let audioPush = item => {
            audioList.push(item)
        }
        let hasDot = list.indexOf('.') != -1
        let numLength = hasDot ? strList.substr(0, strList.indexOf('.')).length : list.length
        console.log(hasDot, numLength)
        let newNuit = unit.slice(5 - numLength)
        //插入单位
        let addNuit = num => {
            audioPush(newNuit[num])
        }
        for (let i in list) {
            //小数点之前
            if (i < numLength - 1) {
                if (list[i] != 0) {
                    audioPush(audio[list[i]])
                    addNuit(i)
                } else if (list[Number(i) + 1] != '0') {
                    audioPush(audio[list[i]])
                }
            } else if (list[i] != 0 && i == numLength - 1) {
                audioPush(audio[list[i]])
            } else if (i == numLength - 1 && numLength == 1) {
                audioPush(audio[list[i]])
            }
            //小数点后的
            if (hasDot && i >= numLength) {
                list[i] == "." ? audioPush(audio[11]) : audioPush(audio[list[i]])
            }
        }
        audioList.push(base[4])
        this.payAudio(audioList)
    },
    payAudio: function(audioList) {
        console.log(audioList)
        let i = 1
        const innerAudioContext = wx.createInnerAudioContext()
        innerAudioContext.autoplay = true
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
        })
        innerAudioContext.onError((res) => {
            console.log("error::", res)
        })

        innerAudioContext.src = `libs/audio/${audioList[0]}`
        innerAudioContext.onEnded((e) => {
            if (audioList[i]) {
                innerAudioContext.src = `libs/audio/${audioList[i]}`
                i++
            }
        })
    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: '收款成功',
        })
    },
    goDetail: function() {
        wx.redirectTo({
            url: '/pages/orderDetail/orderDetail?isPos=true'
        })
    },
    onShow: function() {

    },

    onHide: function() {

    }
})