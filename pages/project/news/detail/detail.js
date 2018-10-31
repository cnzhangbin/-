// pages/project/news/detail/detail.js
var host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id);
    var _this = this;
    wx.request({
      url: host + 'findZixunOne',
      data:{
        zixun_id:options.id,
        user_id:wx.getStorageSync("userid")
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        _this.setData({
          news:data.data
        })
      }
    })
  },

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
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
  // onShareAppMessage: function () {
  
  // }
})