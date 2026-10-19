const root=document.getElementById('root'),look=root.dataset.look,P=window.STUDY_TIMING,F=P.fps||30,O=Number(root.dataset.originFrame)/F,D=Number(root.dataset.duration);
const $=s=>document.querySelector(s),clamp=x=>Math.max(0,Math.min(1,x)),out=x=>1-Math.pow(1-clamp(x),3),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,u)=>a+(b-a)*u;
const starts=Object.fromEntries(P.scenes.map(s=>[s.id,s.startFrame/F]));
const bases={chalk:{x:205,y:590,w:670},'paper-stage':{x:180,y:585,w:720},'type-poster':{x:170,y:610,w:740},cel:{x:180,y:580,w:720},'sci-fi-wireframe':{x:180,y:580,w:720}};
function poseAt(t){let p={...bases[look]};for(const [id,x]of[['chain',716],['overview',64],['spend',716],['risk',64]]){if(t<starts[id])continue;const u=smooth((t-starts[id])/.6);p={x:mix(p.x,x,u),y:mix(p.y,1255,u),w:mix(p.w,300,u)}}if(t>=starts.recap){const u=smooth((t-starts.recap-.1)/.6),b=bases[look];p={x:mix(p.x,b.x,u),y:mix(p.y,b.y,u),w:mix(p.w,b.w,u)}}return {...p,circle:true}}
const text=(x,y,t,cls='',size)=>`<text x="${x}" y="${y}" class="${cls}"${size?` style="font-size:${size}px"`:''}>${t}</text>`;
const path=(d,c='var(--accent)',w=6,draw=false)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${draw?' data-draw="1"':''}/>`;
const group=(body,delay=0,at='',extra='')=>`<g data-enter="1" data-delay="${delay}"${at?` data-at="${at}"`:''} ${extra}>${body}</g>`;
const board=body=>`<svg class="board" viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
function chalkScenes(){
 const box=(x,y,w,h)=>path(`M${x} ${y+7} Q${x+w/2} ${y-8} ${x+w} ${y} L${x+w+3} ${y+h} Q${x+w/2} ${y+h-5} ${x-3} ${y+h+4} Z`,'#fff9df',5,true);
 const arrow=(x,y)=>path(`M${x} ${y} Q${x+55} ${y-8} ${x+120} ${y+2} M${x+100} ${y-17} L${x+123} ${y+2} L${x+100} ${y+20}`,'#f3d475',6,true);
 return {
 chain:board(group(box(12,20,420,150)+text(47,115,'跟风消费','',70),0,176)+group(arrow(400,180),0,198)+group(box(495,240,420,150)+text(526,338,'盲目投资','',70),0,198)+group(path('M680 418 Q680 520 485 525 M507 502 L482 525 L510 545','#f3d475',6,true)+text(110,625,'本金受损','large'),0,310)),
 overview:board([['砍掉无效消费',85],['守住本金',305],['减少负债',525]].map(([t,y],i)=>group(text(28,y+70,String(i+1),'large')+text(176,y+65,t,'',70)+path(`M175 ${y+100} L865 ${y+100}`,'#d1e4d3',3,true),.45+i*.15)).join('')),
 spend:board(group(box(10,25,430,580)+text(93,188,'想要','large')+text(70,340,'一时喜欢','',60)+text(70,435,'容易冲动','',60)+path('M67 485 Q225 505 390 475','#f3d475',7,true),.4)+group(box(505,25,430,580)+text(587,188,'需要','large')+text(566,340,'实际用途','',60)+text(566,435,'当下必要','',60)+path('M565 485 Q735 465 897 480','#f3d475',7,true),.58)),
 risk:board(group(text(40,115,'夸大收益','',100)+path('M35 150 Q440 165 850 145','#fff9df',4,true),.45)+group(path('M100 232 L870 426 M112 433 L855 238','#f3d475',12,true)+text(173,600,'暗藏风险','large'),0,686)),
 debt:board(group(text(40,235,'负债','large')+path('M400 185 L820 185 M780 145 L825 185 L780 225','#f3d475',7,true)+text(520,430,'减少','large')+path('M50 570 Q460 650 895 565','#fff9df',5,true),0))};
}
function paperObject(kind,x,y,s=1){let body='';const shadow='#a13627',light='#ed805d',navy='#174e5a',pale='#f4e9cf';
 if(kind==='bag')body=`<path d="M44 67 Q42 5 100 5 Q158 5 156 67" fill="none" stroke="${navy}" stroke-width="20"/><path d="M17 62 L182 62 L198 220 L0 220Z" fill="${light}"/><path d="M150 62 L182 62 L198 220 L154 220Z" fill="${shadow}"/><path d="M0 220 L154 220 L154 202 L3 202Z" fill="#fff6df"/>`;
 if(kind==='shield')body=`<path d="M100 0 L195 43 L176 157 Q155 214 100 242 Q45 213 24 157 L5 43Z" fill="${navy}"/><path d="M100 25 L170 58 L155 145 Q142 184 100 211 Q57 184 45 145 L30 58Z" fill="#dce6d8"/><path d="M55 107 L91 145 L154 73" fill="none" stroke="#ac3928" stroke-width="20"/>`;
 if(kind==='coin')body=`<circle cx="100" cy="100" r="96" fill="#ad7e36"/><circle cx="93" cy="90" r="86" fill="#f5d58d"/><circle cx="93" cy="90" r="64" fill="none" stroke="#ad7e36" stroke-width="5"/><path d="M72 53 L112 53 M92 54 L92 127 M70 127 L114 127" fill="none" stroke="#174e5a" stroke-width="10"/>`;
 if(kind==='weight')body=`<path d="M74 62 C47 -7 155 -7 128 62" fill="none" stroke="${navy}" stroke-width="19"/><path d="M40 56 L163 56 L198 218 L0 218Z" fill="${navy}"/><path d="M40 56 L76 56 L35 196 L4 196Z" fill="#588d95"/>`;
 return `<g class="cut layer" data-depth="${kind==='shield'?1.3:.8}" transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
}
function paperScenes(){
 const step=(t,x,y,kind)=>group(paperObject(kind,x+75,y,.85)+`<path d="M${x} ${y+225} H${x+350} L${x+328} ${y+345} H${x+22}Z" fill="#f7f0df" class="cut"/>`+text(x+28,y+303,t,'',61));
 return {chain:board(group(paperObject('bag',50,70,1.1)+text(33,380,'跟风消费','',58),0,176)+group(paperObject('coin',600,70,1.1)+text(570,380,'盲目投资','',58),0,198)+group(`<path d="M120 447 Q475 650 820 447 L820 533 Q475 735 120 533Z" fill="#174e5a" class="cut"/>`+text(303,594,'本金受损','',78).replace('<text','<text fill="#f7f0df" style="fill:#f7f0df"'),0,310)),
 overview:board(group(paperObject('bag',60,90,.9)+text(20,465,'少冲动','',61),.45)+group(paperObject('shield',370,90,.9)+text(337,465,'守本金','',61),.6)+group(paperObject('weight',680,90,.9)+text(652,465,'减负债','',61),.75)),
 spend:board(step('想要',25,95,'bag')+step('需要',553,95,'shield')+group(text(58,605,'一时喜欢','small')+text(585,605,'当下必要','small'),.6)),
 risk:board(group(paperObject('coin',310,180,1.45),.4)+group(paperObject('shield',345,120,1.18),0,686)+group(text(242,580,'先守住本金','',78),0,686)),
 debt:board(group(paperObject('weight',95,140,1.3)+text(470,250,'减少','',110)+text(470,415,'负债','',110),0))};
}
function typeScenes(){
 const band=(y,t,negative=false,size=166)=>`<rect x="0" y="${y-145}" width="952" height="190" fill="${negative?'#121712':'#d2fb3c'}"/>`+text(30,y,t,'',size).replace('<text',`<text style="fill:${negative?'#d2fb3c':'#121712'};font-size:${size}px"`);
 return {chain:board(group(band(150,'跟风消费'),0,176)+group(band(375,'盲目投资',true),0,198)+group(band(620,'本金受损'),0,310)),
 overview:board(group(band(160,'少冲动'),.4)+group(band(380,'守本金',true),.55)+group(band(610,'减负债'),.7)),
 spend:board(group(text(0,225,'想要','giant')+text(532,190,'一时喜欢','small'),.4)+group(`<path d="M0 292 H952" stroke="#121712" stroke-width="14"/>`+text(0,570,'需要','giant')+text(532,533,'当下必要','small'),.55)),
 risk:board(group(band(150,'夸大收益',true,163),.4)+group(text(0,390,'暗藏','giant')+text(0,660,'风险','giant'),0,686)),
 debt:board(group(text(0,235,'减少','giant')+band(575,'负债',true,250),0))};
}
function celObject(kind,x,y,s=1){let b='';const line='#172f4d';
 if(kind==='bag')b=`<path d="M45 73 C40 -4 161 -4 157 73" fill="none" stroke="${line}" stroke-width="13"/><path d="M15 65 L188 65 L202 237 L0 237Z" fill="#f4bb72" class="cel-body"/><path d="M132 68 L188 68 L200 234 L140 234Z" fill="#c66e56"/><path d="M22 79 H134" stroke="#ffe5b5" stroke-width="11"/>`;
 if(kind==='shield')b=`<path d="M102 0 L201 43 L182 165 Q160 220 102 251 Q44 220 23 165 L4 43Z" fill="#4f91ac" class="cel-body"/><path d="M102 5 L198 46 L180 163 Q158 216 102 246Z" fill="#315a87"/><path d="M53 119 L92 159 L159 80" fill="none" stroke="#fff1b6" stroke-width="20"/>`;
 if(kind==='coin')b=`<ellipse cx="103" cy="112" rx="97" ry="107" fill="#b36d4d" class="cel-body"/><ellipse cx="91" cy="103" rx="87" ry="100" fill="#f7d68a" class="cel-body"/><path d="M45 58 L93 58 L144 144 L100 177Z" fill="#e2ac65"/><path d="M60 59 L115 59 M88 60 L88 152 M61 152 L116 152" fill="none" stroke="${line}" stroke-width="12"/>`;
 if(kind==='weight')b=`<path d="M70 68 C47 0 158 0 135 68" fill="none" stroke="${line}" stroke-width="16"/><path d="M40 59 H167 L206 230 H0Z" fill="#688e9c" class="cel-body"/><path d="M112 62 H166 L201 228 H119Z" fill="#3f607f"/><path d="M46 78 H103" stroke="#b7d4d5" stroke-width="9"/>`;
 return `<g transform="translate(${x} ${y}) scale(${s})">${b}</g>`;
}
function celScenes(){return {
 chain:board(group(celObject('bag',30,90,1)+text(14,403,'跟风消费','',58),0,176)+group(celObject('coin',695,85,1)+text(650,403,'盲目投资','',58),0,198)+group(`<path d="M285 255 L360 210 L635 255 L578 325Z" fill="#9d3028"/>`+celObject('weight',350,370,.8)+text(265,680,'本金受损','',82),0,310)),
 overview:board(['bag','shield','weight'].map((kind,i)=>group(celObject(kind,27+i*326,100,.85)+text(12+i*326,500,['少冲动','守本金','减负债'][i],'',62),.4+i*.15)).join('')),
 spend:board(group(celObject('bag',60,130,1.3)+text(50,580,'想要','large'),.4)+group(celObject('shield',625,130,1.1)+text(585,580,'需要','large'),.6)+group(text(65,660,'一时喜欢','small')+text(590,660,'当下必要','small'),.72)),
 risk:board(group(celObject('coin',330,150,1.4),.4)+group(celObject('shield',365,80,1.2)+text(215,620,'先守住本金','',84),0,686)),
 debt:board(group(celObject('weight',60,150,1.35)+text(450,260,'减少','large')+text(450,430,'负债','large'),0))};}
function modelLabels(){return {chain:'<div class="model-label" style="left:0;width:300px">跟风消费</div><div class="model-label" style="left:330px;width:300px">盲目投资</div><div class="model-label" style="left:650px;width:300px" data-at="310" data-enter="1">本金受损</div>',overview:['少冲动','守本金','减负债'].map((t,i)=>`<div class="model-label" style="left:${i*326}px;width:300px">${t}</div>`).join(''),spend:'<div class="model-label" style="left:0;width:430px">想要<small>一时喜欢</small></div><div class="model-label" style="left:520px;width:430px">需要<small>当下必要</small></div>',risk:'<div class="model-result" data-enter="1" data-at="686"><strong>本金</strong>优先 · 先看风险</div>',debt:'<div class="model-result">减少负债</div>'};}
const titles={hook:['越努力上班','越存不到钱？'],chain:['跟风的代价','最后落在自己身上'],overview:['三个财经底线','给选择排个顺序'],spend:['无效消费','分清想要和需要'],risk:['守住本金','先看风险，再做选择'],debt:['减少负债','把压力往回收'],recap:['不跟风，不浮躁','回到自己的判断']};
const notes={chain:'从习惯到后果，\n代价由自己承担。',overview:'三项并列建议，\n从自己的选择开始。',spend:'下单之前，\n先留一点判断的空间。',risk:'先守住本金，\n再想下一步。',debt:'',hook:'',recap:''};
const breaks={'为什么越努力上班越存不到钱':'为什么越努力上班\n越存不到钱','给大家三个普通人的财经底线':'给大家三个普通人的\n财经底线','市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};
async function build(){
 let model=null,scenes;
 if(look==='sci-fi-wireframe'){
  scenes=modelLabels();$('#stage').innerHTML='<canvas id="models"></canvas>';
  const {buildModels}=await import('./models.js');model=buildModels($('#models'),P);
 }else scenes=look==='chalk'?chalkScenes():look==='paper-stage'?paperScenes():look==='type-poster'?typeScenes():celScenes();
 for(const [id,html]of Object.entries(scenes))$('#stage').insertAdjacentHTML('beforeend',`<section data-scene="${id}">${html}</section>`);
 await document.fonts.ready;
 const panels=[...document.querySelectorAll('#stage section')],enters=[...document.querySelectorAll('[data-enter]')],draws=[...document.querySelectorAll('[data-draw]')].map(el=>({el,len:el.getTotalLength()}));draws.forEach(({el,len})=>el.style.strokeDasharray=String(len));
 function render(t){
  t=Math.max(0,Math.min(P.duration-1/F,t));const frame=Math.floor(t*F+.001),sc=P.scenes.find(s=>frame>=s.startFrame&&frame<s.endFrame)||P.scenes.at(-1),age=t-sc.startFrame/F;
  $('#kicker').textContent=sc.kicker;$('#title').textContent=titles[sc.id][0];$('#subtitle').textContent=titles[sc.id][1];
  gsap.set('#heading',{opacity:sc.id==='hook'?1:.4+.6*out(age/.2),y:sc.id==='hook'?0:18*(1-out(age/.2))});
  const c=P.captions.find(c=>frame>=c.startFrame&&frame<c.endFrame);$('#caption-text').textContent=c?(breaks[c.text]||c.text):'';$('#captions').style.opacity=c?'1':'0';
  const p=poseAt(t);gsap.set('#person',{x:p.x,y:p.y,scale:p.w/840});root.dataset.scene=sc.id;
  panels.forEach(el=>el.style.opacity=el.dataset.scene===sc.id?'1':'0');$('#stage').style.opacity=['hook','recap'].includes(sc.id)?'0':'1';
  for(const el of enters){const panel=el.closest('section'),at=el.dataset.at?Number(el.dataset.at)/F:starts[panel.dataset.scene]+Number(el.dataset.delay||0);let dt=t-at;if(look==='cel')dt=Math.floor(dt*12)/12;const u=out(dt/(look==='paper-stage'?.55:.35));const props={opacity:u};if(look==='chalk'){props.x=0;props.y=0;}else if(look==='paper-stage'){props.y=65*(1-u);props.rotation=-8*(1-u);props.scale=.94+.06*u;props.svgOrigin='476 350'}else if(look==='type-poster'){props.x=(Number(el.dataset.delay)>0?1:-1)*130*(1-u);props.y=0;props.svgOrigin='476 350'}else if(look==='cel'){props.y=50*(1-u);props.scale=.9+.1*u;props.svgOrigin='476 350'}else props.y=14*(1-u);gsap.set(el,props)}
  for(const {el,len}of draws){const panel=el.closest('section'),parent=el.closest('[data-enter]'),at=parent?.dataset.at?Number(parent.dataset.at)/F:starts[panel.dataset.scene]+Number(parent?.dataset.delay||0);el.style.strokeDashoffset=String(len*(1-out((t-at)/.6)))}
  if(look==='paper-stage')document.querySelectorAll('[data-depth]').forEach((el,i)=>{el.style.translate=`${Math.sin((age+i)*.45)*Number(el.dataset.depth)*3}px ${Math.cos((age+i)*.45)*Number(el.dataset.depth)*2}px`});
  const note=$('#note');note.textContent=notes[sc.id];gsap.set(note,{x:['overview','risk'].includes(sc.id)?341:0,opacity:out((age-.7)/.3)});
  gsap.set('#recap',{opacity:sc.id==='recap'?out((age-.9)/.4):0});gsap.set('#progress',{scaleX:t/P.duration});
  if(model)model.render(t,sc.id);window.STUDY_STATE={frame,scene:sc.id,look,portrait:{...p,width:p.w,height:p.w},captionId:c?.id||null};
 }
 const clock={t:0},tl=gsap.timeline({paused:true});tl.to(clock,{t:D,duration:D,ease:'none',onUpdate:()=>render(clock.t+O)});render(O);window.STUDY_RENDER=render;window.STUDY_POSE=poseAt;window.__timelines=window.__timelines||{};window.__timelines.main=tl;window.addEventListener('hf-seek',e=>render(e.detail.time+O));window.STUDY_READY=true;
}
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};window.__hf.buildReady.fiveCandidateLooks=build();
