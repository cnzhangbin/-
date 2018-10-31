// pages/project/live/pay/pay.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img:'',
    title:'',
    money:'',
    id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      img:options.img,
      title:options.title,
      money: options.money,
      id: options.id,
      openid:wx.getStorageSync("openid"),
      userid:wx.getStorageSync("userid")
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

  buy:function(){



    wx.request({
      url: host + 'payLive',
      data: {
        money: 0.01,//this.data.money,
        openid: this.data.openid,
        userId:this.data.userid,
        liveId: this.data.id
      },
      success: function (res) {

        var data = res.data;
        data = JSON.parse(data);
        console.log(data);

        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: data.signType,
          paySign: data.sign,
          success: function (res) {
            wx.showToast({
              title: '支付成功！',
              mask:"true",
              duration:2000,
            })
            console.log(res);
            _this.setData({
              canIChou: true,
              canClick: true,
            })

          },
          fail: function (res) {
            console.log(res)
          },
          complete: function (res) {
            console.log(res);
          }
        })
      }
    })
    // wx.showToast({
    //   title: '购买成功！',
    //   mask:true,
    //   duration:2000,
    //   icon:"none"
    // });
    // setTimeout(function(){
    //   wx.navigateBack({
    //     delta:1
    //   })
    // },2000);
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