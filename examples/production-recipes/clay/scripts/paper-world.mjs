export function createPaperWorld(mount,C){
 const E=C.rhythm.eventSchedule,cl=x=>Math.max(0,Math.min(1,x)),ease=x=>x<.5?16*x**5:1-(-2*x+2)**5/2,at=n=>typeof n==='number'?n:E[n],p=(f,a,b)=>ease(cl((f-at(a))/(at(b)-at(a))));
 const world=document.createElement('div');world.id='paper-world';mount.append(world);
 const photo=(id,food=false)=>`<div id="${id}" class="paper-actor paper-photo"><div class="crop ${food?'food':''}"><img src="assets/life-objects.png" alt="${food?'日常采购':'耳机'}概念示意" data-layout-allow-overflow></div>${id==='extra'?'<svg class="paper-cross" viewBox="0 0 330 350"><path id="extra-cross" d="M24 318L306 30"/></svg>':''}</div>`;
 world.innerHTML='<div id="paper-base"></div>'+photo('headphone')+photo('extra')+photo('food',true)+`<div id="principal" class="paper-actor"><div class="principal-frame"><div id="principal-units" class="principal-units">${Array.from({length:C.representation.objectGeometry.unitCount},()=>'<i class="capital-unit"></i>').join('')}</div><svg id="capital-crack" viewBox="0 0 700 270"><path d="M395 0L350 60L400 100L345 160L390 205L352 270"/></svg></div></div><div id="burden" class="paper-actor">${Array.from({length:C.representation.objectGeometry.debtCount},(_,i)=>`<i class="debt-unit" style="top:${20+i*43}px"></i>`).join('')}</div><div id="trend" class="paper-actor"><svg viewBox="0 0 540 300"><path class="axis" d="M20 15V280H520"/><path id="rise" d="M30 245L110 170L180 190L265 95L345 120L420 30"/><path id="fall" d="M420 30L450 130L480 110L520 270"/></svg></div><div id="risk" class="paper-actor"><div id="risk-inside"><b data-check-text>暗藏风险</b></div><div id="risk-cover"><small data-check-text>夸大收益的说法</small><b data-check-text>高收益</b></div></div><div id="avoid" class="paper-actor"><b data-check-text>投机</b><b data-check-text>炒作</b></div>`;
 const $=id=>world.querySelector('#'+id),tracks=Object.fromEntries(Object.entries(C.motion.tracks).map(([id,keys])=>[id,keys.map(k=>({...k,f:at(k.at)}))]));
 // The same objects return as a result strip below the restored speaker.
 for(const[id,x,s]of[['headphone',110,.5],['principal',405,.35],['burden',790,.38]]){tracks[id]=tracks[id].filter(k=>k.f<898);tracks[id].push({f:920,x,y:1320,s,a:0},{f:970,x,y:1280,s,a:1},{f:1099,x,y:1280,s,a:1});}
 const sample=(keys,f)=>{let a=keys[0];for(let i=1;i<keys.length;i++){let b=keys[i];if(f<b.f){let u=p(f,a.f,b.f);return Object.fromEntries(['x','y','s','a'].map(k=>[k,a[k]+(b[k]-a[k])*u]));}a=b;}return a;};
 const paths=['rise','fall','extra-cross'];for(const id of paths){let e=$(id);e.dataset.length=e.getTotalLength();e.style.strokeDasharray=e.dataset.length;}
 return{draw(f){
  const actors={};for(const[id,keys]of Object.entries(tracks)){const q=sample(keys,f),r=id==='headphone'?-1.4:id==='extra'?2.4:0;$(id).style.transform=`translate(${q.x}px,${q.y}px) scale(${q.s}) rotate(${r}deg)`;$(id).style.opacity=q.a;actors[id]={...q,r};}
  const loss=p(f,'lossStart','lossEnd'),deny=p(f,'denyStart','denyEnd'),reveal=p(f,'riskRevealStart','riskRevealEnd');
  for(const[i,e]of [...$('principal-units').children].entries())e.style.opacity=i>=C.motion.stateTransitions.lossResult?1-loss:1;
  $('capital-crack').style.opacity=loss*(1-p(f,349,378));
  for(const[i,e]of [...$('burden').children].entries()){const u=i>=2?p(f,E.debtStart+(5-i)*2,E.debtReady-(i-2)*2):0;e.style.opacity=1-u;e.style.transform=`translate(${u*480}px,${-u*55}px) rotate(${u*7}deg)`;}
  for(const id of paths){const u=id==='fall'?loss:id==='extra-cross'?deny:p(f,266,285);$(id).style.strokeDashoffset=+$(id).dataset.length*(1-u);}
  // Printed front leaves on its physical left hinge; back text is revealed only
  // once the spoken turn arrives, never mirrored through a rotating paper.
  $('risk-cover').style.transform=`rotateY(${-155*reveal}deg) translateX(${-55*reveal}px)`;
  $('risk-cover').style.visibility=f>=E.riskRevealEnd?'hidden':'visible';
  for(const e of $('risk-cover').children)e.style.visibility=f>=E.riskRevealStart?'hidden':'visible';
  $('risk-inside').style.opacity=f>=E.riskRevealEnd-2?1:0;
  const z=1+(C.camera.viewTransforms.detailScale-1)*p(f,616,643)*(1-p(f,680,704));world.style.transform=`translate(${(1-z)*450}px,${(1-z)*870}px) scale(${z})`;
  $('paper-base').style.opacity=p(f,75,112)*(1-p(f,898,937));
  return{actors,camera:{scale:z},principalUnits:f>=E.lossEnd?4:8,debtUnits:f>=E.debtReady?2:6,frontPaperAngle:-155*reveal,continuity:'same-photo, same-capital and same-debt IDs; no replenishment'};
 }};
}
