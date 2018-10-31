
const host = getApp().globalData.host;
const ctx = wx.createCanvasContext('myCanvas');
var dstatus = 0,
  imgs = {
    code: "",
    big: '',
  }
function getRandomColor() {
  const rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

Page({
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  inputValue: '',
  data: {
    windowW: wx.getSystemInfoSync().windowWidth,
    showshare: false,
    share_img: '',


    src: '',
    sending:false,
    hasMore: true,
    first:true,
    playing:false,
    autoplay:false,
    list: [],
    page: 1,
    loading: false,
    danmuList:[{
      text: '第 1s 出现的弹幕',
      color: '#ff0000',
      time: 1
    },
    {
      text: '第 3s 出现的弹幕',
      color: '#ff00ff',
      time: 3
    }],
    list:[],
    comment:'',
    showcomment:false,
    seeall: {},
    crt: {},
    subcal: {},
    holder: "",
  },
  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },
  bindSendDanmu: function () {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },
  bindPlay: function () {
    // this.videoContext.play();

    this.setData({
      playing:true
    })
  },
  bindPause: function () {
    this.setData({
      playing: false
    })
    // this.videoContext.pause()
  },
  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg);
    wx.showToast({
      title: '网络错误！请稍后重试，或切换到网络状况较好的网络！',
      icon:"none",
      duration:1500,
    })
  },
  loadmore: function () {
    if (this.data.loading == true || !this.data.hasMore) {
      return false;
    }

    var page = this.data.page;
    page += 1;
    this.setData({
      page: page
    });

    this.loadlist();

    this.setData({
      loading:true,
    })

  },

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },

  loadlist:function(){
    var _this = this;
    var id = this.data.id;
    var userid = wx.getStorageSync("userid");

    if (!userid) {
      wx.showLoading({
        title: '加载用户信息',
        mask: true,
      });

      setTimeout(function () {
        _this.loadlist();
      }, 1000);
      return false;
    }

    wx.hideLoading();

    var list = this.data.list,
      hasMore = this.data.hasMore;

    this.setData({
      loading: true,
    })

    wx.request({
      url: host + 'findLiveById',
      data: {
        pageNum: this.data.page,
        live_id: id,
        userId: userid
      },
      success: function (res) {
        var data = res.data;

        if (data.code == 2) {
          wx.showToast({
            title: data.message,
            icon: "none",
            duration: 2000,
            mask: true,
          });
          return false;
        }

        var dt = data.critical;
        console.log(dt);

        if (dt.length < 5) {
          hasMore = false;
        } else {
          hasMore = true;
        }

        if (dt.length > 0) list = list.concat(dt);
        console.log(list);

        _this.setData({
          hasMore: hasMore,
          list: list || [],
          loading: false,
        });


        if (_this.data.first){
          console.log("初始化")
          _this.setData({
            info: data.live,
            first:false,
          });
          _this.loadcode();
        }
      }
    })
  },
  togglecomment:function(){
    var _this = this;
    if (!this.data.showcomment){
      if(this.data.playing){
        this.setData({
          autoplay: true,
        })
      }
      this.setData({
        playing:false,
      })
      this.videoContext.pause()
    } else if (!!this.data.showcomment){
      
      if(this.data.autoplay){
        this.videoContext.play();
      }
      this.setData({
        autoplay:false,
      })
    }
    this.setData({
      showcomment:!_this.data.showcomment
    });
    
  },
  onLoad:function(options){
    var id = options.id;
    this.setData({
      id:id
    })
    this.loadlist();
  },
  waiting:function(){
    // wx.showLoading({
    //   title: '正在缓冲视频',
    //   mask:true
    // })
  },
  gogogo:function(){
    wx.hideLoading();
  },
  iptcomment:function(e){
    var txt = e.detail.value;
    console.log(txt);

    this.setData({
      comment:txt,
    })
  },
  // sendcomment:function(e){

  //   var formid = e.detail.formId;
  //   wx.request({
  //     url: host + '',
  //     data: {
  //       userId: wx.getStorageSync("userid")
  //     },
  //     success: function (res) {

  //     }
  //   })
    
  //   var txt = this.data.comment,
  //   _this = this;
  //   if(!txt){
  //     wx.showToast({
  //       title: '请输入评论内容！',
  //       icon: "none",
  //       duration: 2000
  //     })
  //     return false
  //   }

  //   if(this.data.sending){
  //     return false;
  //   }

  //   this.setData({
  //     comment:'',
  //     sending:true
  //   })

  //   wx.request({
  //     url: host + 'saveCal',
  //     data:{
  //       message:txt,
  //       userId:wx.getStorageSync("userid"),
  //       liveId:this.data.id
  //     },
  //     method:"POST",
  //     header:{
  //       "content-type":"application/x-www-form-urlencoded"
  //     },
  //     success:function(res){
  //       var data = res.data;
  //       console.log(data);
  //       if(data.code==1){
  //         wx.showToast({
  //           title: '评论成功！',
  //           duration: 2000,
  //         });


  //         _this.setData({
  //           sending:false,
  //           page:1,
  //           list:[]
  //         });

  //         _this.loadlist();

  //         setTimeout(function(){
  //           _this.togglecomment();
  //         },500);
  //       }
  //     }
  //   })
  // },
  onShareAppMessage: function () {
    console.log(this.data.id)
    return {
      title: this.data.info.live_name,
      imageUrl: this.data.info.shareImg || this.data.info.live_audioImg ||'/imgs/share.jpg',
      path: '/pages/project/video/video?id=' + this.data.id
    }
  },




  loadcode: function () {
    var that = this;
    wx.request({
      url: host + 'findCodeUrl',
      data: {
        path: "pages/project/video/video?id=" + this.data.id
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        if (data.code == 1) {
          var dstatus = 0;

          wx.downloadFile({
            url: data.url, //仅为示例，并非真实的资源
            success(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                dstatus++
                imgs.code = res.tempFilePath;
                if (dstatus >= 2) {
                  that.draw(imgs.code, imgs.big)
                }
              }
            }
          })
          var img =  that.data.info.live_audioImg,
            img = img.replace("http", "https");
          wx.downloadFile({
            url: img, //仅为示例，并非真实的资源
            success(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                dstatus++
                imgs.big = res.tempFilePath;
                if (dstatus >= 2) {
                  that.draw(imgs.code, imgs.big)
                }
              }
            }
          })
        } else {
          that.draw();
          // wx.showToast({
          //   title: '邀请卡生成失败！',
          //   icon: "none",
          //   duration: 1000
          // })
        }
      }
    })
  },

  draw: function (qrcode, bigimg) {
    if (!qrcode) {

      // wx.showToast({
      //   title: '邀请卡生成失败！',
      //   icon: "none",
      //   duration: 1000
      // })
    }
    var _this = this;
    ctx.setFillStyle("#fff");
    ctx.fillRect(0, 0, 690, 898);
    ctx.font = 'normal 10px sans-serif';
    ctx.setFillStyle('#000');
    // ctx.drawImage("/imgs/500276466.png", 105 , -0.6853 * this.data.windowW / 5, 0.68 * this.data.windowW, 0.6853 * this.data.windowW);
    // var img = this.data.info.shareImg,
    // img = img.replace("http","https");
    ctx.drawImage(bigimg, 0, 0, 690, 431);

    console.log(this.data.info);

    var title = this.data.info.live_brief || this.data.info.live_name,
      teacher = this.data.info.cr_userName;
    var starty = 516,
      line = 0;

    ctx.setFontSize(32);
    ctx.setFillStyle("#333");
    ctx.font = 'bold 32px sans-serif'
    ctx.setTextAlign('left')
    ctx.setTextBaseline("top");
    ctx.fillText(teacher.length > 3 ? teacher.substr(0, 3) + "..." : teacher, 60, 511);


    ctx.setFontSize(28);
    ctx.font = 'normal 28px sans-serif'
    ctx.setFillStyle("#333");
    ctx.setTextAlign('left')

    if (!!ctx.measureText) {
      console.log("支持！");
      if (!!title) {
        var lineWidth = 0;
        var canvasWidth = 396;//计算canvas的宽度
        var initHeight = 516;//绘制字体距离canvas顶部初始的高度
        var lastSubStrIndex = 0; //每次开始截取的字符串的索引
        starty += 0 - 0
        console.log("最大宽度：" + canvasWidth);
        ctx.setFillStyle(title.color || "rgb(40,40,40)");
        for (let k = 0; k < title.length; k++) {
          lineWidth += ctx.measureText(title[k]).width;
          if (lineWidth >= canvasWidth) {
            line++;
            if (line < 2) {
              ctx.fillText(title.substring(lastSubStrIndex, k + 1), 210, starty);//绘制截取部分
              console.log("该行字为：" + title.substring(lastSubStrIndex, k + 1));
              console.log("该行字数" + title.substring(lastSubStrIndex, k + 1).length);
              console.log("宽度：" + lineWidth);
              console.log("开始脚标：" + lastSubStrIndex);
              console.log("结束脚标" + k);
              starty += 46;//20为字体的高度
              lineWidth = 0;
              lastSubStrIndex = k + 1;
            } else {
              ctx.fillText(title.substring(lastSubStrIndex, k) + "......", 210, starty);//绘制截取部分
              console.log("该行字为：" + title.substring(lastSubStrIndex, k + 1));
              console.log("该行字数" + title.substring(lastSubStrIndex, k + 1).length);
              console.log("宽度：" + lineWidth);
              console.log("开始脚标：" + lastSubStrIndex);
              console.log("结束脚标" + k);
              starty += 46;//20为字体的高度
              lineWidth = 0;
              lastSubStrIndex = k + 1;
              break;
            }


          }
          if (k == title.length - 1) { //绘制剩余部分
            ctx.fillText(title.substring(lastSubStrIndex, k + 1), 210, starty);
            console.log(title.substring(lastSubStrIndex, k + 1))
            console.log("宽度：" + lineWidth);
            starty += 20
          }
        }
        starty += 8 - 0;
      } else {//没有附加文字
        starty += 8 - 0;
      }
    } else {
      var nmax = 400 / 36
      console.log("不支持！");
      if (!!title && !!title) {
        var n = title.length,//总字数
          lines = Math.ceil(n / nmax);//总行数
        // starty += 46 - 0

        ctx.setFillStyle(title.color || "#333333");
        for (var j = 0; j < lines; j++) {
          if (j < 1) {
            starty += 2.5 - 0;
            var val = title.substr(j * nmax, nmax);
            ctx.fillText(val, 98, starty);
            starty += 44 - 0;
          } else {
            starty += 2.5 - 0;
            var val = title.substr(j * nmax, nmax);
            ctx.fillText(val + "...", 98, starty);
            starty += 44 - 0;
            break;
          }

        }
      } else {//没有附加文字
        starty += 8 - 0;
      }
    }

    console.log("下一行开始高度：" + starty)
    ctx.setFontSize(30);
    ctx.setFillStyle("rgb(102,102,102)")
    ctx.setTextAlign('left');
    // teacher = teacher.length > 6 ? teacher.substring(0, 6) + "..." : teacher.substring(0, 6);
    // ctx.fillText("————讲师：" + teacher, 98, starty + 50, 404);
    ctx.drawImage(qrcode || "/imgs/procode.png", 257.5, 647, 175, 175);
    ctx.setTextAlign('center')
    ctx.setFontSize(26);
    ctx.setFillStyle("#000000")
    ctx.fillText("长按识别二维码", 345, 830, 404);
    ctx.draw(false, function () {
      wx.hideLoading();
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          console.log(res.tempFilePath);
          var path = res.tempFilePath;

          _this.setData({
            share_img: path,
            // showshare:true
          })
        }
      })
    });

    setTimeout(function () {
      // wx.hideLoading();
      // wx.canvasToTempFilePath({
      //   canvasId: 'myCanvas',
      //   success: function (res) {
      //     console.log(res.tempFilePath);
      //     var path = res.tempFilePath;

      //     _this.setData({
      //       share_img: path,
      //       showshare: true,
      //     })
      //   }
      // })
    }, 1000);
  },
  hideshare: function () {

    this.setData({
      showshare: false,
    })
  },
  shows: function () {
    this.setData({
      showshare: true,
    })
  },
  savepic: function () {
    var that = this;
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        wx.saveImageToPhotosAlbum({
          filePath: that.data.share_img,
          success(res) {
            console.log(res);
            wx.showModal({
              title: '提示',
              content: '课程海报已保存至相册',
              cancelText: "我知道啦"
            })
          },
          fail: function () {
            wx.hideLoading();
            wx.showModal({
              title: '错误',
              content: '出现未知错误，保存失败！',
            })
          },
          complete: function () {
            wx.hideLoading();
          }
        })
      },
      fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '您已关闭了保存图片的权限，请手动点击右上角菜单，选择关于小程序，然后点击右上角菜单，选择设置，开通权限！',
          confirmText: "去设置",
          confirmColor: "#3CC51F",
          success: function (result) {
            if (result.confirm) {
              wx.openSetting({
                success: function (res1) {
                  console.log(res1)
                  if (!!res1.authSetting['scope.writePhotosAlbum']) {//同意保存图片授权
                    that.save();
                  } else {

                  }
                },
                fail: function () {

                }
              })
            }
          },
          fail: function () {

          }
        });
      }
    })
    // wx.saveImageToPhotosAlbum({
    //   filePath:this.data.share_img,
    //   success:function(){
    // wx.showModal({
    //   title: '提示',
    //   content: '',
    // })
    //   }
    // })
  },
  gocomment: function (e) {
    this.togglecomment();
    console.log(e);
    if (e.currentTarget.dataset.uname) {
      this.setData({
        holder: "回复：" + e.currentTarget.dataset.uname
      })
    } else {
      this.setData({
        holder: ''
      })
    }

    if (e.currentTarget.dataset.index >= 0) {
      var index = e.currentTarget.dataset.index,
        crt = JSON.parse(JSON.stringify(this.data.list[index]));
      console.log(crt);
      this.setData({
        crt: crt,
        subcal: {}
      })
    } else {
      this.setData({
        crt: {},
        subcal: {}
      })
    }
  },

  iptcomment: function (e) {
    var txt = e.detail.value;
    console.log(txt);

    this.setData({
      comment: txt,
    })
  },
  sendcomment: function (e) {

    var formid = e.detail.formId;
    if (!!formid) {
      wx.request({
        url: host + 'saveBoom',
        data: {
          openId: wx.getStorageSync("openid"),
          formId: formid
        },
        success: function (res) {

        }
      })
    }

    var txt = this.data.comment,
      _this = this;
    if (!txt) {
      wx.showToast({
        title: '请输入评论内容！',
        icon: "none",
        duration: 2000
      })
      return false
    }

    if (this.data.sending) {
      return false;
    }

    this.setData({
      comment: '',
      sending: true
    });

    console.log(this.data.crt);

    if (!this.data.crt.record_id) {
      wx.request({
        url: host + 'saveCal',
        data: {
          message: txt,
          userId: wx.getStorageSync("userid"),
          liveId: this.data.id
        },
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          var data = res.data;
          console.log(data);
          if (data.code == 1) {
            wx.showToast({
              title: '评论成功！',
              duration: 2000,
            });


            _this.setData({
              sending: false,
              page: 1,
              list: []
            });

            _this.loadlist();

            setTimeout(function () {
              _this.togglecomment();
            }, 500);
          }
        }
      })
    } else {
      wx.request({
        url: host + 'saveCritical',
        data: {
          cal_message: txt,
          userId: wx.getStorageSync("userid"),
          cal_recordId: this.data.crt.record_id,
          calId: this.data.subcal.cal_id || ""
        },
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          var data = res.data;
          console.log(data);
          if (data.code == 1) {
            wx.showToast({
              title: '评论成功！',
              duration: 2000,
            });


            _this.setData({
              sending: false,
              page: 1,
              list: []
            });

            _this.loadlist();

            setTimeout(function () {
              _this.togglecomment();
            }, 500);
          }
        }
      })
    }

    return false;


  },
  subcomment: function (e) {
    var father = JSON.parse(JSON.stringify(this.data.list[e.currentTarget.dataset.index])),
      current = JSON.parse(JSON.stringify(father.calList[e.currentTarget.dataset.cindex]));

    console.log(current);

    this.togglecomment();
    this.setData({

    })
    this.setData({
      holder: "回复：" + current.userName,
      crt: father,
      subcal: current
    })
  },
  cliskseeall: function (e) {
    var id = e.currentTarget.dataset.id;
    var see = this.data.seeall;
    see[id] = true;

    this.setData({
      seeall: see,
    });

    console.log(this.data.seeall);
  }
})