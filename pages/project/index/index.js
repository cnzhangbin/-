// pages/project/index/index.js
const host = getApp().globalData.host;
const ctx = wx.createCanvasContext('myCanvas')
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
    windowW: wx.getSystemInfoSync().windowWidth,
    showshare: false,
    share_img: '',


    showlogin:false,
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    hasMore:false,
    loading:false,
    indicatorDots: false,
    autoplay: false,
    page:1,
    interval: 5000,
    duration: 1000,
    nav:[

    ],
    beginTime:"2018/08/26 15:40:00",
    time:{
      day:0,
      hour:0,
      minutes:0,
      second:0,
    },
    liveStatus:0,
    yuyue:false,
    livelist:[],
    living:{},
    news:{},
    typeid: 1,
  },
  bannerdetail:function(e){
    var id = e.currentTarget.dataset.id;
    var typeid = e.currentTarget.dataset.t;

    


    if (typeid == 2) {//banner_name为1是音频，为2是视频
      wx.navigateTo({
        url: '/pages/project/video/video?id=' + id,
      });
      return false;
    }

    if (!id) {
      wx.showToast({
        title: '获取课程ID失败！',
        icon: "none",
        duration: 2000
      });
      return false;
    }


    var userid = e.currentTarget.dataset.uid;

    var cuid = wx.getStorageSync("userid");

    if (cuid == userid && type == 1) {
      wx.navigateTo({
        url: '/pages/project/live/teacher/teacher?id=' + id,
      });
      return false;
    }

    // if (type == 1){
    //   wx.navigateTo({
    //     url: '/pages/project/live/teacher/teacher?id=' + id,
    //   });
    //   return false;
    // }


    if (this.data.liveStatus == 1 && type == 1) {
      wx.navigateTo({
        url: '/pages/project/live/live/live?id=' + id,
      });
      return false;
    }
    wx.navigateTo({
      url: '/pages/project/live/liveinfo/liveinfo?id=' + id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    // const backgroundAudioManager = wx.getBackgroundAudioManager();


    // backgroundAudioManager.title = '此时此刻'
    // backgroundAudioManager.epname = '此时此刻'
    // backgroundAudioManager.singer = '许巍'
    // backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'
    // // 设置了 src 之后会自动播放
    // backgroundAudioManager.src = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46'
    // backgroundAudioManager.src = 'https://m.nongjike.cn/NJK/uploadFiles/uploadImgs/shengyin/20180930/1538290265919_njk.mp3'

    var _this = this;
    this.loadcode();
    var userid = wx.getStorageSync("userid");

    if(!userid){
      wx.showLoading({
        title: '加载数据中...',
        mask:true
      });
      _this.loadpage();
      return false;
    }
    _this.loadpage();

   
  },

  loadpage: function () {
    var _this = this;

    var userid = wx.getStorageSync("userid");
    if (!userid) {
      wx.showLoading({
        title: '加载数据中...',
        mask: true
      });
      setTimeout(function(){

        _this.loadpage();
      },1000);
      return false;
    }


    wx.hideLoading();

    wx.request({
      url: host + 'getFirstPage',
      data: {
        userId: wx.getStorageSync("userid")
      },
      success: function (res) {
        var data = res.data;
        console.log(data);

        var types = data.data.types,
          banners = data.data.banners;

        var navlist = _this.data.nav;


        for (var i = 0; i < types.length; i++) {
          var obj = {
            name: types[i].type_name,
            id: types[i].type_id,
            selected: i==0?true:false,
          }
          navlist.push(obj);
        }

        _this.setData({
          imgUrls: banners,
          nav: navlist,
          // livelist: data.data.lives,
          living: data.data.live || {},
          news: data.data.zixun,
          beginTime: !!data.data.live ? data.data.live.beginTime.replace(/-/g, "/") : ""
        });
        _this.loadlist();
        _this.calcTime();
      }
    })


    setTimeout(function () {
      var user_info = wx.getStorageSync("user_info");
      if (!user_info.cr_userName || !user_info.cr_userImg) {
        _this.setData({
          showlogin: true
        })
      }
    }, 3000);
  },

  zixun:function(){
    wx.navigateTo({
      url: '/pages/project/news/news?id=0',
    })
  },

  livedetail:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/project/live/liveinfo/liveinfo?id='+id,
    })
  },
  yuyueclick:function(e){
    console.log(e);
    var formid = e.detail.formId;
    var live = this.data.living;
    if (live.scribeState!=0){
      return false;
    }

    var userid = wx.getStorageSync("userid");

    if(!userid){
      wx.showLoading({
        title: '加载中...',
        mask:true,
      });

      setTimeout(function(){
        wx.hideLoading();
      },1000);

      return false;
    }

    wx.request({
      url: host + 'saveSubscribe',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data:{
        userId:wx.getStorageSync("userid"),
        liveId: this.data.living.live_id,
        openId: wx.getStorageSync("openid"),
        page: "pages/project/live/live/live?id="+this.data.living.live_id,
        form_id: formid,
        beginTime: this.data.living.beginTime,
        key1: this.data.living.live_name,
        key2: this.data.living.beginTime,
        key3: "您关注的课程马上就开始啦！",
        key4: this.data.living.cr_userName,
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        if(data.code==1){
          wx.showToast({
            title: '预约成功！',
            duration:1500,
          })
          
        }else{
          wx.showToast({
            title: '预约失败！'+data.message,
            duration: 1500,
            icon:"none",
            mask:true
          })
        }
      }
    })
    live.scribeState = 1;
    this.setData({
      living:live
    })
  },

  selectnav:function(e){
    var index = e.currentTarget.dataset.index;
    var list = this.data.nav;
    var id = list[index].id;
    if(list[index].selected == true){
      return false;
    }
    for(var i=0 ; i<list.length ; i++){
      if(i==index){
        list[i].selected = true;
      }else{
        list[i].selected = false;
      }
    }

    this.setData({
      nav:list,
      typeid:id,
      page:1,
      hasMore:true,
      loading:true,
      livelist:[]
    });

    var _this = this;

    _this.loadlist(id);
    
  },

  history:function(){
    var nav = this.data.nav;
    var id;
    for(var i=0;i<nav.length;i++){
      if(!!nav[i].selected){
        id = nav[i].id;
      }
    }

    console.log(id);
    wx.navigateTo({
      url: '/pages/project/history/history?id='+id,
    })
  },

  detail: function (e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type,
    typeid = e.currentTarget.dataset.typeid;

    var formid = e.detail.formId;
    if(!!formid){
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
    

    console.log(formid);
    

    if (typeid == 5 || typeid == 4){
      wx.navigateTo({
        url: '/pages/project/video/video?id='+id,
      });
      return false;
    }

    if(!id){
      wx.showToast({
        title: '获取课程ID失败！',
        icon:"none",
        duration:2000
      });
      return false;
    }


    var userid = e.currentTarget.dataset.uid;

    var cuid = wx.getStorageSync("userid");

    if (cuid == userid && type == 1) {
      wx.navigateTo({
        url: '/pages/project/live/teacher/teacher?id=' + id,
      });
      return false;
    }

    // if (type == 1){
    //   wx.navigateTo({
    //     url: '/pages/project/live/teacher/teacher?id=' + id,
    //   });
    //   return false;
    // }


    if (this.data.liveStatus==1&&type==1){
      wx.navigateTo({
        url: '/pages/project/live/live/live?id=' + id,
      });
      return false;
    }
    wx.navigateTo({
      url: '/pages/project/live/liveinfo/liveinfo?id='+id,
    })
  },

  mine:function(){
    wx.redirectTo({
      url: '/pages/project/my/index/index',
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

  calcTime:function(){
    var now = new Date().getTime();
    var beginTime = new Date(this.data.beginTime).getTime();

    var dis = beginTime - now;
    // console.log(this.data.beginTime);

    if(dis<=0){
      this.setData({
        liveStatus:1,
      });
      return false;
    }

    var second = parseInt(dis / 1000);
    var minute = parseInt(second / 60),
      hour = parseInt(minute / 60),
      day = parseInt(hour / 24);

    hour = (hour % 24) >= 10 ? hour % 24 : "0" + hour % 24;

    // hour = hour>=10?hour:"0"+hour

    minute = minute % 60 >= 10 ? minute % 60 : "0" + minute % 60;

    second = second % 60 >= 10 ? second % 60 : "0" + second % 60;

    // console.log("天数：" + day + ";小时数：" + hour + "；分钟数" + minute + ";秒数" + second);

    this.setData({
      time:{
        day: day,
        hour: hour,
        minutes: minute,
        second: second,
      }
    });

    var _this = this;

    setTimeout(function(){
      _this.calcTime();
    },1000);
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
    return {
      title: '农资大讲堂，是农资人进行学习充电的一大利器。',
      path: '/pages/project/index/index'
    }
  },

  binduserinfo: function (res) {
    console.log(res);

    var that = this;

    this.setData({
      showlogin: false,
    })

    var detail = res.detail;

    var openid = wx.getStorageSync("openid");
    if (!detail.userInfo) {

    } else {
      wx.setStorageSync("userinfo", detail.userInfo);
      wx.request({
        url: host + 'editUser',
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          userId: wx.getStorageSync("userid"),
          cr_userName: detail.userInfo.nickName,
          cr_userImg: detail.userInfo.avatarUrl
        },
        success: function (e) {
          console.log(e);
          var user_info = wx.getStorageSync("user_info");
          user_info.cr_userName = detail.userInfo.nickName ;
          user_info.cr_userImg = detail.userInfo.avatarUrl;

          wx.setStorageSync("user_info", user_info)
          
        }
      })
    }
  },

  cancel:function(){
    this.setData({
      showlogin:false
    })
  },
  loadmore:function(){
    if(this.data.loading||!this.data.hasMore){
      return false;
    }

    this.setData({
      loading:true,
      page:++this.data.page
    });

    this.loadlist();
  },
  loadlist:function(id){
    var _this = this;
    wx.request({
      url: host + 'findLiveList',
      data: {
        typeId: this.data.typeid == 1 ? '' : this.data.typeid,
        comeGo: 0,
        pageNum: this.data.page,
      },
      success: function (res) {
        var data = res.data;
        console.log(data);

        var list = _this.data.livelist;

        for (var i = 0; i < data.critical.length;i++){
          data.critical[i].beginTime = data.critical[i].beginTime.split(" ")[0];
          // console.log(data.critical[i].beginTime)
        }

        if(data.critical.length>0){
          list = list.concat(data.critical);
        }

        _this.setData({
          livelist: list,
          loading:false,
          hasMore: data.critical.length>0
        });
        console.log(data.critical);
      }
    })
  },

  loadcode:function(){
    this.draw();
    return false;
    var that = this;
    wx.request({
      url: host + 'findCodeUrl',
      data:{
        path:"pages/project/index/index"
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        if(data.code==1){
          
          wx.downloadFile({
            url: data.url, //仅为示例，并非真实的资源
            success(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                that.draw(res.tempFilePath)
              }
            }
          })
        }else{
          // wx.showToast({
          //   title: '邀请卡生成失败！',
          //   icon:"none",
          //   duration: 1000
          // })
        }
      }
    })
  },

  draw: function (qrcode) {
    if(!qrcode){
      
      // wx.showToast({
      //   title: '邀请卡生成失败！',
      //   icon: "none",
      //   duration: 1000
      // })
    }
    var _this = this;
    ctx.setFillStyle("#fff");
    ctx.fillRect(0,0,690,898);
    ctx.setFillStyle('#000');
    // ctx.drawImage("/imgs/500276466.png", 105 , -0.6853 * this.data.windowW / 5, 0.68 * this.data.windowW, 0.6853 * this.data.windowW);
    ctx.drawImage("/imgs/nlogo.png", 60, 60, 86, 86);
    // ctx.drawImage("/imgs/logo_l.png", 60, 64, 74, 74);
    ctx.setFontSize(30);
    ctx.setTextAlign('left')
    ctx.fillText("农资大讲堂", 166, 115);

    var title = "农资大讲堂，是一款农业领域学习小程序；它具有知识全面、随时多次学习、名师讲解的特点，是农资人进行学习充电的一大利器。",
    teacher = "农资大讲堂";
    var starty = 206,
    line = 0;
    ctx.setFontSize(36);
    ctx.setTextAlign('left')

    if (!!ctx.measureText) {
      console.log("支持！");
      if (!!title) {
        var lineWidth = 0;
        var canvasWidth = 510;//计算canvas的宽度
        var initHeight = 176;//绘制字体距离canvas顶部初始的高度
        var lastSubStrIndex = 0; //每次开始截取的字符串的索引
        starty += 0 - 0
        console.log("最大宽度：" + canvasWidth);
        ctx.setFillStyle(title.color || "rgb(40,40,40)");
        for (let k = 0; k < title.length; k++) {
          lineWidth += ctx.measureText(title[k]).width;
          if (lineWidth >= canvasWidth) {
            // line++;
            // if(line<100){
              
            // }else{
            //   ctx.fillText(title.substring(lastSubStrIndex, k)+"......", 98, starty);//绘制截取部分
            //   console.log("该行字为：" + title.substring(lastSubStrIndex, k + 1));
            //   console.log("该行字数" + title.substring(lastSubStrIndex, k + 1).length);
            //   console.log("宽度：" + lineWidth);
            //   console.log("开始脚标：" + lastSubStrIndex);
            //   console.log("结束脚标" + k);
            //   starty += 46;//20为字体的高度
            //   lineWidth = 0;
            //   lastSubStrIndex = k + 1;
            //   break;
            // }
            ctx.fillText(title.substring(lastSubStrIndex, k + 1), 60, starty);//绘制截取部分
            console.log("该行字为：" + title.substring(lastSubStrIndex, k + 1));
            console.log("该行字数" + title.substring(lastSubStrIndex, k + 1).length);
            console.log("宽度：" + lineWidth);
            console.log("开始脚标：" + lastSubStrIndex);
            console.log("结束脚标" + k);
            starty += 46;//20为字体的高度
            lineWidth = 0;
            lastSubStrIndex = k + 1;
            
            
          }
          if (k == title.length - 1) { //绘制剩余部分
            ctx.fillText(title.substring(lastSubStrIndex, k + 1), 60, starty);
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
          if(j<1){
            starty += 2.5 - 0;
            var val = title.substr(j * nmax, nmax);
            ctx.fillText(val, 98, starty);
            starty += 44 - 0;
          }else{
            starty += 2.5 - 0;
            var val = title.substr(j * nmax, nmax);
            ctx.fillText(val+"...", 98, starty);
            starty += 44 - 0;
            break;
          }
         
        }
      } else {//没有附加文字
        starty += 8 - 0;
      }
    }

    console.log("下一行开始高度："+starty)
    ctx.setFontSize(30);
    ctx.setFillStyle("rgb(102,102,102)")
    ctx.setTextAlign('left');
    teacher = teacher.length > 6 ? teacher.substring(0, 6)+"...":teacher.substring(0,6);
    // ctx.fillText("————"+teacher, 98, starty+50, 404);
    ctx.drawImage(qrcode||"/imgs/procode.png", 223.5, 522, 243, 257);
    ctx.setTextAlign('center')
    ctx.setFontSize(24);
    ctx.setFillStyle("#000000")
    ctx.fillText("长按识别二维码", 345, 820, 404);
    ctx.draw(false,function(){
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
  hideshare:function(){
    this.setData({
      showshare:false,
    })
  },
  shows:function(){
    this.setData({
      showshare: true,
    })
  },
  savepic:function(){
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
              cancelText:"我知道啦"
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
        //   content: '已保存至相册',
        // })
    //   }
    // })
  },
  gosearch:function(){
    wx.navigateTo({
      url: '/pages/project/search/search',
    })
  }
})