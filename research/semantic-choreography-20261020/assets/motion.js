const P=window.STUDY_TIMING,F=P.fps,D=P.duration,A=P.semanticAnchors;
const sec=f=>f/F,at=k=>sec(A[k]);
const coins=document.getElementById('coins');for(let i=0;i<8;i++)coins.insertAdjacentHTML('beforeend',`<div class="coin" id="coin-${i}"><i></i></div>`);
const debts=document.getElementById('debt-blocks');for(let i=0;i<6;i++)debts.insertAdjacentHTML('beforeend',`<div class="debt-block" id="debt-${i}" style="top:${65+i*36}px"></div>`);
async function build(){await document.fonts.ready;
 const tl=gsap.timeline({paused:true}),set=(s,v,t=0)=>tl.set(s,v,t),to=(s,v,t)=>tl.to(s,{ease:'power3.inOut',...v},t),fade=(s,on,t,d=.22)=>to(s,{opacity:on,duration:d,ease:'power2.out'},t);
 const photos=['#photo-0','#photo-1','#photo-2','#photo-3'];const initial=[[145,510],[635,510],[145,795],[635,795]];
 photos.forEach((s,i)=>set(s,{x:initial[i][0],y:initial[i][1],scale:1,opacity:1}));
 set('#presenter-shell',{x:716,y:1255,scale:300/840});
 set('#classification,#checkout-gate,#spend-memory,#capital-frame,#capital-label,#capital-note,#pitch-surface,#risk-underline,#protect-rail,.speculation,#debt-group,#pressure-left,#pressure-right,#debt-note,#recap-panels',{opacity:0});
 set('#risk-underline',{scaleX:0});set('#protect-rail',{scaleX:.2});
 for(let i=0;i<8;i++)set(`#coin-${i}`,{x:120+i*70,y:1230,scale:1,opacity:1});
 // A visible action: the impulsive add-on is crossed out and separated.
 to('#cut-line',{strokeDashoffset:0,duration:.34,ease:'power2.out'},.18);
 to('#impulse-strip',{rotation:4,y:57,opacity:0,duration:.44,ease:'power2.in'},.59);
 fade('#checkout-gate',1,at('pause')+.03,.2);
 to('#coin-7',{x:635,y:1170,duration:.27,ease:'power2.out'},at('pause')+.03);
 to('#coin-7',{x:610,y:1230,duration:.35,ease:'power3.out'},at('pause')+.44);
 to('.gate-stop',{scaleY:1.13,duration:.15,ease:'power2.out'},at('pause')+.28);
 to('.gate-stop',{scaleY:1,duration:.18},at('pause')+.43);
 // Same four photographs sort along separate paths; no new picture swap.
 fade('#checkout-gate',0,at('distinguish'),.18);fade('#receipt-outline',0,at('distinguish'),.23);fade('#classification',1,at('distinguish')+.06,.25);
 to(photos[0],{x:165,y:555,scale:.84,duration:.44},at('distinguish')+.04);
 to(photos[3],{x:655,y:850,scale:.84,duration:.44},at('distinguish')+.04);
 to(photos[1],{keyframes:[{x:680,y:800,scale:.84,duration:.3,ease:'power2.in'},{x:165,y:850,duration:.4,ease:'power3.out'}],duration:.7,ease:'none'},at('distinguish')+.07);
 to(photos[2],{keyframes:[{x:280,y:525,scale:.84,duration:.3,ease:'power2.in'},{x:655,y:555,duration:.4,ease:'power3.out'}],duration:.7,ease:'none'},at('distinguish')+.25);
 // The photo group becomes a small memory. The same coins enter the next task.
 const b=at('capital');fade('#classification,#budget-label',0,b,.2);
 photos.forEach((s,i)=>to(s,{x:80,y:550+i*83,scale:.2,opacity:.27,duration:.62},b+.02+i*.025));
 fade('#spend-memory',1,b+.45,.2);fade('#capital-frame',1,b+.35,.34);fade('#capital-label',1,b+.99,.22);
 for(let i=0;i<8;i++)to(`#coin-${i}`,{x:330+(i%4)*105,y:867+Math.floor(i/4)*90,scale:1.28,duration:.65,ease:'power3.inOut'},b+.08+i*.035);
 // Open the claim itself to expose what was hidden beneath it.
 fade('#pitch-surface',1,at('pitch')+.06,.28);set('#pitch-surface',{y:20,rotation:-2},at('pitch'));to('#pitch-surface',{y:0,rotation:0,duration:.5},at('pitch')+.02);
 to('#pitch-front',{rotationX:-110,y:-8,duration:.62,ease:'power2.inOut'},at('riskReveal')-.12);
 fade('#risk-underline',1,at('riskReveal')+.2,.12);to('#risk-underline',{scaleX:1,duration:.3,ease:'power2.out'},at('riskReveal')+.2);
 // Risky pitches meet a boundary; the principal does not magically grow.
 const avoid=at('avoid');fade('#pitch-surface,#risk-underline',0,avoid,.2);fade('#protect-rail',1,avoid+.02,.15);to('#protect-rail',{scaleX:1,duration:.25},avoid+.02);
 set('#speculation-left',{x:75,y:570,rotation:-5});set('#speculation-right',{x:785,y:570,rotation:5});
 fade('.speculation',1,avoid+.12,.15);
 to('#speculation-left',{x:278,y:682,rotation:0,duration:.48,ease:'power2.in'},avoid+.15);
 to('#speculation-right',{x:584,y:682,rotation:0,duration:.48,ease:'power2.in'},avoid+.28);
 to('#speculation-left',{x:97,y:560,rotation:-7,duration:.52,ease:'power3.out'},avoid+.63);
 to('#speculation-right',{x:765,y:560,rotation:7,duration:.52,ease:'power3.out'},avoid+.76);
 fade('.speculation',0,avoid+1.58,.27);
 // The third suggestion is parallel: less debt, less pressure around the same funds.
 const debt=at('debt');fade('#spend-memory,#protect-rail',0,debt,.2);fade('#debt-group',1,debt+.05,.18);
 set('#pressure-left',{x:209,y:785});set('#pressure-right',{x:811,y:785});fade('#pressure-left,#pressure-right',1,debt+.06,.15);
 to('#pressure-left',{x:220,duration:.22},debt+.06);to('#pressure-right',{x:800,duration:.22},debt+.06);
 for(let i=5;i>=2;i--)to(`#debt-${i}`,{x:45,y:-45,opacity:0,duration:.29,ease:'power2.in'},debt+.38+(5-i)*.12);
 to('#pressure-left',{x:178,duration:.5},debt+.46);to('#pressure-right',{x:842,duration:.5},debt+.46);
 fade('#capital-label,#capital-note',0,debt+.08,.2);
 // Completed results shrink into three parallel recap positions before the face moves.
 const resolve=at('summary');fade('#capital-frame,#pressure-left,#pressure-right,#debt-note',0,resolve+.04,.24);
 photos.forEach((s,i)=>to(s,{x:114+(i%2)*110,y:1170+Math.floor(i/2)*90,scale:.30,opacity:1,duration:.6},resolve+.12+i*.035));
 for(let i=0;i<8;i++)to(`#coin-${i}`,{x:414+(i%4)*56,y:1221+Math.floor(i/4)*61,scale:.78,duration:.65},resolve+.1+i*.025);
 to('#debt-group',{x:418,y:722,scale:.59,duration:.67},resolve+.15);
 fade('#debt-group',0,resolve+.56,.18);fade('#debt-group',1,at('recognition')-.05,.3);
 to('#presenter-shell',{x:250,y:470,scale:580/840,duration:.88,ease:'power3.inOut'},resolve+1.02);
 fade('#recap-panels',1,at('recognition')-.05,.32);
 set('#progress',{scaleX:0},0);to('#progress',{scaleX:1,duration:D,ease:'none'},0);
 // Hold a fully designed last frame. This tween only establishes the finite duration.
 tl.to({}, {duration:.001},D-.001);
 const split={'市面上夸大收益理财的都暗藏风险':'市面上夸大收益理财的\n都暗藏风险'};
 function update(){const time=tl.time(),f=Math.min(P.frameCount-1,Math.floor(time*F+.0001));const c=P.captions.find(c=>f>=c.startFrame&&f<c.endFrame);document.getElementById('caption-text').textContent=c?(split[c.text]||c.text):'';
  let phase=f<A.capital?0:f<A.debt?1:f<A.summary?2:3;
  const labels=[['第一条 / 消费选择','砍掉无效消费','下单之前，给判断留一步。'],['第二条 / 风险判断','先守住本金','说法再动听，也先看清风险。'],['第三条 / 负债管理','减少负债','把负担，一点点往回收。'],['三条底线 / 并列回收','把判断权留给自己','少冲动 · 守本金 · 减负债']][phase];
  if(phase===0&&f>=A.distinguish){labels[1]='分清想要和需要';labels[2]='同一件物品，也要先问实际用途。';}
  if(phase===1){labels[2]=f<A.pitch?'先守住，再做选择。':f<A.riskReveal?'收益的说法，翻开再判断。':'看清风险，再做选择。';}
  document.getElementById('eyebrow').textContent=labels[0];document.getElementById('headline').textContent=labels[1];document.getElementById('subhead').textContent=labels[2];
  for(let i=0;i<3;i++)document.getElementById('step-'+(i+1)).className=phase===3?'complete':i===phase?'active':i<phase?'complete':'';
  window.RESEARCH_STATE={time,frame:f,phase,caption:c?.sourceId||null,sourceFrame:f+P.sourceRangeFrames[0],person:{x:Number(gsap.getProperty('#presenter-shell','x')),y:Number(gsap.getProperty('#presenter-shell','y')),scale:Number(gsap.getProperty('#presenter-shell','scaleX')),circle:true},coins:8,graphics:'conceptual; no monetary quantities'};
 }
 tl.eventCallback('onUpdate',update);window.RESEARCH_TIMELINE=tl;window.__timelines=window.__timelines||{};window.__timelines.main=tl;update();window.RESEARCH_READY=true;
}
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};window.__hf.buildReady.semanticStudy=build();
