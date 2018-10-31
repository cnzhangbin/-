// pages/project/search/search.js
const host = getApp().globalData.host;
var timer = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchtxt:'',
    inputing:false,
    nodes:"",
    searchList:[],
    keylist:[],
    hot:[],
  },
  easy:function(e){
    var key = e.currentTarget.dataset.key;
    this.setData({
      searchtxt:key
    });
    this.searchResult();
  },

  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },

  ipt:function(e){
    var val = e.detail.value;
    this.setData({
      searchtxt:val,
      inputing:true,
    });
    var _this = this;
    if(val.length<=0){
      this.setData({
        searchList:[]
      });
      clearTimeout(timer);
      return false;
    }
    clearTimeout(timer);
    timer = setTimeout(function(){
      _this.searchResult();
    },800);
  },
  cancelipt:function(){
    this.setData({
      searchtxt: '',
      searchList:[]
    })
  },
  detial:function(e){
    var id = e.currentTarget.dataset.id,
    typeid=e.currentTarget.dataset.typeid;
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
  searchResult:function(){
    console.log("SearchResult");
    wx.showLoading({
      title: '搜索中...',
      mask:true
    })
    var key = this.data.searchtxt,
    _this = this;

    var keys = wx.getStorageSync("keylist")||[],
    has = false;
    for(var k=0;k<keys.length;k++){
      if(keys[k]==key){
        has = true;
        break;
      }
    }
    if(!has){
      keys.unshift(key);
      wx.setStorageSync("keylist", keys);
    }
    
    this.setData({
      keylist:keys
    });
    wx.request({
      method:"POST",
      header:{
        "content-type": "application/x-www-form-urlencoded"
      },
      url: host +'searchLive',
      data:{
        searchKey: key
      },
      success:function(res){
        var data = res.data;
        wx.hideLoading();
        console.log(data);
        if(data.code==1){
          for (var i= 0;i < data.data.length;i++){
            var c = data.data[i];
            var str = c.live_name;
            var word = key;
            str = str.replace(new RegExp("(" + word + ")", "ig"), "<strong class='strong'>" + word + "</strong>");
            str = "<div class='rich'>" + str + "</div>";
            c.live_name = str;
          }
          _this.setData({
            searchList: data.data
          })

        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var keylist = wx.getStorageSync("keylist"),
    _this = this;

    this.setData({
      keylist: keylist||[]
    });

    wx.request({
      url: host +'hotTop',
      data:{
        showCount :10
      },
      success:function(res){
        var data = res.data;
        console.log(data);
        _this.setData({
          hot:data.data
        })
      }
    })

  },
  deletehistory:function(){
    this.setData({
      keylist:[]
    });
    wx.setStorageSync("keylist", []);
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