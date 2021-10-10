// pages/gameRR/gameRR.js

const app = getApp();
const cardLib = app.globalData.cardLib;
const C = app.globalData.C;
const D = app.globalData.D;
const S = app.globalData.S;
const H = app.globalData.H;
const that = this;

Page({
    data: {
        enemy: {                 
            cards:[                             //对方手牌
                [],                             //C
                [],                             //D
                [],                             //S
                []                              //H
            ],
        },
        enemy_showList:["","","",""],           //对方各花色牌顶（CDSH）

        self: {                 
            cards:[                             //己方手牌
                [],                             //C
                [],                             //D
                [],                             //S
                []                              //H
            ],
        },
        self_showList:["","","",""],            //己方各花色牌顶（CDSH）

        type: 0,                                //对战类型
        isMyTurn: false,                        //是否己方回合
        isEnemyTurn: false,                     //是否对方回合
    },

    onLoad: function (options) {         

        //console.log(this.data.type)

        this.randomCardLib();

        
    },
    
    //处理每一回合的显示
    setShow: function(player,pNum) {
        //传入this.data.enemy
        let CDSH=[C,D,S,H];
        let list = [];
        for(var i = 0; i < 4 ; i++){ 
            var x=CDSH[i];
            if (player.cards[i].length != 0)
                list.push(x[player.cards[i][0]]);          
            else
                list.push("");
        }
        if(pNum==0) 
            this.setData({self_showList: list});       
        else 
            this.setData({enemy_showList: list});
        
    },

    //处理摸牌
    handleMo: function() {
        let CDSH=['C','D','S','H'];

        var card = cardLib.pop();
        let t = card[0];
        //console.log(t);
        for(let i = 0; i < 4; i++){
            if(t === CDSH[i]){
                this.data.self.cards[i].unshift(card);
                //console.log( this.data.self.cards);
                break;
            }
        }
        this.setShow(this.data.self,0);
        
    },
    //处理出牌
    handleChu: function() {
        //console.log(this.data.isMyTurn)
   
    },
    //处理托管
    handleTuo: function() {
        console.log(123)
         
    },


    /* 人人对战和人机对战时的本地牌库随机化 */ 
    randomSort: function (a, b) {
        return Math.random() > 0.5 ? -1 : 1;
    },
    randomCardLib: function () {
        cardLib.sort(this.randomSort)
        console.log(cardLib)
    },
})
