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
 const bg=cs.getPropertyValue('--bg').trim()||getComputedStyle(document.body).backgroundColor;
 const rgb=color=>{const el=document.createElement('span');el.style.color=color;root.append(el);const v=getComputedStyle(el).color.match(/[\d.]+/g).slice(0,3).map(Number);el.remove();return v;};
 const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>{a=lum(a);b=lum(b);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
 let fg=cs.color;if(contrast(fg,bg)<4.5)fg=contrast('#15201d',bg)>contrast('#fffdf6',bg)?'#15201d':'#fffdf6';
 const panelBg=cs.getPropertyValue('--caption').trim()||bg;
 const panelFg=contrast(fg,panelBg)>=4.5?fg:contrast('#15201d',panelBg)>contrast('#fffdf6',panelBg)?'#15201d':'#fffdf6';
 $('#caption-text').style.color=panelFg;
 root.style.setProperty('--director-fg',fg);root.style.setProperty('--director-bg',bg);
 root.style.setProperty('--director-font',getComputedStyle(oldTitle).fontFamily);
 root.insertAdjacentHTML('beforeend',`<div id="d-material-wrap" aria-hidden="true"></div><div id="d-world">
 <div id="d-line"></div><div id="d-heading"><h1 id="d-title-a"></h1><h2 id="d-title-b"></h2></div>
 <div id="d-context"></div><div id="d-items"><div class="d-item"><b></b><span></span></div><div class="d-item"><b></b><span></span></div><div class="d-item"><b></b><span></span></div></div>
 <svg id="d-relations" viewBox="0 0 1080 1500"><path id="d-path"/><path id="d-branch1"/><path id="d-branch2"/></svg>
 <div id="d-frame"></div><div id="d-tabs"><span>消费</span><span>本金</span><span>负债</span><i></i></div><div id="d-center"></div><div id="d-scroll-viewport"><div id="d-scroll"></div></div></div>
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
 #root{isolation:isolate;width:100%!important;height:100%!important}#d-world{position:absolute;inset:0;z-index:25;pointer-events:none;color:var(--director-fg)}
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
 #d-frame{border:3px solid currentColor;opacity:.4;box-sizing:border-box;pointer-events:none;z-index:-2}
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
 #d-scroll-viewport{position:absolute;left:64px;top:480px;width:510px;height:850px;overflow:hidden;opacity:0;pointer-events:none}
 #d-scroll{position:absolute;left:0;top:0;width:510px;transform-origin:0 0;border-left:2px solid currentColor}
 .d-scroll-panel{position:absolute;left:0;width:510px;height:850px;padding-left:28px;box-sizing:border-box}
 .d-scroll-panel small{font:28px/36px Body,sans-serif;display:block;margin-bottom:40px;opacity:.75}
 .d-scroll-row{position:absolute;left:28px;width:465px;pointer-events:auto}
 .d-scroll-row b{font:700 70px/1.25 var(--director-font);display:block;white-space:pre-line}
 .d-scroll-row span{font:42px/1.5 Body,sans-serif;display:block;white-space:pre-line;margin-top:16px}
 `;document.head.append(css);
 const items=[...document.querySelectorAll('.d-item')],A=$('#d-title-a'),B=$('#d-title-b'),heading=$('#d-heading'),ctx=$('#d-context'),wrap=$('#d-material-wrap'),line=$('#d-line'),frame=$('#d-frame'),tabs=$('#d-tabs'),center=$('#d-center'),relations=$('#d-relations'),cover=$('#d-occluder');
 $('#d-notice').textContent=C.key==='spotlight-stage'?'图解示意 · 舞台照片 daveynin / CC BY 2.0 · 数字裁切与合成':'依据本段口播的解释示意';
 const content=C.sceneContent;if(!content||P.scenes.some(s=>!content[s.id]?.items))throw Error('A designed sceneContent plan is required; fixture copy is never inferred for a new script');
 const scrollViewport=$('#d-scroll-viewport'),scrollWorld=$('#d-scroll');
 for(const [i,sc]of P.scenes.entries()){const panel=document.createElement('section');panel.className='d-scroll-panel';panel.style.top=i*900+'px';const small=document.createElement('small');small.textContent=String(i+1).padStart(2,'0')+' / '+String(P.scenes.length).padStart(2,'0');panel.append(small);
  for(const [j,row]of content[sc.id].items.entries()){if(!row[0]||(['spend','risk'].includes(sc.id)&&j===2))continue;const e=document.createElement('div');e.className='d-scroll-row';e.style.top=(70+j*240)+'px';const b=document.createElement('b'),span=document.createElement('span');b.textContent=row[0];b.style.fontSize=row[0].length>5?'62px':'70px';span.textContent=row[1];e.append(b,span);panel.append(e)}scrollWorld.append(panel)}
 const mainPose=g=>['editorial','derive','archive','radial'].includes(g)?{x:64,y:1255,w:300}:{x:716,y:1255,w:300};
 const hookPoses={speaker:{x:100,y:535,w:790},editorial:{x:360,y:560,w:650},type:{x:456,y:800,w:560},derive:{x:64,y:600,w:640},gallery:{x:180,y:480,w:720},stage:{x:220,y:630,w:640},archive:{x:360,y:580,w:650},interface:{x:280,y:580,w:520},scroll:{x:550,y:870,w:450}};
 function poseFor(g,id){return id==='hook'?(hookPoses[g]||mainPose(g)):id==='recap'&&g==='speaker'?hookPoses.speaker:mainPose(g)}
 function hideLegacyText(){for(const el of wrap.querySelectorAll('.object-labels,.object-leaders,.model-label,.model-result,.graphic-note,.compare-note'))el.style.setProperty('visibility','hidden','important');const walker=document.createTreeWalker(wrap,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const el=node.parentElement;if(node.data.trim()&&el&&!['SCRIPT','STYLE'].includes(el.tagName)&&!el.closest('svg')&&el.childElementCount===0)el.style.setProperty('visibility','hidden','important')}}
 function box(el,x,y,w,h){Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h?h+'px':'auto'});}
 function item(i,x,y,w,font=74){const el=items[i];box(el,x,y,w);el.querySelector('b').style.fontSize=font+'px';return el;}
 function material(x,y,w,rot=0,ry=0){gsap.set(wrap,{x,y,scale:w/952,rotation:rot,rotationY:ry,transformPerspective:1400,transformOrigin:'0 0',opacity:1});}
 function reset(){
  $('#d-items').style.clipPath='none';gsap.set([A,B],{x:0,y:0,scale:1,opacity:1});
  for(const text of art.querySelectorAll('svg text'))text.style.removeProperty('display');
  for(const e of [line,frame,tabs,center,relations,ctx,scrollViewport,...items])e.style.opacity='0';
  $('#d-items').style.opacity='1';frame.style.borderRadius='0';frame.style.background='transparent';
  gsap.set(heading,{x:0,y:0,rotation:0,scale:1,opacity:1});heading.style.clipPath='none';
  for(const it of items){gsap.set(it,{x:0,y:0,rotation:0,rotationX:0,rotationY:0,scale:1});it.style.padding='0';it.style.border='0';it.style.background='transparent';it.style.clipPath='none';it.style.transformStyle='flat';it.querySelector('b').style.opacity='1';it.querySelector('span').style.opacity='1';it.querySelector('span').style.fontSize='42px';}
  center.style.fontSize='90px';center.style.background='var(--bg,var(--director-bg))';center.style.border='0';
  gsap.set(wrap,{x:64,y:500,scale:1,rotation:0,rotationY:0,opacity:1,transformOrigin:'0 0'});wrap.style.clipPath='none';
  gsap.set(cover,{opacity:0,scaleX:0});A.style.fontSize='90px';B.style.fontSize='50px';B.style.marginLeft='0';B.style.color='inherit';ctx.style.fontSize='46px';
 }
 function apply(t){
  if(C.canonicalMaterialSeek)original(0);original(t);reset();const f=Math.floor(t*30+.001),sc=P.scenes.find(s=>f>=s.startFrame&&f<s.endFrame)||P.scenes.at(-1),age=t-sc.startFrame/30,d=content[sc.id],g=C.choreography.key;
  if(!['speaker','gallery','stage'].includes(g))hideLegacyText();
  A.textContent=d.a;B.textContent=d.b;ctx.textContent=d.context;items.forEach((e,i)=>{e.querySelector('b').textContent=d.items[i][0];e.querySelector('span').textContent=d.items[i][1]});
  const intro=sc.id==='hook',recap=sc.id==='recap',u=intro?1:out(age/.38);let p={x:716,y:1255,w:300};
  box(heading,64,160,952);box(ctx,64,1290,610);gsap.set(heading,{opacity:1});
  if(g==='speaker'){
   box(heading,64,160,952);A.style.fontSize='94px';B.style.fontSize='62px';material(64,510,900);
   if(intro||recap){const k=intro?1:ease(age/.7);p={x:mix(716,100,k),y:mix(1255,535,k),w:mix(300,790,k)};gsap.set(wrap,{opacity:0});box(ctx,64,1390,952);ctx.style.opacity='1';}
   else{const arrival=ease(age/.8),last=sc.id==='chain'?{x:100,y:535,w:790}:{x:716,y:1255,w:300};p={x:mix(last.x,716,arrival),y:mix(last.y,1255,arrival),w:mix(last.w,300,arrival)};ctx.style.opacity='0';if(sc.id==='chain')gsap.set(wrap,{opacity:out((age-.8)/.25)});}
  }else if(g==='editorial'){
   box(heading,64,170,375);A.style.fontSize=d.a.length>=5?'70px':'84px';B.style.fontSize='51px';box(line,446,165,2,1110);line.style.opacity='.4';material(480,470,536);
   const editorialLines={chain:['跟风的代价','最后落在\n自己身上'],overview:['三个\n财经底线','从自己的\n选择开始'],risk:['守住本金','先看风险\n再做选择'],debt:['减少负债','把压力\n往回收'],recap:['不跟风\n不浮躁','回到\n自己的判断']};
   if(editorialLines[sc.id]){A.textContent=editorialLines[sc.id][0];B.textContent=editorialLines[sc.id][1]}
   const list=['chain','overview','recap'].includes(sc.id),plain=['magazine','paper','newspaper'].includes(C.key);
   if(list||plain)gsap.set(wrap,{opacity:0});
   for(let i=0;i<(list?3:sc.id==='debt'?1:2);i++){const x=list?480:480+i*280,y=list?540+i*220:plain?660:950,w=list?536:256;let e=item(i,x,y,w,list?62:sc.id==='spend'?86:58);e.style.opacity=intro?'0':out((age-.25-i*.16)/.35);e.querySelector('span').style.fontSize='40px';}
   box(ctx,64,650,350);ctx.style.fontSize='44px';ctx.style.opacity='1';if(sc.id==='spend')ctx.textContent='下单之前\n留一点\n判断的空间';p={x:64,y:1255,w:300};
  }else if(g==='type'){
   box(heading,64,160,952);A.textContent=sc.id==='spend'?'想要':d.a;B.textContent=sc.id==='spend'?'需要':d.b;
   A.style.fontSize=sc.id==='spend'?'236px':'126px';B.style.fontSize=sc.id==='spend'?'236px':'80px';B.style.marginLeft=sc.id==='spend'?'370px':'0';
   gsap.set(wrap,{opacity:0});box(ctx,64,1420,610);ctx.style.fontSize='42px';ctx.style.opacity='1';
   if(['chain','overview','recap'].includes(sc.id)){A.style.fontSize='96px';B.style.fontSize='60px';for(let i=0;i<3;i++){const e=item(i,64,610+i*220,952,100);e.style.opacity=out((age-.3-i*.16)/.3);e.querySelector('span').textContent=''}}
   if(sc.id==='risk'){for(let i=0;i<2;i++){const e=item(i,64,650+i*270,952,i?148:94);e.style.opacity=out((age-.35-i*.2)/.3);e.style.borderBottom=i?'0':'4px solid currentColor';e.querySelector('span').textContent=''}}
   if(sc.id==='debt'){A.textContent='第三条';const e=item(0,64,730,952,300);e.querySelector('b').textContent='负债';e.querySelector('span').textContent='';e.style.opacity=out((age-.2)/.4)}
   gsap.set(A,{x:-110*(1-u),opacity:u});const u2=intro?1:out((age-.18)/.3);gsap.set(B,{x:120*(1-u2),opacity:u2});
  }else if(g==='route'){
   A.style.fontSize='96px';material(560,380,450);relations.style.opacity='.6';$('#d-path').setAttribute('d','M112 570 V1220');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','');
   for(let i=0;i<3;i++){const e=item(i,175,570+i*235,760,78);const k=intro?1:out((age-.2-i*.23)/.35);e.style.opacity=k;gsap.set(e,{x:40*(1-k)});}
   box(ctx,64,1420,610);ctx.style.fontSize='42px';ctx.style.opacity='1';
   if(sc.id==='overview')gsap.set(wrap,{opacity:0});
  }else if(g==='stack'){
   A.style.fontSize='94px';material(64,410,490);const short=sc.endFrame-sc.startFrame<50,k=intro?1:ease((age-.05)/(short?.32:.7));
   for(let i=0;i<3;i++){const e=item(i,64,760,952,72);e.style.opacity='1';e.style.background='var(--caption,var(--bg,#fff))';e.style.border='2px solid currentColor';e.style.padding='25px 32px';e.style.height='204px';gsap.set(e,{y:mix(i*20,i*226,k),x:(1-k)*i*22,rotation:(1-k)*(i-1)*4,scale:mix(1-i*.035,1,k)});e.querySelector('b').style.opacity=intro?'1':out((age-(short?.25:.65))/(short?.15:.25));e.querySelector('span').style.opacity=intro?'1':out((age-(short?.25:.65))/(short?.15:.25));}
   p={x:716,y:1255,w:300};items[2].style.width='610px';items[2].querySelector('b').style.fontSize='64px';
  }else if(g==='derive'){
   A.style.fontSize='96px';material(64,450,920);relations.style.opacity='.65';$('#d-path').setAttribute('d','M540 400 V440 M540 1000 V1080 M230 1080 H850');$('#d-branch1').setAttribute('d','M230 1080 V1110');$('#d-branch2').setAttribute('d','M850 1080 V1110');
   const short=sc.endFrame-sc.startFrame<50,x=out((age-(short?.18:.4))/(short?.3:.8));$('#d-path').style.strokeDasharray='1000';$('#d-path').style.strokeDashoffset=1000*(1-x);
   for(let i=0;i<2;i++){const e=item(i,64+i*505,1130,455,80);e.style.opacity=out((age-.5-i*.15)/.3);e.querySelector('span').style.fontSize='40px';}
   if(sc.id==='overview'||recap){material(64,410,920);for(let i=0;i<3;i++){const e=item(i,64+i*326,1080,300,60);if(sc.id==='overview'&&i===0)e.querySelector('b').textContent='减少\n无效消费';e.style.opacity=out((age-.4-i*.15)/.3)}$('#d-path').setAttribute('d','M540 1000 V1040 M210 1040 H870');$('#d-branch1').setAttribute('d','M210 1040 V1060');$('#d-branch2').setAttribute('d','M870 1040 V1060')}
   if(sc.id==='debt'){box(items[0],350,1130,600);items[0].style.opacity=out((age-.18)/.2);$('#d-path').setAttribute('d','M540 1000 V1110');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','')}
   p={x:64,y:1255,w:300};for(const e of items)e.querySelector('span').textContent='';box(ctx,410,1380,605);ctx.style.opacity='1';ctx.style.fontSize='42px';
  }else if(g==='gallery'){
   A.style.fontSize='86px';B.style.fontSize='50px';material(64+80*(1-u),450,952);box(frame,64,430,952,742);frame.style.opacity='.4';
   box(ctx,64,1235,610);ctx.style.fontSize='52px';ctx.style.opacity='0';
  }else if(g==='stage'){
   box(heading,64,1180,615);A.style.fontSize='87px';B.style.fontSize='48px';material(64,340,952,0,(1-u)*28);
   box(ctx,64,175,952);ctx.style.fontSize='54px';ctx.style.opacity='1';box(frame,165,1080,750,3);frame.style.opacity='.3';
   if(C.key==='paper-stage'){material(64,350,820,0,(1-u)*28);box(heading,150,800,770);A.style.fontSize='96px';B.style.fontSize='62px';}
   if(C.key==='miniature-puppet'&&$('#architecture'))$('#architecture').style.bottom='800px';
  }else if(g==='archive'){
   box(heading,340,170,676);A.style.fontSize='91px';B.style.fontSize='48px';box(line,300,170,2,1070);line.style.opacity='.35';material(340,510,676);
   const labs=['消费','本金','负债'];for(let i=0;i<3;i++){const e=item(i,64,520+i*195,220,65);e.querySelector('b').textContent=labs[i];e.querySelector('span').textContent='';e.style.opacity=sc.id==='spend'?i===0?'1':'.68':sc.id==='risk'?i===1?'1':'.68':'1';}
   box(ctx,340,1100,676);ctx.style.opacity='1';ctx.style.fontSize='51px';p={x:64,y:1255,w:300};
  }else if(g==='interface'){
   A.style.fontSize='88px';box(tabs,64,370,952,94);tabs.style.opacity='1';const active=['spend','chain','hook','overview'].includes(sc.id)?0:sc.id==='risk'?1:2;
   gsap.set(tabs.querySelector('i'),{x:active*317,scaleX:1+.15*(1-u)});box(frame,64,500,952,670);frame.style.opacity='1';frame.style.borderRadius='38px';frame.style.background='var(--caption,var(--bg))';gsap.set(wrap,{opacity:0});
   const pair=sc.id==='spend';for(let i=0;i<(pair?2:3);i++){const e=item(i,pair?110+i*460:110,pair?625:560+i*170,pair?400:850,pair?96:70);e.style.opacity=out((age-.45-i*.12)/.25);e.querySelector('span').style.fontSize='44px'}
   if(pair){box(center,105,1000,870);center.style.opacity=out((age-.65)/.25);center.style.fontSize='56px';center.style.border='2px solid currentColor';center.style.background='transparent';center.textContent='先想用途，再做选择'}
   for(const e of items)e.style.color=panelFg;center.style.color=panelFg;
   box(ctx,100,1255,585);ctx.style.fontSize='48px';ctx.style.opacity='1';p={x:716,y:1255,w:300};
  }else if(g==='scroll'){
   A.style.fontSize='88px';material(610,590,405);const idx=P.scenes.indexOf(sc),progress=intro?0:idx-1+ease(age/.65);gsap.set(scrollWorld,{y:-progress*900});scrollViewport.style.opacity='1';box(ctx,64,1390,610);ctx.style.opacity='1';ctx.style.fontSize='42px';
  }else if(g==='radial'){
   A.style.fontSize='90px';material(340,670,400);relations.style.opacity='.55';$('#d-path').setAttribute('d','M540 1000 L230 640 M540 1000 L835 670 M540 1000 L720 1200');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','');
   const places=[[64,490,360],[660,520,356],[430,1240,580]];for(let i=0;i<3;i++){const e=item(i,...places[i],70);e.style.background='var(--bg,var(--director-bg))';e.style.padding='10px 16px';e.style.opacity=intro?1:out((age-.2-i*.18)/.4);e.querySelector('span').textContent='';}
   box(center,350,1040,480);center.style.fontSize='76px';center.textContent=sc.id==='spend'?'分清楚':sc.id==='risk'?'先判断':'选择';center.style.opacity='1';p={x:64,y:1255,w:300};
   if(sc.id==='spend'){items[2].style.opacity='0';$('#d-path').setAttribute('d','M540 1000 L230 640 M540 1000 L835 670')}
   if(sc.id==='debt')$('#d-path').setAttribute('d','M540 1000 L230 640');
  }
  // A hook is a designed state, not an empty material frame. The same person
  // hands over to the explanation; no alternate source clock or face filter.
  if(intro){
   if(g==='editorial'){box(heading,64,170,952);A.style.fontSize='100px';B.style.fontSize='64px';box(line,315,540,2,700);box(ctx,64,620,240);ctx.style.fontSize='48px';ctx.textContent='先从\n自己的选择\n看起';items.forEach(e=>e.style.opacity='0');gsap.set(wrap,{opacity:0})}
   if(g==='type'){A.style.fontSize='160px';B.style.fontSize='120px'}
   if(g==='derive'){gsap.set(wrap,{opacity:0});for(let i=0;i<3;i++){const e=item(i,750,590+i*240,265,54);e.style.opacity='1';e.querySelector('span').textContent=''}$('#d-path').setAttribute('d','M720 650 V1180');$('#d-branch1').setAttribute('d','');$('#d-branch2').setAttribute('d','');$('#d-path').style.strokeDashoffset='0';box(ctx,64,1390,952);ctx.style.opacity='1'}
   if(g==='gallery'){gsap.set(wrap,{opacity:0});box(frame,140,450,800,830);box(ctx,64,1365,952);ctx.style.opacity='1'}
   if(g==='stage'){gsap.set(wrap,{opacity:0});box(heading,64,160,952);A.style.fontSize='96px';B.style.fontSize='62px';box(ctx,64,1390,952);box(frame,165,1360,750,3)}
   if(g==='archive'){gsap.set(wrap,{opacity:0});box(ctx,340,1340,676);ctx.style.fontSize='48px'}
   if(g==='interface'){items.forEach(e=>e.style.opacity='0');center.style.opacity='0';box(frame,64,500,952,700)}
   if(g==='scroll')gsap.set(wrap,{opacity:0});
  }
  if(g!=='speaker'){
   const target=poseFor(g,sc.id),idx=P.scenes.indexOf(sc),previous=idx>0?poseFor(g,P.scenes[idx-1].id):target,k=intro?1:ease(age/.8);
   p={x:mix(previous.x,target.x,k),y:mix(previous.y,target.y,k),w:mix(previous.w,target.w,k)};
   if(!intro&&previous.w>400){const reading=out((age-.7)/.22);for(const el of [...items,relations])el.style.opacity=Number(el.style.opacity||0)*reading;gsap.set(wrap,{opacity:Number(gsap.getProperty(wrap,'opacity'))*reading});if(parseFloat(heading.style.top)>800)heading.style.opacity=reading;if(parseFloat(ctx.style.top)>500)ctx.style.opacity=Number(ctx.style.opacity||0)*reading;}
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
  if(g!=='derive'){$('#d-path').style.strokeDashoffset='0';$('#d-path').style.strokeDasharray='none';}
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
