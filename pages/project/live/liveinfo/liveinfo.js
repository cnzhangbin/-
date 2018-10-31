// pages/project/live/liveinfo/liveinfo.js
const host = getApp().globalData.host;
const ctx = wx.createCanvasContext('myCanvas')
var  innerAudioContext;
var timer;
var dstatus=0,
imgs={
  code:"",
  big:'',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowW: wx.getSystemInfoSync().windowWidth,
    showshare: false,
    share_img: '',

    showcomment: false,
    seeall:{},
    crt:{},
    subcal:{},
    holder:"",
    sending:false,
    comment:'',
    navStatus:1,
    showshare:false,
    buystatus:0,
    playstatus: 0,
    autoplay:false,
    hasMore: true,
    page: 1,
    loading: false,
    list: [],
    tasklist:[],
    id:'',
    nowTime:"00:00",
    endTime:"00:28:37",
    sliding:false,
    cvalue:0,
    downloaderror:false,
    info:{},
    downloaded:0,
    html: '<div class="main_pic" style="font-size:28rpx;color:#282828;"><img style="width:100%;" src="http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg"/></div>',
    nodes: [{
      name: 'div',
      attrs: {
        class: 'main_pic',
        style: 'padding-bottom:30rpx;font-size:28rpx;color:#282828;'
      },
      children: [{
        type: 'text',
        text: 'Hello&nbsp;World!'
      }]
    }],
    // audiolist:[
    //   {
    //     src:"http://www.meitiannongzi.com/nongjike/audios/8dc012c6db58f859262fdba497467b37.mp3",
    //     time:308,
    //     playing:false,
    //   },
    //   {
    //     src: "http://www.meitiannongzi.com/nongjike/audios/bc344d32e112b35f98ef10074359a5ce.mp3",
    //     time: 758,
    //     playing: false,
    //   }
    // ],

    audiolist: [
      // {
      //   src: "http://www.meitiannongzi.com/nongjike/audios/1538290265919_njk_1.mp3",
      //   time: 500,
      //   playing: false,
      // },
      // {
      //   src: "http://www.meitiannongzi.com/nongjike/audios/1538290265919_njk_2.mp3",
      //   time: 500,
      //   playing: false,
      // },
      // {
      //   src: "http://www.meitiannongzi.com/nongjike/audios/1538290265919_njk_3.mp3",
      //   time: 500,
      //   playing: false,
      // },
      // {
      //   src: "http://www.meitiannongzi.com/nongjike/audios/1538290265919_njk_4.mp3",
      //   time: 217,
      //   playing: false,
      // }
    ]
  },

  returnindex: function () {
    innerAudioContext.stop();
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */

  downAudio:function(src,index){
    var _this = this;
   
    var list = wx.getStorageSync("downAudios");

    this.setData({
      downloading:true
    });

    if(!!list[src]){
      console.log(list[src].src)
      _this.data.audiolist[index].src = list[src].src;
      _this.setData({
        audiolist: _this.data.audiolist,
        downloaded: ++_this.data.downloaded
      });
      if (_this.data.downloaded >= _this.data.tasklist.length) {
        wx.hideLoading();
      }
      return false;
    }
    wx.downloadFile({
      url: src,
      success: function (res) {
        if (res.statusCode==404){
          return false;
        }
        var path = res.tempFilePath;
        // console.log(res, _this.data.audiolist);
        // _this.data.audiolist[index].src = path;
        _this.setData({
          audiolist: _this.data.audiolist,
          downloaded: ++_this.data.downloaded
        });
        var obj = {
          src: path
        },
        list = wx.getStorageSync("downAudios");
        list[src] = obj;
        wx.setStorageSync("downAudios", list);

        if (_this.data.downloaded >= _this.data.tasklist.length){
          wx.hideLoading();
          if(_this.data.autoplay==true){
            _this.playaudio();
          }
        }
      },
      fail:function(res){
        console.log(res);
        wx.showToast({
          title: '加载音频出错，' + res.errMsg,
          icon:"none",
          duration:2000,
        });
        _this.setData({
          downloaderror:true
        })
      }
    })
  },
  onLoad: function (options) {
    // wx.setEnableDebug({
    //   enableDebug: false
    // })
    // innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext = wx.getBackgroundAudioManager();
    // innerAudioContext.title = '此时此刻'
    // innerAudioContext.epname = '农资大讲堂'
    // innerAudioContext.singer = '许巍'
    // innerAudioContext.coverImgUrl = 'http://www.meitiannongzi.com/nongjike/audios/logo_l.png'
    // innerAudioContext.src=""
    // innerAudioContext.autoplay = false
    var id = options.id;
    var _this = this,
    that = this;
    var userid = wx.getStorageSync("userid");
    this.setData({
      id:id,
      userid:userid
    });


    

    wx.request({
      url: host + 'findLiveRecordList',
      data:{
        liveId:id,
      },
      success:function(res){
        var data = res.data;
        var totaltime = 0;
        var arr = [];

        if (data.length<=0){
          return false;
        }
        var taskarr = [];

        for (var i = 0; i < data.length; i++) {
          if(data[i].audio_text==1){
            totaltime += data[i].size
            var o = {
              src: data[i].message,
              playing: false,
              time: data[i].size
            }
            arr.push(o);
            if(data[i].size>=60){
              taskarr.push(data[i]);
            }
          }
          

          // _this.downAudio(data[i].message, i)
        }
        console.log(o);

        var minute = parseInt(totaltime/60),
          hour = parseInt(minute / 60),
          minute = minute % 60 >= 10 ? minute % 60 : "0" + minute % 60,
          hour = hour % 24 >= 10 ? hour % 24 : "0" + hour % 24,
          s = totaltime % 60 >= 10 ? totaltime % 60 : "0" + totaltime % 60,
          end = hour + ":" + minute + ":" + s;
        console.log(hour + ":" + minute + ":" + s);
        _this.setData({// 设置播放列表
          audiolist: arr,
          // tasklist: taskarr,
          endTime: end
        });
        // setTimeout(function(){
        //   for (var j = 0; j < arr.length; j++) {
        //     if(arr[j].time>=60){
        //       // _this.downAudio(arr[j].src, j);
        //     }
        //   }
        // },1000);
      }
    })


    innerAudioContext.onPlay(function () {
      clearTimeout(timer);
      _this.timeinterval();
      console.log("开始播放音频！");
      _this.setData({
        playstatus:1
      })
      wx.hideLoading();
    });
    innerAudioContext.onStop(function () {
      _this.setData({
        playstatus: 0
      })
    });

    innerAudioContext.onTimeUpdate(function(res){
      console.log("TimeUpdate");
      console.log(innerAudioContext.currentTime);
      var audios = that.data.audiolist;
      var bg = 0,
        src = '',
        nowindex = 0;
      if(_this.data.sliding){
        return false;
      }
      for (var i = 0; i < audios.length; i++) {
        if (audios[i].playing == true) {
          console.log("正在播放第" + i + "个音频");
          
          var now = _this.totime(bg + parseInt(innerAudioContext.currentTime));

          var time1 = _this.tosecond(now),
            time2 = _this.tosecond(_this.data.endTime);
          var val = parseInt(time1 * 100 / time2);
          _this.setData({
            nowTime: now,
            cvalue:val
          });
          console.log(now);
          break;
        } else {
          bg += audios[i].time;
        }
      }
    })

    innerAudioContext.onPause(function(){
      console.log("音频被暂停！");
      _this.setData({
        playstatus:0
      })
      // clearTimeout(timer);
    });


    innerAudioContext.onError(function (res) {
      console.log(res.errMsg)
      console.log(res.errCode);

      wx.showToast({
        title: '网络出错！请稍后重试！或重启小程序重试！',
        icon:"none",
        duration:2000,
      });

      clearTimeout(timer);
    });


    innerAudioContext.onEnded(function(){
      var audios = that.data.audiolist;
      console.log("音频自然结束")
      clearTimeout(timer);

      var bg = 0,
      src = '',
      nowindex=0;
      console.log(audios)
      for (var i = 0; i < audios.length; i++) {
        if (audios[i].playing == true) {
          console.log("将要播放第" + (i+1));
          audios[i].playing = false;
          if (i >= audios.length - 1) {
            _this.setData({
              nowTime:_this.data.endTime,
              playstatus:0,
            })
            break;
          }
          audios[i + 1].playing = true;
          var now = _this.totime(bg + audios[i].time);
          _this.setData({
            nowTime: now
          })
          src = audios[i + 1].src;
          break;
        }else{
          bg += audios[i].time;
        }
      }

      that.setData({
        audiolist: audios,
      });

      console.log(src);

      if(!!src){


        console.log(innerAudioContext.src)
        innerAudioContext.src = src;
        // innerAudioContext.startTime = 0;
        innerAudioContext.play();
        // innerAudioContext.seek(0)
        // _this.timeinterval();
      }else{
        innerAudioContext.stop();
      }


    });



    // innerAudioContext.onTimeUpdate(() => {
    //   // console.log(innerAudioContext.currentTime)
    // })
    innerAudioContext.onSeeked(function(){
      // console.log(innerAudioContext.currentTime);
    });

    // innerAudioContext.onWaiting(function(){
    //   // clearTimeout(timer);
    //   // wx.showToast({
    //   //   title: '你的网络情况较差，正在加载音频，请稍候...',
    //   //   mask:true,
    //   //   duration:1000,
    //   //   icon:"none"
    //   // });
    //   wx.showLoading({
    //     title: '加载音频中',
    //   });

    //   setTimeout(function(){
    //     wx.hideLoading();
    //   },500);
    // });
    
  },
  sliderchanged:function(res){
    var obj = this.calctime(),
    audios = this.data.audiolist,
    _this = this;


    var val = res.detail.value;
    // console.log(val);

    clearTimeout(timer);

    var time1 = this.tosecond(this.data.nowTime),
      time2 = this.tosecond(this.data.endTime);
    // console.log(time1+";"+time2)

    var now = parseInt(time2 * val / 100);
    // console.log(now);

    var time = this.totime(now);

    console.log(time);

    this.setData({
      nowTime: time
    })

    obj = this.calctime();

    clearTimeout(timer);

    var tt = 0;

    for (var i = 0; i < audios.length; i++) {
      if(i==obj.index){
        audios[i].playing = true;
      }else{
        audios[i].playing = false;
      }

      if(i<obj.index){
        tt+=audios[i].time;
      }
    }

    tt = this.totime(tt);
    this.setData({
      audiolist:audios,
      // nowTime:tt
    })


    console.log(obj);

    var status = this.data.playstatus;
    if(status==0){//没播

    }else{
      
      // console.log(innerAudioContext.src)
      if (innerAudioContext.src != audios[obj.index].src){
        innerAudioContext.pause();
        innerAudioContext.src = audios[obj.index].src;
        console.log("从第" + obj.dis + "秒开始播放了")
        console.log(audios[obj.index].src);
        innerAudioContext.play();
        var o = (obj.dis - 1) > 0 ? (obj.dis - 1) : 0;
        setTimeout(function () {
          innerAudioContext.seek(obj.dis)
        }, 200);
        setTimeout(function () {
          _this.setData({
            sliding: false
          })
        }, 1000);
        
        
        console.log(obj.dis)
      }else{
        setTimeout(function () {
          _this.timeinterval();
          innerAudioContext.seek(obj.dis)
        }, 200);
        this.setData({
          sliding: false
        })
      }
      
      // innerAudioContext.startTime = obj.dis;
      
      // innerAudioContext.seek(obj.dis);
      
      // innerAudioContext.seek(obj.dis - 1)
    }
  },

  playaudio:function(){

    // var src = this.data.audiolist[0].src;

    // innerAudioContext.src = src;

    var status = this.data.playstatus == 0 ? 1 : 0;

    var sta = this.data.info.comeGo;

    if (sta == 1) {
      clearTimeout(timer);
      innerAudioContext.stop();
      this.setData({
        playstatus: 0,
      })
      wx.navigateTo({
        url: '/pages/project/live/live/live?id=' + this.data.id,
      });
      return false;
    }
    if(this.data.audiolist.length==0){
      return false;
    }


    if (this.data.downloaded >= this.data.tasklist.length||this.data.downloaderror){

    }else{
      // this.setData({
      //   autoplay:true
      // })
      // wx.showLoading({
      //   title: '加载音频中...',
      //   mask: true
      // });
      // return false;
    }



    // this.golive();

    // return false;

    // if(this.data.buystatus==0){//还未付款
    //   var info = this.data.info;
    //   wx.navigateTo({
    //     url: '/pages/project/live/pay/pay?img=' + info.live_img + "&title=" + info.live_name + "&money=" + info.payMoney + "&id=" + info.live_id,
    //   });
    //   return false;
    // }

    // if (sta == 1 && this.data.buystatus == 1){//comeGo==0往期直播；；comeGo==1进行中或即将开始的直播
    //   wx.navigateTo({
    //     url: '/pages/project/live/live/live?id='+this.data.id,
    //   });
    //   return false;
    // }

    // console.log(status);
    this.setData({
      playstatus: status
    });
    if (status == 1) {
      var obj = this.calctime(),
        list = this.data.audiolist;
      console.log(obj);

      // var tt = 0;

      for (var i = 0; i < list.length; i++) {
        if (obj.index==i){
          list[i].playing = true;
        }else{
          list[i].playing = false;
        }
      }

      //   if(i<obj.index){
      //     tt+=list[i].time
      //   }
      // }

      // tt = this.totime(tt);
      clearTimeout(timer);


      console.log("开始播放，从第" + obj.dis)
      // innerAudioContext.stop();
      // console.log(innerAudioContext.src)
      // innerAudioContext.src = list[obj.index].src;
      if (innerAudioContext.src != list[obj.index].src) {
        innerAudioContext.src = list[obj.index].src;
        console.log(list[obj.index].src);
      }
      // innerAudioContext.startTime = obj.dis;
      innerAudioContext.play();
      // innerAudioContext.seek(obj.dis)
      // obj.dis = (obj.dis).toFixed(3)

      setTimeout(function(){
        innerAudioContext.seek(obj.dis)
      }, 100);
      this.setData({
        sliding: false
      })
      console.log(obj.dis)
      // setTimeout(function(){
      //   innerAudioContext.seek((obj.dis - 1) > 0 ? (obj.dis - 1) : 0)
      // },100)
      // innerAudioContext.seek(obj.dis)
      // this.timeinterval();
      this.setData({
        audiolist:list,
        // nowTime:tt
      })

    } else {
      innerAudioContext.pause();
      clearTimeout(timer)
    }
  },

  timeinterval:function(){
    var time1 = this.tosecond(this.data.nowTime),
      time2 = this.tosecond(this.data.endTime);

      var _this = this;

    var playstatus = this.data.playstatus;

    if(playstatus==0||time1>=time2){
      clearTimeout(timer);
      this.setData({
        playstatus:0
      })
      return false;
    }

    time1+=1;

    var val = parseInt(time1 * 100/time2);

    var now = time1;

    var time = this.totime(now);

    // console.log(time);

    var _this = this;
    // console.log("setTimeout")
    timer = setTimeout(function(){
      // console.log("DoTimeout");
      clearTimeout(timer);
      _this.setData({
        // nowTime: time,
        // cvalue: val
      });
      _this.timeinterval();
    },1000);
  },

  sliderchange:function(res){
    var val = res.detail.value;
    // console.log(val);

    clearTimeout(timer);

    this.setData({
      sliding:true
    })

    var time1 = this.tosecond(this.data.nowTime),
      time2 = this.tosecond(this.data.endTime);
    // console.log(time1+";"+time2)

    var now = parseInt(time2*val/100);
    // console.log(now);

    var time = this.totime(now);

    // console.log(time);

    this.setData({
      nowTime:time
    })

  },

  tosecond:function(e){
    var arr = e.split(":");

    var time = 0;

    if(arr.length==1){
      time = Number(arr[0])
    }else if(arr.length==2){
      time = Number(arr[0]*60)+Number(arr[1]);
    } else if (arr.length == 3) {
      time = Number(arr[0] * 3600) + Number(arr[1]*60)+Number(arr[2]);
    }

    return time;
  },

  totime:function(s){
    var minute = parseInt(s/60),
    hour = parseInt(minute/60);

    minute = minute % 60 >= 10 ? minute % 60 : "0" + minute % 60;
    hour = hour % 60 >= 10 ? hour % 60 : "0" + hour % 60;
    var second = s % 60 >= 10 ? s % 60 : "0" + s % 60;

    if(hour-0>0){
      return hour+":"+minute+":"+second;
    }else{
      return minute+":"+second
    }
  },

  calctime:function(){
    var now = this.data.nowTime,
    list = this.data.audiolist,
    _this = this;

    var s = this.tosecond(now);
    console.log(s);

    var bg = 0;
    var dis = 0,
    index = 0;

    for(var i=0;i<list.length;i++){
      if (s > bg && (s <= bg + list[i].time)){
        dis = s-bg;
        index = i;
        break;
      }else{
        bg += list[i].time
      }
    }

    return {
      index:index,
      dis: dis
    }
  },

  buy:function(){
    var info = this.data.info;
    innerAudioContext.stop();
    wx.navigateTo({
      url: '/pages/project/live/pay/pay?img=' + info.live_img + "&title=" + info.live_name + "&money=" + info.payMoney + "&id=" + info.live_id,
    })
    // this.setData({
    //   buystatus:1,
    // })
  },

  golive:function(){

    var comeGo = this.data.info.comeGo;
    console.log(comeGo);
    if(comeGo==0){

      clearTimeout(timer);
      innerAudioContext.stop();
      this.setData({
        playstatus: 0,
      })
      wx.navigateTo({
        url: '/pages/project/live/lived/live?id=' + this.data.id,
      })
    }else{

      clearTimeout(timer);
      innerAudioContext.stop();
      this.setData({
        playstatus: 0,
      })
      wx.navigateTo({
        url: '/pages/project/live/live/live?id=' + this.data.id,
      })
    }
    return false;
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
    var id = this.data.id; 
    var userid = wx.getStorageSync("userid");
    this.setData({
      userid: userid,
      list:[]
    })
    this.loadlist();
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // clearTimeout(timer);
    // innerAudioContext.stop();
    // this.setData({
    //   playstatus:0,
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(timer);
    innerAudioContext.stop();
    // innerAudioContext.destroy();
    this.setData({
      playstatus: 0,
    })
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
    console.log(this.data.id)
    return {
      title: this.data.info.live_name,
      imageUrl: this.data.info.shareImg || this.data.info.live_audioImg || '/imgs/share.jpg',
      path: '/pages/project/live/liveinfo/liveinfo?id=' + this.data.id
    }
  },
  gopro: function () {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '/pages/project/prodetail/prodetail',
    });
    return false;
    wx.setEnableDebug({
      enableDebug: true,
      success:function(){
        wx.navigateTo({
          url: '/pages/project/prodetail/prodetail',
        })
      }
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

  },

  loadlist: function () {

    var _this = this;
    var id = this.data.id;
    var userid = wx.getStorageSync("userid");

    if(!userid){
      wx.showLoading({
        title: '加载用户信息',
        mask:true,
      });

      setTimeout(function(){
        _this.loadlist();
      },1000);
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

        if(dt.length>0) list = list.concat(dt);
        console.log(list);

        _this.setData({
          hasMore: hasMore,
          list: list||[],
          loading: false,
        });

        var st = data.live.payMoney > 0 ? data.live.payStatus : 1;
        if(!_this.data.share_img){
          _this.loadcode();
          
        }
        innerAudioContext.title = data.live.live_name;
        innerAudioContext.epname = '农资大讲堂';
        innerAudioContext.singer = data.live.cr_userName;
        innerAudioContext.coverImgUrl = 'http://www.meitiannongzi.com/nongjike/audios/logo_l.png'
        _this.setData({
          info: data.live,
          buystatus: st
        })
        if (!!data.live.video){
          wx.redirectTo({
            url: '/pages/project/video/video?id=' + data.live.live_id,
          })
        }
      }
    })
  },

  loadcode: function () {
    var that = this;
    wx.request({
      url: host + 'findCodeUrl',
      data: {
        path: "pages/project/live/liveinfo/liveinfo?id="+this.data.id
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
                  that.draw(imgs.code,imgs.big)
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

  draw: function (qrcode,bigimg) {
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

    var title = this.data.info.live_brief||this.data.info.live_name,
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
  toggleShow:function(e){
    console.log("change");
    var sta = '';
    if(e.currentTarget.dataset.c==1){
      sta = 1;
    }else{
      sta = 2;
    }

    this.setData({
      navStatus:sta
    })
  },
  togglecomment: function () {
    var _this = this;
    this.setData({
      showcomment: !_this.data.showcomment,
      comment:'',
    });
  },

  gocomment:function(e){
    this.togglecomment();
    console.log(e);
    if (e.currentTarget.dataset.uname){
      this.setData({
        holder: "回复："+e.currentTarget.dataset.uname
      })
    }else{
      this.setData({
        holder: ''
      })
    }

    if(e.currentTarget.dataset.index>=0){
      var index = e.currentTarget.dataset.index,
      crt = JSON.parse(JSON.stringify(this.data.list[index]));
      console.log(crt);
      this.setData({
        crt:crt,
        subcal:{}
      })
    }else{
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
        icon:"none",
        duration:2000
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

    if (!this.data.crt.record_id){
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
    }else{
      wx.request({
        url: host + 'saveCritical',
        data: {
          cal_message: txt,
          userId: wx.getStorageSync("userid"),
          cal_recordId: this.data.crt.record_id,
          calId: this.data.subcal.cal_id||""
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
  subcomment:function(e){
    var father = JSON.parse(JSON.stringify(this.data.list[e.currentTarget.dataset.index])),
      current = JSON.parse(JSON.stringify(father.calList[e.currentTarget.dataset.cindex]));

    console.log(current);

    this.togglecomment();
    this.setData({
      
    })
    this.setData({
      holder: "回复：" + current.userName,
      crt: father,
      subcal:current
    })
  },
  cliskseeall:function(e){
    var id = e.currentTarget.dataset.id;
    var see = this.data.seeall;
    see[id] = true;

    this.setData({
      seeall:see,
    });

    console.log(this.data.seeall);
  }
})