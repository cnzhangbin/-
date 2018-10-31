//app.js
var debug = false;
App({
  onLaunch: function () {
    // 展示本地存储能力
    wx.removeStorageSync("downAudios");

    wx.setStorageSync("downAudios", {});
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    var host = this.globalData.host;

    wx.setStorageSync("showbg", true);

    var local = wx.getStorageSync("localaudio");
    if(!local){
      wx.setStorageSync('localaudio', {});
    }

    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

    // wx.setClipboardData({
    //   data:"hahahahhahaha"
    // })


    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res);
        wx.request({
          url: host + 'login',
          method:"GET",
          data: {
            code: res.code
          },
          success: function (res) {
            if(res.data.code==2){
              wx.showToast({
                title: "登录失败（login）！"+res.data.message,
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

            if (!!res.data.data.cr_unionid){
              wx.setStorageSync("unionid", res.data.data.cr_unionid);
            } else {
              wx.showToast({
                title: '获取unionId失败！请关注“每天农资”公众号后重试！',
                icon: "none",
                duration: 1500,
              })
            }
            if (!!res.data.data.cr_userid) {
              wx.setStorageSync("userid", res.data.data.cr_userid);
              wx.setStorageSync("user_info", res.data.data)
            }

            if (!!res.data.data.pageData){
              wx.setStorageSync("njk", res.data.data.pageData);
            }
          }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              console.log(res.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  globalData: {
    userInfo: null,
    host: debug ? "https://hitman.net.cn/NJK/app/classRoom/" : "https://m.nongjike.cn/NJK/app/classRoom/",
    socket: debug ? "wss://www.nongjike.net/websocket" : "wss://www.nongjike.net/websocket"
  },
  nowTime:function(){
    var now = new Date();
    now.getDate();
    var month = now.getMonth() + 1 >= 10 ? now.getMonth() + 1 : "0" + (now.getMonth() + 1),
    year = now.getFullYear(),
      day = now.getDate() >= 10 ? now.getDate() : "0" + now.getDate(),
      hour = now.getHours() >= 10 ? now.getHours() : "0" + now.getHours(),
      minute = now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes();
    var time = year+"-"+month+"-"+day+" "+hour+":"+minute;
    return time;
  }
})