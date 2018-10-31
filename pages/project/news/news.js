// pages/project/news/news.js
var host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore:true,
    list:[],
    page:1,
    loading:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadlist();
  },


  returnindex: function () {
    wx.redirectTo({
      url: '/pages/project/index/index',
    })
  },
  detail:function(e){

    var id = e.currentTarget.dataset.id,
    index = e.currentTarget.dataset.index;
    this.data.list[index].counts = 1;
    this.setData({
      list:this.data.list
    })
    wx.navigateTo({
      url: '/pages/project/news/detail/detail?id='+id,
    })
  },

  loadmore:function(){
    if(this.data.loading == true||!this.data.hasMore){
      return false;
    }

    var page = this.data.page;
    page+=1;
    this.setData({
      page:page
    });

    this.loadlist();

  },

  loadlist:function(){

    var _this = this;

    var list = _this.data.list,
    hasMore = this.data.hasMore;

    this.setData({
      loading:true,
    })

    wx.request({
      url: host + 'findZixunList',
      data:{
        pageNum:this.data.page,
        userId: wx.getStorageSync("userid")
      },
      success:function(res){
        var data = res.data;

        data = data.data;
        console.log(data);

        if(data.length<5){
          hasMore = false;
        }else{
          hasMore = true;
        }
        
        list = list.concat(data);
        console.log(list);

        _this.setData({
          hasMore:hasMore,
          list:list,
          loading:false,
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
  // onShareAppMessage: function () {
  
  // }
})