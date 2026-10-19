// Original editorial/graphic interpretations. Text comes from this fixture; no invented data.
import {shapes}from'./material-stage.js';
export function makeEditorial(ctx,mode){
 const{container,P,out,clamp}=ctx,ink='var(--fg)',accent='var(--accent)',paper='var(--caption)';let seq=0;
 const T=(x,y,t,size=48,extra='')=>`<text x="${x}" y="${y}" fill="${mode==='constructivist'?paper:ink}" font-family="${['newspaper','dictionary-entry','art-deco','art-nouveau'].includes(mode)?'Serif':'Body'}" font-size="${size}" ${extra}>${t}</text>`;
 const line=(x,y,w,color=ink,sw=2)=>`<path d="M${x} ${y}h${w}" stroke="${color}" stroke-width="${sw}"/>`;
 function icon(kind){const d=shapes[kind],id='e'+seq++,inside=kind==='bag'?'M91 82V26Q150 0 209 26V82':kind==='shield'?'M85 143L134 191L219 96':kind==='coin'?'M111 106H189M150 106V205M111 205H189':'M80 225H220M105 141H195';
  if(mode==='constructivist')return`<path d="${d}" fill="${paper}" stroke="${ink}" stroke-width="8"/><path d="${inside}" stroke="${ink}" stroke-width="12" fill="none"/>`;
  if(mode==='swiss-grid')return`<path d="${d}" fill="${accent}"/><path d="${inside}" stroke="${paper}" stroke-width="12" fill="none"/>`;
  if(mode==='art-deco')return`<defs><clipPath id="${id}-light"><rect data-deco-light x="-90" y="0" width="68" height="300"/></clipPath></defs><path d="${d}" fill="#1c3436" stroke="${accent}" stroke-width="5"/><path d="${d}" fill="none" stroke="${accent}" stroke-width="2" transform="translate(23 23) scale(.85)"/><path d="${inside}" stroke="${accent}" stroke-width="6" fill="none"/><path d="M130 70L150 46L170 70L150 94Z" fill="${accent}"/><g clip-path="url(#${id}-light)"><path d="${d}" fill="none" stroke="#fff0b4" stroke-width="6"/><path d="${inside}" fill="none" stroke="#fff0b4" stroke-width="7"/></g>`;
  if(mode==='art-nouveau')return`<path d="${d}" fill="#d8dbb9" stroke="${ink}" stroke-width="5"/><path d="${inside}" stroke="${ink}" stroke-width="6" fill="none"/><path d="M150 270C85 218 221 184 150 125C106 83 171 54 186 30M150 202C112 170 91 172 78 182C96 200 120 207 150 202M156 151C184 109 208 118 217 135C197 152 177 161 156 151" fill="none" stroke="${accent}" stroke-width="4"/>`;
  if(mode==='lab-notebook')return`<path d="${d}" fill="#f9f6e7" stroke="#244f77" stroke-width="5"/><path d="${inside}" stroke="#244f77" stroke-width="6" fill="none"/><path d="M-5 290H300M-5 281V299M300 281V299" stroke="#315c7c" stroke-width="2"/>`;
  if(mode==='dictionary-entry')return`<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="none" stroke="${ink}" stroke-width="4"/><path d="${inside}" stroke="${ink}" stroke-width="4" fill="none"/><path d="M52 215L245 100M44 231L251 116M40 248L256 132" stroke="${ink}" stroke-width="1" opacity=".35" clip-path="url(#${id})"/>`;
  if(mode==='archive-dossier')return`<path d="M16 36H120L149 68H284V276H16Z" fill="#cbb589" stroke="${ink}" stroke-width="3"/><rect x="34" y="87" width="230" height="170" fill="#f6edcf"/><g transform="translate(61 90) scale(.6)"><path d="${d}" fill="none" stroke="${ink}" stroke-width="6"/><path d="${inside}" stroke="${ink}" stroke-width="7" fill="none"/></g>`;
  return`<defs><pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${ink}"/></pattern></defs><path d="${d}" fill="url(#${id})" stroke="${ink}" stroke-width="4"/><path d="${inside}" stroke="${ink}" stroke-width="7" fill="none"/>`;
 }
 const piece=(kind,x,y,s=1,at=0)=>`<g data-piece data-kind="${kind}" data-at="${at}" data-x="${x}" data-y="${y}" data-scale="${s}">${icon(kind)}</g>`;
 const panel=(id,s)=>`<g data-scene="${id}">${s}</g>`,bullet=(x,y,n)=>T(x,y,n,45,`fill="${accent}"`);
 const geometry={
  'newspaper':{x:[40,530],s:1.05,y:130,ly:520},'archive-dossier':{x:[15,515],s:1.23,y:80,ly:535},
  'dictionary-entry':{x:[55,555],s:.92,y:155,ly:520},'lab-notebook':{x:[50,550],s:1,y:100,ly:525},
  'swiss-grid':{x:[15,565],s:1,y:135,ly:545},'constructivist':{x:[50,550],s:1.1,y:115,ly:535},
  'art-deco':{x:[70,560],s:.98,y:140,ly:550},'art-nouveau':{x:[130,560],s:1,y:140,ly:555}
 }[mode],g=geometry;
 function substrate(id){
  if(mode==='newspaper'){const bottom=id==='spend'?605:id==='risk'?650:572,cols=['overview','chain'].includes(id)?'M310 65V567M632 65V567':id==='risk'?'':`M476 65V${bottom-5}`;return`<path d="M0 32H952M0 40H952${cols}M0 ${bottom}H952M0 690H952" stroke="${ink}" stroke-width="2"/>${T(0,0,'口播摘记',29)}${T(748,0,'原声要点',29)}${id==='chain'||id==='risk'?'':T(0,663,'根据原片整理 · 图解为解释示意',34)}`;}
  if(mode==='archive-dossier')return`<path d="M10 50V18H275L315 50H942V665H10Z" fill="#e7d7b3" stroke="${ink}" stroke-width="3"/><rect x="27" y="65" width="897" height="570" fill="#faf2dc"/>${T(38,48,'本段资料',29)}${T(590,48,'原声摘记 / 示意',27)}${['chain','spend','debt'].includes(id)?'<path d="M476 85V580" stroke="#9b8054" stroke-width="2" stroke-dasharray="8 7"/>':''}`;
  if(mode==='dictionary-entry')return`${line(0,36,952,ink,4)}${T(0,7,'财经 · 词条',30)}${T(770,7,'释义',30)}<path d="M476 75V625" stroke="${ink}" stroke-width="1"/>${line(0,657,952)}${T(0,696,'词义取自本段讲述',28)}`;
  if(mode==='lab-notebook'){let lines='';for(let y=26;y<690;y+=48)lines+=line(0,y,952,'#bccbc6',1);return`<rect width="952" height="700" fill="#f9f6e7"/>${lines}<path d="M44 0V700" stroke="#bd8b80" stroke-width="2"/><g fill="#d4ddd5">${[40,180,320,460,600].map(y=>`<circle cx="18" cy="${y}" r="9"/>`).join('')}</g>${T(68,39,'观察 → 判断 → 行动',31)}`}
  if(mode==='swiss-grid')return`${line(0,34,952,ink,3)}${T(0,6,'选择的顺序',30)}<rect x="0" y="75" width="8" height="555" fill="${accent}"/>${line(0,655,952,ink,3)}${T(770,696,'原声要点',28)}`;
  if(mode==='constructivist')return`<path d="M0 42L952 0L952 590L0 665Z" fill="${accent}"/><path d="M0 530L952 395V455L0 590Z" fill="${ink}"/><path d="M0 0L130 0L0 150Z" fill="${ink}"/>`;
  if(mode==='art-deco')return`<path d="M8 668V70H130V28H280V6H672V28H822V70H944V668Z" fill="#162a2d" stroke="${accent}" stroke-width="3"/><path d="M26 650V88H148V46H298V24H654V46H804V88H926V650Z" fill="none" stroke="${accent}" stroke-width="1.5"/><path d="M476 70L451 100L476 130L501 100Z" fill="${accent}"/><path d="M150 620H380M572 620H802M476 588V654M458 606H494" stroke="${accent}" stroke-width="2"/>`;
  return`<path d="M12 663C60 535 -34 392 40 217C85 110 218 17 476 18C735 17 869 110 912 217C986 392 892 535 940 663" fill="#eee5c6" stroke="${ink}" stroke-width="4"/><path data-vine d="M25 653C130 523 -54 464 67 306C190 147 217 155 172 81M927 653C822 523 1006 464 885 306C762 147 735 155 780 81" fill="none" stroke="${accent}" stroke-width="6" pathLength="1"/><path d="M70 309Q65 229 112 217Q138 270 70 309M882 309Q887 229 840 217Q814 270 882 309M48 530Q67 457 112 482Q100 529 48 530M904 530Q885 457 840 482Q852 529 904 530" fill="#909c72" stroke="${ink}" stroke-width="2"/>`;
 }
 const chain=piece('bag',g.x[0],g.y,g.s,P.triggers.consume)+piece('coin',g.x[1],g.y,g.s,P.triggers.invest)+`<g data-at-label="${P.triggers.consume+8}">${T(g.x[0],g.ly,'跟风消费',49)}</g><g data-at-label="${P.triggers.invest+8}">${T(g.x[1],g.ly,'盲目投资',49)}</g><g data-loss>${mode==='constructivist'?'<path d="M285 578L690 535V657L285 699Z" fill="var(--fg)"/>':''}${T(300,640,'本金受损',61)}</g>`;
 const overview=piece('bag',35,160,.74)+piece('shield',355,160,.74)+piece('weight',675,160,.74)+T(35,532,'少冲动',49)+T(355,532,'守本金',49)+T(675,532,'减负债',49);
 const spend=piece('bag',g.x[0],g.y,g.s)+piece('shield',g.x[1],g.y,g.s)+T(g.x[0],g.ly,'想要',74)+T(g.x[1],g.ly,'需要',74)+T(g.x[0],g.ly+63,'一时喜欢',36)+T(g.x[1],g.ly+63,'当下必要',36);
 const risk=`<g data-risk-coin>${piece('coin',332,115,1.05)}</g><g data-risk-shield>${piece('shield',270,84,1.45)}</g>${T(237,610,'先守住本金',72)}`;
 const debt=piece('weight',65,120,1.25)+T(525,300,'减少',92)+T(525,440,'负债',92)+`<path data-debt-arrow d="M525 514H820L785 482M820 514L785 546" fill="none" stroke="${ink}" stroke-width="7"/>`;
 let body={chain,overview,spend,risk,debt};
 if(mode==='newspaper'){
  body.chain=piece('bag',22,140,.78,P.triggers.consume)+piece('coin',350,140,.78,P.triggers.invest)+piece('weight',678,140,.78,224)+`<g data-at-label="${P.triggers.consume+8}">${T(20,120,'跟风消费',48)}${T(20,495,'冲动购物',39)}</g><g data-at-label="${P.triggers.invest+8}">${T(348,120,'盲目投资',48)}${T(348,495,'跟风炒股',39)}</g><g data-at-label="232">${T(676,120,'透支负债',48)}${T(676,495,'背上压力',39)}</g><g data-loss>${T(300,647,'本金受损',67)}</g>`;
  body.spend=T(16,137,'砍掉无效消费',56)+T(16,241,'戒掉冲动购物',40)+T(16,303,'先留判断空间',40)+line(16,351,420)+T(16,436,'分清想要与需要',39)+T(16,511,'再决定是否下单',39)+piece('bag',520,110,.61)+piece('shield',748,110,.61)+T(545,462,'想要',59)+T(775,462,'需要',59);
  body.risk=T(16,169,'守住本金',72)+T(16,278,'先看风险',44)+T(16,344,'远离投机',44)+`<g data-risk-coin>${piece('coin',580,105,.95)}</g><g data-risk-shield>${piece('shield',550,79,1.2)}</g>`+T(16,596,'本金永远优先',60);
 }
 // Different editorial information architecture, rather than reskinning identical cards.
 if(mode==='dictionary-entry'){
  body.spend=substrate('spend')+T(30,120,'想要',83)+T(530,120,'需要',83)+piece('bag',60,175,.82)+piece('shield',560,175,.82)+T(30,520,'一时喜欢',47)+T(530,520,'当下必要',47)+line(30,556,370)+line(530,556,370)+T(30,612,'先留判断空间',38)+T(530,612,'再决定是否下单',38);
 }
 if(mode==='swiss-grid'){
  body.spend=`<rect x="0" y="75" width="252" height="550" fill="${accent}"/>${T(28,248,'01',132,`style="fill:${paper}"`)}${T(32,560,'选择',50,`style="fill:${paper}"`)}${T(330,164,'想要',82)}${T(330,237,'一时喜欢',40)}${piece('bag',692,75,.66)}${line(330,307,622)}${T(330,448,'需要',82)}${T(330,521,'当下必要',40)}${piece('shield',692,363,.66)}`;
  body.overview=['少冲动','守本金','减负债'].map((t,i)=>T(32,175+i*192,String(i+1).padStart(2,'0'),91,`style="fill:${accent}"`)+T(255,165+i*192,t,65)+piece(['bag','shield','weight'][i],750,73+i*192,.43)+line(0,220+i*192,952)).join('');
 }
 if(mode==='lab-notebook')body.spend=T(80,117,'记录一',35)+T(525,117,'记录二',35)+piece('bag',108,164,.76)+piece('shield',565,164,.76)+T(80,472,'想要',76)+T(525,472,'需要',76)+T(80,545,'一时喜欢',40)+T(525,545,'当下必要',40)+`<rect x="80" y="602" width="35" height="35" fill="none" stroke="${ink}" stroke-width="3"/><path data-note-check d="M86 618L99 629L122 598" fill="none" stroke="${accent}" stroke-width="5"/>`+T(142,635,'下单前，先判断',41);
 const defs='<style>text{font-weight:700}.e-rule{fill:none}</style>';
 container.innerHTML=`<svg viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg"><defs>${defs}<clipPath id="editorial-art-bound"><rect width="952" height="700"/></clipPath></defs>${Object.entries(body).map(([id,s])=>panel(id,(mode==='dictionary-entry'&&id==='spend'?'':substrate(id))+s)).join('')}${mode==='constructivist'?'<g clip-path="url(#editorial-art-bound)"><rect data-edit-cover width="952" height="700" fill="var(--accent)"/></g>':''}</svg>`;
 if(mode==='newspaper')ctx.architecture.innerHTML='<div style="position:absolute;left:64px;right:64px;top:132px;height:7px;border-top:3px solid var(--fg);border-bottom:1px solid var(--fg)"></div>';
 if(mode==='lab-notebook')ctx.architecture.innerHTML='<div style="position:absolute;left:40px;right:40px;top:145px;bottom:380px;background:repeating-linear-gradient(0deg,transparent 0 46px,#c5d1c8 47px 48px);border-left:3px solid #bf8a80"></div>';
 if(mode==='constructivist')ctx.architecture.innerHTML='<svg viewBox="0 0 1080 1920" width="1080" height="1920"><path d="M0 450L1080 260V300L0 490Z" fill="#c73b28"/><path d="M0 1500L1080 1335V1350L0 1515Z" fill="#1d2521"/></svg>';
 if(mode==='art-deco')ctx.architecture.innerHTML='<svg viewBox="0 0 1080 1920" width="1080" height="1920"><path d="M36 1515V140H140V44H940V140H1044V1515M54 1515V158H158V62H922V158H1026V1515" stroke="#c9a969" fill="none" stroke-width="2"/></svg>';
 if(mode==='art-nouveau')ctx.architecture.innerHTML='<svg viewBox="0 0 1080 1920" width="1080" height="1920"><path d="M38 1520C90 1290 -20 1080 38 830V200Q38 40 230 40H850Q1042 40 1042 200V830C1100 1080 990 1290 1042 1520" fill="none" stroke="#65734e" stroke-width="4"/></svg>';
 const panels=[...container.querySelectorAll('[data-scene]')],pieces=[...container.querySelectorAll('[data-piece]')],labels=[...container.querySelectorAll('[data-at-label]')],vines=[...container.querySelectorAll('[data-vine]')],lights=[...container.querySelectorAll('[data-deco-light]')],cover=container.querySelector('[data-edit-cover]');
 return{render(t,id,age,frame){
  const switchU=out(age/.32);for(const p of panels){const active=p.dataset.scene===id;p.style.opacity=active?'1':'0';p.setAttribute('transform',mode==='archive-dossier'?`translate(${(1-switchU)*38} ${-(1-switchU)*15})`:mode==='newspaper'?`translate(0 ${(1-switchU)*22})`:mode==='constructivist'?`translate(${(1-switchU)*-80} ${(1-switchU)*24})`:'translate(0 0)');}
  for(const p of pieces){const scene=p.closest('[data-scene]').dataset.scene,start=Number(p.dataset.at)||P.scenes.find(s=>s.id===scene).startFrame+18,u=out((frame-start)/15),x=Number(p.dataset.x),y=Number(p.dataset.y),s=Number(p.dataset.scale);p.style.opacity=u;
   p.setAttribute('transform',mode==='archive-dossier'?`translate(${x+(1-u)*38} ${y-(1-u)*25}) rotate(${(1-u)*-4} 150 150) scale(${s})`:mode==='constructivist'?`translate(${x-(1-u)*90} ${y+(1-u)*28}) scale(${s})`:mode==='art-deco'?`translate(${x} ${y+(1-u)*35}) scale(${s})`:mode==='lab-notebook'?`translate(${x} ${y}) scale(${s})`:`translate(${x} ${y}) scale(${s})`);
   if(mode==='lab-notebook'||mode==='art-nouveau')p.style.clipPath=`inset(0 ${100*(1-u)}% 0 0)`;
  }
  for(const label of labels)label.style.opacity=out((frame-Number(label.dataset.atLabel))/8);
  container.querySelector('[data-loss]').style.opacity=out((frame-P.triggers.loss)/14);
  container.querySelector('[data-risk-shield]').style.opacity=out((frame-P.triggers.risk)/12);container.querySelector('[data-risk-coin]').style.opacity=1-out((frame-P.triggers.risk)/12);
  const noteCheck=container.querySelector('[data-note-check]');if(noteCheck)noteCheck.style.opacity=out((frame-P.triggers.want)/10);
  for(const light of lights)light.setAttribute('x',String(-90+430*out((age-.5)/1.3)));
  if(cover){const sc=P.scenes.find(s=>s.id===id),until=(sc.endFrame-frame)/P.fps;cover.setAttribute('x',String(age<.25?952*out(age/.25):until<.2?-952+952*out((.2-until)/(.2-1/P.fps)):-952));}
  for(const v of vines){v.setAttribute('stroke-dasharray','1');v.setAttribute('stroke-dashoffset',String(1-out(age/1.05)));}
 }};
}
