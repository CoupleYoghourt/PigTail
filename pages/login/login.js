// pages/login/login.js
Page({

    data: {
        id:"",                                  //学号
        pwd:"",                                 //密码
        token:"",                               //发送请求后返回的token
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

        //发送请求
        wx.request({
          url: 'http://172.17.173.97:8080/api/user/login',
          data: util.json2Form( { student_id: this.data.id, password: this.data.pwd }),
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: 'post',

          success (res) {
            const status = res.data.status;

            //用户名密码正确
            if (status === 200) {
                const token = res.data.data.token;          //获取token
                that.setData({
                    token: token
                })
                //进行页面跳转
                wx.navigateTo({
                    url: '../roomlist/roomlist?type=1'      //传递对局类型为1
                })
            }   
            //用户名密码不正确，暂时先这样写，以后可能要设置一个弹框之类的
            else {
                console.log('用户名密码出错')
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