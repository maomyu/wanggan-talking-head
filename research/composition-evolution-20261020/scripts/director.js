/* Research adapter. Material renderer stays intact; this owns spatial hierarchy,
 * persistent subjects and visual edits. Voice/source timing is never rewritten. */
const legacyBuilds=Object.values(window.__hf?.buildReady||{});
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
window.ADAPT_READY=false;
const adaptation=Promise.all(legacyBuilds).then(async()=>{
 await document.fonts.ready;
 if(!window.STUDY_RENDER)await new Promise(resolve=>requestAnimationFrame(resolve));
 const C=window.DIRECTOR_CONFIG,P=window.STUDY_TIMING,$=s=>document.querySelector(s),root=$('#root');
 const original=window.STUDY_RENDER,oldTimeline=window.__timelines.main;
 if(!original||!oldTimeline)throw Error('Material renderer not ready');
 oldTimeline.kill();
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},out=x=>1-(1-clamp(x))**3,mix=(a,b,u)=>a+(b-a)*u;
 let art=$('#art')||$('#stage');const person=$('#person')||$('#person-motion'),mask=$('#person-mask'),captions=$('#captions');
 // The first paper prototype predates the shared stage/person DOM contract.
 // Its paper surface is retained; its text cards are replaced by the same
 // dedicated director labels as every other style, without duplicate reading.
 const paperLegacy=!art&&C.key==='paper';
 if(paperLegacy){art=document.createElement('div');art.id='art';Object.assign(art.style,{position:'absolute',inset:'0',width:'952px',height:'700px',border:'2px solid #8b3326',background:'repeating-linear-gradient(0deg,#fffdf6 0px,#fffdf6 68px,#c9bda8 69px,#fffdf6 70px)',boxShadow:'14px 18px 0 #d7cdbb'});root.append(art);Object.assign(person.style,{left:'0',top:'0'});}
 if(!art||!person||!mask||!captions)throw Error('Required source layers are missing');
 const cs=getComputedStyle(root),oldTitle=$('#title')||$('#heading')||$('#heading-hook');
 root.style.setProperty('--director-fg',cs.color);root.style.setProperty('--director-bg',cs.backgroundColor);
 root.style.setProperty('--director-font',getComputedStyle(oldTitle).fontFamily);
 root.insertAdjacentHTML('beforeend',`<div id="d-material-wrap" aria-hidden="true"></div><div id="d-world">
 <div id="d-line"></div><div id="d-heading"><h1 id="d-title-a"></h1><h2 id="d-title-b"></h2></div>
 <div id="d-context"></div><div id="d-items"><div class="d-item"><b></b><span></span></div><div class="d-item"><b></b><span></span></div><div class="d-item"><b></b><span></span></div></div>
 <svg id="d-relations" viewBox="0 0 1080 1500"><path id="d-path"/><path id="d-branch1"/><path id="d-branch2"/></svg>
 <div id="d-frame"></div><div id="d-tabs"><span>消费</span><span>本金</span><span>负债</span><i></i></div><div id="d-center"></div></div>
 <div id="d-occluder"></div><div id="d-caption-backing"></div><div id="d-notice"></div>`);
 $('#d-material-wrap').append(art);
 const threeMount=$('#three-mount');
 if(threeMount){$('#d-material-wrap').append(threeMount);Object.assign(threeMount.style,{left:'0',top:'0',width:'952px',height:'700px'});}
 // Retain actual surfaces and the one media source; retire the old global
 // reading layers instead of leaving two directors' copy on screen.
 const keep=new Set(['surface','architecture','backdrop','set','person','captions','voice']);
 for(const el of [...root.children])if(!el.id.startsWith('d-')&&!keep.has(el.id)&&el!==person&&!el.classList.contains('backdrop')&&!el.classList.contains('paper'))el.style.setProperty('display','none','important');
 const css=document.createElement('style');css.textContent=`
 @font-face{font-family:Body;src:url('assets/fonts/NotoSansSC-700.woff');font-weight:700}
 #heading,#scene-labels,#recap,#progress,#credit,#style-label,.masthead,.marginword,.ambient-mark{display:none!important}
 #root{isolation:isolate}#d-world{position:absolute;inset:0;z-index:25;pointer-events:none;color:var(--director-fg)}
 #d-heading,#d-context,#d-items,#d-line,#d-frame,#d-tabs,#d-center{position:absolute;transform-origin:0 0}
 #d-heading h1,#d-heading h2{font-family:var(--director-font);font-weight:900;line-height:1.14;letter-spacing:-1.5px;margin:0;white-space:pre-line}
 #d-heading h2{margin-top:20px;font-size:.56em;line-height:1.3;font-family:Body,sans-serif;font-weight:700;letter-spacing:0}
 #d-heading,#d-context,.d-item,#d-tabs,#d-center,#d-material-wrap svg text{pointer-events:auto}
 #d-context{font-family:Body,sans-serif;font-size:46px;line-height:1.5;white-space:pre-line}
 #d-items{inset:0;pointer-events:none}.d-item{position:absolute;transform-origin:0 0;box-sizing:border-box;white-space:pre-line;color:var(--director-fg)}
 .d-item b{display:block;font-size:74px;line-height:1.25;font-family:var(--director-font);font-weight:900}.d-item span{display:block;font:42px/1.5 Body,sans-serif;margin-top:15px}
 #d-line{background:currentColor;opacity:.3}#d-material-wrap{position:absolute;left:0;top:0;width:952px;height:700px;z-index:12;transform-origin:0 0;pointer-events:none}
 #d-material-wrap #art,#d-material-wrap #stage{position:absolute!important;left:0!important;top:0!important;width:952px!important;height:700px!important;margin:0!important;transform:none!important;opacity:1!important}
 #d-material-wrap #three-mount{position:absolute!important;left:0!important;top:0!important;width:952px!important;height:700px!important;opacity:1!important}
 #d-material-wrap svg text,#d-material-wrap .note{display:none!important}
 #d-frame{border:3px solid currentColor;opacity:.4;box-sizing:border-box;pointer-events:none}
 #d-relations{position:absolute;inset:0;width:1080px;height:1500px;overflow:visible;z-index:-1;fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
 #d-tabs{display:flex;width:952px;height:94px;border-bottom:2px solid currentColor;font:50px/80px Body,sans-serif}
 #d-tabs span{width:33.333%;text-align:center}#d-tabs i{position:absolute;left:0;bottom:-3px;width:317px;height:7px;background:currentColor;transform-origin:0 0}
 #d-center{font-family:var(--director-font);font-size:90px;line-height:1.2;text-align:center;font-weight:900;background:var(--bg,var(--director-bg));padding:16px 20px}
 #person{left:0!important;top:0!important;transform-origin:0 0!important;z-index:50!important;width:840px!important;height:840px!important}
 #person-mask{border-radius:50%!important;filter:none!important;mix-blend-mode:normal!important;inset:0!important;outline:5px solid var(--bg,#fff)}
 #person video{filter:none!important;mix-blend-mode:normal!important;opacity:1!important;width:840px!important;height:840px!important;object-fit:cover!important}
 #captions{left:64px!important;top:1600px!important;width:952px!important;z-index:80!important;transform:none!important;box-sizing:border-box;min-height:90px}
 #caption-text{font-family:Body,sans-serif!important;font-size:60px!important;line-height:1.28!important;white-space:pre-line!important;margin:0!important}
 #d-caption-backing{position:absolute;left:64px;top:1600px;width:952px;height:188px;background:var(--caption,var(--bg,#fff));z-index:75;pointer-events:none;opacity:0}
 #d-notice{position:absolute;left:64px;top:1835px;width:952px;font:24px/32px Body,sans-serif;color:var(--director-fg);z-index:85}
 #d-occluder{position:absolute;left:0;top:100px;width:1080px;height:1460px;z-index:45;transform-origin:0 0;background:var(--bg,var(--director-bg));pointer-events:none;opacity:0}
 `;document.head.append(css);
 const items=[...document.querySelectorAll('.d-item')],A=$('#d-title-a'),B=$('#d-title-b'),heading=$('#d-heading'),ctx=$('#d-context'),wrap=$('#d-material-wrap'),line=$('#d-line'),frame=$('#d-frame'),tabs=$('#d-tabs'),center=$('#d-center'),relations=$('#d-relations'),cover=$('#d-occluder');
 $('#d-notice').textContent=C.key==='spotlight-stage'?'图解示意 · 舞台照片 daveynin / CC BY 2.0 · 数字裁切与合成':'依据本段口播的解释示意';
 const content={
 hook:{a:'越努力上班',b:'越存不到钱？',context:'先从自己的选择看起',items:[['跟风消费',''],['盲目投资',''],['负债前行','']]},
 chain:{a:'跟风的代价',b:'最后落在自己身上',context:'跟风消费、盲目投资\n后果由自己承担',items:[['跟风消费',''],['盲目投资',''],['本金受损','']]},
 overview:{a:'三个财经底线',b:'从自己的选择开始',context:'三项并列建议',items:[['减少无效消费',''],['守住本金',''],['减少负债','']]},
 spend:{a:'分清楚',b:'想要和需要',context:'下单之前\n留一点判断的空间',items:[['想要','一时喜欢'],['需要','实际用途'],['先分清楚','再决定买不买']]},
 risk:{a:'守住本金',b:'先看风险，再做选择',context:'夸大收益的说法\n暗藏风险',items:[['夸大收益',''],['暗藏风险',''],['守住本金','']]},
 debt:{a:'减少负债',b:'把压力往回收',context:'第三条底线',items:[['减少负债',''],['',''],['','']]},
 recap:{a:'不跟风，不浮躁',b:'回到自己的判断',context:'少冲动　守本金　减负债',items:[['少冲动',''],['守本金',''],['减负债','']]}
 };
 function box(el,x,y,w,h){Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h?h+'px':'auto'});}
 function item(i,x,y,w,font=74){const el=items[i];box(el,x,y,w);el.querySelector('b').style.fontSize=font+'px';return el;}
 function material(x,y,w,rot=0,ry=0){gsap.set(wrap,{x,y,scale:w/952,rotation:rot,rotationY:ry,transformPerspective:1400,transformOrigin:'0 0',opacity:1});}
 function reset(){
  $('#d-items').style.clipPath='none';gsap.set([A,B],{x:0,y:0,scale:1,opacity:1});
  for(const text of art.querySelectorAll('svg text'))text.style.removeProperty('display');
  for(const e of [line,frame,tabs,center,relations,ctx,...items])e.style.opacity='0';
  gsap.set(heading,{x:0,y:0,rotation:0,scale:1,opacity:1});heading.style.clipPath='none';
  for(const it of items){gsap.set(it,{x:0,y:0,rotation:0,rotationX:0,rotationY:0,scale:1});it.style.padding='0';it.style.border='0';it.style.background='transparent';it.style.clipPath='none';it.style.transformStyle='flat';it.querySelector('b').style.opacity='1';it.querySelector('span').style.opacity='1';}
  gsap.set(wrap,{x:64,y:500,scale:1,rotation:0,rotationY:0,opacity:1});wrap.style.clipPath='none';
  gsap.set(cover,{opacity:0,scaleX:0});A.style.fontSize='90px';B.style.fontSize='50px';B.style.marginLeft='0';B.style.color='inherit';ctx.style.fontSize='46px';
 }
 function apply(t){
  original(t);reset();const f=Math.floor(t*30+.001),sc=P.scenes.find(s=>f>=s.startFrame&&f<s.endFrame)||P.scenes.at(-1),age=t-sc.startFrame/30,d=content[sc.id],g=C.choreography.key,v=C.variant;
  A.textContent=d.a;B.textContent=d.b;ctx.textContent=d.context;items.forEach((e,i)=>{e.querySelector('b').textContent=d.items[i][0];e.querySelector('span').textContent=d.items[i][1]});
  const intro=sc.id==='hook',recap=sc.id==='recap',u=intro?1:out(age/.38);let p={x:716,y:1255,w:300};
  box(heading,64,160,952);box(ctx,64,1290,610);gsap.set(heading,{opacity:1});
  if(g==='speaker'){
   box(heading,64,160,952);A.style.fontSize='94px';B.style.fontSize='62px';material(64,510,900);
   if(intro||recap){const k=intro?1:ease(age/.7);p={x:mix(716,100,k),y:mix(1255,535,k),w:mix(300,790,k)};gsap.set(wrap,{opacity:0});box(ctx,64,1390,952);ctx.style.opacity='1';}
   else{const arrival=ease(age/.8),last=sc.id==='chain'?{x:100,y:535,w:790}:{x:716,y:1255,w:300};p={x:mix(last.x,716,arrival),y:mix(last.y,1255,arrival),w:mix(last.w,300,arrival)};ctx.style.opacity=out((age-.8)/.25);if(sc.id==='chain')gsap.set(wrap,{opacity:out((age-.8)/.25)});}
  }else if(g==='editorial'){
   box(heading,64,170,375);A.style.fontSize='84px';B.style.fontSize='51px';box(line,446,165,2,1110);line.style.opacity='.4';material(480,480,536);
   for(const text of art.querySelectorAll('svg text'))if(parseFloat(getComputedStyle(text).fontSize)>=100)text.style.setProperty('display','block','important');
   for(let i=0;i<2;i++){let e=item(i,64,630+i*255,350,82);e.style.opacity=out((age-.25-i*.16)/.35);gsap.set(e,{y:24*(1-out((age-.25-i*.16)/.35))});}
   box(ctx,480,1050,535);ctx.style.fontSize='44px';ctx.style.opacity='1';p={x:64,y:1255,w:300};
  }else if(g==='type'){
   box(heading,64,160,952);A.textContent=sc.id==='spend'?'想要':d.a;B.textContent=sc.id==='spend'?'需要':d.b;
   A.style.fontSize=sc.id==='spend'?'236px':'126px';B.style.fontSize=sc.id==='spend'?'236px':'80px';B.style.marginLeft=sc.id==='spend'?'370px':'0';
   material(64,890,620);box(ctx,64,1390,610);ctx.style.opacity='1';
   gsap.set(A,{x:-110*(1-u),opacity:u});const u2=intro?1:out((age-.18)/.3);gsap.set(B,{x:120*(1-u2),opacity:u2});
  }else if(g==='route'){
   A.style.fontSize='96px';material(560,380,450);relations.style.opacity='.6';$('#d-path').setAttribute('d','M112 570 V1220');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','');
   for(let i=0;i<3;i++){const e=item(i,175,570+i*235,760,78);const k=intro?1:out((age-.2-i*.23)/.35);e.style.opacity=k;gsap.set(e,{x:40*(1-k)});}
   box(ctx,64,1420,610);ctx.style.fontSize='42px';ctx.style.opacity='1';
  }else if(g==='stack'){
   A.style.fontSize='94px';material(64,410,490);const k=intro?1:ease((age-.05)/.7);
   for(let i=0;i<3;i++){const e=item(i,64,760,952,72);e.style.opacity='1';e.style.background='var(--caption,var(--bg,#fff))';e.style.border='2px solid currentColor';e.style.padding='25px 32px';e.style.height='204px';gsap.set(e,{y:mix(i*20,i*226,k),x:(1-k)*i*22,rotation:(1-k)*(i-1)*4,scale:mix(1-i*.035,1,k)});e.querySelector('b').style.opacity=intro?'1':out((age-.65)/.25);e.querySelector('span').style.opacity=intro?'1':out((age-.65)/.25);}
   p={x:716,y:1255,w:300};items[2].style.width='610px';items[2].querySelector('b').style.fontSize='64px';
  }else if(g==='derive'){
   A.style.fontSize='96px';material(64,490,920);relations.style.opacity='.65';$('#d-path').setAttribute('d','M540 400 V470 M540 1090 V1150 M230 1150 H850');$('#d-branch1').setAttribute('d','M230 1150 V1190');$('#d-branch2').setAttribute('d','M850 1150 V1190');
   const x=out((age-.4)/.8);$('#d-path').style.strokeDasharray='1000';$('#d-path').style.strokeDashoffset=1000*(1-x);
   for(let i=0;i<2;i++){const e=item(i,64+i*505,1125,455,80);e.style.opacity=out((age-.5-i*.15)/.3);e.querySelector('span').style.fontSize='40px';}
   p={x:64,y:1255,w:300};for(const e of items)e.querySelector('span').textContent='';box(ctx,410,1380,605);ctx.style.opacity='1';ctx.style.fontSize='42px';
  }else if(g==='gallery'){
   A.style.fontSize='86px';B.style.fontSize='50px';material(64+80*(1-u),450,952);box(frame,64,430,952,742);frame.style.opacity='.4';
   box(ctx,64,1235,610);ctx.style.fontSize='52px';ctx.style.opacity='1';
  }else if(g==='stage'){
   box(heading,64,1180,615);A.style.fontSize='87px';B.style.fontSize='48px';material(64,340,952,0,(1-u)*28);
   box(ctx,64,175,952);ctx.style.fontSize='54px';ctx.style.opacity='1';box(frame,165,1080,750,3);frame.style.opacity='.3';
  }else if(g==='archive'){
   box(heading,340,170,676);A.style.fontSize='91px';B.style.fontSize='48px';box(line,300,170,2,1070);line.style.opacity='.35';material(340,510,676);
   const labs=['消费','本金','负债'];for(let i=0;i<3;i++){const e=item(i,64,520+i*195,220,65);e.querySelector('b').textContent=labs[i];e.querySelector('span').textContent='';e.style.opacity=sc.id==='spend'?i===0?'1':'.35':sc.id==='risk'?i===1?'1':'.35':'1';}
   box(ctx,340,1100,676);ctx.style.opacity='1';ctx.style.fontSize='51px';p={x:64,y:1255,w:300};
  }else if(g==='interface'){
   A.style.fontSize='88px';box(tabs,64,370,952,94);tabs.style.opacity='1';const active=['spend','chain','hook'].includes(sc.id)?0:sc.id==='risk'?1:2;
   gsap.set(tabs.querySelector('i'),{x:active*317,scaleX:1+.15*(1-u)});box(frame,64,500,952,670);frame.style.opacity='.45';frame.style.borderRadius='38px';material(170,560,740);box(ctx,100,1220,585);ctx.style.fontSize='58px';ctx.style.opacity='1';p={x:716,y:1255,w:300};
  }else if(g==='scroll'){
   A.style.fontSize='88px';material(560,520,455);const phase=sc.id==='spend'?ease((t-18.1)/.55):sc.id==='risk'?ease((t-22.3)/.55):0;
   for(let i=0;i<3;i++){const e=item(i,64,610+i*440,470,94);e.style.opacity=i<2?'1':'.35';gsap.set(e,{y:-phase*440});}
   $('#d-items').style.clipPath='inset(450px 0 675px 0)';box(ctx,64,1290,610);ctx.style.opacity='1';ctx.style.fontSize='46px';
  }else if(g==='radial'){
   A.style.fontSize='90px';material(100,420,880);relations.style.opacity='.55';$('#d-path').setAttribute('d','M535 850 L245 650 M535 850 L830 745 M535 850 L285 1170');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','');
   const places=[[64,500,390],[640,680,375],[64,1140,580]];for(let i=0;i<3;i++){const e=item(i,...places[i],70);e.style.background='var(--bg,var(--director-bg))';e.style.padding='10px 16px';e.style.opacity=out((age-.2-i*.18)/.4);e.querySelector('span').textContent='';}
   box(center,345,850,390);center.textContent=sc.id==='spend'?'分清楚':sc.id==='risk'?'先判断':'选择';center.style.opacity='1';
  }
  // Portrait remains one source video. Geometry is uniform in x/y and scale;
  // no blur, grade, opacity replacement, face warp or independent source clock.
  gsap.set(person,{x:p.x,y:p.y,scale:p.w/840,rotation:0});mask.style.borderRadius='50%';
  for(const el of items)if(!el.querySelector('b').textContent)el.style.opacity='0';
  // Real content occlusion only for a few section seams. Voice and captions
  // stay continuous; this is not claimed as a temporal source splice.
  const cut=P.scenes.slice(1).find(s=>Math.abs(t-s.startFrame/30)<.24),wipe=['editorial','archive','stack'].includes(g);
  if(cut&&wipe){const dt=t-cut.startFrame/30,u=clamp((dt+.24)/.48);const extent=u<.4?ease(u/.4):u<=.6?1:1-ease((u-.6)/.4);gsap.set(cover,{opacity:1,scaleX:extent,x:u>.6?1080*(1-extent):0});cover.style.background='var(--accent,var(--director-fg))';heading.style.opacity='0';ctx.style.opacity='0';for(const el of items)el.style.opacity='0';gsap.set(wrap,{opacity:0});}
  if(cut&&g==='stage'){const dt=t-cut.startFrame/30;const ry=dt<0?90*ease((dt+.24)/.24):-90*(1-ease(dt/.24));gsap.set(wrap,{rotationY:ry,transformOrigin:'50% 50%',opacity:Math.abs(Math.cos(ry*Math.PI/180))});}
  // Reset paths written by other modes before evaluating backwards/random seek.
  if(g!=='derive')$('#d-path').style.strokeDashoffset='0';
  root.dataset.choreography=C.choreography.id;
  window.STUDY_STATE={frame:f,scene:sc.id,look:C.key,choreography:C.choreography.key,portrait:{...p,width:p.w,height:p.w,circle:true},captionId:window.STUDY_STATE?.captionId??P.captions?.find(c=>f>=c.startFrame&&f<c.endFrame)?.id,sourceContinuity:'continuous-0-1100',visualEditOnly:true};
 }
 const F=30,O=Number(root.dataset.originFrame||0)/F,D=Number(root.dataset.duration),clock={t:0};
 const timeline=gsap.timeline({paused:true});timeline.to(clock,{t:D,duration:D,ease:'none',onUpdate:()=>apply(clock.t+O)});
 await document.fonts.ready;apply(O);window.STUDY_RENDER=apply;window.__timelines.main=timeline;
 // Historical templates also listen to the renderer's seek event. Reapply the
 // complete new state after that legacy listener, so encoded frames and native
 // preview use the same portrait geometry and visual clock.
 window.addEventListener('hf-seek',e=>apply(e.detail.time+O));window.ADAPT_READY=true;
});
window.__hf.buildReady.adaptation=adaptation;
