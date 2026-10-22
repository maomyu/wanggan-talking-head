const C=window.FILM_CONFIG,P=C.source,$=id=>document.getElementById(id),E=C.rhythm.eventSchedule;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x<.5?16*x**5:1-(-2*x+2)**5/2,at=x=>typeof x==='number'?x:E[x];
const progress=(f,a,b)=>ease(clamp((f-at(a))/(at(b)-at(a))));
const tracks=Object.fromEntries(Object.entries(C.motion.tracks).map(([id,ks])=>[id,ks.map(k=>({...k,f:at(k.at)}))]));
const person=C.typography.personTrack.map(k=>({...k,f:at(k.at)})),camera=C.camera.viewTransforms.map(k=>({...k,f:at(k.at)}));
function sample(ks,f){let a=ks[0];for(let i=1;i<ks.length;i++){const b=ks[i];if(f<b.f){const u=progress(f,a.f,b.f);return Object.fromEntries(['x','y','s','a'].map(k=>[k,a[k]+(b[k]-a[k])*u]));}a=b;}return a;}
const place=(id,q)=>{const e=$(id);e.style.transform=`translate(${q.x}px,${q.y}px) scale(${q.s})`;e.style.opacity=q.a;};
try{
 await document.fonts.ready;
 const unitN=C.representation.objectGeometry.unitCount,debtN=C.representation.objectGeometry.debtCount;
 for(let i=0;i<unitN;i++){const e=document.createElement('i');e.className='capital-unit';$('principal-units').append(e);}
 for(let i=0;i<debtN;i++){const e=document.createElement('i');e.className='debt-unit';e.style.top=(20+i*43)+'px';$('debt-units').append(e);}
 const traceIds=['rise','fall','extra-cross'];for(const id of traceIds){const e=$(id),n=e.getTotalLength();e.style.strokeDasharray=n;e.dataset.length=n;}
 function draw(t){
  const f=clamp((t+(window.FILM_OFFSET||0))*30/1099)*1099,frame=Math.min(1099,Math.max(0,Math.floor(f+.00001))),actors={};
  for(const[id,ks]of Object.entries(tracks)){actors[id]=sample(ks,frame);place(id,actors[id]);}
  const q=sample(person,frame),cam=sample(camera,frame);place('presenter-shell',q);$('world').style.transform=`translate(${cam.x}px,${cam.y}px) scale(${cam.s})`;
  const cue=[...C.information.headlines].reverse().find(c=>frame>=c[0]);$('headline').textContent=cue[1];$('section-index').textContent='';
  for(const el of document.querySelectorAll('#labels .label'))el.style.opacity=0;
  const clearing=C.transition.entryExitBridges.some(n=>frame>=n&&frame<n+C.transition.labelClearFrames);
  if(!clearing)for(const c of C.typography.labelCues)if(frame>=at(c.start)&&frame<at(c.end)){const el=$(c.id);el.textContent=c.text;el.style.fontSize=c.size+'px';el.style.transform=`translate(${c.x}px,${c.y}px)`;el.style.opacity=1;}
  const loss=progress(frame,...C.motion.actions.loss),deny=progress(frame,...C.motion.actions.deny),reveal=progress(frame,...C.motion.actions.riskReveal);
  $('capital-crack').style.opacity=frame<388?loss:0;
  for(const[i,e]of [...$('principal-units').children].entries()){const a=frame<616&&i>=C.motion.stateTransitions.lossResult?1-loss:1;e.style.opacity=a;}
  for(const[i,e]of [...$('debt-units').children].entries()){
   const start=E.debtStart+(debtN-1-i)*2,end=E.debtReady-(i-2)*2,u=i>=C.motion.stateTransitions.debtAfter?progress(frame,start,end):0;
   e.style.transform=`translate(${u*570}px,${-u*65}px)`;e.style.opacity=1-u;
  }
  for(const id of traceIds){const e=$(id),u=id==='extra-cross'?deny:id==='fall'?loss:progress(frame,266,285);e.style.strokeDashoffset=(+e.dataset.length)*(1-u);}
  $('extra').style.opacity=actors.extra.a*(1-.45*deny);
  $('risk-cover').style.transform=`translateX(${-830*reveal}px)`;
  for(const child of $('risk-cover').children)child.style.visibility=frame>=E.riskRevealStart?'hidden':'visible';
  $('risk-cover').style.opacity=1;$('risk-cover').style.visibility=frame>=E.riskRevealEnd?'hidden':'visible';
  $('risk-inside').style.opacity=frame>=E.riskRevealEnd-2?1:0;
  const cap=P.captions.find(c=>frame>=c.startFrame&&frame<c.endFrame),breaks={'为什么越努力上班越存不到钱':'为什么越努力上班\n越存不到钱','给大家三个普通人的财经底线':'给大家三个普通人的\n财经底线','市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};
  $('caption-text').textContent=cap?(breaks[cap.text]||cap.text):'';
  const b=$('presenter-mask').getBoundingClientRect();window.FILM_STATE={frame,person:{x:b.x,y:b.y,w:b.width,h:b.height,circle:true},actors,camera:cam,principalUnits:frame>=331&&frame<616?4:8,debtUnits:frame>=E.debtReady?2:6,sourceFrame:frame,style:C.style.compositionMode,modules:{style:C.style.compositionMode,palette:C.palette.colorRoles.background,material:C.material.surfaceAssignments.objects,representation:unitN,motion:C.motion.language,camera:C.camera.language,transition:C.transition.labelClearFrames,typography:C.typography.mode,lighting:C.lighting.finishLayers.grainOpacity,information:C.information.relations.length,rhythm:C.rhythm.readWindows.length}};
 }
 const clock={t:0},duration=window.FILM_DURATION||P.duration,tl=gsap.timeline({paused:true});tl.to(clock,{t:duration,duration,ease:'none',onUpdate:()=>draw(clock.t)});
 window.__timelines=window.__timelines||{};window.__timelines.main=tl;window.FILM_RENDER=window.SEMANTIC_RENDER=draw;window.addEventListener('hf-seek',e=>draw(e.detail.time));draw(0);window.SELECTOR_READY=window.RESEARCH_READY=true;window.TRIO_READY();
}catch(e){window.TRIO_FAIL(e);throw e;}
