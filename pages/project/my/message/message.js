// pages/project/my/message/message.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    hasMore: true,
    page: 1,
    loading: false,

    holder: "",
    crt: {},
    showcomment: false,
    sending: false,
    comment: '',
  },
  iptcomment: function (e) {
    var txt = e.detail.value;
    console.log(txt);

    this.setData({
      comment: txt,
    })
  },
  togglecomment: function () {
    var _this = this;
    this.setData({
      showcomment: !_this.data.showcomment,
      comment: '',
    });
  },
  recomment:function(e){
    var index = e.currentTarget.dataset.index,
    cobj = this.data.list[index];

    this.setData({
      holder: "回复：" + cobj.userName,
      crt: cobj
    });
    this.togglecomment();
  },
  todetail:function(e){
    var id = e.currentTarget.dataset.id,
    typeid = e.currentTarget.dataset.typeid;
    if (typeid == 5 || typeid == 4) {
      wx.navigateTo({
        url: '/pages/project/video/video?id=' + id,
      });
    }else{
      wx.navigateTo({
        url: '/pages/project/live/liveinfo/liveinfo?id=' + id,
      })
    }
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
      url: host + 'findCriListByUser',
      data: {
        userId: wx.getStorageSync("userid"),
        pageNum:this.data.page
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

        var dt = data.data;
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

      }
    })
  },
  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
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
    wx.request({
      url: host + 'saveCritical',
      data: {
        cal_message: txt,
        userId: wx.getStorageSync("userid"),
        cal_recordId: this.data.crt.cal_recordId,
        calId: this.data.crt.cal_id || ""
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
            title: '回复成功！',
            duration: 2000,
          });


          _this.setData({
            sending: false,
          });


          setTimeout(function () {
            _this.togglecomment();
          }, 500);
        }
      }
    })

    return false;


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadlist();
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