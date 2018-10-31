// pages/socket/socket.js


var SocketTask;

var iddd = "MHW_" + parseInt(Math.random() * 10);


const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
var path;
innerAudioContext.autoplay = false
innerAudioContext.onPlay(() => {
  console.log('开始播放')
})
innerAudioContext.onError((res) => {
  console.log(res.errMsg)
  console.log(res.errCode)
})

recorderManager.onStop((res) => {
  wx.vibrateShort();
  console.log('recorder stop', res)
  const { tempFilePath } = res
  wx.showToast({
    title: '录制完毕',
    duration: 1500
  })
  path = res.tempFilePath;


  var str = new Date().getTime(),
    openid = 12345;

  str = "audio" + str + "" + parseInt(Math.random() * 10);
  console.log(str);

  wx.uploadFile({
    url: 'https://www.xingxuanju.xyz/websocket/app/shangchuan/picture', //仅为示例，非真实的接口地址
    filePath: path,
    name: 'file',
    header: {
      'content-type': 'multipart/form-data'
    }, // 设置请求的 header
    formData: {
      id: str
    },
    success: function (res) {
      var data = res.data;
      path = data;
      wx.showToast({
        title: path,
        icon: "none",
        duration: 2000
      });
      var obj = {
        audio: true,
        content: path,
        id: iddd
      };

      var strings = JSON.stringify(obj);
      SocketTask.send({
        data: strings,
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          console.log(res)
          wx.showToast({
            title: str,
            icon: 'none',
            image: '',
            duration: 1500,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      })
      console.log("upload Success", data);
      //do something
    },
    fail: function (res) {
      wx.showToast({
        title: res.errMsg,
        icon: 'none',
        image: '',
        duration: 1500,
        mask: true,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    },
    complete: function (res) {
      console.log(res);
    }
  })
})

recorderManager.onStart(() => {
  wx.vibrateShort();
  console.log('recorder start')
  wx.vibrateShort();
})
recorderManager.onPause(() => {
  console.log('recorder pause')
})
recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  console.log('frameBuffer.byteLength', frameBuffer.byteLength)
})

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    ste: "1234",
    ps: '',
    status: 0,
    msg: [],
    totop: 0,
    val: '',
  },
  ipt: function (res) {
    var val = res.detail.value;
    console.log(val);
    this.setData({
      val: val,
    })
  },

  sen: function () {
    console.log(this.data.val);
    var val = this.data.val;
    if (!val) {
      return false;
    }

    var obj = {
      audio: false,
      content: val,
      id: iddd
    };

    var str = JSON.stringify(obj);

    wx.showToast({
      title: val,
      icon: 'none',
      image: '',
      duration: 1500,
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })

    SocketTask.send({
      data: obj,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res);
        // wx.showToast({
        //   title: res.errMsg,
        //   icon: 'none',
        //   image: '',
        //   duration: 1500,
        //   mask: true,
        //   success: function (res) { },
        //   fail: function (res) { },
        //   complete: function (res) { },
        // })
      }
    })


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.request({
      url: 'https://www.xingxuanju.xyz/websocket/app/shangchuan/ceshi',
      data:{
          id:"123",
          name:"ok"
      },
      success:function(res){
        var data = res.data;
        console.log(data);
      }
    })

    var that = this;

    var obj = {
      audio: false,
      content: '进入了大讲堂',
      id: iddd
    };

    var str = JSON.stringify(obj);

    console.log(str);

    SocketTask = wx.connectSocket({
      url: 'wss://www.xingxuanju.xyz/websocket/websocket/122/12'
    });
    SocketTask.onOpen(function (res) {
      console.log("SocketOK");
      SocketTask.send({
        data: str,
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          console.log(res);
          wx.showToast({
            title: res.errMsg,
            icon: 'none',
            image: '',
            duration: 2000,
            mask: false,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      })
    });
    SocketTask.onMessage(function (res) {
      console.log(res);
      var obj = JSON.parse(res.data);

      console.log(that.data.msg);
      that.data.msg.push(obj);
      that.setData({
        msg: that.data.msg
      });


      wx.createSelectorQuery().select('.cont').boundingClientRect(function (rect) {
        console.log(rect.height);
        that.setData({
          totop: rect.height
        })
      }).exec()

    });

  },

  sendmsg: function () {
    var txt = parseInt(Math.random() * 10) + "zb";
    var obj = {
      audio: false,
      content: txt,
      id: iddd
    };

    var str = JSON.stringify(obj);
    SocketTask.send({
      data: str,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          image: '',
          duration: 1500,
          mask: true,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  start: function () {
    console.log("start")
    // wx.vibrateShort();
    recorderManager.start(options);
    this.setData({
      status: 1,
    })
  },
  end: function () {
    recorderManager.stop();
    this.setData({
      status: 0,
    })
  },
  play: function () {
    if (!path) {
      wx.showToast({
        title: '还没录制完成！',
      });
      return false;
    }

    console.log(path);

    innerAudioContext.src = path;
    innerAudioContext.play();

    wx.showToast({
      title: path,
      icon: "none"
    })
  },

  playaudio: function (e) {
    var path = e.currentTarget.dataset.id;

    if (!path) {
      wx.showToast({
        title: '还没录制完成！',
      });
      return false;
    }

    console.log(path);

    innerAudioContext.src = path;
    innerAudioContext.play();

    wx.showToast({
      title: path,
      icon: "none"
    })
  }
})