// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    
  },

  //处理在线对战页面跳转
  handleZX: function(e) {
    wx.navigateTo({
        url: '../login/login'        
    })
  },

  //处理人人对战页面跳转
  handleRR: function(e) {
    wx.navigateTo({
        url: '../gameRR/gameRR'   
    })
  },

  //处理人机对战页面跳转
  handleRJ: function(e) {
    wx.navigateTo({
        url: '../gameRJ/gameRJ'    
    })
  }
})
