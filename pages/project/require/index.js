// pages/project/require/index.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid:'',
    name:'',
    phone:'',
    cname:'',
    info:'',
  },

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },


  iptname:function(e){
    var val = e.detail.value;

    this.setData({
      name:val
    })
  },

  iptphone:function(e){
    var val = e.detail.value;

    this.setData({
      phone: val
    })
  },

  iptcname: function (e) {
    var val = e.detail.value;

    this.setData({
      cname: val
    })
  },

  iptinfo: function (e) {
    var val = e.detail.value;

    this.setData({
      info: val
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userid = wx.getStorageSync("userid");

    this.setData({
      userid:userid,
    })
  },

  send:function(){
    var name = this.data.name,
    phone = this.data.phone,
    cname = this.data.cname,
    info = this.data.info,
    reg = /^1\d{10}$/;

    if(!name){
      wx.showToast({
        title: '请填写你的姓名！',
        mask:"true",
        duration:1500,
        icon:"none",
      });
      return false;
    }
    if (!reg.test(phone)) {
      wx.showToast({
        title: '请填写11位数字的手机号码！',
        mask: "true",
        duration: 1500,
        icon: "none",
      });
      return false;
    }
    if (!cname) {
      wx.showToast({
        title: '请填写你的课程名称！',
        mask: "true",
        duration: 1500,
        icon: "none",
      });
      return false;
    }

    wx.request({
      url: host + 'proposSave',
      method:"POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data:{
        propos_userId:this.data.userid,
        propos_userName: name,
        propos_userPhone:phone,
        propos_title: cname,
        propos_text:info
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        if(data.code==2){
          wx.showToast({
            title: '提交申请失败！'+data.message,
            icon: "none",
            mask: "true",
            duration: 2000,
          });
          return false;
        }

        wx.showToast({
          title: '申请成功！我们将会尽快联系你，请保持手机畅通！',
          icon:"none",
          mask:"true",
          duration: 3000,
        });

        setTimeout(function(){
          wx.navigateBack({
            delta:1
          });
        },3500);
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
  // onShareAppMessage: function () {
  
  // }
})