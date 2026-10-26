export async function create(H){const{c,C,ph,mix,save,restore,rect,line,circle,txt,photo,travel}=H,red='#f2a78b';
 const pos=[[234,590],[635,590],[234,965],[635,965]],labels=['消费选择','本金状态','负债状态','收益说法'];
 function corners(x,y,w,h,col=C.color,p=1){for(const [xx,yy,sx,sy]of[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){line(xx,yy,xx+sx*30*p,yy,col,5);line(xx,yy,xx,yy+sy*30*p,col,5);}}
 function barNotes(x,y,q=1){for(let i=0;i<6;i++){let loss=i>=4?q:0;rect(x+i%3*66,y+Math.floor(i/3)*65,48,48,loss>.99?'#213c36':C.color);if(loss>0&&loss<1)rect(x+i%3*66,y+Math.floor(i/3)*65,48*(1-loss),48,C.color);}}
 return{draw(f){
 const focus=f<198?0:f<224?1:f<266?2:f<349?1:f<388?2:f<461?-1:f<616?0:f<686?1:f<856?3:2;
 for(let x=215;x<=1020;x+=50)line(x,515,x,1295,'#a9bdb210',1);for(let y=515;y<=1295;y+=50)line(215,y,1020,y,'#a9bdb210',1);
 ['消费','本金','负债'].forEach((s,i)=>{const a=f<388?(focus===0?0:focus===2?2:1):f<461?-1:f<616?0:f<856?1:2;txt('0'+(i+1),72,600+i*215,36,i===a?C.color:C.muted);txt(s,64,655+i*215,35,i===a?C.fg:C.muted);if(i===a)rect(64,710+i*215,80,4,C.color);});
 for(let i=0;i<4;i++){const[x,y]=pos[i];rect(x,y,345,300,'#203b35',null,8);line(x+24,y+61,x+321,y+61,'#46675b',2);txt(labels[i],x+24,y+17,33,C.fg);
 if(i===0){photo('headphone',x+24,y+93,127,125);if(f>=563)photo('food',x+192,y+93,127,130);else{photo('headphone',x+192,y+93,127,125);if(f>=482){line(x+193,y+98,x+312,y+214,red,5);line(x+312,y+98,x+193,y+214,red,5);}}if(f>=585){txt('想要',x+80,y+241,28,red,'center');txt('需要',x+251,y+241,28,C.color,'center');}}
 if(i===1){barNotes(x+70,y+105,ph(f,310,333));if(f>=333)txt(f<616?'本金已受损':'守住剩余本金',x+172,y+246,29,f<616?red:C.color,'center');}
 if(i===2){for(let j=0;j<3;j++){let q=j?ph(f,856,879):0;rect(x+35,y+92+j*43,270*(1-q),26,j?red:C.color);}txt(f<856?'负担累积':'减少，不是清零',x+172,y+246,29,f<856?red:C.color,'center');}
 if(i===3){txt(f>=761?'风险':'收益说法',x+172,y+125,f>=761?56:44,f>=761?red:C.fg,'center');txt(f>=783?'远离投机与炒作':'待检查',x+172,y+246,28,C.muted,'center');}
 }
 let track=[[0,222,578,369,324],[198,623,578,369,324],[224,222,953,369,324],[266,623,578,369,324],[349,222,953,369,324],[388,213,565,790,725],[461,222,578,369,324],[616,623,578,369,324],[686,210,565,800,725],[783,623,953,369,324],[856,222,953,369,324],[898,213,565,790,725]];
 // Focus handoff begins at each source sentence, then settles; does not pre-reveal next target.
 const stops=[];for(let i=0;i<track.length;i++){let a=track[i];if(i)stops.push([a[0],...track[i-1].slice(1)]);stops.push([a[0]+(i?20:0),...a.slice(1)]);}const r=travel(stops,f);
 if(f>=686&&f<783){const grow=ph(f,686,708);save();rect(210,565,800,725,C.bg,'#496c60',12);txt('收益说法 / 内部检查',250,605,34,C.color);const q=ph(f,742,761);rect(265,712,690,400,'#efaa8c',null,6);if(q>.9){txt('风险',610,810,100,'#402c26','center');txt('不能只看表面承诺',610,1015,36,'#402c26','center');}save();c.beginPath();c.rect(265,712,690*(1-q),400);c.clip();rect(265,712,690,400,'#33594b');if(q<.15){txt('高回报',610,810,89,C.fg,'center');txt('宣传说法 · 示意',610,1020,31,C.fg,'center');}restore();if(q>0&&q<1)line(265+690*(1-q),712,265+690*(1-q),1112,C.color,7);txt(q>.95?'已看见：风险':'逐层检查，不只看承诺',610,1190,37,q>.95?red:C.muted,'center');restore();}
 corners(...r);const note=f<388?'先看见选择带来的变化':f<461?'三条底线，分别判断':f<616?'核查消费：先分清需要':f<686?'核查本金：先守住剩余':f<783?'核查说法：看清背后风险':f<856?'核查边界：远离投机':f<898?'核查负担：减少不清零':'判断完成，再做选择';
 txt('当前观察',64,1338,28,C.muted);txt(note,64,1400,35,C.fg);line(64,1470,650,1470,C.color,2);
 return{focus,corners:r,coordinatesStable:true,fictionalFinancialReadouts:false};
 }};
}
