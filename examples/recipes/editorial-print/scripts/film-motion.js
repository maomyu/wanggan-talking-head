window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
window.__hf.buildReady.editorial=(async()=>{
 await document.fonts.ready;const C=window.FILM_CONFIG,P=C.source,$=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,u)=>a+(b-a)*u;
 const ease={quint:x=>x<.5?16*x**5:1-(-2*x+2)**5/2,out:x=>1-(1-x)**4,in:x=>x**3,soft:x=>x*x*(3-2*x),linear:x=>x};
 const progress=(f,a,b,curve='out')=>(ease[curve]||ease.out)(clamp((f-a)/(b-a)));
 const tracks=Object.entries(C.resolvedTracks).map(([id,keys])=>({id,el:$(id),keys}));
 for(const[id,[w,h]]of Object.entries(C.representation.objectGeometry)){const e=$(id);if(e){e.style.width=w+'px';e.style.height=h+'px';}}
 for(let i=0;i<8;i++){const e=document.createElement('i');e.className='unit';e.style.left=(50+i%4*180)+'px';e.style.top=(104+Math.floor(i/4)*95)+'px';$('units').append(e);}
 for(let i=0;i<6;i++){const e=document.createElement('i');e.className='debt-strip';e.style.top=(70+i*36)+'px';$('debt-strips').append(e);}
 function pose(keys,f){let a=keys[0];for(let i=1;i<keys.length;i++){const b=keys[i];if(f<b.f){const u=(ease[b.ease]||ease.quint)(clamp((f-a.f)/(b.f-a.f)));return Object.fromEntries(['x','y','s','a','r'].map(p=>[p,mix(a[p],b[p],u)]));}a=b;}return a;}
 function draw(t){const offset=window.FILM_OFFSET||0,f=Math.min(1099,Math.max(0,Math.floor((t+offset)*30+.00001))),states={};
  for(const tr of tracks){const q=pose(tr.keys,f);tr.el.style.transform=`translate(${q.x}px,${q.y}px) scale(${q.s}) rotate(${q.r}deg)`;tr.el.style.opacity=q.a;states[tr.id]=q;tr.el.classList.toggle('mini',q.s<(tr.id==='account'?.5:.65));}
  const camera=C.camera.viewTransforms;let cam=camera[camera.length-1];for(let i=1;i<camera.length;i++)if(f<camera[i][0]){const a=camera[i-1],b=camera[i],u=progress(f,a[0],b[0],'quint');cam=[f,mix(a[1],b[1],u),mix(a[2],b[2],u),mix(a[3],b[3],u)];break;}$('paper-world').style.transform=`translate(${cam[2]}px,${cam[3]}px) scale(${cam[1]})`;
  const cue=[...C.information.headlineCues].reverse().find(c=>f>=c[0]);$('headline').textContent=cue[1];$('headline').style.fontSize=cue[2]+'px';const u=f===0?1:progress(f,cue[0],cue[0]+9);$('heading').style.transform=`translateY(${(1-u)*14}px)`;$('heading').style.opacity=.65+.35*u;
  $('page-base').style.opacity=progress(f,91,113)*(1-progress(f,898,928));
  const capital=f>=616;$('account-title').textContent=capital?'本金 · 示意':f>=310?'本金受损':'留下的钱';$('ledger-lines').style.opacity=capital?0:1;$('units').style.opacity=capital?1:0;$('loss-cut').style.opacity=capital?0:progress(f,...C.motion.stateTransitions.loss);
  for(let i=0;i<8;i++)$('units').children[i].style.transform=`translateY(${(1-progress(f,626+i,646+i))*24}px)`;
  for(let i=0;i<6;i++){const e=$('debt-strips').children[i],removed=i>=2?progress(f,C.motion.stateTransitions.debtRemove[0]+(5-i)*2,C.motion.stateTransitions.debtRemove[1]-6+(5-i)*2,'in'):0;e.style.opacity=1-removed;e.style.transform=`translate(${removed*240}px,${removed*-65}px) rotate(${removed*6}deg)`;}
  $('debt-title').textContent=f>=856?'负担减轻':'负债';$('debt-title').style.visibility=f>=898?'hidden':'';
  $('risk-front').style.transform=`rotateY(${-180*progress(f,...C.motion.stateTransitions.riskFront,'quint')}deg)`;$('risk-front').style.visibility=f>=752?'hidden':'visible';$('risk-back').style.visibility='visible';$('risk-back').querySelector('b').style.opacity=progress(f,751,755);
  $('capital-rail').style.opacity=progress(f,779,789)*(1-progress(f,850,862));
  const bridge=C.transition.entryExitBridges.find(b=>f>=b.start&&f<=b.end);let bridgeX=-1300,bridgeAlpha=0;if(bridge){bridgeAlpha=1;if(f<bridge.coverIn)bridgeX=mix(-1300,-40,progress(f,bridge.start,bridge.coverIn,'in'));else if(f>bridge.coverOut)bridgeX=mix(-40,1220,progress(f,bridge.coverOut,bridge.end,'out'));else bridgeX=-40;}$('bridge').style.opacity=bridgeAlpha;$('bridge').style.transform=`translateX(${bridgeX}px)`;
  for(const[id,start,end]of[['impulse-cross',466,482],['extra-cross',...C.motion.stateTransitions.cross],['market-rise',268,292],['market-fall',310,329]]){const e=id==='extra-cross'?$('extra-cross').querySelector('path'):$(id),len=e.getTotalLength();e.style.strokeDasharray=len;e.style.strokeDashoffset=len*(1-progress(f,start,end));}
  const cap=P.captions.find(c=>f>=c.startFrame&&f<c.endFrame),breaks={'为什么越努力上班越存不到钱':'为什么越努力上班\n越存不到钱','给大家三个普通人的财经底线':'给大家三个普通人的\n财经底线','市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};$('caption-text').textContent=cap?(breaks[cap.text]||cap.text):'';
  const r=$('presenter-mask').getBoundingClientRect();window.FILM_STATE={frame:f,person:{x:r.x,y:r.y,w:r.width,h:r.height,circle:true},actors:states,principalUnits:8,debtUnits:f>=882?2:6,camera:cam,bridge:bridge?.id??null,sourceFrame:f,style:C.style.compositionMode};window.RESEARCH_READY=window.SELECTOR_READY=true;
 }
 const clock={t:0},duration=window.FILM_DURATION||P.duration,tl=gsap.timeline({paused:true});tl.to(clock,{t:duration,duration,ease:'none',onUpdate:()=>draw(clock.t)});window.__timelines=window.__timelines||{};window.__timelines.main=tl;window.FILM_RENDER=window.SEMANTIC_RENDER=draw;window.addEventListener('hf-seek',e=>draw(e.detail.time));draw(0);
})();
