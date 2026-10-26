export async function create(H){const{c,C,ph,mix,save,restore,rect,line,circle,txt,photo,travel,brush}=H;
 function inkRing(x,y,r,p=1){for(let j=0;j<5;j++){c.beginPath();for(let i=0;i<=160*p;i++){const t=i/160*Math.PI*2-.7,rr=r+Math.sin(t*7+j)*3+j*1.3;let xx=x+Math.cos(t)*rr,yy=y+Math.sin(t)*rr*.84;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.lineWidth=2+j*.6;c.strokeStyle=j===3?'#252d2b35':'#252d2b75';c.stroke();}}
 function seal(x,y,s=1,r=0){save(x,y,s,r);rect(-43,-50,86,100,C.color);rect(-36,-43,72,86,null,C.bg);txt('判',0,-36,38,C.bg,'center',true);txt('断',0,4,38,C.bg,'center',true);restore();}
 function notes(x,y,loss=1,s=1){save(x,y,s);for(let i=0;i<6;i++){const q=i>=4?loss:0;save(i%3*87-110,i<3?-62:42,1,0,1-q);rect(0,-q*65,66,88,'#5d6c61');brush(9,22-q*65,56,22-q*65,2,C.bg);circle(33,49-q*65,12,null,C.bg,1);restore();}restore();}
 function burden(x,y,remove=0,s=1){save(x,y,s);for(let i=0;i<3;i++){const q=i?remove:0;save(q*470,-q*80,1,q*.12,1-q);brush(-235,-60+i*58,235,-60+i*58,34,'#404f45');restore();}restore();}
 return{draw(f){
 const[rx,ry,rr]=travel([[0,440,900,310],[388,440,920,300],[461,440,900,325],[616,440,920,285],[686,440,920,300],[783,440,920,300],[856,440,920,300],[898,440,920,310]],f);inkRing(rx,ry,rr);brush(100,1285,760,1285,7,'#7d877867');
 const st=travel([[0,760,550,-.07],[149,720,590,-.07],[198,680,710,.04],[224,670,1025,.08],[266,690,650,-.05],[349,680,1080,.04],[388,695,600,0],[461,705,750,-.08],[516,705,750,0],[563,705,1060,.06],[616,700,730,-.05],[686,700,670,.08],[742,700,670,0],[783,710,1020,-.06],[856,675,750,.08],[898,710,1080,0]],f);
 if(f<388){
 if(f<198){photo('headphone',170,700,230,240);photo('headphone',460,700-50*(1-ph(f,158,179)),230,240);txt('已有同类',285,1010,34,C.muted,'center');if(f>=179)txt('又跟风加购',575,1010,34,C.color,'center');}
 else if(f<224){notes(440,890,0,1.3);txt('盲目选择',440,1210,47,C.fg,'center',true);}
 else if(f<266){burden(440,920);txt('负担，叠了上去',440,1210,47,C.fg,'center',true);}
 else {const q=ph(f,310,333);brush(200,830,330,760,9,C.fg);brush(330,760,460,790,9,C.fg);brush(460,790,570,670,9,C.fg);brush(570,670,690,940,13,C.color,q);notes(425,1065,q,.85);if(f>=333)txt(f>=349?'损失之后，压力仍在':'本金受损',440,1210,39,C.color,'center');}
 }else if(f<461){['消费有取舍','本金有边界','负担要减少'].forEach((s,i)=>{circle(220,735+i*135,10,C.color);txt(s,265,700+i*135,50,C.fg,'left',true);});}
 else if(f<616){photo('headphone',155,720,230,240);const q=ph(f,482,518);save(q*380,-q*90,1,q*.18,1-q);photo('headphone',465,720,230,240);restore();if(f<563){brush(470,765,680,930,12,C.color,ph(f,477,495));if(f>=518)txt('不再多买一件',440,1130,43,C.color,'center');}else{save(0,22*(1-ph(f,563,583)),1,0,ph(f,563,583));photo('food',465,710,230,250);restore();txt('想要',270,1080,48,C.color,'center',true);txt('需要',580,1080,48,C.fg,'center',true);} }
 else if(f<686){inkRing(440,920,245,ph(f,616,647));notes(440,905,1,1.3);txt('先守住剩下的',440,1210,46,C.fg,'center',true);}
 else if(f<783){const q=ph(f,742,761);rect(185,730,510,360,C.color);if(q>.9){txt('风险',440,820,95,C.bg,'center',true);txt('看清背后的条件',440,997,32,C.bg,'center');}save();c.beginPath();c.rect(185+510*q,730,510*(1-q),360);c.clip();rect(185,730,510,360,C.fg);if(q<.15){txt('高回报',440,825,78,C.bg,'center',true);txt('宣传说法 · 示意',440,1010,29,C.bg,'center');}restore();if(q>0&&q<1)brush(185+510*q,730,185+510*q,1090,27,C.bg);}
 else if(f<856){notes(360,960,1,1);const q=ph(f,783,810);save(q*240,0,1,0,1-q);rect(550,760,200,220,C.color);txt('投机',650,795,47,C.bg,'center');txt('炒作',650,865,47,C.bg,'center');restore();brush(560,725,560,1095,10,C.color,ph(f,785,806));txt('远离',340,1210,56,C.color,'center',true);}
 else if(f<898){burden(440,890,ph(f,856,879));txt('减负，不是清零',440,1210,44,C.fg,'center',true);}
 else{['取舍','守住','减负'].forEach((s,i)=>{inkRing(220+i*220,920,86);txt(s,220+i*220,890,42,C.fg,'center',true);});}
 seal(st[0],st[1],1,st[2]);
 if(f>=388&&f<898){const which=f<616?0:f<856?1:2;['消费','本金','负债'].forEach((s,i)=>{txt(s,100+i*205,1400,36,i===which?C.color:C.muted);if(i===which)brush(100+i*205,1460,185+i*205,1460,5,C.color);});}
 return{carrier:'judgment-seal',seal:{x:st[0],y:st[1],rotation:st[2]},inkRing:{x:rx,y:ry,r:rr}};
 }};
}
