(function(){
  const VERSION='1.0.1-beta';
  const TRYAL_SETUPS={
    4:{notWitch:18,witch:1,constable:1,perPlayer:5},
    5:{notWitch:23,witch:1,constable:1,perPlayer:5},
    6:{notWitch:27,witch:2,constable:1,perPlayer:5},
    7:{notWitch:32,witch:2,constable:1,perPlayer:5},
    8:{notWitch:29,witch:2,constable:1,perPlayer:4},
    9:{notWitch:33,witch:2,constable:1,perPlayer:4},
    10:{notWitch:27,witch:2,constable:1,perPlayer:3}
  };
  const PLAY_CARDS=[
    {key:'accusation',name:'指控',type:'red',count:35,points:1,text:'对一名其他玩家放置1点指控。'},
    {key:'evidence',name:'证据',type:'red',count:5,points:3,text:'对一名其他玩家放置3点指控。'},
    {key:'witness',name:'证人',type:'red',count:1,points:7,text:'对一名其他玩家放置7点指控。'},
    {key:'alibi',name:'托辞',type:'green',count:3,text:'移除一名其他玩家面前最多3点指控。'},
    {key:'arson',name:'纵火',type:'green',count:1,text:'弃掉一名其他玩家的全部手牌。'},
    {key:'curse',name:'诅咒',type:'green',count:1,text:'弃掉一名其他玩家面前1张蓝牌。'},
    {key:'robbery',name:'抢劫',type:'green',count:1,text:'将一名玩家的全部手牌交给另一名玩家。'},
    {key:'scapegoat',name:'替罪羊',type:'green',count:2,text:'将一名玩家面前全部红牌、蓝牌和枷锁移动给另一名玩家。'},
    {key:'stocks',name:'枷锁',type:'green',count:3,text:'放在一名其他玩家面前；该玩家下个回合被跳过，随后弃掉。'},
    {key:'black_cat',name:'黑猫',type:'blue',count:1,text:'放在一名玩家面前；持有者先行动，阴谋时需先翻审判牌。'},
    {key:'asylum',name:'庇护所',type:'blue',count:1,text:'持有者不会在夜晚被女巫杀死。'},
    {key:'piety',name:'虔诚',type:'blue',count:1,text:'其他玩家不能对持有者打红牌。'},
    {key:'matchmaker',name:'媒人',type:'blue',count:2,text:'两名媒人持有者绑定；其中一人死亡，另一人也死亡。'},
    {key:'conspiracy',name:'阴谋',type:'black',count:1,text:'立即结算阴谋：黑猫先翻牌，随后所有存活玩家传递1张未公开审判牌。'},
    {key:'night',name:'夜晚',type:'black',count:1,text:'立即进入夜晚：女巫行动，警长保护，自首，然后公布结果。'}
  ];
  const TOWN_ROLES=[
    {key:'abigail',name:'阿比盖尔·威廉姆斯',text:'你打出最后指控并翻开审判牌后，可弃掉自己面前所有指控。'},
    {key:'ann',name:'安·普特南',text:'你打出最后指控时，翻牌前可抽2张，并可继续在本回合使用。'},
    {key:'cotton',name:'科顿·马瑟',text:'打到你身上的证据只算1点指控。'},
    {key:'giles',name:'贾尔斯·科里',text:'你抽到的2张牌都是指控时，展示后额外抽1张。'},
    {key:'george',name:'乔治·伯勒斯',text:'你需要8点指控才会被翻审判牌。'},
    {key:'john',name:'约翰·普罗克特',text:'有玩家死亡时，你获得其手牌和面前蓝牌。'},
    {key:'martha',name:'玛莎·科里',text:'你获得右手边第一个存活玩家的角色能力。'},
    {key:'mary',name:'玛丽·沃伦',text:'你不受媒人和黑猫的不利效果。'},
    {key:'rebecca',name:'丽贝卡·纳斯',text:'其他玩家审判牌被非死亡、非自首方式翻开时，你可抽1张。'},
    {key:'samuel',name:'塞缪尔·帕里斯',text:'每局2次，可从弃牌堆拿最多2张非黑牌代替抽牌。'},
    {key:'sarah',name:'萨拉·古德',text:'对你使用的抢劫和纵火无效并弃掉。'},
    {key:'thomas',name:'托马斯·丹福斯',text:'你打出第6点指控时可翻目标审判牌；对乔治需第7点。'},
    {key:'tituba',name:'蒂图芭',text:'每局1次，自己抽牌前可查看并调整牌堆顶部顺序。'},
    {key:'will',name:'威尔·格里格斯',text:'你可把托辞当作证人使用。'},
    {key:'william',name:'威廉·菲普斯',text:'每局1次，自首时不用翻审判牌。'}
  ];
  const clone=o=>JSON.parse(JSON.stringify(o));
  const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const expand=(items,prefix)=>items.flatMap(item=>Array.from({length:item.count},(_,i)=>({...clone(item),id:prefix+'_'+item.key+'_'+(i+1)})));
  const buildTryalDeck=count=>{
    const cfg=TRYAL_SETUPS[count];if(!cfg)throw new Error('仅支持4-10人标准配置');
    return shuffle([
      ...Array.from({length:cfg.notWitch},(_,i)=>({id:'tryal_not_'+(i+1),key:'not_witch',name:'不是女巫'})),
      ...Array.from({length:cfg.witch},(_,i)=>({id:'tryal_witch_'+(i+1),key:'witch',name:'女巫'})),
      {id:'tryal_constable_1',key:'constable',name:'警长'}
    ])
  };
  const buildPlayingDeck=()=>shuffle(expand(PLAY_CARDS,'play'));
  const buildRoleDeck=()=>shuffle(TOWN_ROLES.map(r=>({...clone(r),id:'role_'+r.key})));
  const getCard=key=>PLAY_CARDS.find(c=>c.key===key);
  const setupGame=(names,mode)=>{
    if(!TRYAL_SETUPS[names.length])throw new Error('标准规则仅支持4-10人');
    const cfg=TRYAL_SETUPS[names.length],tryals=buildTryalDeck(names.length),roles=buildRoleDeck(),deck=buildPlayingDeck();
    const players=names.map((name,i)=>{
      const hand=[];
      for(let h=0;h<3;h++)hand.push(deck.shift());
      const myTryals=tryals.slice(i*cfg.perPlayer,(i+1)*cfg.perPlayer).map((card,slot)=>({...card,slot,revealed:false}));
      return{name,alive:true,hand,tryals:myTryals,everWitch:myTryals.some(t=>t.key==='witch'),roleCard:mode==='character'?roles[i]:null,red:[],blue:[],stocks:0,skipped:false,used:{samuel:0,tituba:false,william:false}};
    });
    const firstIndex=Math.floor(Math.random()*players.length);
    const blackCatIndex=deck.findIndex(c=>c.key==='black_cat');
    if(blackCatIndex>=0)players[firstIndex].blue.push(deck.splice(blackCatIndex,1)[0]);
    return{version:VERSION,mode,players,deck,discard:[],turnIndex:firstIndex,round:1,phase:'day',log:['黑猫放在了 '+players[firstIndex].name+' 面前'],constableRevealed:false,lastEventId:0}
  };
  const isWitchPlayer=p=>p.everWitch||p.tryals.some(t=>!t.revealed&&t.key==='witch');
  const isConstablePlayer=(p,constableRevealed)=>!constableRevealed&&p.alive&&p.tryals.some(t=>!t.revealed&&t.key==='constable');
  const roleSummary=(p,constableRevealed)=>{
    const w=isWitchPlayer(p),c=isConstablePlayer(p,constableRevealed);
    if(w&&c)return'witch_constable';if(w)return'witch';if(c)return'constable';return'villager'
  };
  const accusationTotal=p=>p.red.reduce((sum,c)=>sum+(c.points||0),0);
  const revealThreshold=p=>p.roleCard?.key==='george'?8:7;
  const publicPlayer=p=>({name:p.name,alive:p.alive,tryals:p.tryals.map(t=>({slot:t.slot,revealed:t.revealed,name:t.revealed?t.name:''})),roleCard:p.roleCard?{key:p.roleCard.key,name:p.roleCard.name,text:p.roleCard.text}:null,redTotal:accusationTotal(p),blue:p.blue.map(c=>c.name),stocks:p.stocks});
  const privatePlayer=p=>({...publicPlayer(p),used:p.used||{},hand:p.hand.map(c=>({id:c.id,key:c.key,name:c.name,type:c.type,text:c.text,points:c.points||0})),tryals:p.tryals.map(t=>({slot:t.slot,revealed:t.revealed,name:t.name,key:t.key}))});
  window.SALEM_RULES={VERSION,TRYAL_SETUPS,PLAY_CARDS,TOWN_ROLES,setupGame,buildPlayingDeck,buildTryalDeck,getCard,roleSummary,isWitchPlayer,isConstablePlayer,accusationTotal,revealThreshold,publicPlayer,privatePlayer,shuffle};
})();
