// pages/project/live/live/live.js
const host = getApp().globalData.host;
const websocket = getApp().globalData.socket;
const app = getApp();
var SocketTask;

const recorderManager = wx.getRecorderManager()
var  innerAudioContext

var path;




const options = {
  duration: 50000,
  sampleRate: 8000,
  numberOfChannels: 1,
  encodeBitRate: 16000,
  format: 'mp3',
  frameSize: 50
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startY:0,
    watchpic:false,
    toTop:0,
    moveY:0,
    cancel: false,
    ustatus: false,
    recording:false,
    status: 0,
    msg: [],
    show: false,
    person:0,
    show_danmu: true,
    restime:50,
    audiolist: [

    ],
    commentlist: [
      
    ],
    crid:'',
    txtid:'',
    allowed:false,
    sendtype:1,
    txt:'',
    canSend:true,
    autoerror:false,
    living:{},
    canvasW:750,
    canvasH:10000,
  },

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },

  toggle_danmu: function () {
    this.setData({
      show_danmu: !this.data.show_danmu
    })
  },

  showscroll: function (e) {
    var txt = "txt"+e.currentTarget.dataset.index;
    var _this = this;
    this.setData({
      show: true,
      txtid:txt
    });
  },

  hidescroll: function () {
    this.setData({
      show: false
    })
  },

  begin:function(){
    wx.request({
      url: host + 'sendMode',
      data:{
        liveId:this.data.liveid
      },
      success:function(res){
        var data = res.data;
        console.log(data);
      }
    })
  },

  ipttext: function (e) {
    var val = e.detail.value;
    this.setData({
      txt: val,
    })
  },

  sendmsg: function () {
    var liveid = this.data.liveid,
      _this = this,
      txt = this.data.txt;

    if (!this.data.canSend){
      return false;
    }

    if (!this.data.txt) {
      wx.showToast({
        title: '请输入评论内容！',
        mask: true,
        duration: 1000,
        icon: "none"
      })
      return false;
    }
    this.setData({
      txt:"",
      canSend:false,
    });
    var userinfo = wx.getStorageSync("user_info");
    var d = {
      liveId: liveid,
      message: txt,
      openid: wx.getStorageSync("openid"),
      audio_index: 2,
      teacher: true,
      img: userinfo.cr_userImg,
      userName: userinfo.cr_userName,
    };

    d = JSON.stringify(d);

    wx.request({
      url: host +'saveRecordMessage',
      data:{
        message:d
      },
      success:function(re){
        var data = re.data;
        console.log(data);
      }
    })

    SocketTask.send({
      data: d,
      success:function(){
        _this.setData({
          canSend:true
        });
        // clearInterval(_this.interval);
        // _this.interval = setInterval(function () {
        //   var msg = {
        //     heartBeat: true,
        //     liveId: liveid
        //   };
        //   msg = JSON.stringify(msg);
        //   SocketTask.send({
        //     data: msg,
        //     fail: function () {

        //     }
        //   });
        // }, 50000);
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
    //     teacher:true,
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

  playaudio: function (e) {
    var id = e.currentTarget.dataset.id,
      index = e.currentTarget.dataset.index;

    var list = this.data.audiolist;

    var src = list[index].src;

    var local = wx.getStorageSync("localaudio")||{};

    if(list[index].playing){
      list[index].playing = false;
      innerAudioContext.pause();
      this.setData({
        audiolist:list,
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
      data: {
        userId: wx.getStorageSync("userid"),
        live_id: liveid,
        pageNum: 1,
      },
      success: function (e) {
        var data = e.data;
        // console.log(data);
        _this.setData({
          living: data.live,
        });

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
        console.log(data);
      }
    });

    wx.request({
      url: host + 'findLiveRecordList',
      data:{
        liveId:liveid
      },
      success:function(r){
        var data = r.data;
        console.log(data);
        var arr = [];

        var local = wx.getStorageSync("localaudio")||{};

        for (var i = 0; i < data.length; i++) {
          var o = {
            src: data[i].message,
            content: data[i].message,
            head: data[i].img,
            name: data[i].userName,
            played: local[data[i].message]?true:false,
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
      for(var i=0;i<audios.length;i++){

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
        if(audios[i].playing==true){
          flag = true;
          audios[i].playing =false;
          if (i >= audios.length-1){
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
        audiolist:audios,
        crid:crid
      })
    });

    recorderManager.onStop(function (res) {
      wx.vibrateShort();
      console.log('recorder stop', res);

      var cancel = _this.data.cancel;

      console.log(cancel);

      _this.setData({
        cancel: false,
        startY: 0,
        moveY: 0,
        recording: false,
      })

      if(cancel){
        return false;
      }
      const { tempFilePath } = res

      var duration = Math.ceil(res.duration / 1000);
      // wx.showToast({
      //   title: '录制完毕',
      //   duration: 1500
      // })
      path = res.tempFilePath;
      var str = new Date().getTime(),
        openid = wx.getStorageSync("openid");

      str = "audio" + str + "" + parseInt(Math.random() * 10);
      console.log(str);

      wx.uploadFile({
        url: 'https://m.nongjike.cn/NJK/app/shangchuan/picture', //仅为示例，非真实的接口地址
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
          // wx.showToast({
          //   title: path,
          //   icon: "none",
          //   duration: 2000
          // });
          var obj = {
            liveId: liveid,
            message: path,
            openid: wx.getStorageSync("openid"),
            audio_index: 1,
          };

          var strings = JSON.stringify(obj);
          var userinfo = wx.getStorageSync("user_info");
          var d = {
            liveId: liveid,
            message: path,
            openid: wx.getStorageSync("openid"),
            audio_index: 1,
            size: duration,
            img: userinfo.cr_userImg,
            userName: userinfo.cr_userName,
            teacher: true,
          };

          d = JSON.stringify(d);


          wx.request({
            url: host + 'saveRecordMessage',
            data: {
              message: d
            },
            success: function (re) {
              var data = re.data;
              console.log(data);
            }
          })

          SocketTask.send({
            data: d,
            fail: function () {
              wx.showToast({
                title: '发送失败！请重新进入大讲堂重试！',
                icon: "none",
                duration: 2000,
              })
            },
            success:function(res){
              // clearInterval(_this.interval);
              // _this.interval = setInterval(function () {
              //   var msg = {
              //     heartBeat: true,
              //     liveId: liveid
              //   };
              //   msg = JSON.stringify(msg);
              //   SocketTask.send({
              //     data: msg,
              //     fail: function () {

              //     }
              //   });
              // }, 50000);
            }
          })

          // wx.request({
          //   url: host + 'send',
          //   data: {
          //     liveId: liveid,
          //     message: path,
          //     openid: wx.getStorageSync("openid"),
          //     audio_index: 1,
          //     size: duration,
          //     teacher:true,
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

  start: function (e) {
    console.log(e);
    if(!this.data.allowed){
      wx.showModal({
        title: '提示',
        content: '检测到未开启录音功能！请在本小程序设置中开启录音功能后重试！',
      })
      return false;
    }
    var y = e.touches[0].pageY;
    var _this = this;
    this.setData({
      cancel:false,
      startY:y,
      recording:true
    })
    // wx.vibrateShort();
    recorderManager.start(options);
    this.setData({
      status: 1,
      restime:50
    });

    this.timer = setInterval(function(){
      _this.data.restime-=1;
      if (_this.data.restime<=0){
        _this.data.restime=0;
      }
      _this.setData({
        restime: _this.data.restime
      })
    },1000);
  },

  preview:function(e){
    var src = this.data.audiolist[e.currentTarget.dataset.index].src;
    console.log(src);
    this.setData({
      watchpic:true
    });
    setTimeout(function(){
      wx.previewImage({
        urls: [src],
      })
    },300);
  },
  end: function (e) {
    console.log(e);
    recorderManager.stop();
    this.setData({
      status: 0,
    });
    clearInterval(this.timer);
  },
  moving:function(e){
    console.log(e);
    var y = e.touches[0].pageY,
    y1 = this.data.startY,
    cancel = this.data.cancel;
    if(y1-y>=100){
      cancel = true;
    }else{
      cancel = false;
    }
    this.setData({
      cancel: cancel,
      moveY: y
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

    if(this.data.watchpic){
      this.setData({
        watchpic:false,
      })
      return false;
    }

    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              _this.setData({
                allowed: true
              })

            },
            fail: function (res) {
              console.log(res);
              _this.setData({
                allowed: false
              })
              // wx.showModal({
              //   title: '提示',
              //   content: res,
              // })
            }
          })
        } else {
          _this.setData({
            allowed: true
          })
        }
      }
    })
    var obj = {
      liveId: this.data.liveid,
      message: '系统管理员‘农极客植保图谱’进入了大讲堂',
      openid: wx.getStorageSync("openid"),
      audio_index: false,
    };

    var str = JSON.stringify(obj);

    SocketTask = wx.connectSocket({
      url: websocket//'wss://m.nongjike.cn/websocket'//'wss://m.nongjike.cn/NJK/websocket/socketServer.do?liveId=' + liveid
    });
    SocketTask.onOpen(function (res) {


      var d = {
        liveId: liveid
      };

      _this.interval = setInterval(function(){
        var msg = {
          heartBeat:true,
          liveId:liveid
        };
        msg = JSON.stringify(msg);
        SocketTask.send({
          data: msg,
          success:function(){
            
          },
          fail: function () {
            
          }
        });
      },45000);

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

      console.log("SocketOK");
      if(!!_this.data.ustatus){
        return false;
      }
      _this.setData({
        ustatus:true
      })

      var userinfo = wx.getStorageSync("user_info");
      console.log(userinfo);
      var data = {
        liveId: liveid,
        message: '进入了大讲堂',
        img: userinfo.cr_userImg,
        userName: userinfo.cr_userName,
        openid: wx.getStorageSync("openid"),
        audio_index: 2,
        golden: true,
        createTime: app.nowTime()
      }
      data = JSON.stringify(data);
      console.log(data);
      SocketTask.send({
        data: data,
        success: function () {
          var that = _this;
          // clearInterval(_this.interval);
          // that.interval = setInterval(function () {
          //   var msg = {
          //     heartBeat: true,
          //     liveId: liveid
          //   };
          //   msg = JSON.stringify(msg);
          //   SocketTask.send({
          //     data: msg,
          //     fail: function () {

          //     }
          //   });
          // }, 50000);
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
            head: obj.img || "/imgs/black.png",
            name: obj.userName ||"未授权猫友",
            content: obj.message,
            audio_index: 2,
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
          head: obj.img,
          name: obj.userName,
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

    SocketTask.onError(function () {
      // SocketTask.close();
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '连接失败，点击重连！',
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
    });

    SocketTask.onClose(function () {
      // var _this = this;
      if(_this.data.autoerror){
        _this.setData({
          autoerror:false
        })
        return false
      }
      // wx.showToast({
      //   title: '已断开与大讲堂的连接！请返回重新进入！',
      //   icon:"none",
      //   mask:true,
      //   duration:2000,
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

  addpic:function(){
    var liveid = this.data.liveid;
    var that = this;
    this.setData({
      watchpic:true
    })
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0];

        console.log("Picture",res);

        wx.showLoading({
          title: '上传中...',
        })

        console.log("临时文件路径为"+src);
        wx.getImageInfo({
          src: src,
          success: function (res) {
            var ctx = wx.createCanvasContext('photo_canvas');
            // that.setData({
            //   canvasW: res.width,
            //   canvasH: res.height
            // })
            console.log(res)
            console.log(res.height)
            var canvasWidth = 750//原图宽度 
            var canvasHeight = res.height*750/res.width; 
            console.log("绘图路径",res.path);
            ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
            ctx.draw(false,function(){
              wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: canvasWidth,
                height: canvasHeight,
                destWidth: canvasWidth / 1.5,
                destHeight: canvasHeight / 1.5,
                canvasId: 'photo_canvas',
                fileType: "jpg",
                // quality: 0.8,
                success: function (res) {
                  console.log(res.tempFilePath);
                  wx.uploadFile({
                    url: "https://m.nongjike.cn/NJK/app/shangchuan/imgUpload",
                    filePath: res.tempFilePath,
                    name: "file",
                    header: {
                      'content-type': 'multipart/form-data'
                    }, // 设置请求的 header// HTTP 请求中其他额外的 form data
                    success: function (result) {
                      console.log(result);
                      wx.hideLoading();

                      wx.showToast({
                        title: '上传成功！',
                        duration: 1000
                      });

                      var userinfo = wx.getStorageSync("user_info");

                      var d = {
                        liveId: liveid,
                        message: result.data,
                        openid: wx.getStorageSync("openid"),
                        audio_index: 3,
                        teacher: true,
                        img: userinfo.cr_userImg,
                        userName: userinfo.cr_userName,
                      };

                      d = JSON.stringify(d);


                      wx.request({
                        url: host + 'saveRecordMessage',
                        data: {
                          message: d
                        },
                        success: function (re) {
                          var data = re.data;
                          console.log(data);
                        }
                      })
                      SocketTask.send({
                        data: d,
                        success: function () {

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
                      //     message: result.data,
                      //     openid: wx.getStorageSync("openid"),
                      //     audio_index: 3,
                      //     teacher:true
                      //   },
                      //   success: function (r) {
                      //     var data = r.data;
                      //     console.log(data);
                      //   }
                      // })

                    },
                    fail: function (result) {
                      console.log(result);
                      wx.hideLoading();
                      wx.showModal({
                        title: '提示',
                        content: '图片生成失败！请稍候重试...',
                      })
                      typeof fail == "function" && fail(result);
                    }
                  });
                  wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (res) {
                      console.log("压缩后", res);

                    }
                  })
                }
              })
            });
            // setTimeout(function(){
            //   wx.canvasToTempFilePath({
            //     x: 0,
            //     y: 0,
            //     width: canvasWidth,
            //     height: canvasHeight,
            //     destWidth: canvasWidth/1.5,
            //     destHeight: canvasHeight/1.5,
            //     canvasId: 'photo_canvas',
            //     fileType:"jpg",
            //     // quality: 0.8,
            //     success: function (res) {
            //       console.log(res.tempFilePath);
            //       wx.uploadFile({
            //         url: "https://m.nongjike.cn/NJK/app/shangchuan/imgUpload",
            //         filePath: res.tempFilePath,
            //         name: "file",
            //         header: {
            //           'content-type': 'multipart/form-data'
            //         }, // 设置请求的 header// HTTP 请求中其他额外的 form data
            //         success: function (result) {
            //           console.log(result);
            //           wx.hideLoading();

            //           wx.showToast({
            //             title: '上传成功！',
            //             duration: 1000
            //           });

            //           var userinfo = wx.getStorageSync("user_info");

            //           var d = {
            //             liveId: liveid,
            //             message: result.data,
            //             openid: wx.getStorageSync("openid"),
            //             audio_index: 3,
            //             teacher: true,
            //             img: userinfo.cr_userImg,
            //             userName: userinfo.cr_userName,
            //           };

            //           d = JSON.stringify(d);


            //           wx.request({
            //             url: host + 'saveRecordMessage',
            //             data: {
            //               message: d
            //             },
            //             success: function (re) {
            //               var data = re.data;
            //               console.log(data);
            //             }
            //           })
            //           SocketTask.send({
            //             data: d,
            //             success: function () {

            //             },
            //             fail: function () {
            //               wx.showToast({
            //                 title: '发送失败！请重新进入大讲堂重试！',
            //                 icon: "none",
            //                 duration: 2000,
            //               })
            //             }
            //           })


            //           // wx.request({
            //           //   url: host + 'send',
            //           //   method: "POST",
            //           //   header: {
            //           //     "content-type": "application/x-www-form-urlencoded"
            //           //   },
            //           //   data: {
            //           //     liveId: liveid,
            //           //     message: result.data,
            //           //     openid: wx.getStorageSync("openid"),
            //           //     audio_index: 3,
            //           //     teacher:true
            //           //   },
            //           //   success: function (r) {
            //           //     var data = r.data;
            //           //     console.log(data);
            //           //   }
            //           // })

            //         },
            //         fail: function (result) {
            //           console.log(result);
            //           wx.hideLoading();
            //           wx.showModal({
            //             title: '提示',
            //             content: '图片生成失败！请稍候重试...',
            //           })
            //           typeof fail == "function" && fail(result);
            //         }
            //       });
            //       wx.getImageInfo({
            //         src: res.tempFilePath,
            //         success: function (res) {
            //           console.log("压缩后", res);

            //         }
            //       })
            //     }
            //   })
            // },400);
          }
        });

        return false;

        wx.uploadFile({
          url:"https://m.nongjike.cn/NJK/app/shangchuan/imgUpload",
          filePath: src,
          name: "file",
          header: {
            'content-type': 'multipart/form-data'
          }, // 设置请求的 header// HTTP 请求中其他额外的 form data
          success: function (result) {
            console.log(result);
            wx.hideLoading();

            wx.showToast({
              title: '上传成功！',
              duration: 1000
            });

            var userinfo = wx.getStorageSync("user_info");

            var d = {
              liveId: liveid,
              message: result.data,
              openid: wx.getStorageSync("openid"),
              audio_index: 3,
              teacher: true,
              img: userinfo.cr_userImg,
              userName: userinfo.cr_userName,
            };

            d = JSON.stringify(d);

            setTimeout(function(){
              SocketTask.send({
                data: d,
                success: function () {

                },
                fail: function () {
                  wx.showToast({
                    title: '发送失败！请重新进入大讲堂重试！',
                    icon: "none",
                    duration: 2000,
                  })
                }
              })
            },1000);

            // wx.request({
            //   url: host + 'send',
            //   method: "POST",
            //   header: {
            //     "content-type": "application/x-www-form-urlencoded"
            //   },
            //   data: {
            //     liveId: liveid,
            //     message: result.data,
            //     openid: wx.getStorageSync("openid"),
            //     audio_index: 3,
            //     teacher:true
            //   },
            //   success: function (r) {
            //     var data = r.data;
            //     console.log(data);
            //   }
            // })

          },
          fail: function (result) {
            console.log(result);
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '图片生成失败！请稍候重试...',
            })
            typeof fail == "function" && fail(result);
          }
        });


      }
    })
  },

  sendtypechange:function(){
    this.setData({
      sendtype: this.data.sendtype==1?2:1
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      autoerror:true,
    });
    if(this.data.watchpic){
      return false;
    }
    clearInterval(this.interval)
    SocketTask.close();
    innerAudioContext.stop();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      autoerror: true,
    });
    clearInterval(this.interval)
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
      path: '/pages/project/live/liveinfo/liveinfo?id='+this.data.liveid
    }
  }
})