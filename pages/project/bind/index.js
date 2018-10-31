// pages/project/bind/index.js
const host = getApp().globalData.host;
var util = require('../../utils/md5.js');

var mddd = function (t1, t2) {
  var t = util.hexMD5(t2);
  var md5 = util.hexMD5(t + t1);
  return md5;
};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    yzm:'',
    second:'',
    canISend: true,
    showlogin: false,
    clickable:false,
    userid:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userinfo = wx.getStorageSync("userinfo");

    var unionid = wx.getStorageSync("unionid");

    var userid = wx.getStorageSync("userid");

    this.setData({
      userinfo:userinfo,
      unionid:unionid,
      userid : userid
    })

    if(!unionid){
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log(res);
          wx.request({
            url: host + 'login',
            data: {
              code: res.code
            },
            success: function (res) {
              console.log(res.data.data.cr_openId);
              if (res.data.code == 2) {
                wx.showToast({
                  title: res.data.message,
                  icon: "none",
                  duration: 1500,
                });
                return false;
              }
              if (!!res.data.data.cr_openId) {
                wx.setStorageSync("openid", res.data.data.cr_openId);
              } else {
                wx.showToast({
                  title: '获取openId失败！',
                  icon: "none",
                  duration: 1500,
                })
              }

              if (!!res.data.data.cr_unionid) {
                wx.setStorageSync("unionid", res.data.data.cr_unionid);
              }else{
                wx.showModal({
                  title: '提示',
                  content: '未获取到绑定的凭证UNIONID，请关注“每天农资”公众号后重试！',
                })
              }

              if (!!res.data.data.cr_userid) {
                wx.setStorageSync("userid", res.data.data.cr_userid);
              }
            }
          })
        }
      })
    }

    if(!userinfo){
      this.setData({
        showlogin: true
      })
    }
  },
  iptphone:function(e){
    // console.log(e);
    var val = e.detail.value;
    this.setData({
      phone:val.trim()
    })

    var reg = /^1\d{10}$/;
    if (reg.test(this.data.phone) && !!this.data.yzm) {
      this.setData({
        clickable: true
      })
    }else{
      this.setData({
        clickable: false
      })
    }
  },

  iptyzm: function (e) {
    // console.log(e);
    var val = e.detail.value;
    this.setData({
      yzm: val.trim()
    })

    var reg = /^1\d{10}$/;
    if (reg.test(this.data.phone)&&!!this.data.yzm) {
      this.setData({
        clickable:true
      })
    } else {
      this.setData({
        clickable: false
      })
    }

  },

  sendyzm:function(){
    var second = this.data.second,
    _this = this,
    that = this;
    if(!this.data.canISend){
      return false;
    }

    console.log(this.data.phone)

    var reg = /^1\d{10}$/;
    if(!reg.test(this.data.phone)){
      wx.showToast({
        title: '请填写11位数字的手机号',
        icon:"none",
        mask:true,
        duration:1500
      });
      return false;
    }
    // wx.request({
    //   url: host + '',
    //   data:{

    //   }
    // })
    second = 60;
    this.setData({
      canISend:false,
      second: 60
    })
    var timer = setInterval(function(){

      if(_this.data.second==0){
        clearInterval(timer);
        _this.setData({
          canISend:true,
          second:0
        })
        return false;
      }
      second-=1;
      _this.setData({
        canISend: false,
        second: second
      })

    },1000);


    var md51 = "asdas-asdaskjslfklsasdf-dklfgkdjsgjdfljgldf-asdjaksldjaslkdas-dsfsfasd"

    var md52 = "asdas-asdaskjslfklsasdf-dklfgkdjsgjdfljgldf"
    var md53 = "dklfgkdjsgjdfljgldf-asdjaksldjaslkdas-dsfsfasd"
    var md54 = "dklfgkdjsgjdfljgldf-asdas-asdaskjslfklsasdf"

    var md55 = "asdas-asdaskjslfklsasdf-sfsdfks=asdjaks=sadas-asdjaksldjaslkdas-dsfsfasd";

    var tel = mddd(this.data.phone, md52)
    var tels = mddd(this.data.phone, md53)
    var tls = mddd(this.data.phone, md51)
    var lop = mddd(this.data.phone, md54)

    wx.request({
      url:  'http://m.nongjike.cn/NJK/app/findeSendS',
      data: {
        "tel": tel,
        "tels": tels,
        "tls": tls,
        "lop": lop,
        "poi": this.data.phone
      },
      success: function (res) {
        var data = res.data;

        var md52 = "asdas-asdaskjslfklsasdf-dklfgkdjsgjdfljgldf"
        var md53 = "dklfgkdjsgjdfljgldf-asdjaksldjaslkdas-dsfsfasd"
        var md54 = "dklfgkdjsgjdfljgldf-asdas-asdaskjslfklsasdf"

        console.log(that.data.phone);
        var api = "verification";
        var tel = mddd(that.data.phone, md55)
        var tels = mddd(that.data.phone, md52)
        var tls = mddd(that.data.phone, md53)
        var lop = mddd(that.data.phone, md54)

        wx.request({
          url:  'http://m.nongjike.cn/NJK/app/verification',
          data: {
            "tel": tel,
            "tels": tels,
            "tls": tls,
            "lop": lop,
            "USERNAME": that.data.phone
          },
          success: function (r) {
            var data = r.data;
            console.log(data);

            if (data.status == 1 || data.status == 2 || data.status == 5) {
              wx.showToast({
                title: data.message,
                icon: "none",
                duration: 2000,
              });
              return false;
            } else if (data.object.YZM == -1) {
              wx.showToast({
                title: "验证码发送失败！请检查手机号是否错误！",
                icon: "none",
                duration: 2000,
              });
              return false;
            }


            that.setData({
              sended: true,
            });

            wx.showToast({
              title: '验证码已发送！',
              duration: 1500
            });

          }
        })
      }
    });

  },

  bind:function(){
    if(!this.data.clickable){
      return false;
    }
    var phone = this.data.phone,
    yzm = this.data.yzm;

    var userinfo = this.data.userinfo;

    if (!userinfo){
      console.log(userinfo);
      this.setData({
        showlogin:true,
      });
      return false;
    }

    wx.request({
      url: host + 'bindNJK',
      method:"POST",
      header:{
        "content-type": "application/x-www-form-urlencoded"
      },
      data:{
        yzm:yzm,
        phone: phone,
        cr_userid: wx.getStorageSync("userid"),
        passWord:123456,
        nickname: userinfo.nickName,
        openid:wx.getStorageSync("openid"),
        unionid: wx.getStorageSync("unionid"),
        sex:userinfo.gender,
        headImageUrl: userinfo.avatarUrl,
        city: userinfo.city
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        if(data.code==2){
          wx.showToast({
            title: '绑定失败！'+data.message,
            icon:"none",
            mask:"true",
            duration: 2000,
          });
          return false;
        }else{
          wx.showToast({
            title: '绑定成功！',
            icon: "none",
            mask: "true",
            duration: 2000,
          });
          wx.setStorageSync("njk", data.data);
          return false;
        }
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
  
  // },

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
      wx.setStorageSync("userinfo", detail.userInfo)
      this.setData({
        userinfo: detail.userInfo
      })
      wx.request({
        url: host + 'getUserInfo',
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: {
          openid: wx.getStorageSync("openid"),
          iv: detail.iv,
          encryptedData: detail.encryptedData
        },
        success: function (e) {
          console.log(e)
          // var dt = e.data;
          // var userinfo = that.data.userinfo;
          // userinfo.img = detail.userInfo.avatarUrl;
          // userinfo.name = detail.userInfo.nickName;
          // wx.setStorageSync("userinfo", userinfo);
          // that.setData({
          //   userinfo: userinfo
          // })
          // if (dt.code == 1) {

          // }
        }
      })
    }
  },

  cancel: function () {
    this.setData({
      showlogin: false
    })
  },

  returnindex:function(){
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  }
})