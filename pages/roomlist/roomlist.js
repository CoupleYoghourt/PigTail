// pages/roomlist/roomlist.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const app = getApp()

Page({
    data: {
        createUuid:"",
        uuidList:[
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse",
          "wu1yrmnbb1hsstse"
        ],
        inputUuid:"",
        show:false,
        curPage:1,
        maxPage:10,

        token:""
    },

    onLoad: function (options) {
      this.getList({"size":4, "num":1});
      this.setData({
        token: options.token
      })
    },

    //创建对局 并 加入对局
    createGame: function (e) {
        let token = app.globalData.token
        //let token = this.data.token
        let that = this
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
                //that.joinMyGame(uuid);
                                                          //跳转到对局界面
                wx.navigateTo({
                  url: '../gameZX/gameZX?uuid=' + uuid +'&token=' + token       
                })            
            }
            else {
                console.log("创建失败")
            }
          }
        })
    },

    joinMyGame: function(uuid) {
      let token = app.globalData.token;
      wx.request({
        url: 'http://172.17.173.97:9000/api/game/:' + uuid,
        header: {
          "Authorization":token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "post",

        success(res) {
          const status = res.data.code
          //console.log(status)
          if (status === 200) {
              console.log("加入对局成功！！！")
          }
          console.log(res.data)
          console.log("加入对局失败！！！")
        }
      })
    },

    /* 搜索对局 */
    //显示搜索框
    showDailog: function(e) {
      this.setData({show:true})
    },

    //关闭搜索框
    onClose: function() {
      this.setData({
        show:false,
        inputUuid:""
      })
    },

    //搜索框的 输入uuid
    inputUid: function(e) {
      //console.log(e)
      this.setData({
        inputUuid:e.detail.value
      })
    },

    //搜索框的加入 按钮，uuid为inputUuid
    onConfirm: function(e) {
      let token = this.data.token
      var uuid = this.data.inputUuid
      //console.log(uuid)
                                                            //没写逻辑？？？
      wx.navigateTo({
        url: '../gameZX/gameZX?uuid=' + uuid +'&token=' + token     
      }) 
                                                           /////进行页面跳转。。。
    },

    //正常的 加入对局 按钮，list的
    joinGame: function(e) {
      let token = this.data.token

      console.log(123456789123456)
      console.log(this.data.token)
      console.log(123456789123456)

      var uuid = e.currentTarget.dataset.uuid
      //console.log(uuid)
                                                          //没写逻辑？？
      wx.navigateTo({
        url: '../gameZX/gameZX?uuid=' + uuid +'&token=' + token     
      }) 
                                                          //跳转到对面界面
    },

    //获取对局列表 传入一个对象page{"size": "num":}
    getList:function(page) {
      var that = this
      //let token = this.data.token
      let token = app.globalData.token
      // console.log(123456789123456)
      // console.log(this.data.token)
      // console.log(123456789123456)


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