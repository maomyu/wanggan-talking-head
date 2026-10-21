const C=window.FILM_CONFIG,P=C.source,K=C.key,$=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,u)=>a+(b-a)*u;
const easing={out:x=>1-(1-x)**4,in:x=>x**3,soft:x=>x*x*(3-2*x),quint:x=>x<.5?16*x**5:1-(-2*x+2)**5/2};
const pr=(f,a,b,kind='out')=>(easing[kind]||easing.out)(clamp((f-a)/(b-a)));
const key=(f,x,y,s=1,a=1,r=0)=>({f,x,y,s,a,r});
const place=(id,q)=>{const e=$(id);e.style.transform=`translate(${q.x}px,${q.y}px) scale(${q.s}) rotate(${q.r||0}deg)`;e.style.opacity=q.a;};
function sample(keys,f){let a=keys[0];for(let i=1;i<keys.length;i++){let b=keys[i];if(f<b.f){let u=pr(f,a.f,b.f,b.curve||'quint');return Object.fromEntries(['x','y','s','a','r'].map(k=>[k,lerp(a[k],b[k],u)]));}a=b;}return a;}
function track(...keys){return keys;}
const blue=C.style.compositionMode==='technical-blueprint',clay=C.style.compositionMode==='soft-volume',left=C.typography.personCorner==='left';
const person=blue?track(key(0,716,1255,300/840),key(1099,716,1255,300/840)):track(key(0,210,620,660/840),key(24,210,620,660/840),key(90,left?64:716,1255,300/840),key(898,left?64:716,1255,300/840),key(950,240,550,600/840),key(1099,240,550,600/840));
const commonEnd=[key(919,0,0,.1,0),key(958,110,1240,.52,1),key(1099,110,1240,.52,1)];
const H=blue?track(key(0,370,690,1,0),key(124,370,690,1,0),key(149,345,640,1.12),key(180,345,640,1.12),key(211,100,620,.5),key(350,100,620,.5),key(370,100,620,.5,0),key(388,100,620,.5,0),key(413,110,750,.65),key(455,110,750,.65),key(484,160,650,1.3),key(546,160,650,1.3),key(585,180,660,.66),key(614,180,660,.66),key(637,-350,750,.66,0),...commonEnd):track(key(0,380,700,1,0),key(124,380,700,1,0),key(149,365,660,1.12),key(187,365,660,1.12),key(210,105,660,.6),key(360,105,660,.6),key(388,105,660,.6),key(414,130,730,.65),key(454,130,730,.65),key(486,350,630,1.25),key(545,350,630,1.25),key(585,110,750,.66),key(614,110,750,.66),key(638,-350,750,.66,0),...commonEnd);
const tracks={headphone:H,
 extra:track(key(0,360,750,.66,0),key(572,360,750,.66,0),key(585,blue?440:360,blue?660:750,.66),key(614,blue?440:360,blue?660:750,.66),key(637,-80,750,.66,0)),
 food:track(key(0,1050,750,.85,0),key(565,1050,750,.85,0),key(585,blue?180:710,blue?1020:730,blue?.55:.85),key(614,blue?180:710,blue?1020:730,blue?.55:.85),key(638,1200,730,.85,0)),
 principal:track(key(0,420,850,.58,0),key(197,420,850,.58,0),key(214,420,850,.58),key(294,420,850,.58),key(331,240,830,.85),key(368,240,830,.85),key(414,397,800,.38),key(454,397,800,.38),key(478,397,800,.38,0),key(615,160,780,1.08,0),key(640,160,780,1.08),key(680,160,780,1.08),key(715,190,930,1),key(836,190,930,1),key(855,190,930,1,0),key(923,390,1260,.35,0),key(958,390,1260,.35),key(1099,390,1260,.35)),
 burden:track(key(0,120,930,.58,0),key(224,120,930,.58,0),key(243,120,930,.58),key(295,120,930,.58),key(349,120,930,.58),key(372,120,930,.58,0),key(388,760,770,.43,0),key(414,760,770,.43),key(454,760,770,.43),key(478,760,770,.43,0),key(848,300,720,1,0),key(868,300,720,1),key(897,300,720,1),key(932,760,1260,.4,0),key(958,760,1260,.4),key(1099,760,1260,.4)),
 trend:track(key(0,450,650,.88,0),key(266,450,650,.88,0),key(280,450,650,.88),key(329,450,650,.88),key(350,450,650,.88,0)),
 risk:track(key(0,140,590,1,0),key(686,140,590,1,0),key(701,140,590,1),key(781,140,590,1),key(803,140,480,.96,0)),
 avoid:track(key(0,140,870,1,0),key(783,140,870,1,0),key(803,140,575,1),key(838,140,575,1),key(856,140,540,1,0))};

function label(id,text,x,y,a=1,size=46){const e=$(id);e.textContent=text;e.style.fontSize=size+'px';e.style.transform=`translate(${x}px,${y}px)`;e.style.opacity=a;}
function labels(f){for(const e of document.querySelectorAll('#labels .label'))e.style.opacity=0;
 if(f>=149&&f<198)label('a-label','跟风消费',blue?665:700,1040,1,42);
 if(f>=198&&f<224)label('principal-label','资产选择 · 示意',430,1100,1,36);
 if(f>=224&&f<266)label('a-label','负担累积',95,1140,1,40);
 if(f>=266&&f<310)label('b-label','走势示意',600,1040,1,34);
 if(f>=310&&f<368)label('principal-label','本金受损',460,1125,1,46);
 if(f>=410&&f<461){label('a-label','少冲动',125,1040);label('b-label','守本金',410,1040);label('c-label','减负债',760,1040);label('note','三项并列原则',390,1140,1,28);}
 if(f>=461&&f<516)label('a-label','无效加购',blue?655:130,1120,1,44);
 if(f>=516&&f<563){label('pause-label','先停一下',blue?620:130,1050,pr(f,...C.motion.actionWindows.pause),50);}
 if(f>=563&&f<616){label('a-label','想要',110,blue?570:595);label('b-label','需要',blue?530:710,blue?1100:595);if(f>=582){label('c-label','已有一件',blue?170:90,blue?900:1020,1,32);label('d-label','再加一件？',blue?430:350,blue?900:1020,1,32);label('note','同类物件对照 · 示意',100,blue?1320:1130,1,26);}}
 if(f>=643&&f<686){label('principal-label','本金优先',140,1090,1,48);label('note','完整单位仅作原则示意',140,1160,1,27);}
 if(f>=712&&f<856)label('principal-label','本金 · 始终保留',blue?190:430,1240,1,38);
 if(f>=863&&f<898){label('a-label',f>=882?'减少后的负担':'把负担往回收',290,1100,1,46);}
 if(f>=958){label('a-label','少冲动',110,1460,1,40);label('b-label','守本金',410,1460,1,40);label('c-label','减负债',760,1460,1,40);}
}
try{
 await document.fonts.ready;
 $('viewport').style.height='1030px';
 const unitN=C.representation.objectGeometry.unitCount,debtN=C.representation.objectGeometry.debtCount;
 for(let i=0;i<unitN;i++){let e=document.createElement('i');e.className='capital-unit';$('principal-units').append(e);}
 for(let i=0;i<debtN;i++){let e=document.createElement('i');e.className='debt-unit';e.style.top=(20+i*43)+'px';$('debt-units').append(e);}
 let engineering=null;if(blue){const m=await import('./blueprint-plan.mjs');engineering=m.createBlueprintPlan($('viewport'),C);}
 let space=null;if(clay){const m=await import('./clay-world.mjs');space=await m.createClayWorld($('clay-mount'),C);}
 if(blue)$('comparison-line').setAttribute('d','M110 620H970M110 1000H970M110 620V1220');
 const traceEls=[...document.querySelectorAll('path.trace,#rise,#fall,#extra-cross')];for(const e of traceEls){const l=e.getTotalLength();e.style.strokeDasharray=l;e.dataset.length=l;}
 function draw(t){const f=Math.min(1099,Math.max(0,Math.floor((t+(window.FILM_OFFSET||0))*30+.00001))),states={};
  for(const[id,tr]of Object.entries(tracks)){const q=sample(tr,f);place(id,q);states[id]=q;}
  const q=sample(person,f);place('presenter-shell',q);
  const cue=[...C.information.headlineCues].reverse().find(c=>f>=c[0]);$('headline').textContent=cue[1];$('section-index').textContent=f<388?'—':f<461?'03':f<616?'01':f<856?'02':f<898?'03':'✓';
  labels(f);
  const loss=pr(f,...C.motion.actionWindows.loss);$('capital-crack').style.opacity=f<388?loss:0;$('principal-units').style.opacity=f<388?.45:1;
  for(let i=0;i<debtN;i++){const u=f>=856&&i>=2?pr(f,856+(5-i)*3,872+(5-i)*3,'in'):0,e=$('debt-units').children[i];e.style.transform=blue?`translate(${u*600}px,0)`:`translate(${u*580}px,${-u*80}px) rotate(${u*8}deg)`;e.style.opacity=1-u;}
  for(const e of traceEls){let u=1;if(e.id==='rise')u=pr(f,266,290);else if(e.id==='fall')u=pr(f,...C.motion.actionWindows.loss);else if(e.id==='extra-cross')u=pr(f,590,603);else u=pr(f,132,175);e.style.strokeDashoffset=(+e.dataset.length)*(1-u);}
  const reveal=pr(f,...C.motion.actionWindows.riskReveal,'quint');
  // The minimal plate withdraws sideways; the blueprint separates front and inner planes.
  $('risk-cover').style.transform=C.transition.language==='relation-expand'?`translate(${reveal*-35}px,${reveal*-220}px) scale(${1-.09*reveal})`:`translateX(${-860*reveal}px)`;
  for(const el of $('risk-cover').children)el.style.visibility=f>=738?'hidden':'visible';$('risk-cover').style.opacity=blue?1-reveal:1;$('risk-cover').style.visibility=f>=755?'hidden':'visible';
  $('risk-inside').style.opacity=f>=752?pr(f,752,755):0;
  $('branch-line').style.opacity=C.transition.language==='relation-expand'&&f>=388&&f<461?pr(f,388,410):0;$('comparison-line').style.opacity=blue&&f>=563&&f<616?pr(f,563,580):0;
  const z=blue?(1+.2*pr(f,266,275)*(1-pr(f,331,350))-.05*pr(f,388,405)*(1-pr(f,455,470))+(C.camera.viewTransforms.detailScale-1)*pr(f,616,630)*(1-pr(f,680,695))):1+(C.camera.viewTransforms.detailScale-1)*pr(f,149,168)*(1-pr(f,180,210));
  $('world').style.transform=`scale(${z})`;
  const cap=P.captions.find(c=>f>=c.startFrame&&f<c.endFrame),breaks={'为什么越努力上班越存不到钱':'为什么越努力上班\n越存不到钱','给大家三个普通人的财经底线':'给大家三个普通人的\n财经底线','市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};$('caption-text').textContent=cap?(breaks[cap.text]||cap.text):'';
  let engineeringState=null;if(engineering){engineeringState=engineering.draw(f);for(const e of document.querySelectorAll('#labels .label'))e.style.opacity=0;
   if(f<149||f>=388&&f<461||f>=950){label('a-label',f>=388?'少冲动':'消费',110,f>=950?1170:920,1,36);label('b-label',f>=388?'守本金':'本金',440,f>=950?1170:920,1,36);label('c-label',f>=388?'减负债':'负债',800,f>=950?1170:920,1,36);}
   if(f>=149&&f<198)label('a-label','跟风消费',170,1200,1,44);
   if(f>=198&&f<224)label('a-label','资产选择 · 示意',170,1200,1,38);
   if(f>=224&&f<266)label('a-label','负担累积',170,1200,1,44);
   if(f>=266&&f<310)label('a-label','跟风炒作 · 走势示意',170,1200,1,36);
   if(f>=310&&f<349)label('a-label','本金受损',170,1200,1,44);
   if(f>=349&&f<388)label('a-label','跟风的代价',130,1370,1,44);
   if(f>=461&&f<516)label('a-label','额外加购',150,1340,1,44);
   if(f>=516&&f<563)label('pause-label','先停一下',120,1340,1,44);
   if(f>=563&&f<616){label('a-label','想要',275,1190,1,40);label('b-label','需要',680,1190,1,40);}
   if(f>=643&&f<686)label('principal-label','本金优先',200,1200,1,48);
   if(f>=704&&f<738)label('risk-label','夸大收益的说法',200,1000,1,42);
   if(f>=755&&f<783)label('risk-label','暗藏风险',310,1000,1,52);
   if(f>=704&&f<783)label('principal-label','本金 · 保留',180,1440,1,34);
   if(f>=808&&f<856)label('principal-label','保留本金，隔离风险',110,1400,1,38);
   if(f>=879&&f<921)label('a-label','把负担往回收',110,1390,1,40);
  }
  let clayState=null;if(space){clayState=space.draw(f);for(const e of document.querySelectorAll('#labels .label'))e.style.opacity=0;const phase=f<149?'hook':f<388?'problem':f<461?'overview':f<616?'spend':f<856?'risk':f<898?'debt':'recap';
   if(phase==='overview'){label('a-label','少冲动',120,1195,1,40);label('b-label','守本金',425,1195,1,40);label('c-label','减负债',760,1210,1,40);}
   if(f>=485&&f<563)label('a-label','已有一件',330,650,1,32);
   if(f>=485&&f<516)label('b-label','额外加购',730,650,1,32);
   if(f>=516&&f<563)label('pause-label','先停一下',390,530,pr(f,...C.motion.actionWindows.pause),50);
   if(f>=563&&f<616){label('a-label','想要',170,570);label('b-label','需要',735,570);label('note','日常需要与额外加购 · 示意',210,1150,1,27);}
   if(f>=643&&f<686)label('principal-label','本金优先',390,1230,1,46);
   if(f>=695&&f<738){label('b-label','夸大收益的说法',260,570,1,36);label('principal-label','本金 · 保留',410,1240,1,34);}
   if(f>=755&&f<783){label('risk-label','暗藏风险',360,500,1,64);label('principal-label','本金 · 保留',410,1240,1,34);}
   if(f>=783&&f<850)label('risk-label','远离投机与炒作',245,570,1,52);
   if(f>=882&&f<898)label('a-label','减少后的负担',400,1240,1,46);
   if(f>=960){label('a-label','少冲动',110,1460,1,40);label('b-label','守本金',410,1460,1,40);label('c-label','减负债',760,1460,1,40);}
  }
  const b=$('presenter-mask').getBoundingClientRect();window.FILM_STATE={frame:f,person:{x:b.x,y:b.y,w:b.width,h:b.height,circle:true},actors:states,principalUnits:unitN,debtUnits:f>=882?2:6,camera:engineeringState?.camera||z,engineering:engineeringState,sourceFrame:f,style:C.style.compositionMode,clay:clayState,modules:{style:C.style.compositionMode,palette:getComputedStyle(document.body).color,material:C.material.surfaceAssignments.objects,representation:unitN,motion:C.motion.language,camera:C.camera.language,transition:C.transition.language,typography:C.typography.mode,lighting:C.lighting.finishLayers.gridStep,information:C.information.relations.length,rhythm:C.rhythm.readWindows.length}};
 }
 const clock={t:0},duration=window.FILM_DURATION||P.duration,tl=gsap.timeline({paused:true});tl.to(clock,{t:duration,duration,ease:'none',onUpdate:()=>draw(clock.t)});window.__timelines=window.__timelines||{};window.__timelines.main=tl;window.FILM_RENDER=window.SEMANTIC_RENDER=draw;window.addEventListener('hf-seek',e=>draw(e.detail.time));draw(0);window.SELECTOR_READY=window.RESEARCH_READY=true;window.TRIO_READY();
}catch(e){window.TRIO_FAIL(e);throw e;}
