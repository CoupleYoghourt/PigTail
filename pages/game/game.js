// pages/game/game.js

const app = getApp();
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
        var type = options.type;
        this.setData({type: type}); 
        //console.log(this.data.type)
        if(type === 1){

        }
        else if(type === 2){

        }
        else{
            this.randomCardLib();

        }
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
        if(this.data.type === 1){

        }
        else if(this.data.type === 2){
            
        }
        else{
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
        }
    },
    //处理出牌
    handleChu: function() {
        //console.log(this.data.isMyTurn)
        if(this.data.type === 2){
 
        }
        else{
            
        }
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


var cardLib = [
"C1","C2","C3","C4","C5","C6","C7","C8","C9","C10","CJ","CQ","CK",
"D1","D2","D3","D4","D5","D6","D7","D8","D9","D10","DJ","DQ","DK",
"H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","HJ","HQ","HK",
"S1","S2","S3","S4","S5","S6","S7","S8","S9","S10","SJ","SQ","SK"]

const C = 
{
    "C1":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c01.PNG",
    "C2":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c02.PNG",
    "C3":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c03.PNG",
    "C4":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c04.PNG",
    "C5":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c05.PNG",
    "C6":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c06.PNG",
    "C7":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c07.PNG",
    "C8":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c08.PNG",
    "C9":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c09.PNG",
    "C10":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c10.PNG",
    "CJ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c11.PNG",
    "CQ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c12.PNG",
    "CK":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/c13.PNG"
}

const D = 
{
    "D1":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d01.PNG",
    "D2":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d02.PNG",
    "D3":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d03.PNG",
    "D4":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d04.PNG",
    "D5":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d05.PNG",
    "D6":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d06.PNG",
    "D7":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d07.PNG",
    "D8":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d08.PNG",
    "D9":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d09.PNG",
    "D10":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d10.PNG",
    "DJ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d11.PNG",
    "DQ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d12.PNG",
    "DK":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/d13.PNG"
}

const H = 
{
    "H1":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h01.PNG",
    "H2":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h02.PNG",
    "H3":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h03.PNG",
    "H4":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h04.PNG",
    "H5":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h05.PNG",
    "H6":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h06.PNG",
    "H7":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h07.PNG",
    "H8":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h08.PNG",
    "H9":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h09.PNG",
    "H10":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h10.PNG",
    "HJ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h11.PNG",
    "HQ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h12.PNG",
    "HK":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/h13.PNG"
}

const S = 
{
    "S1":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s01.PNG",
    "S2":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s02.PNG",
    "S3":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s03.PNG",
    "S4":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s04.PNG",
    "S5":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s05.PNG",
    "S6":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s06.PNG",
    "S7":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s07.PNG",
    "S8":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s08.PNG",
    "S9":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s09.PNG",
    "S10":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s10.PNG",
    "SJ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s11.PNG",
    "SQ":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s12.PNG",
    "SK":"https://cdn.jsdelivr.net/gh/Taj-x/images@main/img/s13.PNG"
}