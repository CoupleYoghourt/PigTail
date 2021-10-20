const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

function json2Form(json) {
  var str = [];
  for(var p in json){
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}


/* 设置监听器 */
export function setWatcher(page) {
  let data = page.data;
  let watch = page.watch;
  Object.keys(watch).forEach(v => {
    let key = v.split('.'); // 将watch中的属性以'.'切分成数组
    let nowData = data; // 将data赋值给nowData
    for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
      nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
    }
    let lastKey = key[key.length - 1];
    // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
    let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
    let deep = watch[v].deep; // 若未设置deep,则为undefine
    observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
  })
}

/* 监听属性 并执行监听函数 */
function observe(obj, key, watchFun, deep, page) {
  var val = obj[key];
  // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
  if (deep && val != null && typeof val === 'object') {
    Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
      observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
    })
  }
  let that = this;
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    set: function (value) {
      watchFun.call(page, value, val); // value是新值，val是旧值
      val = value;
      if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
        observe(obj, key, watchFun, deep, page);
      }
    },
    get: function () {
      return val;
    }
  })
}

//抉择函数，选择最优的操作
//对手手牌状态，己方手牌状态，放置区手牌状态, 放置区牌顶
//顺序CDSH
//返回一个值0 摸牌， 1，2，3，4分别表示CDSH
function Mcts(enemyCnt, selfCnt, placeArea, palceTop_card) {
  let placeAreaCnt = [0,0,0,0];
  for (var i = 0; i < 4; ++i) {
    placeAreaCnt[i] = placeArea[i].length;
  }
  //统计牌库的状态
  let leftCard = [13,13,13,13];
  for (var i = 0; i < 4; ++i) {
    leftCard[i] -= enemyCnt[i];
    leftCard[i] -= selfCnt[i];
    leftCard[i] -= placeAreaCnt[i];
  }
  var sumSelf = 0, sumLeft = 0;
  for (var i = 0; i < 4; ++i) {
    sumSelf += selfCnt[i];
    sumLeft += leftCard[i];
  }
  //如果没有手牌，那么只能摸牌
  if (sumLeft == 0) {
    return 0;
  }
  //放置区顶牌对应的下标
  var index = -1;
  switch(palceTop_card[0]) {
    case 'C':
      index = 0;
      break;
    case 'D':
      index = 1;
      break;
    case 'S':
      index = 2;
      break;
    case 'H':
      index = 3;
      break;
  }
  //如果牌库剩余牌不大于手牌，则全部操作为出牌
  if (sumSelf >= sumLeft) {
    //获得牌堆中与当前放置区不同的牌的数量
    //取最大值，这样对手摸牌的话，吃牌概率最大
    var maxCardCnt = -1, maxIndex = -1;
    for (var i = 0; i < 4; ++i) {
        if (leftCard[i] >= maxCardCnt && i != index && selfCnt[i] != 0) {
          maxCardCnt = leftCard[i];
          maxIndex = i;
        }
    }
    //出的牌为对应的下标
    return maxIndex + 1;
  }
  //牌库的牌数量多于手牌，考虑用蒙特卡洛树搜索进行决策
  //对剩余牌库进行随机化排序，使得摸牌操作的后继状态唯一
  var cardList = [];
  for (var i = 0; i < 4; ++i) {
    var tmp = leftCard[i];
    while(tmp) {
      tmp--;
      cardList.append(i);
    }
  }
  cardList.sort(function(){
    return Math.random - 0.5;
  });
  //进行抉择
  var possilbeSelect = [0];
  for (var i = 0; i < 4; ++i) {
    if (selfCnt[i] != 0)
      possilbeSelect.append(i+1);
  }
  possilbeSelect.sort(function(){
    return Math.random - 0.5;
  });
  return possilbeSelect[0];
}

module.exports = {
  json2Form:json2Form,
  formatTime,
  setWatcher: setWatcher
}
