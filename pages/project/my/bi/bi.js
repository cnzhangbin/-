// pages/project/my/bi/bi.js
const app = getApp()

const host = app.globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    txt:'',
    btype:0,
    sending:false,
  },

  ipt:function(e){
    var val = e.detail.value;

    this.setData({
      txt:val
    })
  },
  select:function(e){
    var id = e.currentTarget.dataset.id;
    this.setData({
      btype:id
    })
  },

  sendmsg:function(){

    var txt = this.data.txt,
    userinfo = wx.getStorageSync("user_info");

    console.log(userinfo);


    if(!txt){
      wx.showToast({
        title: '请输入反馈内容！',
        icon:"none",
        duration:2000
      });
      return false;
    }

    if(this.data.sending){
      return false;
    }

    wx.showLoading({
      title: '提交中...',
      mask:true
    })

    this.setData({
      sending:true
    })

    var _this = this;
    wx.request({
      url: host + 'saveOpinion',
      method:"POST",
      header:{
        "content-type":"application/x-www-form-urlencoded"
      },
      data:{
        userImg: userinfo.cr_userImg,
        opinionType: this.data.btype == 0 ? "咨询" : this.data.btype == 1 ?"建议": this.data.btype ==2 ?"意见":"其他" ,
        opinionText: txt,
        userName: userinfo.cr_userName,
        openId:wx.getStorageSync("openid")
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        wx.hideLoading();

        if(data.code==1){
          wx.showToast({
            title: '提交成功！',
            duration:2000
          })
          _this.setData({
            txt: '',
            sending: false,
          });
        }else{
          wx.showToast({
            title: '提交失败！',
            duration: 2000,
            icon: "none"
          })
          _this.setData({
            sending: false,
          });
        }

      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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