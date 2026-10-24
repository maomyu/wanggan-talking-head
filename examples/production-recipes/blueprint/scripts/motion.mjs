const C=window.FILM_CONFIG,P=C.source,K=C.key,$=id=>document.getElementById(id),cl=x=>Math.max(0,Math.min(1,x)),ease=x=>x<.5?16*x**5:1-(-2*x+2)**5/2,p=(f,a,b)=>ease(cl((f-a)/(b-a)));
const person=C.typography.personTrack.map(k=>({...k,f:k.at}));
function sample(keys,f){let a=keys[0];for(let i=1;i<keys.length;i++){const b=keys[i];if(f<b.f){const u=p(f,a.f,b.f);return Object.fromEntries(['x','y','s','a'].map(k=>[k,a[k]+(b[k]-a[k])*u]));}a=b;}return a;}
try{
 await document.fonts.ready;let engine;
 if(K==='editorial-print'){const{createPaperWorld}=await import('./paper-world.mjs');engine=createPaperWorld($('stage'),C);}
 else{const mount=document.createElement('div');mount.className='engine-stage';$('stage').append(mount);if(K==='blueprint'){const{createBlueprintPlan}=await import('./blueprint-plan.mjs');engine=createBlueprintPlan(mount,C);}else{const{createClayWorld}=await import('./clay-world.mjs');engine=await createClayWorld(mount,C);}}
 function draw(t){
  const frame=Math.min(1099,Math.max(0,Math.floor((t+(window.FILM_OFFSET||0))*30+.00001))),q=sample(person,frame);
  $('presenter-shell').style.transform=`translate(${q.x}px,${q.y}px) scale(${q.s})`;
  const cue=[...C.information.headlines].reverse().find(c=>frame>=c[0]);$('headline').textContent=cue[1];
  const clearing=C.transition.entryExitBridges.some(n=>frame>=n&&frame<n+C.transition.labelClearFrames);
  for(const e of document.querySelectorAll('#labels .label'))e.style.opacity=0;
  if(!clearing)for(const c of C.typography.labelCues){const E=C.rhythm.eventSchedule,at=n=>typeof n==='number'?n:E[n];if(frame>=at(c.start)&&frame<at(c.end)){const e=$(c.id);e.textContent=c.text;e.style.fontSize=c.size+'px';e.style.transform=`translate(${c.x}px,${c.y}px)`;e.style.opacity=1;}}
  const state=engine.draw(frame);$('stage').style.opacity=p(frame,74,112);
  const cap=P.captions.find(c=>frame>=c.startFrame&&frame<c.endFrame),breaks={'为什么越努力上班越存不到钱':'为什么越努力上班\n越存不到钱','给大家三个普通人的财经底线':'给大家三个普通人的\n财经底线','市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};$('caption-text').textContent=cap?(breaks[cap.text]||cap.text):'';
  const b=$('presenter-mask').getBoundingClientRect();window.FILM_STATE={frame,sourceFrame:frame,person:{x:b.x,y:b.y,w:b.width,h:b.height,circle:true},actors:state.actors||{},camera:state.camera||{span:state.span,yaw:state.yaw,target:state.target},principalUnits:state.principalUnits,debtUnits:state.debtUnits,engine:state,style:K,modules:{style:C.style.identityRules,palette:C.palette.colorRoles.background,material:C.material.surfaceAssignments.objects,representation:C.representation.objectIdentity,motion:C.motion.language,camera:C.camera.language,transition:C.transition.language,typography:C.typography.mode,lighting:C.lighting.lightAssignments,information:C.information.assetTasks,rhythm:C.rhythm.eventSchedule}};
 }
 const clock={t:0},duration=window.FILM_DURATION||P.duration,tl=gsap.timeline({paused:true});tl.to(clock,{t:duration,duration,ease:'none',onUpdate:()=>draw(clock.t)});window.__timelines=window.__timelines||{};window.__timelines.main=tl;window.FILM_RENDER=window.SEMANTIC_RENDER=draw;window.addEventListener('hf-seek',e=>draw(e.detail.time));draw(0);window.SELECTOR_READY=window.RESEARCH_READY=true;window.REBUILD_READY();
}catch(e){window.REBUILD_FAIL(e);throw e;}
