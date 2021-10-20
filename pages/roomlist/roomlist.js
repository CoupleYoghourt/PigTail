// pages/roomlist/roomlist.js

const app = getApp();

Page({
    data: {
        createUuid:"",
        uuidList:[
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse"
        ],
        curPage:1,
        maxPage:10,

        token:""
    },

    onLoad: function (options) {
      this.setData({
        token: options.token
      })
      this.getList({"size":4, "num":1});
      //console.log(this.data.token);
    },

    //创建对局 并 加入对局
    createGame: function (e) {
        //let token = app.globalData.token
        let token = this.data.token;
        let that = this;
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
            if (status === 200) {
                //成功创建对局，获取uuid
                var uuid = res.data.data.uuid
                console.log("创建的对局uuid为："+uuid)
                that.setData({
                    createUuid: uuid
                })
                wx.navigateTo({
                  url: '../gameZX/gameZX?uuid=' + uuid +'&token=' + token       
                })            
            }
            else {
                console.log("创建失败")
                wx.showModal({
                  title: '提示',
                  content: '创建对局失败',
                  showCancel: false,
                })
            }
          }
        })
    },
    
    //点击 搜索对局 框后，显示弹出框
    showDailog: function(e) {
      let that = this;
      wx.showModal({  
        title: '正在加入对局',  
        editable: true,
        placeholderText: "请输入对局uuid...",
        success: function(res) {  
            if (res.confirm) {  
              let token = that.data.token;
              let uuid = res.content;
              console.log(uuid);
              that.sendJoinRequest(token,uuid);    //用户点确定加入对局后，发送请求
            }
            else if (res.cancel) {  
              console.log('用户点击取消')  
            }  
        }  
      })
    },

    //对局列表中的 加入对局 按钮
    joinGame: function(e) {
      let token = this.data.token;
      let uuid = e.currentTarget.dataset.uuid;
      this.sendJoinRequest(token, uuid);
    },

    //发送加入对局请求，并进行页面跳转
    sendJoinRequest: function(token, uuid){
      let that = this;
      wx.request({
        url: 'http://172.17.173.97:9000/api/game/' + uuid,
        header: {
          "Authorization":token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "post",

        success(res) {
          const status = res.data.code;
          console.log(res.data)
          console.log(status)
          if (status === 200) {
            console.log("加入对局成功！！！");  
            wx.navigateTo({
              url: '../gameZX/gameZX?uuid=' + uuid +'&token=' + token     
            }) 
          }  
          else{
            console.log("加入对局失败！！！");
            wx.showModal({
              title: '提示',
              content: '加入房间失败，可能由于uuid错误或网络延迟...',
              showCancel: false,
            })
          }
        }
      })
    },

    //获取对局列表 传入一个对象page{"size": "num":}
    getList:function(page) {
      var that = this;
      let token = this.data.token;
      //console.log(token);
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
            console.log("获取对局列表失败");
            wx.showModal({
              title: '提示',
              content: '获取对局列表失败',
              showCancel: false,
            })
          }
        }
      })
    },

    //上一页 按钮
    goPrev: function() {
      var that = this
      if (that.data.curPage === 1) {
        return
      }
      var now = that.data.curPage - 1
      console.log({"size":4, "num":now})
      this.getList({"size":4, "num":now})
      
    },

    //下一页 按钮
    goNext: function() {
      var that = this
      if (that.data.curPage === that.data.maxPage) {
        return
      }
      var now = that.data.curPage + 1
      console.log({"size":4, "num":now})
      this.getList({"size":4, "num":now})
    },
})