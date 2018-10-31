// pages/balance/recharge/recharge.js
const app = getApp()

const host = app.globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '',
    user: {},
    list: [],
  },

  iptMoney: function (e) {
    var val = e.detail.value;
    if (val > 100) {
      val = 100;
    }

    this.setData({
      money: val
    })
  },

  tixian: function () {
    var _this = this;
    if (this.data.money - 2 < 0 || this.data.money - 100 > 0) {
      wx.showToast({
        title: '提现金额不能低于2，不能高于100，每次提现扣除￥2手续费',
        icon: "none",
        duration: 1500,
      });
      return false;
    }
    if (this.data.money - this.data.user.cr_userBalance > 0) {
      wx.showToast({
        title: '提现金额不能高于余额，每次提现扣除￥2手续费',
        icon: "none",
        duration: 1500,
      });
      return false;
    }
    var money = this.data.money;
    money = parseFloat(money).toFixed(2);
    wx.request({
      url: host + 'saveTiXian',
      data: {
        openid: wx.getStorageSync("openid"),
        money: money
      },
      success: function (res) {
        var data = res.data;
        console.log(data);

        if (data.code == 2) {
          wx.showToast({
            title: '提现失败！' + data.message,
            icon: "none",
            duration: 1500,
          });
          return false;
        } else {
          wx.showToast({
            title: '提现成功！',
            duration: 1500,
          });
          _this.loaduser();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loaduser();
  },

  loaduser: function () {
    var _this = this;
    wx.request({
      url: host + 'findUserByCondition',
      data: {
        userId: wx.getStorageSync("userid")
      },
      success: function (res) {
        var data = res.data;

        _this.setData({
          user: data.data
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
})