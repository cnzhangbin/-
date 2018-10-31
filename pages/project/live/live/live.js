// pages/project/live/live/live.js
const host = getApp().globalData.host;
const websocket = getApp().globalData.socket;
const app = getApp();
var SocketTask;

const recorderManager = wx.getRecorderManager()
var  innerAudioContext ;

var path;




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

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },
  data: {
    totop:0,
    liveStatus:1,
    ustatus:false,
    watchpic:false,
    status: 0,
    msg: [],
    show: false,
    person: 0,
    show_danmu: true,
    audiolist: [

    ],
    commentlist: [

    ],
    crid: '',
    txtid: '',
    txt:'',
    living:{},
    time:{},
    canSend: true,
    autoerror: false,
  },

  toggle_danmu: function () {
    this.setData({
      show_danmu: !this.data.show_danmu
    })
  },

  showscroll: function (e) {
    var txt = "txt" + e.currentTarget.dataset.index;
    var _this = this;
    this.setData({
      show: true,
      txtid: txt
    });
  },

  hidescroll: function () {
    this.setData({
      show: false
    })
  },

  playaudio: function (e) {
    var id = e.currentTarget.dataset.id,
      index = e.currentTarget.dataset.index;

    var list = this.data.audiolist;
    var local = wx.getStorageSync("localaudio") || {};

    if (list[index].playing) {
      list[index].playing = false;
      innerAudioContext.pause();
      this.setData({
        audiolist: list,
      })
      return false;
    }

    for (var i = 0; i < list.length; i++) {
      if (i != index) {
        list[i].playing = false;
      } else {
        list[i].playing = true;
        list[i].played = true;
        local[list[i].src] = true;
      }
    }
    wx.setStorageSync("localaudio", local);

    this.setData({
      audiolist: list
    });

    var data = this.data;

    var src = list[index].src;

    console.log(src);

    innerAudioContext.src = src;

    innerAudioContext.play();

    wx.setStorageSync("liveobj", data);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    var that = this;
    innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = false
    innerAudioContext.onPlay(function () {

    })
    innerAudioContext.onError(function (res) {
      console.log(res.errMsg)
      console.log(res.errCode)

      wx.showToast({
        title: '网络出错！请稍后重试！或重启小程序重试！',
        icon: "none",
        duration: 2000,
      });
    })

    var liveid = options.id,
      userid = wx.getStorageSync("userid");

    this.setData({
      liveid: liveid,
      userid: userid
    });

    wx.request({
      url: host + 'findLiveById',
      data:{
        userId:wx.getStorageSync("userid"),
        live_id:liveid,
        pageNum:1,
      },
      success:function(e){
        var data = e.data;
        // console.log(data);
        _this.setData({
          living:data.live,
        });

        _this.calcTime();
      }
    })

    var lis = this.data.commentlist;


    wx.request({
      url: host + 'saveLook',
      data: {
        userId: userid,
        liveId: liveid
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        var data = res.data;
        // console.log(data);
      }
    });

    wx.request({
      url: host + 'findLiveRecordList',
      data: {
        liveId: liveid
      },
      success: function (r) {
        var data = r.data;
        // console.log(data);
        var arr = [];

        var local = wx.getStorageSync("localaudio") || {};

        for (var i = 0; i < data.length; i++) {
          var o = {
            src: data[i].message,
            content: data[i].message,
            head: data[i].img,
            name: data[i].userName,
            played: local[data[i].message] ? true : false,
            playing: false,
            time: data[i].size,
            audio_index: data[i].audio_text
          }
          arr.push(o);
        }
        that.setData({
          audiolist: arr
        })
      }
    })

    var liveobj = wx.getStorageSync("liveobj");
    // if (!!liveobj) this.setData(liveobj);

    innerAudioContext.onEnded(function () {
      var audios = that.data.audiolist;

      var crid = '';
      var flag = false;
      for (var i = 0; i < audios.length; i++) {

        if (flag == true) {
          if (audios[i].audio_index == 1) {
            audios[i].playing = true;
            audios[i].played = true;
            innerAudioContext.src = audios[i].src;
            innerAudioContext.play();
            crid = "audio" + i;
            break;
          }
        }
        if (audios[i].playing == true) {
          flag = true;
          audios[i].playing = false;
          if (i >= audios.length - 1) {
            break;
          }
          // if (audios[i + 1].audio_index==1){
          //   audios[i + 1].playing = true;
          //   audios[i + 1].played = true;
          //   innerAudioContext.src = audios[i + 1].src;
          //   innerAudioContext.play();
          //   crid = "audio" + (i + 1);
          //   break;
          // }
        }

      }

      that.setData({
        audiolist: audios,
        crid: crid
      })
    });

    recorderManager.onStop(function (res) {
      wx.vibrateShort();
      console.log('recorder stop', res)
      const { tempFilePath } = res

      var duration = parseInt(res.duration / 1000);
      wx.showToast({
        title: '录制完毕',
        duration: 1500
      })
      path = res.tempFilePath;
      var str = new Date().getTime(),
        openid = wx.getStorageSync("openid");

      str = "audio" + str + "" + parseInt(Math.random() * 10);
      console.log(str);

      wx.uploadFile({
        url: 'https://m.nongjike.cn/NJK/app/shangchuan/picture', 
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
          console.log("返回的录音路径为" + path);
          wx.showToast({
            title: path,
            icon: "none",
            duration: 2000
          });
          var obj = {
            liveId: liveid,
            message: path,
            openid: wx.getStorageSync("openid"),
            audio_index: 1,
            size: duration
          };

          var strings = JSON.stringify(obj);

          SocketTask.send({
            data: strings,
            fail: function () {
              wx.showToast({
                title: '发送失败！请重新进入大讲堂重试！',
                icon: "none",
                duration: 2000,
              })
            }
          })

          // wx.request({
          //   url: host + 'send',
          //   data: {
          //     liveId: liveid,
          //     message: path,
          //     openid: wx.getStorageSync("openid"),
          //     audio_index: 1,
          //     size: duration
          //   },
          //   method: "POST",
          //   header: {
          //     "content-type": "application/x-www-form-urlencoded"
          //   },
          //   success: function (res) {
          //     var data = res.data;
          //     console.log(data);
          //   }
          // })
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

    recorderManager.onStart(function () {
      wx.vibrateShort();
      console.log('recorder start')
      wx.vibrateShort();
    })
    recorderManager.onPause(function () {
      console.log('recorder pause')
    })
    recorderManager.onFrameRecorded(function (res) {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    });



    
  },

  ipttext:function(e){
    var val = e.detail.value;
    this.setData({
      txt:val,
    })
  },
  sendmsg:function(){
    var liveid = this.data.liveid,
      _this = this,
      txt = this.data.txt;

    if (!this.data.canSend) {
      wx.showToast({
        title: '你的发言频率过高！请稍等！',
        icon:"none",
        duration:2000,
      })
      return false;
    }
    if(!this.data.txt){
      wx.showToast({
        title: '请输入评论内容！',
        mask:true,
        duration:1000,
        icon:"none"
      })
      return false;
    }
    _this.setData({
      txt: '',
      canSend:false
    })
    var userinfo = wx.getStorageSync("user_info");
    var obj = {
      liveId: liveid,
      message: txt,
      openid: wx.getStorageSync("openid"),
      audio_index: 2,
      img: userinfo.cr_userImg,
      userName: userinfo.cr_userName,
      createTime:app.nowTime()
    };
    var strings = JSON.stringify(obj);

    if(txt.length>15){


      wx.request({
        url: host + 'saveRecordMessage',
        data: {
          message: strings
        },
        success: function (re) {
          var data = re.data;
          console.log(data);
        }
      })
    }

    console.log(strings);
    SocketTask.send({
      data: strings,
      success: function () {
        setTimeout(function(){
          _this.setData({
            canSend: true
          })
        },5000);
        
      },
      fail: function () {
        wx.showToast({
          title: '发送失败！请重新进入大讲堂重试！',
          icon: "none",
          duration: 2000,
        })
      }
    })
    // wx.request({
    //   url: host + 'send',
    //   method: "POST",
    //   header: {
    //     "content-type": "application/x-www-form-urlencoded"
    //   },
    //   data: {
    //     liveId: liveid,
    //     message: txt,
    //     openid: wx.getStorageSync("openid"),
    //     audio_index: 2,
    //   },
    //   success: function (r) {
    //     var data = r.data;
    //     console.log(data);
    //     _this.setData({
    //       canSend:true
    //     })
    //   }
    // })
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this,
      that = this,
      liveid = this.data.liveid;

    if (this.data.watchpic) {
      this.setData({
        watchpic: false,
      })
      return false;
    }
    var obj = {
      liveId: this.data.liveid,
      message: '进入了大讲堂',
      openid: wx.getStorageSync("openid"),
      audio_index: 2,
    };

    var str = JSON.stringify(obj);

    SocketTask = wx.connectSocket({
      url: websocket//'wss://m.nongjike.cn/websocket'//'wss://m.nongjike.cn/NJK/websocket/socketServer.do?liveId=' + liveid
    });
    wx.showLoading({
      title: '进入大讲堂...',
      mask: true
    })
    SocketTask.onOpen(function (res) {
      console.log("SocketOK",res);
      wx.hideLoading()

      var d = {
        liveId: liveid
      };

      d = JSON.stringify(d);
      SocketTask.send({
        data: d,
        fail: function () {
          wx.showToast({
            title: '发送失败！请重新进入大讲堂重试！',
            icon: "none",
            duration: 2000,
          })
        }
      });

      return false;

      if(_this.data.ustatus==false){
        _this.setData({
          ustatus:true
        })
      }else{
        return false;
      }
      var userinfo = wx.getStorageSync("user_info");
      // console.log(userinfo);
      var data = {
        liveId: liveid,
        message: '进入了大讲堂',
        img: userinfo.cr_userImg,
        userName: userinfo.cr_userName,
        openid: wx.getStorageSync("openid"),
        audio_index: 2,
        createTime: app.nowTime()
      }
      data = JSON.stringify(data);
      console.log(data);
      setTimeout(function(){
        SocketTask.send({
          data: data,
          fail: function () {
            wx.showToast({
              title: '发送失败！请重新进入大讲堂重试！',
              icon: "none",
              duration: 2000,
            })
          }
        })
      },500);
      // wx.request({
      //   url: host + 'send',
      //   method: "POST",
      //   header: {
      //     "content-type": "application/x-www-form-urlencoded"
      //   },
      //   data: {
      //     liveId: liveid,
      //     message: '进入了大讲堂',
      //     openid: wx.getStorageSync("openid"),
      //     audio_index: 2,
      //   },
      //   success: function (r) {
      //     var data = r.data;
      //     console.log(data);
      //   }
      // })
    });
    SocketTask.onMessage(function (res) {
      var obj = JSON.parse(res.data);
      
      console.log("返回对象", obj);

      if (obj.state == 1) {
        that.setData({
          person: obj.num
        });
      }

      var audios = that.data.audiolist,
        comments = that.data.commentlist;

      if (obj.audio_index == 1) {


        var duration = obj.size;


        var ob = {
          src: obj.message,
          head: obj.img,
          name: obj.userName,
          played: false,
          playing: false,
          time: duration,
          audio_index: 1,
        }

        audios.push(ob);
        that.setData({
          audiolist: audios
        });
        wx.createSelectorQuery().select('.main_box_container').boundingClientRect(function (rect) {
          console.log(rect.height);
          that.setData({
            totop: rect.height
          })
        }).exec()
      } else if (obj.audio_index == 2) {

        if (obj.teacher == true) {
          var ob = {
            head: obj.img,
            name: obj.userName,
            content: obj.message,
            audio_index: 2,
            time: obj.createTime
          }
          audios.push(ob);
          that.setData({
            audiolist: audios
          });
          wx.createSelectorQuery().select('.main_box_container').boundingClientRect(function (rect) {
            console.log(rect.height);
            that.setData({
              totop: rect.height
            })
          }).exec();

          return false;
        }

        var ob = {
          head: obj.img||"/imgs/black.png",
          name: obj.userName ||"未授权猫友",
          content: obj.message,
          audio_index: 2,
          time: obj.createTime,
          golden: obj.golden
        }

        comments.push(ob);

        that.setData({
          commentlist: comments
        });

      } else if (obj.audio_index == 3) {
        var ob = {
          src: obj.message,
          head: obj.img,
          name: obj.userName,
          audio_index: 3,
        }

        audios.push(ob);
        that.setData({
          audiolist: audios
        });
        setTimeout(function () {
          wx.createSelectorQuery().select('.main_box_container').boundingClientRect(function (rect) {
            console.log(rect.height);
            that.setData({
              totop: rect.height
            })
          }).exec();
        }, 500);

      }

    });
    SocketTask.onError(function(){
      // SocketTask.close();
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '连接失败，点击重连！',
        confirmText:"重新连接",
        success:function(res){
          if(res.confirm){
            _this.onShow();
          }
          if(res.cancel){
            wx.navigateBack({
              delta:1
            })
          }
        }
      })
    });

    SocketTask.onClose(function () {
      wx.hideLoading()
      if (_this.data.autoerror) {
        _this.setData({
          autoerror: false
        })
        return false
      }
      // wx.showToast({
      //   title: '已断开与大讲堂的连接！',
      //   icon: "none",
      //   duration: 2000,
      // });
      wx.showModal({
        title: '提示',
        content: '已断开与大讲堂的连接，点击重连！',
        confirmText: "重新连接",
        success: function (res) {
          if (res.confirm) {
            _this.onShow();
          }
          if (res.cancel) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
  },

  preview: function (e) {
    var src = this.data.audiolist[e.currentTarget.dataset.index].src;
    console.log(src);
    this.setData({
      watchpic: true
    });
    setTimeout(function () {
      wx.previewImage({
        urls: [src],
      })
    }, 300);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      autoerror: true,
    });
    if (this.data.watchpic) {
      return false;
    }
    SocketTask.close();
    // innerAudioContext.stop();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      autoerror: true,
    });
    SocketTask.close();
    innerAudioContext.stop();
    innerAudioContext.destroy();
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
    console.log(this.data.liveid)
    return {
      title: this.data.living.live_name,
      imageUrl: this.data.living.shareImg || this.data.living.live_audioImg || '/imgs/share.jpg',
      path: '/pages/project/live/liveinfo/liveinfo?id=' + this.data.liveid
    }
  },


  calcTime: function () {
    var now = new Date().getTime();
    var beginTime = new Date((this.data.living.beginTime).replace(/-/g,"/")).getTime();

    var dis = beginTime - now;
    // console.log(this.data.beginTime);

    if (dis <= 0) {
      this.setData({
        liveStatus: 1,
      });
      return false;
    }else{
      this.setData({
        liveStatus: 0,
      });
    }

    var second = parseInt(dis / 1000);
    var minute = parseInt(second / 60),
      hour = parseInt(minute / 60),
      day = parseInt(hour / 24);

    hour = (hour % 24) >= 10 ? hour % 24 : "0" + hour % 24;

    minute = minute % 60 >= 10 ? minute % 60 : "0" + minute % 60;

    second = second % 60 >= 10 ? second % 60 : "0" + second % 60;

    // console.log("天数：" + day + ";小时数：" + hour + "；分钟数" + minute + ";秒数" + second);

    this.setData({
      time: {
        day: day,
        hour: hour,
        minutes: minute,
        second: second,
      }
    });

    var _this = this;

    setTimeout(function () {
      _this.calcTime();
    }, 1000);
  },

  yuyueclick:function(e){
    var formid = e.detail.formId;
    var live = this.data.living;
    var _this = this;
    if (live.subsStatus != 0) {
      wx.showToast({
        title: '您已预约！即将开始时我们会向你推送本次直播！',
        duration:3000,
        icon:"none"
      })
      return false;
    }

    var userid = wx.getStorageSync("userid");

    if (!userid) {
      wx.showLoading({
        title: '加载中...',
        mask: true,
      });

      setTimeout(function () {
        wx.hideLoading();
      }, 1000);

      return false;
    }

    wx.request({
      url: host + 'saveSubscribe',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        userId: wx.getStorageSync("userid"),
        liveId: this.data.living.live_id,
        openId: wx.getStorageSync("openid"),
        page: "pages/project/live/live/live?id=" + this.data.living.live_id,
        form_id: formid,
        beginTime: this.data.living.beginTime,
        key1: this.data.living.live_name,
        key2: this.data.living.beginTime,
        key3: "您关注的直播马上就开始啦！",
        key4: this.data.living.cr_userName,
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        live.subsStatus = 1;
        _this.setData({
          living:live
        })
        if (data.code == 1) {
          wx.showToast({
            title: '预约成功！',
            duration: 1500,
          })
        } else {
          wx.showToast({
            title: '预约失败！' + data.message,
            duration: 1500,
            icon: "none",
            mask: true
          })
        }
      }
    })
    live.subsStatus = 1;
    this.setData({
      living: live
    })
  }
})