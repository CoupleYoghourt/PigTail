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


//随机选择
function randomPolicy(state) {
  while (!state.isTerminal()) {
    let item = state.getPossilbeActions();
    item.sort(function(){
      Math.random() - 0.5;
    });
    let choice = item[0];
    let newState = state.tackAction(choice);
    state = new State(newState.selfCnt, newState.enemyCnt, newState.placeAreaCnt, newState.placeTop, newState.Deck);
  }
  return state.getReward();
  //console.log("randomPolicy");
}


function deepClone(obj) {
  let _obj = JSON.stringify(obj),
  objClone = JSON.parse(_obj);
  return objClone;
}

class State {
  //初始化局面
  constructor(selfCnt, enemyCnt, placeAreaCnt, placeTop, Deck) {
    this.selfCnt = deepClone(selfCnt);
    this.enemyCnt = deepClone(enemyCnt);
    this.placeAreaCnt = deepClone(placeAreaCnt);
    this.placeTop = deepClone(placeTop);
    this.Deck = deepClone(Deck);
    this.currentPlayer = 1;
  }
  //当前的玩家
  getCurrentPlayer() {
    return this.currentPlayer;
  }
  //允许的操作集合
  getPossilbeActions() {
    let possilbeActions = [0];
    for (let i = 0; i < 4; ++i) {
      //如果是己方
      if (this.currentPlayer == 1) {
        if (this.selfCnt[i] != 0) {
          possilbeActions.push(i+1);
        }
      }
      // 如果是对方
      else {
        if (this.enemyCnt[i] != 0) {
          possilbeActions.push(i+1);
        }
      }
    }
    return possilbeActions;
  }
  //进行操作后到达的局面
  tackAction(action) {
    //拷贝当前局面
    let newSate = new State(this.selfCnt, this.enemyCnt, this.placeAreaCnt, this.placeTop, this.Deck);
    if (action == 0) {
      let index = newSate.Deck.pop();
      newSate.placeAreaCnt[index]++;
      //进行吃牌判断
      if (index == newSate.placeTop) {
        for (let i = 0; i < 4; ++i) {
          //判断归属
          if (newSate.currentPlayer == 1) {
            newSate.selfCnt[i] += newSate.placeAreaCnt[i];
          }
          else {
            newSate.enemyCnt[i] += newSate.placeAreaCnt[i];
          }
          newSate.placeAreaCnt[i] = 0;
        }
        newSate.placeTop = -1;
      }
      else {
        newSate.placeTop = index;
      }
    }
    else {
      let index = action - 1;
      //出牌，判断是谁的回合，对应的手牌减少！
      if (newSate.currentPlayer == 1) {
        newSate.selfCnt[index]--;
      }
      else {
        newSate.enemyCnt[index]--;
      }
      newSate.placeAreaCnt[index]++;
      //吃牌判断
      if(newSate.placeTop == index) {
        for (let i = 0; i < 4; ++i) {
          //判断归属
          if (newSate.currentPlayer == 1) {
            newSate.selfCnt[i] += newSate.placeAreaCnt[i];
          }
          else {
            newSate.enemyCnt[i] += newSate.placeAreaCnt[i];
          }
          newSate.placeAreaCnt[i] = 0;
        }
        newSate.placeTop = -1;
      }
      else {
        newSate.placeTop = index;
      }
    }
    newSate.currentPlayer *= -1;
    //console.log("takeAction");
    return newSate;
  }
  //游戏是否结束
  isTerminal() {
    if (this.Deck.length == 0)
      return true;
    else
      return false;
  }
  //奖励分数计算
  getReward() {
    let s1 = 0, s2 = 0;
    for (let i = 0; i < 4; ++i) {
      s1 += this.selfCnt[i];
      s2 += this.enemyCnt[i];
    }
    return s1 > s2 ? 1 : 0;
  }
}

//定义树节点
class treeNode {
  constructor (state, parent) {
    this.state = new State(state.selfCnt, state.enemyCnt, state.placeAreaCnt, state.placeTop, state.Deck);
    this.isTerminal = state.isTerminal();
    this.parent = parent;
    this.isFullyExpanded = this.isTerminal;
    this.numVisits = 1.0;
    this.totalReward = 0.0;
    this.children = {};
  }
}

//定义搜索算法
class MCTS {
  constructor (timeLimit, iterationLimit, explorationConstant=1.0 / Math.sqrt(2), rolloutPolicy=randomPolicy) {
    //console.log(timeLimit);
    if (timeLimit === undefined) {
      this.searchLimit = iterationLimit;
      this.limitType = "iterations";
    }
    else {
      this.timeLimit = timeLimit;
      this.limitType = "time";
    }
    //console.log(this.limitType);
    this.explorationConstant = explorationConstant;
    this.rollout = rolloutPolicy;
  }
  //抉择出较优的一步
  search(initialState, needDetails=false) {
    this.root = new treeNode(initialState);
    //基于时间或者迭代次数设置
    if (this.limitType == "time") {
      //console.log("AAAA");
      let time = new Date();
      let timeLimit = time.getTime() + this.timeLimit / 1000;
      while (time.getTime() < timeLimit) {
        //console.log(time.getTime());
        this.executeRound();
      }
    }
    else {
      //console.log("SSSS");
      for (let i = 0; i < this.searchLimit; ++i) {
        this.executeRound();
      }
    }
    //结束搜索，返回最优节点
    let bestChild = this.getBestChild(this.root, 0);
    //console.log("endsearch");
    for (let action in this.root.children) {
      let node = this.root.children[action];
      if (node === bestChild) {
        return action;
      }
    }
    return 0;
  }

  executeRound() {
    //console.log("executeRound");
    let node = this.selectNode(this.root);
    let reward = this.rollout(node.state);
    if (reward === undefined) {
      console.log(node);
    }
    this.backpropogate(node, reward);
  }

  selectNode(node) {
    //console.log("selectNode");
    while (node.isTerminal == false) {
      if (node.isFullyExpanded) {
        node = this.getBestChild(node, this.explorationConstant);
        //console.log("now is selecting");
        //console.log(node);
      }
      else {
        return this.expand(node);
      }
    }
    return node;
  }

  expand(node) {
    //console.log("expand");
    let actions = node.state.getPossilbeActions();
    //console.log(actions);
    //console.log(node.children);
    for (let action of actions) {
      if (!(action in node.children)) {
        let newNode = new treeNode(node.state.tackAction(action), node);
        node.children[action] = newNode;
        //console.log(Object.getOwnPropertyNames(node.children).length);
        if (actions.length == Object.getOwnPropertyNames(node.children).length) {
          node.isFullyExpanded = true;
        }
        return newNode;
      }
    }
    //console.log(node);
  }
  //上传遍历次数以及奖励分数
  backpropogate(node, reward) {
    //console.log("backpropogate");
    while (node) {
      node.numVisits += 1;
      node.totalReward += reward;
      // if (node.totalReward > 100000)
      //   node.totalReward = 100000;
      // if (node.totalReward < -100000)
      //   node.totalReward = -100000;
      node = node.parent;
    }
  }

  getBestChild(node, explorationValue) {
    //console.log("getBestChild");
    let bestValue = -Infinity;
    let bestNodes = [];
    for (let index in node.children) {
      let child = node.children[index];
      let nodeValue = child.totalReward / child.numVisits + explorationValue * Math.sqrt(2 * Math.log(node.numVisits) / child.numVisits);
      if (nodeValue > bestValue) {
        bestValue = nodeValue;
        bestNodes = [child];
      }
      else if (nodeValue == bestValue) {
        bestNodes.push(child);
      }
    }
    if (bestNodes.length == 0) {
      for (let index in node.children) {
        let child = node.children[index];
          bestNodes.push(child);
      }
    }
    bestNodes.sort(function(){
      return Math.random() - 0.5;
    });
    return bestNodes[0];
  }
}



//抉择函数，选择最优的操作
//对手手牌状态，己方手牌状态，放置区手牌状态, 放置区牌顶
//顺序CDSH
//返回一个值0 摸牌， 1，2，3，4分别表示CDSH
function Mcts(enemyCnt, selfCnt, placeArea, placeTop_card) {
  let placeAreaCnt = [0,0,0,0];
  for (let i = 0; i < 4; ++i) {
    placeAreaCnt[i] = placeArea[i].length;
  }
  //统计牌库的状态
  let leftCard = [13,13,13,13];
  for (let i = 0; i < 4; ++i) {
    leftCard[i] -= enemyCnt[i];
    leftCard[i] -= selfCnt[i];
    leftCard[i] -= placeAreaCnt[i];
  }
  let sumSelf = 0, sumLeft = 0, sumPlace = 0, sumEney = 0;
  for (let i = 0; i < 4; ++i) {
    sumSelf += selfCnt[i];
    sumLeft += leftCard[i];
    sumPlace += placeAreaCnt[i];
    sumEney += enemyCnt[i];
  }
  //如果没有手牌，那么只能摸牌
  if (sumSelf == 0) {
    return 0;
  }
  //放置区顶牌对应的下标
  let index = -1;
  switch(placeTop_card[0]) {
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
  
  //牌库的牌数量多于手牌，考虑用蒙特卡洛树搜索进行决策
  //对剩余牌库进行随机化排序，使得摸牌操作的后继状态唯一
  let cardList = [];
  for (let i = 0; i < 4; ++i) {
    let tmp = leftCard[i];
    while(tmp) {
      tmp--;
      cardList.push(i);
    }
  }
  let ansCnt = [0,0,0,0,0];
  
  for (let i = 0; i < 200; ++i) {
    cardList.sort(function(){
      return Math.random() - 0.5;
    });
    let Game = new State(selfCnt, enemyCnt, placeAreaCnt, index, cardList);
    let searcher = new MCTS(undefined, 100,);
    let action = searcher.search(Game);
    ansCnt[action]++;
  }
  console.log(ansCnt);
  let maxCnt = -1, act = -1;
  for (let i = 0; i <= 4; ++i) {
    if (maxCnt < ansCnt[i]) {
      maxCnt = ansCnt[i];
      act = i;
    }
  }
  if (act == 0) {
    return 0;
  }
  if (selfCnt[act - 1] == 0) {
    act = 0;
  }
  console.log(act);
  return act;
}

module.exports = {
  json2Form:json2Form,
  formatTime,
  setWatcher: setWatcher,
  Mcts: Mcts
}
