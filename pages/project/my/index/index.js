// pages/project/my/index/index.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    living:{},
  },

  bibi:function(){
    wx.navigateTo({
      url: '/pages/project/my/bi/bi',
    });
  },

  msg:function(){
    wx.navigateTo({
      url: '/pages/project/my/message/message',
    });
  },

  recharge:function(){

    // wx.setEnableDebug({
    //   enableDebug: true,
    //   success: function () {
    //     wx.navigateTo({
    //       url: '/pages/project/focus/focus',
    //     })
    //   }
    // })

    // return false;
    var balance = this.data.info.cr_userBalance;
    wx.showToast({
      title: '提现功能正在紧急完善中！敬请期待！',
      mask:true,
      duration:2000,
      icon:"none"
    })
    return false;
    if(balance==0){
      wx.navigateTo({
        url: '/pages/project/my/recharge/recharge',
      });
    }else{
      wx.showToast({
        title: '没有可提现余额！',
        mask:true,
        duration:1000,
        icon:"none"
      });
      return false;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var info = wx.getStorageSync("user_info");
    // this.setData({
    //   info:info
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  buylist:function(){
    wx.navigateTo({
      url: '/pages/project/history/buyhistory/index',
    })
  },

  listenlist:function(){
    wx.navigateTo({
      url: '/pages/project/history/listenhistory/index',
    })
  },

  bind: function () {
    var njk = wx.getStorageSync('njk');
    if (!!njk && !!njk.USER_ID){
      wx.showToast({
        title: '你已经绑定了农极客账号！',
        icon:"none",
        maxk:true,
        duration:1500
      });
      return false;
    }
    wx.navigateTo({
      url: '/pages/project/bind/index',
    })
  },



  teacher: function () {
    wx.navigateTo({
      url: '/pages/project/require/index',
    })
  },



  golive: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/project/live/teacher/teacher?id='+id,
    })
  },

  index:function(){
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // wx.setEnableDebug({
    //   enableDebug: false
    // })
    var _this = this;
    wx.request({
      url: host + 'findUserByCondition',
      data:{
        userId:wx.getStorageSync("userid")
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        _this.setData({
          info:data.data
        })
      }
    });

    wx.request({
      url: host + 'findUserliveList',
      data: {
        userId: wx.getStorageSync("userid")
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        _this.setData({
          living: data.data
        })
      }
    })
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
  // onShareAppMessage: function () {
  
  // }
})