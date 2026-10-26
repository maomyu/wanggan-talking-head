const C=window.CONFIG,G=C.grammar,T=C.timing,$=id=>document.getElementById(id),cv=$('art'),c=cv.getContext('2d');
const P={paper:'#f1eddf',white:'#fffdf6',ink:'#252e29',muted:'#626e62',red:'#aa3e32',rose:'#edd1bf',green:'#426657',pale:'#dce3d4',line:'#bfc6b8',sand:'#cabe96'};
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ph=(f,a,b)=>smooth((f-a)/(b-a)),out=x=>1-(1-clamp(x))**3;
const spr=x=>{x=clamp(x);return x===1?1:1-Math.exp(-8*x)*Math.cos(x*10)},phase=(f,a,n=20)=>out((f-a)/n);
let f=0,boxes=[],mat=[],cameraState=null;
const img=new Image();img.src='assets/life-objects.png';await img.decode();
function save(x=0,y=0,s=1,r=0,a=1){c.save();c.translate(x,y);c.scale(s,s);c.rotate(r);c.globalAlpha*=a;}
const restore=()=>c.restore();
function rect(x,y,w,h,fill=P.white,stroke=null,r=0){c.beginPath();if(r)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(x1,y1,x2,y2,color=P.line,width=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function circle(x,y,r,fill=null,stroke=null,lw=3){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function txt(s,x,y,size=44,color=P.ink,align='left',serif=false,critical=true){c.font=`${serif?'700':'500'} ${size}px ${serif?'Title':'Body'}`;c.textAlign=align;c.textBaseline='top';c.fillStyle=color;c.fillText(s,x,y);const m=c.measureText(s),tr=c.getTransform(),a=tr.transformPoint({x:x-(align==='center'?m.width/2:align==='right'?m.width:0),y}),b=tr.transformPoint({x:x+(align==='center'?m.width/2:align==='right'?0:m.width),y:y+size*1.16});if(c.globalAlpha>.98&&critical)boxes.push({text:s,x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(b.x-a.x),h:Math.abs(b.y-a.y),size:size*Math.hypot(tr.a,tr.b)});}
function shadow(on=true){c.shadowColor=on?'#29302424':'transparent';c.shadowBlur=on?18:0;c.shadowOffsetY=on?12:0;}
function paper(x,y,w,h,fill=P.white){shadow();rect(x,y,w,h,fill);shadow(false);rect(x,y,w,h,null,P.line);}
function photo(kind,x,y,w,h){const src=kind==='food'?[0,572,625,680]:[30,0,565,570];c.drawImage(img,...src,x,y,w,h);}
function photoCard(kind,x,y,w=260,label='',a=1,angle=0){save(x,y,1,angle,a);paper(0,0,w,w+75);photo(kind,12,10,w-24,w-20);if(label)txt(label,w/2,w+12,Math.min(38,w/6.2),P.ink,'center');restore();}
function note(n,x,y,s=1,loss=0){save(x,y,s);for(let i=0;i<n;i++){const gone=i>=4?loss:0;save(i*35,gone*150,1,(i%2?1:-1)*.025,1-gone);rect(0,0,115,153,P.pale,P.green,3);rect(8,10,99,133,null,P.green,1);circle(58,76,22,null,P.green,2);restore();}restore();}
function shield(x,y,w=420,h=250){save(x,y);c.beginPath();c.moveTo(0,25);c.lineTo(w/2,0);c.lineTo(w,25);c.lineTo(w,h-50);c.quadraticCurveTo(w*.85,h,w/2,h+30);c.quadraticCurveTo(w*.15,h,0,h-50);c.closePath();c.fillStyle=P.pale;c.fill();c.strokeStyle=P.green;c.lineWidth=4;c.stroke();restore();}
function debt(x,y,w=520,reduce=0,s=1){save(x,y,s);for(let i=0;i<3;i++){let p=i?reduce:0;save(p*460,-p*50,1,p*.08,1-p);rect(0,i*80,w,61,P.rose,P.red);txt('负债',20,i*80+10,36,P.red);restore();}restore();}
function mark(x,y,w,p=1,color=P.red){line(x,y,x+w*p,y-25*p,color,7);}
function cross(x,y,w,h,p=1){line(x,y,x+w*p,y+h*p,P.red,7);line(x+w,y,x+w*(1-p),y+h*p,P.red,7);}
function chip(s,x,y,w=180,color=P.green){rect(x,y,w,59,color,null,2);txt(s,x+w/2,y+10,34,P.white,'center');}
function captionHeader(s,x,y){txt(s,x,y,36,P.muted);line(x,y+59,x+540,y+59);}
function chart(x,y,w,h,p=1){save(x,y);for(let j=1;j<=3;j++)line(0,h*j/3,w,h*j/3,P.line,1);let pts=[[0,.7],[.17,.55],[.31,.62],[.5,.25],[.63,.4],[.73,.12],[.85,.65],[1,.91]],max=(pts.length-1)*p;c.beginPath();for(let i=0;i<=Math.floor(max);i++){let q=pts[i];i?c.lineTo(q[0]*w,q[1]*h):c.moveTo(q[0]*w,q[1]*h);}if(max<pts.length-1){let i=Math.floor(max),t=max-i;c.lineTo(mix(pts[i][0],pts[i+1][0],t)*w,mix(pts[i][1],pts[i+1][1],t)*h);}c.lineWidth=6;c.strokeStyle=P.red;c.stroke();restore();}
function promo(x,y,w,h,p=0){save(x,y);paper(0,0,w,h,P.ink);if(p>.88){txt('风险',w/2,h*.29,Math.min(90,w/4.5,h*.29),P.rose,'center',true);txt('藏在表象背面',w/2,h*.73,Math.min(37,w/10,h*.12),P.white,'center');}if(p<1){c.save();c.beginPath();c.rect(0,0,w*(1-p),h);c.clip();rect(0,0,w,h,P.red);if(p<.4){txt('宣传说法 · 示意',20,16,Math.min(25,h*.1),P.white);txt('高回报',w/2,h*.28,Math.min(78,w/4,h*.25),P.white,'center',true);txt('夸大的收益承诺',w/2,h*.75,Math.min(35,w/10,h*.12),P.white,'center');}c.restore();if(p>0){let edge=w*(1-p);rect(edge,0,28,h,P.sand);line(edge+28,0,edge+28,h,P.line,2);}}restore();}
function resultRow(y=1400){const ss=['少冲动','守本金','减负债'];for(let i=0;i<3;i++){circle(120+i*210,y+23,8,P.green);txt(ss[i],145+i*210,y,35,P.green);}}
function wrapTitle(){let a=f<149?['越努力，','越存不下？']:f<388?['跟着别人，','选择会失控。']:f<461?['给自己，','三条底线。']:f<616?['先分清，','再下单。']:f<686?['先守住，','自己的本金。']:f<783?['收益说法，','翻到背面看。']:f<856?['投机与炒作，','留在外面。']:f<898?['少一点，','负担。']:['把判断，','留给自己。'];return a.join('\n');}
function baseline(){rect(0,0,1080,1920,P.paper);for(let y=104;y<1880;y+=9){line(0,y,1080,y,'#3c452c02',1);}line(64,80,1016,80,P.ink,2);txt('自己的选择 / 自己的判断',64,108,24,P.muted);txt(G.id+'  '+G.name,1016,108,24,P.muted,'right');line(64,464,146,464,P.red,5);line(64,1850,1016,1850,P.line,2);line(64,1850,64+952*f/1099,1850,P.red,3);txt('物件、图解与数量为示意',64,1798,23,P.muted);txt('原声完整保留',1016,1798,23,P.muted,'right');}
function travel(track){let a=track[0];for(let i=1;i<track.length;i++){let b=track[i];if(f<b[0]){let p=ph(f,a[0],b[0]);return a.slice(1).map((v,j)=>mix(v,b[j+1],p));}a=b;}return a.slice(1);}
function overviewLabels(){txt('消费',205,1200,40,P.ink,'center');txt('本金',495,1200,40,P.ink,'center');txt('负债',770,1200,40,P.ink,'center');}
function spatial(){
 const [cx,z]=travel([[0,0,.31],[149,-950,.86],[195,-950,.86],[217,0,.88],[224,0,.88],[246,950,.86],[266,950,.86],[288,0,.88],[349,0,.88],[367,950,.88],[388,950,.88],[417,0,.31],[461,0,.31],[486,-950,.86],[610,-950,.86],[641,0,.88],[850,0,.88],[874,950,.88],[898,950,.88],[926,0,.31],[1099,0,.31]]);
 cameraState={x:cx,scale:z};c.save();c.beginPath();c.rect(36,500,1008,795);c.clip();c.translate(540-cx*z,895);c.scale(z,z);
 for(let i=0;i<3;i++){let x=(i-1)*950;paper(x-415,-340,830,745);txt(['01 / 消费','02 / 本金','03 / 负债'][i],x-360,-295,46,P.green);}
 // Paths connect locations as an index, never causal arrows.
 line(-520,-370,520,-370,P.green,4);circle(0,-370,9,P.green);
 save(-950,0);if(f<461){photoCard('headphone',-320,-160,270,'已有同类');photoCard('headphone',70,-140,270,'跟风加购',phase(f,163,20),.04);}else{photoCard('headphone',-320,-160,270,'已有同类');let d=ph(f,482,515);photoCard('headphone',70+d*350,-140-d*170,270,'额外加购',1-d,.04+d*.4);if(f<530)cross(80,-130,240,240,phase(f,477));let q=phase(f,563,20);photoCard('food',65,-160+(1-q)*40,270,'日常采购',q);if(f>=585){txt('想要',-190,250,52,P.red,'center');txt('需要',200,250,52,P.green,'center');}}restore();
 save(0,0);if(f<616){chart(-340,-180,680,220,f<310?phase(f,266,34)*.67:.67+phase(f,310,24)*.33);note(6,-170,125,1,ph(f,310,333));if(f>=310)txt('本金受损',0,315,43,P.red,'center');}else if(f<686){shield(-250,-150,500,280);note(4,-110,-70,1);txt('保留本金',0,250,50,P.green,'center');}else if(f<783){promo(-340,-185,680,430,ph(f,742,760));}else{shield(-210,65,420,190);note(4,-120,90,.9);txt('远离投机与炒作',0,-170,53,P.red,'center');mark(-270,-90,540,phase(f,800));}restore();
 save(950,0);debt(-320,-170,640,ph(f,856,879));txt(f<856?'负担累积':'减少，不是清零',0,220,50,f<856?P.red:P.green,'center');restore();c.restore();
 if(z<.4)overviewLabels();
}
function relay(){
 const [x,y,w,h,r]=travel([[0,280,580,520,660,-.05],[149,280,580,520,660,-.05],[388,190,560,700,720,0],[461,180,560,720,720,0],[616,270,600,540,600,0],[686,180,570,720,690,.03],[783,260,560,560,720,0],[856,190,590,700,650,-.02],[898,240,580,600,670,0],[1099,240,580,600,670,0]]);
 save(x+w/2,y+h/2,1,r);paper(-w/2,-h/2,w,h);circle(-w/2+40,-h/2+45,8,null,P.green,3);txt('判断卡',0,-h/2+30,40,P.green,'center');line(-w/2+34,-h/2+94,w/2-34,-h/2+94,P.line);
 const top=-h/2+130;
 if(f<388){photo('headphone',-120,top,240,240);if(f>=164){save(90,-10,1,.06);rect(0,0,170,180,P.rose);txt('又加购',85,45,35,P.red,'center');restore();}if(f>=224)debt(-200,top+280,400,0,.8);if(f>=266){rect(-w/2+20,top,w-40,260,P.white);chart(-w/2+45,top+20,w-90,200,phase(f,266,55));}if(f>=310){note(6,-140,top+220,.9,ph(f,310,333));}if(f>=349)txt('选择，带来代价',0,h/2-80,39,P.red,'center');}
 else if(f<461){['少冲动','守本金','减负债'].forEach((s,i)=>{circle(-220,top+60+i*145,26,null,P.green);txt(s,-165,top+33+i*145,60,P.ink);});}
 else if(f<616){photoCard('headphone',-300,top,240,'已有同类');let d=ph(f,482,518);photoCard('headphone',40+d*450,top-d*70,240,'额外加购',1-d,.03+d*.2);if(f<530)cross(50,top+10,210,220,phase(f,477));if(f>=563){photoCard('food',50,top,240,'日常采购',phase(f,563));txt('想要',-180,top+370,43,P.red,'center');txt('需要',170,top+370,43,P.green,'center');}}
 else if(f<686){shield(-230,top+10,460,290);note(4,-130,top+60,1);txt('先守本金',0,top+390,55,P.green,'center');}
 else if(f<783){promo(-w/2+36,top,w-72,370,ph(f,742,761));txt('看见背后的条件',0,top+430,35,P.muted,'center');}
 else if(f<856){txt('投机 / 炒作',0,top+70,57,P.red,'center');cross(-200,top+43,400,100,phase(f,788));chip('远离',-100,top+280,200,P.green);}
 else if(f<898){debt(-260,top+10,520,ph(f,856,879));txt('少一点负担',0,top+340,50,P.green,'center');}
 else {['少冲动','守本金','减负债'].forEach((s,i)=>{circle(-210,top+40+i*130,17,P.green);txt(s,-160,top+13+i*130,52);});}
 restore();if(f>=388&&f<898){let which=f<616?0:f<856?1:2;for(let i=0;i<3;i++){rect(66,610+i*155,90,115,i===which?P.red:P.pale);txt(String(i+1).padStart(2,'0'),111,645+i*155,38,i===which?P.white:P.green,'center');}}}
function assembly(){
 const spread=ph(f,120,175);const active=f<461?-1:f<616?0:f<856?1:2; const returning=f>=898;
 for(let i=2;i>=0;i--){let selected=active===i;let y=mix(800+i*85,550+i*235,spread);let x=150;let w=780,h=145;let expand=selected?phase(f,[461,616,856][i],22):0; // pull active slice upward into a work surface
  if(active>=0){const t=[461,616,856][active],q=ph(f,t,t+22),prev=active-1;let from=active===0?[150,550+i*235,780,145]:(prev===i?[90,570,900,620]:[140+i*210,1350,180,100]);let dest=selected?[90,570,900,620]:[140+i*210,1350,180,100];[x,y,w,h]=from.map((n,j)=>mix(n,dest[j],q));if(returning){const z=ph(f,898,930);[x,y,w,h]=[x,y,w,h].map((n,j)=>mix(n,[150,760+i*135,780,145][j],z));}}
  save(x,y);c.beginPath();c.moveTo(0,h);c.lineTo(w,h);c.lineTo(w+22,h-28);c.lineTo(22,h-28);c.closePath();c.fillStyle=P.sand;c.fill();paper(0,0,w,h,selected||active<0?P.white:P.pale);
  if(active<0||returning){txt(['消费','本金','负债'][i],42,33,48);txt(['取舍','保护','减负'][i],w-40,42,36,P.muted,'right');if(i===0&&f>=149)photo('headphone',280,5,120,120);if(i===1&&f>=198)note(6,280,14,.55,ph(f,310,333));if(i===2&&f>=224){debt(280,20,350,ph(f,856,879),.45);}}
  else if(selected&&f>=[461,616,856][active]+22){txt(['01 / 拆开消费选择','02 / 合拢本金保护','03 / 拆掉多余负担'][i],36,26,40,P.green);
   if(i===0){photoCard('headphone',70,100,255,'已有同类');let d=ph(f,482,520);photoCard('headphone',470+d*400,100-d*200,255,'额外加购',1-d);if(f<530)cross(485,118,220,235,phase(f,477));if(f>=563){photoCard('food',470,100,255,'日常采购',phase(f,563));txt('想要',195,480,44,P.red,'center');txt('需要',595,480,44,P.green,'center');}}
   if(i===1){if(f<686){let p=phase(f,620,28);rect(210-180*(1-p),180,460,245,P.pale,P.green);note(4,310,210,1);rect(210,150-140*(1-p),460,40,P.green);txt('保护先合拢',450,480,46,P.green,'center');}else if(f<783){const q=ph(f,742,763);rect(170,210,560,240,P.ink);if(q>.92){txt('风险',450,260,84,P.rose,'center',true);txt('藏在说法内部',450,380,38,P.white,'center');}save(0,-q*135);rect(170,210,560,240*(1-q)+62*q,P.red);if(q<.15)txt('高回报',450,270,78,P.white,'center',true);else if(q>.95)txt('宣传说法 · 示意',450,225,34,P.white,'center');restore();line(170,180,170,440,P.line,3);line(730,180,730,440,P.line,3);}else{shield(210,130,480,250);note(4,320,185,1);txt('把投机留在保护之外',450,475,43,P.red,'center');}}
   if(i===2){debt(130,140,640,ph(f,856,880));txt('减少，不是清零',450,470,46,P.green,'center');}
  }else{txt(['消费','本金','负债'][i],w/2,25,36,P.green,'center');}restore();
 }
 if(active<0&&spread>.85){line(110,555,110,1165,P.green,4);line(110,555,132,555,P.green,4);line(110,1165,132,1165,P.green,4);txt(f<388?'问题拆开看':'三项并列，不是先后步骤',540,1250,38,P.green,'center');}
}
function parallel(){
 const left=80,right=560,w=440,top=545;paper(left,top,w,720);paper(right,top,w,720);rect(left,top,w,70,P.red);rect(right,top,w,70,P.green);txt('跟着别人',left+w/2,top+12,40,P.white,'center');txt('先做判断',right+w/2,top+12,40,P.white,'center');
 line(540,555,540,1250,P.line,2);
 if(f<388){photoCard('headphone',140,655,240,'跟风加购');if(f>=224)debt(126,1000,340,0,.9);if(f>=266){rect(105,645,390,300,P.white);chart(120,675,360,215,phase(f,266,65));}if(f>=310){note(6,160,1000,.85,ph(f,310,333));}txt('如何选择？',780,875,56,P.muted,'center',true);}
 else if(f<461){['消费','本金','负债'].forEach((s,i)=>{txt(s,300,710+i*135,50,P.red,'center');txt(['分清需要','守住本金','减少负债'][i],780,710+i*135,45,P.green,'center');});}
 else if(f<616){photoCard('headphone',150,665,280,'已有同类');photoCard('food',640,665,280,'日常采购',phase(f,563));if(f<563){photo('headphone',680,680,205,205);cross(660,690,250,230,phase(f,477));txt('先停一下',780,1085,43,P.green,'center');}else{txt('想要',290,1085,60,P.red,'center',true);txt('需要',780,1085,60,P.green,'center',true);} }
 else if(f<686){note(4,160,780,1);txt('本金已受损',300,1110,41,P.red,'center');shield(610,710,340,270);note(4,675,770,.85);txt('先守本金',780,1110,45,P.green,'center');}
 else if(f<783){promo(110,715,380,345,0);promo(590,715,380,345,ph(f,742,760));txt('表面说法',300,1140,40,P.red,'center');txt('检查背后',780,1140,40,P.green,'center');}
 else if(f<856){txt('投机 / 炒作',300,820,48,P.red,'center');cross(130,800,340,130,phase(f,790));shield(620,720,320,250);note(4,680,775,.8);txt('保持距离',780,1110,43,P.green,'center');}
 else{debt(115,715,370,0,1);debt(595,715,370,ph(f,856,879),1);txt('负担累积',300,1110,41,P.red,'center');txt('减少负担',780,1110,41,P.green,'center');}
 if(f>=388)txt('同一维度，放在一起看',70,1380,38,P.muted);
}
function reveal(){
 const y=555;paper(100,y,880,750);const corners=[[120,575],[140,595]];for(const [x,yy]of corners)rect(x,yy,840,710,null,P.line);
 if(f<388){const a=f<198?149:f<224?198:f<266?224:f<349?266:349;let p=phase(f,a,24);save(150,650);if(f<198){photoCard('headphone',70,10,250,'已有同类');photoCard('headphone',410,10,250,'又加购');}else if(f<224){note(6,250,90,1);txt('盲目选择',390,360,55,P.red,'center');}else if(f<266){debt(100,80,580);txt('负担累积',390,390,50,P.red,'center');}else if(f<349){chart(50,30,680,260,phase(f,266,65));note(6,255,330,.8,ph(f,310,333));}else{debt(100,50,580);txt('压力增加',390,390,55,P.red,'center');}rect(0,0,780*(1-p),530,P.pale);if(p<.1)txt('看见选择背后',390,170,58,P.green,'center',true);if(p>0&&p<1)rect(780*(1-p),0,22,530,P.sand);restore();}
 else if(f<461){for(let i=0;i<3;i++){paper(150,630+i*175,780,140,i===1?P.pale:P.white);txt(['消费的背面','本金的边界','负担的层数'][i],200,670+i*175,52);}}
 else if(f<616){photoCard('headphone',170,680,290,'已有同类');photoCard('food',600,680,290,'日常采购');let p=ph(f,563,585);rect(135,635,810*(1-p),520,P.pale);if(p<.1){txt('想买，就要买吗？',540,800,65,P.green,'center',true);mark(230,935,620,phase(f,483));}if(p>.9){txt('想要',315,1140,54,P.red,'center');txt('需要',745,1140,54,P.green,'center');}if(p>0&&p<1)rect(135+810*(1-p),635,25,520,P.sand);}
 else if(f<686){shield(225,720,630,300);note(4,405,790,1.1);let p=phase(f,620,25);rect(170,650,740,460*(1-p),P.pale);if(p>.95)txt('保护里面的本金',540,1140,52,P.green,'center');}
 else if(f<783){promo(160,665,760,470,ph(f,742,762));txt('翻面之前，先看清说法',540,1210,33,P.muted,'center');}
 else if(f<856){promo(160,665,760,470,1);let p=phase(f,793,23);save(0,-p*350,1,0,1-p);rect(160,665,760,470,P.red);txt('投机 / 炒作',540,840,73,P.white,'center',true);restore();if(p>.95)chip('远离',420,1160,240);}
 else{debt(220,700,640,ph(f,856,879));txt('把多余的负担抽离',540,1135,47,P.green,'center');}
}
function consequence(){
 const load=ph(f,224,249)*(1-ph(f,856,881));let tilt=(f<388?load*.075:0);line(70,1275,1010,1275,P.line,3);save(540,1130,1,tilt);c.beginPath();c.moveTo(-50,145);c.lineTo(0,45);c.lineTo(50,145);c.closePath();c.fillStyle=P.green;c.fill();rect(-430,0,860,24,P.ink);
 if(f<388){photo('headphone',-370,-360,270,270);if(f>=164){let p=phase(f,164,18);photo('headphone',-240,-mix(560,310,p),230,230);}
 if(f>=198)note(6,170,-205,.9,ph(f,310,333));if(f>=224){line(-280,24,-280,100+130*load,P.red,5);for(let i=0;i<3;i++)rect(-345,100+130*load+i*12,130,70,P.rose,P.red);}
 if(f>=266){chart(-80,-495,460,210,phase(f,266,65));} }
 else if(f<461){note(4,-105,-230,1);txt('把选择重新放稳',0,-475,64,P.green,'center',true);}
 else if(f<616){let p=ph(f,482,518);photoCard('headphone',-360,-405,245,'已有同类');photoCard('headphone',50+p*450,-405+p*340,245,'额外加购',1-p,p*.45);if(f<530)cross(60,-390,225,230,phase(f,477));if(f>=563){photoCard('food',80,-405,245,'日常采购',phase(f,563));txt('想要',-240,-80,40,P.red,'center');txt('需要',200,-80,40,P.green,'center');}}
 else if(f<686){note(4,-120,-210,1);let p=phase(f,620,26);rect(-270,-310*p,24,310*p,P.green);rect(245,-310*p,24,310*p,P.green);rect(-270,-330*p,539,24,P.green);txt('先立起保护',0,-485,63,P.green,'center',true);}
 else if(f<856){note(4,-330,-190,.9);rect(20,-340,28,340,P.green);let p=phase(f,701,22);rect(mix(480,85,p),-335,270,220,f>=759?P.ink:P.red);txt(f>=759?'风险':'高回报',mix(615,220,p),-280,53,P.white,'center',true);if(f>=783){let q=phase(f,790,23);line(95,-75,95+260*q,-75,P.red,8);txt('把风险拦在外面',0,-500,53,P.green,'center');}else txt('收益说法 · 示意',200,-385,29,P.muted,'center');}
 else {note(4,-80,-190,.9);let p=ph(f,856,879);line(-300,24,-300,200,P.red,5);for(let i=0;i<3;i++){let q=i?p:0;save(q*430,0,1,q*.2,1-q);rect(-365,150+i*24,130,70,P.rose,P.red);restore();}txt('负担减少',0,-440,64,P.green,'center',true);}
 restore();
 if(f>=349&&f<388)txt('本金受损，负担仍在',80,1395,37,P.red);
}
function tracking(){
 const pos=[[90,565],[575,565],[90,940],[575,940]],labels=['消费选择','本金状态','负债状态','收益说法'];
 const active=f<198?0:f<224?1:f<266?2:f<349?1:f<388?2:f<461?-1:f<616?0:f<686?1:f<856?3:2;
 for(let i=0;i<4;i++){let[x,y]=pos[i];paper(x,y,415,325,i===active?P.white:P.pale);txt(labels[i],x+26,y+21,34,i===active?P.ink:P.muted);
 if(i===0){photo('headphone',x+30,y+80,155,155);if(f>=563)photo('food',x+225,y+80,145,155);else photo('headphone',x+220,y+80,145,155);if(f>=482&&f<563)cross(x+230,y+80,130,150,phase(f,482));if(f>=585)txt('分清想要 / 需要',x+205,y+261,30,P.green,'center');}
 if(i===1){if(f<616)note(6,x+100,y+105,.68,ph(f,310,333));else{shield(x+85,y+85,250,145);note(4,x+145,y+105,.6);}if(f>=636)txt('守住本金',x+210,y+260,32,P.green,'center');}
 if(i===2)debt(x+43,y+95,330,ph(f,856,879),.9);
 if(i===3){promo(x+43,y+85,330,190,ph(f,742,760));if(f>=800){cross(x+55,y+90,300,175,phase(f,790));}}
 }
 if(active>=0){let [x,y]=pos[active];let t0=f<198?149:f<224?198:f<266?224:f<349?266:f<388?349:f<616?461:f<686?616:f<856?686:856;let p=phase(f,t0,18);const before=t0===149?0:t0===198?0:t0===224?1:t0===266?2:t0===349?1:t0===461?0:t0===616?0:t0===686?1:3;const old=pos[before];x=mix(old[0],x,p);y=mix(old[1],y,p);let pad=10+(1-p)*28;c.strokeStyle=P.red;c.lineWidth=6;for(const [sx,sy,dx,dy] of[[x-pad,y-pad,1,1],[x+415+pad,y-pad,-1,1],[x-pad,y+325+pad,1,-1],[x+415+pad,y+325+pad,-1,-1]]){line(sx,sy,sx+dx*38,sy,P.red,6);line(sx,sy,sx,sy+dy*38,P.red,6);}if(p<1)line(x+20,y+60+p*230,x+395,y+60+p*230,P.red,3);}
 if(f>=388&&f<461)txt('逐项检查，再做选择',540,1370,43,P.green,'center');
 else if(f>=461&&f<616)txt(f<563?'额外加购：先停一下':'想要 / 需要：分开判断',80,1380,36,P.green);
 else if(f>=616&&f<686)txt('锁定：本金优先',80,1380,42,P.green);
 else if(f>=686&&f<856)txt(f<759?'检查：收益说法':'识别：隐藏风险',80,1380,42,P.red);
 else if(f>=856)txt('减掉负担，留下判断',80,1380,38,P.green);
}
function response(){
 // Real presenter remains the main subject; graphics respond to the existing voice.
 if(f<149){txt('问题，先留给自己。',540,1370,42,P.muted,'center');return;}
 const x=650,y=630,w=350;let start=f<198?149:f<224?198:f<266?224:f<310?266:f<349?310:f<388?349:f<461?388:f<563?461:f<616?563:f<686?616:f<783?686:f<856?783:f<898?856:898;
 const p=phase(f,start+5,15);save(0,(1-p)*35,1,0,p);
 if(f<198){photoCard('headphone',x,y,w-25,'跟风加购',1,.035);txt('又买？',x+150,y+470,74,P.red,'center',true);}
 else if(f<224){note(6,x+50,y+130,.8);txt('先看清',x+165,y+430,59,P.red,'center',true);}
 else if(f<266){debt(x+10,y+80,330,0);txt('负担增加',x+160,y+440,51,P.red,'center');}
 else if(f<349){chart(x,y+30,330,240,phase(f,266,65));note(6,x+70,y+350,.7,ph(f,310,333));}
 else if(f<388){txt('压力',x+165,y+120,92,P.red,'center',true);line(x+30,y+250,x+300,y+250,P.red,8);txt('越来越大',x+165,y+295,49,P.red,'center');}
 else if(f<461){['少冲动','守本金','减负债'].forEach((s,i)=>{chip(s,x,y+80+i*135,330,i===0?P.red:P.green);});}
 else if(f<563){photoCard('headphone',x,y,330,'已有同类');cross(x+5,y+25,300,285,phase(f,482));txt('先停一下',x+160,y+440,54,P.red,'center');}
 else if(f<616){photoCard('food',x,y,330,'日常采购');txt('分清需要',x+160,y+440,54,P.green,'center');}
 else if(f<686){shield(x+5,y+50,330,300);note(4,x+80,y+130,.8);txt('本金优先',x+165,y+440,54,P.green,'center');}
 else if(f<783){if(f<749){txt('高回报',x+175,y+80,72,P.red,'center',true);txt('宣传说法 · 示意',x+175,y+210,30,P.muted,'center');}else{txt('风险',x+175,y+90,96,P.red,'center',true);circle(x+175,y+150,142,null,P.red,6);txt('看背后',x+175,y+440,59,P.red,'center',true);}}
 else if(f<856){txt('投机',x+170,y+80,82,P.red,'center',true);txt('炒作',x+170,y+200,82,P.red,'center',true);cross(x+20,y+70,300,230,phase(f,790));chip('远离',x+65,y+415,220);}
 else if(f<898){debt(x,y+30,350,ph(f,856,879));txt('少一点负担',x+175,y+400,46,P.green,'center');}
 restore();if(f>=149&&f<898){let word=f<388?'跟风 ≠ 判断':f<461?'三条底线':f<616?'先分清':f<856?'先守住':'先减负';txt(word,300,1310,70,P.ink,'center',true);mark(100,1430,405,phase(f,start+15,18),P.red);}
}
const funcs={spatial,relay,assembly,parallel,reveal,consequence,tracking,response};
function render(seconds){f=Math.max(0,Math.min(1099,seconds*30));boxes=[];cameraState=null;baseline();$('headline').textContent=wrapTitle();
 const artAlpha=ph(f,112,149)*(1-ph(f,906,950));save(0,0,1,0,G.key==='response'?1:artAlpha);funcs[G.key]();restore();
 if(f>=950){resultRow(1410);txt('不跟风 / 不浮躁',540,1325,41,P.red,'center');}
 let person;
 if(G.key==='response')person=travel([[0,180,565,720],[115,180,565,720],[149,70,635,530],[898,70,635,530],[945,205,580,670],[1099,205,580,670]]);
 else person=travel([[0,180,565,720],[108,180,565,720],[148,750,1290,265],[900,750,1290,265],[950,205,580,670],[1099,205,580,670]]);
 const [px,py,d]=person;$('person-shell').style.transform=`translate(${px}px,${py}px) scale(${d/840})`;const cap=T.captions.find(a=>f>=a.startFrame&&f<a.endFrame)||T.captions.at(-1);$('caption-text').textContent=cap.text;
 window.FILM_STATE={frame:Math.round(f),person:{x:px,y:py,diameter:d},camera:cameraState,remainingPrincipal:f>=333?4:6,remainingDebt:f>=879?1:3,textBoxes:boxes,grammar:G.id,sourceTime:f/30};
}
await Promise.all([document.fonts.load('500 44px Body'),document.fonts.load('700 88px Title'),document.fonts.load('700 58px Caption')]);await document.fonts.ready;const clock={t:0};const tl=gsap.timeline({paused:true});tl.to(clock,{t:T.duration,duration:T.duration,ease:'none',onUpdate:()=>render(clock.t)});window.__timelines.main=tl;window.FILM_RENDER=render;window.RESEARCH_READY=true;render(0);window.PROJECT_READY();
