// pages/gameRJ/gameRJ.js

const watch = require("../../utils/util.js");               //导入观察者
const mcts = require("../../utils/util.js");                //导入决策函数

const app = getApp();
const C = app.globalData.C;
const D = app.globalData.D;
const S = app.globalData.S;
const H = app.globalData.H;

Page({
    data: {
        cardLib: app.globalData.cardLib,        //本地牌库

        enemy: {cards:[[],[],[],[]]},           //对方手牌 顺序：CDSH
        enemyCnt: [0,0,0,0],                    //统计对方手牌中各花色数量
        enemy_showList:["","","",""],           //对方各花色牌顶（CDSH）

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
        placeTop_card:"",                       //公共放置区最顶上的牌
        placeTop_show:"",                       //公共放置区最顶上的牌的图片路径

        thisTurnDone: false,                    //本回合是否结束
        isMyTurn: true,                         //是否己方回合，人人对战和人机对战默认己方先手
        isEnemyTurn: false,                     //是否对方回合
        buttonNotActive: true,                  //三个按钮是否激活
        msg:"己方回合",                          //提示到谁的回合了

        tuoguan:false,                          //是否在托管状态
        maskFlag:false,                         //托管时的遮罩标志
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
        if(this.data.cardLib.length == 0){                //牌库中没牌了
            console.log("对局结束！！！");   
            let win;                            
            let selfTotal = 0;
            let enemyTotal = 0;
            for(let i=0;i<4;i++){
                selfTotal = selfTotal + this.data.selfCnt[i];
                enemyTotal =  enemyTotal + this.data.enemyCnt[i];
            }
            if(selfTotal == enemyTotal)
                win = "平局";
            else
                win = selfTotal < enemyTotal ? "己方获胜" : "对方获胜" ;
            //console.log(selfTotal,enemyTotal)
            this.EndGame(win);                          //结束游戏
        }      

        if(this.data.isMyTurn){                 //己方回合
            this.setData({buttonNotActive: false});     
            //this.handleMo();    
        }
        else{                                  //人机对战中，机器方回合
            this.sleep(500);                   //睡眠一下，防止过快
            this.doAI();
            this.setData({msg: "己方回合"});      
        }
    },

    //游戏结束，提示胜方，进行页面跳转
    EndGame: function(win){
        wx.showModal({
            title: '提示',
            content: '游戏结束，' + win + '，即将退出房间...',
            showCancel: false,
            success (res) {
                if (res.confirm) {
                    wx.reLaunch({
                        url: '../index/index'
                    })
                }
            }
        })
    },

    //处理摸牌
    handleMo: function() {
        let pType = "Mo";                   //当前操作类型为 摸牌
        let card = this.data.cardLib.pop();           //从牌堆摸出一张牌
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

    //处理己方出牌(暂时设置点击某张牌，就出那张牌)
    handleSelfChu: function(e) {
        let {cardtype} = e.currentTarget.dataset;   //获取出牌的花色的下标
        let pType = "Chu";                          //当前操作类型为 出牌
        //判断是谁的回合
        if(this.data.isMyTurn){
            let pNum = 0;                           //己方回合
            let card = this.data.self.cards[cardtype][0];       //获取对应的卡牌
            console.log("己方出了！！！" + card)
            this.data.self.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区
            this.handleEat(card, this.data.self, pNum, pType);  //进入吃牌函数判断是否吃牌
        }
    },

    //处理吃牌
    handleEat: function(card,player,pNum,pType) 
    {
        //判断 当前卡牌是否和放置区卡牌 花色相同（因为card和placeTop_card都是字符串类型（如"C1"），所以取下标[0]）
        /* 花色相同 */  
        if(this.data.placeTop_card != "" && card[0] == this.data.placeTop_card[0]){                                
            this.addCardToPlaceArea(card);          //先把牌放到放置区，否则这张牌在吃牌的过程中，不会被吃掉
            for(var i = 0; i < 4 ; i++){ 
                let newCards = this.data.placeArea.cards[i].concat(player.cards[i]);    //合并放置区和玩家的卡组
                player.cards[i] = newCards;         //更新对应玩家的卡组
                this.data.placeArea.cards[i] = [];  //清空放置区卡组
            }
            this.setPlaceArea("","");               //清空 放置区顶 视图
            this.setPlayerShow(player,pNum);        //刷新 玩家卡牌区 视图
        }  
        /* 花色不同 */ 
        else{                                                                                     
            this.addCardToPlaceArea(card);          //没吃牌，那就把牌直接放入放置区
            if(pType == "Chu"){                     //如果是因 出牌操作 而进入到此
                this.setPlayerShow(player,pNum);    //那么需要 刷新 玩家卡牌区 视图
            }
        }
        this.data.thisTurnDone = true;              //本回合结束，触发观察者函数
    },

    //托管时AI操作
    doAI: function(){
        var enemyCnt = this.data.enemyCnt;
        var selfCnt = this.data.selfCnt;
        var placeArea = this.data.placeArea.cards; 
        var placeTop_card = this.data.placeTop_card;
        //console.log(placeTop_card);

        //进行决策
        var num = mcts.Mcts(selfCnt, enemyCnt, placeArea, placeTop_card);
        console.log(num);
        if (num == 0) {                 //0代表摸牌
            this.handleMo();
        }
        else {                          //1，2，3，4分别代表出CDSH的花色
            this.handleAIChu(num-1);
        }
    },
    
    //处理托管出牌，传入要出的牌的花色
    handleAIChu: function(cardtype) {
        let pType = "Chu";                          //当前操作类型为 出牌
        //判断是谁的回合
        if(this.data.isMyTurn){
            let pNum = 0;                           //己方回合
            let card = this.data.self.cards[cardtype][0];       //获取对应的卡牌
            this.data.self.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区
            this.handleEat(card, this.data.self, pNum, pType);  //进入吃牌函数判断是否吃牌
        }
        else{
            let pNum = 1;                           //对方回合
            let card = this.data.enemy.cards[cardtype][0];      //获取对应的卡牌
            this.data.enemy.cards[cardtype].shift();             //将对应卡牌移出自己的手牌区
            this.handleEat(card, this.data.enemy, pNum, pType); //进入吃牌函数判断是否吃牌
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
        try {
            this.setData({
                placeTop_card: card,                //更改放置区顶的牌
                placeTop_show: url                  //更改放置区顶的牌的图片路径
            }); 
        }
        catch(err) {
            this.setPlaceArea(card,url);
        }
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
            try {this.setData({self_showList: list, selfCnt: cnt});}
            catch(err) {this.setData({self_showList: list, selfCnt: cnt});}   
        }   
        else {                                      //对方玩家
            try {this.setData({enemy_showList: list, enemyCnt: cnt}); }
            catch(err) {this.setData({enemy_showList: list, enemyCnt: cnt}); }
        }          
    },

    /* 人人对战和人机对战时的本地牌库随机化 */ 
    randomSort: function (a, b) {
        return Math.random() > 0.5 ? -1 : 1;
    },
    randomCardLib: function () {
        this.data.cardLib.sort(this.randomSort)
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
