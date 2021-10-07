// pages/roomlist/roomlist.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
var app = getApp()
Page({
    
    /**
     * 页面的初始数据
     */
    data: {
        createUuid:"",
        uuidList:[
          12333,
          11111,
          "111sss",
          "ass"
        ],
        inputUuid:"",
        show:false,
        curPage:1,
        maxPage:10
    },
    //创建对局
    createGame: function (e) {
        var token = app.globalData.token
        var that = this
        wx.request({
          url: 'http://172.17.173.97:9000/api/game',
          header: {
            "Authorization":token,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "post",
          success(res) {
            const status = res.data.code
            //console.log(status)
            if (status == 200) {
                //成功创建对局，获取uuid
                var uid = res.data.data.uuid
                console.log(uid)
                that.setData({
                    createUuid: uid
                })
                //跳转到对局界面
                /////
                
            }
            else {
                console.log("创建失败")
            }
          }
        })
    },
    //搜索对局
    //显示对话框
    showDailog: function(e) {
      this.setData({show:true})
    },
    //关闭对话框
    onClose: function() {
      this.setData({
        show:false,
        inputUuid:""
      })
    },
    //输入uuid
    inputUid: function(e) {
      //console.log(e)
      this.setData({
        inputUuid:e.detail.value
      })
    },
    //加入到对局，uuid为inputUuid
    onConfirm: function(e) {
      var uuid = this.data.inputUuid
      //console.log(uuid)
      /////进行页面跳转。。。
    },
    //加入到对局，list的
    joinGame: function(e) {
        var uuid = e.currentTarget.dataset.uuid
        //console.log(uuid)
        //跳转到对面界面
    },
    //获取对局列表 传入一个对象page{"size": "num":}
    getList:function(page) {
      var that = this
      var token = app.globalData.token
      wx.request({
        url: 'http://172.17.173.97:9000/api/game/index',
        header: {
          "Authorization":token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "get",
        data: {
          "page_size": page.size,
          "page_num": page.num
        },
        success(res) {
          var resData = res.data
          if (res.data.code == 200) {
            var list = []
            console.log(resData.data.games)
            for (var index in resData.data.games) {
              list.push(resData.data.games[index].uuid)
            }
            that.setData({
              curPage: page.num,
              maxPage: resData.data.total_page_num,
              uuidList: list
            })
          }
          else {
            console.log("获取对局列表失败")
          }
        }
      })
    },
    //上一页
    goPrev: function() {
      var that = this
      if (that.data.curPage === 1) {
        return
      }
      var now = that.data.curPage - 1
      console.log({"size":4, "num":now})
      this.getList({"size":4, "num":now})
      
    },

    //下一页
    goNext: function() {
      var that = this
      if (that.data.curPage === that.data.maxPage) {
        return
      }
      var now = that.data.curPage + 1
      console.log({"size":4, "num":now})
      this.getList({"size":4, "num":now})
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getList({"size":4, "num":1})
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
    onShareAppMessage: function () {

    }
})