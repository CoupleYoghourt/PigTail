// pages/gameRJ/gameRJ.js

const watch = require("../../utils/util.js");               //导入观察者

const app = getApp();
const C = app.globalData.C;
const D = app.globalData.D;
const S = app.globalData.S;
const H = app.globalData.H;

Page({
    data: {
        enemy: {cards:[[],[],[],[]]},           //对方手牌 顺序：CDSH
        enemy_showList:["","","",""],           //对方各花色牌顶（CDSH）

        self: {cards:[[],[],[],[]]},            //己方手牌 顺序：CDSH
        self_showList:["","","",""],            //己方各花色牌顶（CDSH）

        placeArea: {                 
            cards:[                             //公共放置区的牌
                [],                             //C
                [],                             //D
                [],                             //S
                []                              //H
            ],
        },
        placeTop_card:"",                       //公共放置区最顶上的牌
        placeTop_show:"",                       //公共放置区最顶上的牌的图片路径

        thisTurnDone: false,                    //本回合是否结束
        isMyTurn: false,                         //是否己方回合，人人对战和人机对战默认己方先手
        isEnemyTurn: false,                     //是否对方回合

        buttonNotActive: true,                  //三个按钮是否 不 激活

        msg:"尚未开始",                           //提示到谁的回合了

        resCard:"",
        
        token:"",
        uuid:""
    },

    watch: {                                    //观察者：观察 thisTurnDone 变量（本回合是否结束）
        thisTurnDone: function(newValue,oldValue){
            if(newValue){                       //thisTurnDone为true，本回合结束
                this.data.thisTurnDone = false; //开启下一回合
                this.startGame(this.data.uuid, this.data.token);                  //开启下一回合
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
        this.getLastInfo(uuid, token);                  //获取对局是否开始
    },

    getLastInfo: function (uuid, token){
        let that = this;
        let interval = setInterval(function () {
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
                    if(isMyTurn){                                       /* 己方回合 */ 
                        that.setData({
                            isMyTurn: true,
                            isEnemyTurn: false,
                            buttonNotActive: false,
                            msg: "己方回合"
                        });  

                        if(last_code != ""){                            //上一回合对方操作不为空（说明不是第一回合）
                            let pType = last_code.split(' ')[1];        //获得对手的操作类型：摸牌还是出牌
                            let card = last_code.split(' ')[2];         //获得他出的手牌

                            if(pType == "0"){                           //对手操作为 摸牌
                                that.handleEnemyMo(card);
                                console.log("对手上回合摸了！！！" + card)
                            }
                            else{                                       //对手操作为 出牌
                                that.handleEnemyChu(card);
                                console.log("对手上回合出了！！！" + card)
                            }
                        }
                        clearInterval(interval);                        //关闭计时器，直到本次己方操作结束
                    }  
                    else{                                                   /* 对方回合 */ 
                        that.setData({
                            isMyTurn: false,
                            isEnemyTurn: true,
                            buttonNotActive: true,
                            msg: "对方回合"
                        });  
                    }             
                  }
                }
              })
        }, 1000)    //代表1秒钟发送一次请求
    },

    //处理摸牌
    handleSelfMo: function() {
        //let card = this.sendSelfMo();


        console.log("我进去handleSelfMo啦")
        this.sendSelfMo();
        console.log("结束啦")
    },

    sendSelfMo: function() {
        let that = this;
        let token = app.globalData.token;
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
                let last_code = info.data.last_code;

                console.log(last_code)

                let card = last_code.split(' ')[2];

                that.data.resCard = card;
                console.log("我是card！！！！！" + card)


                let pType = "Mo";                   //当前操作类型为 摸牌

                let pNum = 0;                   //己方回合
                that.handleEat(card, that.data.self, pNum, pType);     //进入吃牌函数判断是否吃牌


                // that.setData({
                //     resCard: card
                // })
                console.log(card)
                console.log(that.data.resCard)
                
                if(code != 200) console.log("操作失败！！！");        
  
            }
        })
        //console.log("我是返回回来的card！！！！" + resCard)
        //return resCard;
    },

    handleEnemyMo: function(card) {
        console.log("处理对手上回合的摸牌操作" + card)
        let pType = "Mo";                   //当前操作类型为 摸牌
        let pNum = 1;                   //对方回合
        this.handleEat(card, this.data.enemy, pNum, pType);    //进入吃牌函数判断是否吃牌
    },

    //处理出牌(暂时设置点击某张牌，就出那张牌)
    handleSelfChu: function(e) {
        let {cardtype} = e.currentTarget.dataset;   //获取出牌的花色的下标
        let pType = "Chu";                          //当前操作类型为 出牌
   
        let pNum = 0;                           //己方回合
        let card = this.data.self.cards[cardtype][0];       //获取对应的卡牌

        this.sendSelfChu(card);

        this.data.self.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区

        this.handleEat(card, this.data.self, pNum, pType);     //进入吃牌函数判断是否吃牌
    },

    sendSelfChu: function(card) {
        let token = app.globalData.token;
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
                    console.log("操作失败！！！");
                }
            }
        })
    },


    handleEnemyChu: function(card) {

        console.log("这里是对面的出牌card！！！33333" + card)

        let CDSH = ['C','D','S','H'];
        let cardType_str = card[0];   //获取出牌的花色的下标
        let cardType_index = 0;
        for(let i = 0;i < 4; i++){
            if(cardType_str == CDSH[i]){
                cardType_index = i;
                break;
            }
        }

        console.log("这里是对面的出牌card的下标" + cardType_index)

        let pType = "Chu";                          //当前操作类型为 出牌
        let pNum = 1;                           //对方回合

        this.data.enemy.cards[cardType_index].shift();             //将对应卡牌移出对方的手牌区
        this.handleEat(card, this.data.enemy, pNum, pType);    //进入吃牌函数判断是否吃牌
        
    },

    //处理吃牌
    handleEat: function(card,player,pNum,pType) {
   
        //判断 当前卡牌是否和放置区卡牌 花色相同（因为card和placeTop_card都是字符串类型，所以取下标[0]）
        if(this.data.placeTop_card != "" && card[0] == this.data.placeTop_card[0]){          /* 花色相同 */            
            for(var i = 0; i < 4 ; i++){ 
                let newCards = this.data.placeArea.cards[i].concat(player.cards[i]);    //合并放置区和玩家的卡组
                player.cards[i] = newCards;         //更新对应玩家的卡组

                this.data.placeArea.cards[i] = [];  //清空放置区卡组
                this.setPlaceArea("","");           //清空 放置区顶 视图
            }
            this.setPlayerShow(player,pNum);        //刷新 玩家卡牌区 视图
        }
        else{                                               /* 花色不同 */ 
            this.addCardToPlaceArea(card);          //把牌先放到放置区顶
            if(pType == "Chu"){                     //如果是因 出牌操作 而进入到此
                this.setPlayerShow(player,pNum);    //那么需要 刷新 玩家卡牌区 视图
            }
        }
        
        if(pNum === 0){
            this.data.thisTurnDone = true;              //本回合结束，触发观察者函数
        }
    },

    //处理托管
    handleTuo: function() {
        console.log(123)
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
        for(var i = 0; i < 4 ; i++){                //更新对应玩家 各花色 最上面的一张牌
            if (player.cards[i].length != 0)
                list.push(CDSH[i][player.cards[i][0]]);          
            else                                    //该玩家没这种花色
                list.push("");
        }
        if(pNum === 0)                              //己方玩家
            this.setData({self_showList: list});       
        else                                        //对方玩家
            this.setData({enemy_showList: list});  
    },


})
