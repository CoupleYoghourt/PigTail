// pages/gameRJ/gameRJ.js

const watch = require("../../utils/util.js");               //导入观察者

const app = getApp();
const C = app.globalData.C;
const D = app.globalData.D;
const S = app.globalData.S;
const H = app.globalData.H;
let cardLib = app.globalData.cardLib;

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
        isMyTurn: true,                         //是否己方回合，人人对战和人机对战默认己方先手
        isEnemyTurn: false,                     //是否对方回合

        buttonNotActive: true,                  //三个按钮是否激活

        msg:"己方回合"                           //提示到谁的回合了
    },

    watch: {                                    //观察者：观察 thisTurnDone 变量（本回合是否结束）
        thisTurnDone: function(newValue,oldValue){
            if(newValue){                       //thisTurnDone为true，本回合结束
                if(this.data.isMyTurn){
                    this.setData({
                        buttonNotActive: true,
                        msg: "对方回合"
                    }); 
                }
                //交换标志着 哪一方回合 的变量
                [this.data.isMyTurn,this.data.isEnemyTurn] = [this.data.isEnemyTurn,this.data.isMyTurn];
                this.data.thisTurnDone = false; //开启下一回合
                this.Gaming();                  //开启下一回合
            }
        }
    },

    onLoad: function (options) {         
        watch.setWatcher(this);                 //设置监听器，建议在onLoad下调用
        this.randomCardLib();                   //人人对战和人机对战，让默认牌库乱序
        this.Gaming();                          //进行第一次回合
    },
    
    /* 进行当前回合 */ 
    Gaming: function () {     
        if(cardLib.length == 0){                //牌库中没牌了
            console.log("对局结束！！！");                                          //之后需展示提示框
        }      

        if(this.data.isMyTurn){                 //己方回合
            this.setData({buttonNotActive: false});          
        }
        else{                                   //人机对战中，机器方回合
            this.sleep(1000);                   //睡眠一下，防止过快
            this.handleMo();                                                       //暂时人机设置只摸牌
            this.setData({msg: "己方回合"});      
        }
    },

    //处理摸牌
    handleMo: function() {
        let pType = "Mo";                   //当前操作类型为 摸牌
        let card = cardLib.pop();           //从牌堆摸出一张牌
        //判断是谁的回合
        if(this.data.isMyTurn){
            let pNum = 0;                   //己方回合
            this.handleEat(card, this.data.self, pNum, pType);     //进入吃牌函数判断是否吃牌
        }
        else{
            let pNum = 1;                   //对方回合
            this.handleEat(card, this.data.enemy, pNum, pType);    //进入吃牌函数判断是否吃牌
        }
    },

    //处理出牌(暂时设置点击某张牌，就出那张牌)
    handleChu: function(e) {
        let {cardtype} = e.currentTarget.dataset;   //获取出牌的花色的下标
        let pType = "Chu";                          //当前操作类型为 出牌
        //判断是谁的回合
        if(this.data.isMyTurn){
            let pNum = 0;                           //己方回合
            let card = this.data.self.cards[cardtype][0];       //获取对应的卡牌
            this.data.self.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区
            this.handleEat(card, this.data.self, pNum, pType);     //进入吃牌函数判断是否吃牌
        }
        else{
            let pNum = 1;                           //对方回合
            let card = this.data.enemy.cards[cardtype][0];      //获取对应的卡牌
            this.data.self.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区
            this.handleEat(card, this.data.enemy, pNum, pType);    //进入吃牌函数判断是否吃牌
        }

    },

    //处理吃牌
    handleEat: function(card,player,pNum,pType) {
        //判断 当前卡牌是否和放置区卡牌 花色相同（因为card和placeTop_card都是字符串类型，所以取下标[0]）
        if(card[0] == this.data.placeTop_card[0]){          /* 花色相同 */            
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
        this.data.thisTurnDone = true;              //本回合结束，触发观察者函数
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

    /* 人人对战和人机对战时的本地牌库随机化 */ 
    randomSort: function (a, b) {
        return Math.random() > 0.5 ? -1 : 1;
    },
    randomCardLib: function () {
        cardLib.sort(this.randomSort)
    },

    /* 自定义睡眠函数 */ 
    sleep(numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    }
})
