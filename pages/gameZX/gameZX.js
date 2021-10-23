// pages/gameRJ/gameRJ.js

//记得try catch一下图片渲染的地方，否则有可能会渲染错误
//写一个渲染图片的函数，try渲染函数 如果有错误就catch这个函数自己（递归），重新渲染
const watch = require("../../utils/util.js");               //导入观察者
const mcts = require("../../utils/util.js");                //导入决策函数

const app = getApp();
const C = app.globalData.C;
const D = app.globalData.D;
const S = app.globalData.S;
const H = app.globalData.H;

Page({
    data: {
        enemy: {cards:[[],[],[],[]]},           //对方手牌 顺序：CDSH       元素："C1"
        enemyCnt: [0,0,0,0],                    //统计对方手牌中各花色数量
        enemy_showList:["","","",""],           //对方各花色牌顶（CDSH）    元素：图片链接

        self: {cards:[[],[],[],[]]},            //己方手牌 顺序：CDSH
        selfCnt: [0,0,0,0],                     //统计己方手牌中各花色数量
        self_showList:["","","",""],            //己方各花色牌顶（CDSH）

        placeArea: {                 
            cards:[                             //公共放置区的牌
                [],                             //C
                [],                             //D
                [],                             //S
                []                              //H
            ],
        },
        placeTop_card:"",                       //公共放置区最顶上的牌      如"C1"
        placeTop_show:"",                       //公共放置区最顶上的牌的图片路径

        thisTurnDone: false,                    //本回合是否结束
        isMyTurn: false,                        //是否己方回合，人人对战和人机对战默认己方先手
        isEnemyTurn: false,                     //是否对方回合
        lastEnemyDone: false,                   //对手上一回合的操作做完了
        buttonNotActive: true,                  //三个按钮是否 不 激活
        msg:"尚未开始",                          //提示到谁的回合了
        tuoguan:false,                          //是否在托管状态
        maskFlag:false,                         //托管时的遮罩标志

        isOpen: false,
        interval:0,
        resCard:"",
        
        token:"",
        uuid:""
    },

    watch: {                                    //观察者：观察 thisTurnDone 变量（本回合是否结束）
        thisTurnDone: function(newValue,oldValue){
            if(newValue){                       //thisTurnDone为true，本回合结束
                this.data.thisTurnDone = false;                     //开启下一回合
                this.startGame(this.data.uuid, this.data.token);    //开启下一回合
            }
        },
        tuoguan: function(newValue,oldValue){   //观察是否在托管状态
            if(newValue){
                clearInterval(this.data.interval);
                this.data.isOpen = false;
                this.startGame(this.data.uuid, this.data.token);   
            }
        }
    },

    onLoad: function (options) {         
        watch.setWatcher(this);                 //设置监听器，建议在onLoad下调用
        this.setData({                          //设置对局token和uuid
            token: options.token,
            uuid: options.uuid
        })
 
        console.log(this.data.uuid)
        this.startGame(this.data.uuid, this.data.token);    //开始第一回合
    },

    startGame: function (uuid, token){
        //this.isEnd(uuid, token);
        this.getLastInfo(uuid, token);                      //获取对局是否开始
    },

    //判断游戏是否结束
    // isEnd: function (uuid, token){
    //     let that = this;
    //     wx.request({
    //         url: 'http://172.17.173.97:9000/api/game/' + uuid ,
    //         header: {
    //           "Authorization": token,
    //         },
    //         method: "get",
    //         success(res) {
    //             console.log(res.data)
    //             if(res === 200){
    //                 that.endGame();                          //结束游戏
    //             }
    //         }
    //     })
    // },

    //游戏结束，提示胜方，进行页面跳转
    endGame: function(){
        let token = this.data.token;
        let uuid = this.data.uuid; 

        if(this.data.isEnemyTurn){
            this.getFinalInfo(uuid, token);
        }

        let win;                            
        let selfTotal = 0;
        let enemyTotal = 0;
        for(let i = 0; i < 4 ; i++){
            selfTotal = selfTotal + this.data.selfCnt[i];
            enemyTotal =  enemyTotal + this.data.enemyCnt[i];
        }
        if(selfTotal == enemyTotal) win = "平局";
        else win = selfTotal < enemyTotal ? "己方获胜" : "对方获胜" ;

        wx.showModal({
            title: '提示',
            content: '游戏结束，' + win + '，即将退出房间...',
            showCancel: false,
            success (res) {
                if (res.confirm) {
                    wx.reLaunch({
                        url: '../roomlist/roomlist?token=' + token
                    })
                }
            }
        })
    },

    getFinalInfo: function (uuid, token){
        let that = this;     
        wx.request({
            url: 'http://172.17.173.97:9000/api/game/' + uuid ,
            header: {"Authorization":token},
            method: "get",
            success(res) {
                let info = res.data;
                let code = info.code;
                if(code === 200){
                    let last = info.data.last;
                    if(last != ""){                       //最后一回合对方操作
                        let pType = last.split(' ')[1];        //获得对手的操作类型：摸牌还是出牌
                        let card = last.split(' ')[2];         //获得对手出的手牌
                        if(pType == "0"){                           //对手操作为 摸牌
                            that.handleEnemyMo(card);
                            console.log("对手最后一回合摸了！！！" + card);
                        }
                        else{                                       //对手操作为 出牌
                            that.handleEnemyChu(card);
                            console.log("对手后一回合出了！！！" + card);
                        }
                    }
                }
            }
        })
    },

    //获取上步操作
    getLastInfo: function (uuid, token){
        let that = this;
        if(!this.data.isOpen){
            this.data.isOpen = true;

            this.data.interval = setInterval(function () {      
                wx.request({
                    url: 'http://172.17.173.97:9000/api/game/' + uuid + '/last',
                    header: {"Authorization":token},
                    method: "get",
    
                    success(res) {
                      let info = res.data;
                      let code = info.code;
                      let last_code = info.data.last_code;
                      let isMyTurn = info.data.your_turn;
    
                      console.log(123456)
                      console.log(info)
                      console.log(789)
    
                      if(code === 403)  console.log("人还没齐!!!");
                      else if(code === 200){
                        if(isMyTurn){                               /* 己方回合 */ 
                            clearInterval(that.data.interval);              //关闭计时器，直到本次己方操作结束
                            that.data.isOpen = false;

                            if(last_code != ""){                            //上一回合对方操作不为空（说明不是第一回合）
                                let pType = last_code.split(' ')[1];        //获得对手的操作类型：摸牌还是出牌
                                let card = last_code.split(' ')[2];         //获得对手出的手牌
                                if(!that.data.lastEnemyDone){                   //上一回合对手操作没在本地完成
                                    if(pType == "0"){                           //对手操作为 摸牌
                                        that.handleEnemyMo(card);
                                        console.log("对手上回合摸了！！！" + card);
                                    }
                                    else{                                       //对手操作为 出牌
                                        that.handleEnemyChu(card);
                                        console.log("对手上回合出了！！！" + card);
                                    }
                                    that.data.lastEnemyDone = true;             //对手上回合操作在本地执行完了
                                }
                            }

                            that.setData({              //等前面都结束后，再打开按钮
                                isMyTurn: true,
                                isEnemyTurn: false,
                                buttonNotActive: false,
                                msg: "己方回合"
                            }); 
                         
                            if(that.data.tuoguan){      //托管
                                that.doAI();
                            }
                        }  
                        else{                                       /* 对方回合 */ 
                            that.setData({
                                isMyTurn: false,
                                isEnemyTurn: true,
                                buttonNotActive: true,
                                msg: "对方回合"
                            });  
                        }             
                      }
                      
                      if(code === 400){
                          let msg = info.data.err_msg;
                          if(msg == "对局已结束"){
                            clearInterval(that.data.interval);
                            that.endGame();
                          }
                      }
                    }
                  })
            }, 1000)    //代表1秒钟发送一次请求
        }
    },

    //处理摸牌
    handleSelfMo: function() {
        this.sendSelfMo();
    },

    //发送己方摸牌的请求
    sendSelfMo: function() {
        let that = this;
        let token = this.data.token;
        let dataInfo = { type: 0 } ;
        let uuid = this.data.uuid

        wx.request({
            url: 'http://172.17.173.97:9000/api/game/' + uuid,
            header: {"Authorization":token},
            method: "put",
            data: dataInfo,

            success(res) {
                let info = res.data;
                let code = info.code;
                if(code === 200)
                {
                    let last_code = info.data.last_code; 

                    console.log(info)
                    console.log(last_code)

                    let card = last_code.split(' ')[2];                 //获取卡牌
                    that.data.resCard = card;

                    console.log("本回合己方摸了 " + card)

                    let pType = "Mo";                                   //当前操作类型为 摸牌
                    let pNum = 0;                                       //己方回合
                    that.handleEat(card, that.data.self, pNum, pType);  //进入吃牌函数判断是否吃牌
                }

                if(code != 200) console.log("操作失败！！！");                          //可能要写个弹框或递归
            },
            fail: function () {                                     //失败就再发一次
                that.sendSelfMo();
            },
        })
    },

    //处理对方摸牌
    handleEnemyMo: function(card) {
        console.log("处理对手上回合的摸牌操作" + card)
        let pType = "Mo";                                           //当前操作类型为 摸牌
        let pNum = 1;                                               //对方回合
        this.handleEat(card, this.data.enemy, pNum, pType);         //进入吃牌函数判断是否吃牌
    },

    //处理托管出牌，传入要出的牌的花色的对应下标
    handleAIChu: function(cardtype) {
        let pType = "Chu";                                          //当前操作类型为 出牌
        let pNum = 0;                                               //己方回合
        let card = this.data.self.cards[cardtype][0];               //获取对应的卡牌

        this.sendSelfChu(card);
        this.data.self.cards[cardtype].shift();                     //将对应卡牌移出自己的手牌区
        this.handleEat(card, this.data.self, pNum, pType);          //进入吃牌函数判断是否吃牌
    },

    //处理出牌(暂时设置点击某张牌，就出那张牌)
    handleSelfChu: function(e) {
        let {cardtype} = e.currentTarget.dataset;                   //获取出牌的花色的下标
        let pType = "Chu";                                          //当前操作类型为 出牌
        let pNum = 0;                                               //己方回合
        let card = this.data.self.cards[cardtype][0];               //获取对应的卡牌

        this.sendSelfChu(card);
        this.data.self.cards[cardtype].shift();                     //将对应卡牌移出自己的手牌区
        this.handleEat(card, this.data.self, pNum, pType);          //进入吃牌函数判断是否吃牌
    },
    //发送己方出牌请求
    sendSelfChu: function(card) {
        let token = this.data.token;
        let dataInfo = { type: 1 , card: card };
        let uuid = this.data.uuid;
        wx.request({
            url: 'http://172.17.173.97:9000/api/game/' + uuid,
            header: {"Authorization":token},
            method: "put",
            data: dataInfo,

            success(res) {
                let code = res.data.code;
                if(code === 200){
                    console.log(res.data.data.last_msg);
                    console.log("操作成功！！！");
                }
                else{
                    console.log("操作失败！！！");       //可能要写个弹框或递归
                }
            },
            fail: function () {                         //失败就再发一次
                that.sendSelfChu(card);
            },
        })
    },

    //处理对方出牌操作
    handleEnemyChu: function(card) {
        console.log("处理对手上回合的出牌操作" + card)

        let CDSH = ['C','D','S','H'];
        let cardType_str = card[0];                 //获取出牌的花色的下标
        let cardType_index;
        for(let i = 0;i < 4; i++){
            if(cardType_str == CDSH[i]){
                cardType_index = i;
                break;
            }
        }

        console.log("这里是对面的出牌card的下标" + cardType_index)

        let pType = "Chu";                                      //当前操作类型为 出牌
        let pNum = 1;                                           //对方回合

        this.data.enemy.cards[cardType_index].shift();          //将对应卡牌移出对方的手牌区
        this.handleEat(card, this.data.enemy, pNum, pType);     //进入吃牌函数判断是否吃牌  
    },

    //处理吃牌
    handleEat: function(card,player,pNum,pType) {
    /* 花色相同 */ 
        //判断 当前卡牌是否和放置区卡牌 花色相同（因为card和placeTop_card都是字符串类型（如"C1"），所以取下标[0]）
        if(this.data.placeTop_card != "" && card[0] == this.data.placeTop_card[0]){            
            this.addCardToPlaceArea(card);         //先把牌放到放置区，否则这张牌在吃牌的过程中，不会被吃掉
            for(let i = 0; i < 4 ; i++){ 
                let newCards = this.data.placeArea.cards[i].concat(player.cards[i]);    //合并放置区和玩家的卡组
                player.cards[i] = newCards;         //更新对应玩家的卡组

                this.data.placeArea.cards[i] = [];  //清空放置区卡组
            }
            this.setPlaceArea("","");               //清空 放置区顶 视图
            this.setPlayerShow(player,pNum);        //刷新 玩家卡牌区 视图
        }
    /* 花色不同 */
        else{                                               
            this.addCardToPlaceArea(card);          //先把牌先放到放置区顶，再判断是否会有吃牌行为
            if(pType == "Chu"){                     //如果是因 出牌操作 而进入到此
                this.setPlayerShow(player,pNum);    //那么需要 刷新 玩家卡牌区 视图
            }
        }
        
        if(pNum === 0){
            this.data.thisTurnDone = true;          //己方本回合结束，触发观察者函数
            this.data.lastEnemyDone = false;
        }     
    },

    //托管时AI操作
    doAI: function(){
        var enemyCnt = this.data.enemyCnt;
        var selfCnt = this.data.selfCnt;
        var placeArea = this.data.placeArea.cards; 
        var placeTop_card = this.data.placeTop_card;
        //console.log(placeTop_card);

        //进行决策
        var num = mcts.Mcts(enemyCnt, selfCnt, placeArea, placeTop_card);
        console.log(num);
        if (num == 0) {                 //0代表摸牌
            this.handleSelfMo();
        }
        else {                          //1，2，3，4分别代表出CDSH的花色
            this.handleAIChu(num-1);
        }
    },

    //处理托管
    handleTuo: function() {
        this.setData({
            maskFlag: true,
            tuoguan: true
        })
    },

    //处理取消托管
    handleCancelTuo: function() {
        this.setData({
            maskFlag: false,
            tuoguan: false
        })
    },

    //把牌加到放置区顶
    addCardToPlaceArea: function(card) {
        let CDSH=[C,D,S,H];  
        let CDSHchar=['C','D','S','H'];   
        let t = card[0];                                    //判断牌的花色
        for(let i = 0; i < 4; i++){         
            if(t == CDSHchar[i]){
                this.data.placeArea.cards[i].unshift(card); //把牌加入到对应花色的顶部
                this.setPlaceArea(card,CDSH[i][card]);      //更新 放置区顶部 的视图
                break;
            }
        }
    },

    //设置 放置区牌顶 显示的内容
    setPlaceArea: function(card,url){
        this.setData({
            placeTop_card: card,                //更改放置区顶的牌
            placeTop_show: url                  //更改放置区顶的牌的图片路径
        }); 
    },

    //处理每一回合玩家手牌区的显示
    setPlayerShow: function(player,pNum) {
        //传入this.data.enemy/self
        let CDSH=[C,D,S,H];
        let list = [];
        let cnt = [];
        for(var i = 0; i < 4 ; i++){                //更新对应玩家 各花色 最上面的一张牌
            let len = player.cards[i].length;
            if (len != 0)
                list.push(CDSH[i][player.cards[i][0]]);          
            else                                    //该玩家没这种花色
                list.push("");
            cnt.push(len);
        }
        
        if(pNum === 0) {                            //己方玩家
            this.setData({self_showList: list, selfCnt: cnt});
        }   
        else {                                      //对方玩家
            this.setData({enemy_showList: list, enemyCnt: cnt}); 
        }   
    },
})
