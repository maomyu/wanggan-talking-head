const C=window.CONFIG,T=C.timing,$=id=>document.getElementById(id),c=$('art').getContext('2d');
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,ease=x=>{x=clamp(x);return x*x*(3-2*x)},ph=(f,a,b)=>ease((f-a)/(b-a));
let f=0,boxes=[];
const img=new Image();img.src='assets/life-objects.png';await img.decode();
function save(x=0,y=0,s=1,r=0,a=1){c.save();c.translate(x,y);c.scale(s,s);c.rotate(r);c.globalAlpha*=a;}function restore(){c.restore();}
function rect(x,y,w,h,fill,stroke=null,r=0){c.beginPath();r?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(x,y,x2,y2,col=C.fg,w=3){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.lineWidth=w;c.strokeStyle=col;c.lineCap='round';c.stroke();}
function circle(x,y,r,fill,stroke=null,w=3){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function txt(s,x,y,size=42,col=C.fg,align='left',serif=false,critical=true){c.font=`${serif?'700':'500'} ${size}px ${serif?'Title':'Body'}`;c.textAlign=align;c.textBaseline='top';c.fillStyle=col;c.fillText(s,x,y);const m=c.measureText(s),tr=c.getTransform(),xx=x-(align==='center'?m.width/2:align==='right'?m.width:0),ys=[y-4,y+size*1.22],xs=[xx-2,xx+m.width+2],pts=xs.flatMap(x=>ys.map(y=>tr.transformPoint({x,y})));if(c.globalAlpha>.15&&critical)boxes.push({text:s,x:Math.min(...pts.map(p=>p.x)),y:Math.min(...pts.map(p=>p.y)),w:Math.max(...pts.map(p=>p.x))-Math.min(...pts.map(p=>p.x)),h:Math.max(...pts.map(p=>p.y))-Math.min(...pts.map(p=>p.y)),alpha:c.globalAlpha});}
function photo(kind,x,y,w,h){const src=kind==='food'?[0,572,625,680]:[30,0,565,570];c.drawImage(img,...src,x,y,w,h);}
function travel(track,frame=f){let a=track[0];for(let i=1;i<track.length;i++){let b=track[i];if(frame<b[0]){const t=ph(frame,a[0],b[0]);return a.slice(1).map((v,j)=>mix(v,b[j+1],t));}a=b;}return a.slice(1);}
function brush(x,y,x2,y2,width=10,col=C.fg,p=1){const dx=(x2-x)*p,dy=(y2-y)*p;for(let j=0;j<7;j++){c.beginPath();c.moveTo(x,y+(j-3)*width*.12);c.bezierCurveTo(x+dx*.3,y+dy*.28-4+j,x+dx*.7,y+dy*.76+4-j,x+dx,y+dy+(j-3)*width*.12);c.strokeStyle=col;c.lineWidth=width*(.1+Math.sin(j*3.1)**2*.11);c.globalAlpha*=.55;c.stroke();c.globalAlpha/=.55;}}
function grain(){for(let y=90;y<1830;y+=9){for(let x=30;x<1060;x+=97){const n=Math.sin(x*12.99+y*78.2)*437.58;rect(x,y,Math.abs(n%1)*24+3,1,'#52625108');}}}
const H={c,C,T,$,clamp,mix,ph,save,restore,rect,line,circle,txt,photo,travel,brush};
const artist=await import('./'+C.recipe+'-world.mjs');const world=await artist.create(H);
const shortHeads={ink:['存不下钱','跟风有代价','三条底线','想要与需要','守住本金','收益的背面','远离投机','减少负债','把判断留下'],precision:['越努力，\n越存不下？','跟风之前，\n先看清。','给判断，\n三个坐标。','想买，\n先核查需要。','先把本金，\n留在边界里。','承诺越诱人，\n越要看背后。','投机与炒作，\n保持距离。','减少负债，\n留下余地。','不跟风，\n不浮躁。'],clay:['每个选择，\n都有重量。','加上去的，\n都是代价。','先把选择，\n放稳。','先放下，\n多余的冲动。','先守住，\n手里的本金。','看清风险，\n再做判断。','把风险，\n留在外面。','卸下一些，\n负担。','少一点跟风，\n多一点判断。']};
const bounds=[0,149,388,461,616,686,783,856,898,1100];
function render(seconds){f=Math.max(0,Math.min(1099,Math.round((seconds+(window.FILM_OFFSET||0))*30)));boxes=[];c.clearRect(0,0,1080,1920);rect(0,0,1080,1920,C.bg);if(C.recipe==='ink')grain();
 const si=bounds.findIndex((a,i)=>f>=a&&f<bounds[i+1]);
 txt(C.recipe==='ink'?'财 经 随 笔':C.recipe==='precision'?'选择观察室':'给选择一点分量',64,96,28,C.muted);txt('原声 · 真实口播',1016,96,25,C.muted,'right');
 if(C.recipe==='ink'){shortHeads.ink[si].split('').forEach((s,i)=>txt(s,936,235+i*88,76,C.fg,'center',true));brush(865,222,865,235+shortHeads.ink[si].length*88,4,C.color);txt('从跟风，到判断',64,206,37,C.muted);}
 else {const ss=shortHeads[C.recipe][si].split('\n');ss.forEach((s,i)=>txt(s,64,217+i*117,C.recipe==='clay'?95:91,C.fg,'left',false));}
 const a=ph(f,148,168)*(1-ph(f,898,908));save(0,0,1,0,a);const ws=world.draw(f);restore();
 let pt=C.recipe==='ink'?[[0,120,580,680],[108,120,580,680],[148,750,1290,265],[908,750,1290,265],[960,130,570,660],[1099,130,570,660]]:C.recipe==='clay'?[[0,180,570,720],[108,180,570,720],[148,64,1290,265],[908,64,1290,265],[960,220,570,640],[1099,220,570,640]]:[[0,180,570,720],[108,180,570,720],[148,750,1290,265],[908,750,1290,265],[960,220,570,640],[1099,220,570,640]];
 const[px,py,d]=travel(pt);$('person-shell').style.transform=`translate(${px}px,${py}px) scale(${d/840})`;
 if(f>=960){const xx=C.recipe==='ink'?145:205;['少冲动','守本金','减负债'].forEach((s,i)=>{circle(xx+i*230,1414,7,C.color);txt(s,xx+22+i*230,1388,43,C.fg);});}
 const cap=T.captions.find(q=>f>=q.startFrame&&f<q.endFrame)||T.captions.at(-1);$('caption-text').textContent=cap.text;
 line(64,1840,1016,1840,C.recipe==='precision'?'#43615a':'#c7c4b8',2);line(64,1840,64+952*f/1099,1840,C.color,4);txt('物件、数量及动作均为示意',64,1790,24,C.muted);txt(C.recipe==='clay'?'立体比喻 · 非物理仿真':'原声完整保留',1016,1790,24,C.muted,'right');
 window.FILM_STATE={frame:f,person:{x:px,y:py,diameter:d},textBoxes:boxes,scene:si,world:ws,remainingPrincipal:f>=333?4:6,remainingDebt:f>=879?1:3,sourceTime:f/30,style:C.recipe,orchestration:C.mechanism};
}
await Promise.all([document.fonts.load('500 42px Body'),document.fonts.load('700 76px Title'),document.fonts.load('700 58px Caption')]);await document.fonts.ready;const clock={t:0},duration=window.FILM_DURATION||T.duration,tl=gsap.timeline({paused:true});tl.to(clock,{t:duration,duration,ease:'none',onUpdate:()=>render(clock.t)});window.__timelines.main=tl;window.FILM_RENDER=render;window.RESEARCH_READY=true;window.addEventListener('hf-seek',e=>render(e.detail.time));render(0);window.PROJECT_READY();
