// pages/login/login.js
Page({
    data: {
        id:"",                                  //学号
        pwd:""                                  //密码
    },

    onLoad: function (options) {

    },

    //获取输入的id
    bindIDInput: function (e) {
        let input = e.detail.value
        //console.log("检测输入：" + input)
        this.setData({
          id: input
        })
    },

    //获取输入的密码
    bindPWDInput: function (e) {
        let input = e.detail.value
        //console.log("检测输入：" + input)
        this.setData({
          pwd: input
        })
    },

    //处理登录
    handleLogin: function (e) {
        var that = this;
        var util = require( '../../utils/util.js' );        //导入json转form表单的工具
        var app = getApp()
        //发送请求
        wx.request({
          url: 'http://172.17.173.97:8080/api/user/login',
          data: util.json2Form( { student_id: that.data.id, password: that.data.pwd }),
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: 'post',

          success (res) {
            const status = res.data.status;
            //用户名密码正确
            if (status === 200) {
                const res_token = res.data.data.token;          //获取token
                console.log(res_token)
                app.globalData.token = res_token
                //进行页面跳转
                wx.navigateTo({
                    url: '../roomlist/roomlist?token=' + res_token      
                })
            }   
            //用户名密码不正确
            else {
                console.log('用户名密码出错')
                wx.showModal({
                  title: '提示',
                  content: '登录失败，可能由于用户名密码错误或网络延迟...',
                  showCancel: false,
                })
            }
          }    
        })

        // 判断缓存中有没有token 
        //const token = wx.getStorageSync("token");
        // 2 判断
        /*if (!token) {
            wx.navigateTo({
            url: '/pages/auth/index'
            });
            return;
        }*/
    },
})