export async function makeCraftPaint(ctx,{mode,geometry:g}){
 const {container,P,out}=ctx;
 const travel=Number(document.querySelector('#root').dataset.personTravel||.55);
 const picture=new Image();picture.src='assets/atlas.png';await picture.decode();
 const font=['enamel-badge','mosaic'].includes(mode)?'Body':'Serif';
 let serial=0;
 const tx=(x,y,text,size=58,extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="${font}" font-size="${size}" font-weight="700" fill="var(--fg)" ${extra} ${mode==='mosaic'&&!extra.includes('data-paint-at')?'data-paint-reading':''}>${text}</text>`;
 const panel=(id,body)=>`<g data-paint-scene="${id}">${body}</g>`;
 const line=(d,color='var(--accent)',width=2)=>`<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
 function image(kind,x,y,size,at=0,angle=0){
  const b=g.boxes[kind],scale=size/Math.max(b[2],b[3]),dx=(size-b[2]*scale)/2,dy=(size-b[3]*scale)/2,id='paint-'+serial++;
  let source=`<image href="assets/atlas.png" x="${dx-b[0]*scale}" y="${dy-b[1]*scale}" width="${g.width*scale}" height="${g.height*scale}"/>`;
  return `<g data-paint-piece data-kind="${kind}" data-at="${at}" data-x="${x}" data-y="${y}" data-size="${size}" data-angle="${angle}"><defs><clipPath id="${id}"><rect x="${dx}" y="${dy}" width="${b[2]*scale}" height="${b[3]*scale}"/></clipPath></defs><g clip-path="url(#${id})">${source}</g></g>`;
 }
 const labels=(kind,y=630)=>kind==='pair'?tx(225,y,'想要',82)+tx(727,y,'需要',82):tx(155,y,'少冲动',56)+tx(476,y,'守本金',56)+tx(797,y,'减负债',56);
 const chainLabels=(y=505)=>tx(225,y,'跟风消费',52,`data-paint-at="${P.triggers.consume}"`)+tx(727,y,'盲目投资',52,`data-paint-at="${P.triggers.invest}"`);
 const loss=()=>`<g data-paint-loss>${tx(476,665,'本金受损',82)}</g>`;
 const debtWords=()=>tx(730,265,'减少',104)+tx(730,425,'负债',104);
 let markup='';
 if(mode==='watercolor'){
  markup=panel('chain',image('bag',18,40,385,P.triggers.consume,-2)+image('coin',548,40,385,P.triggers.invest,2)+chainLabels(510)+loss())+
   panel('overview',image('bag',5,90,290,0,-3)+image('shield',331,90,290,0,2)+image('weight',657,90,290,0,-1)+labels('three',575))+
   panel('spend',image('bag',15,55,420,0,-2)+image('shield',516,55,420,0,2)+labels('pair'))+
   panel('risk',image('coin',20,180,220,0,-4)+image('shield',260,0,550,0,2)+tx(476,675,'先守住本金',82))+
   panel('debt',image('weight',25,40,470,0,-3)+debtWords()+tx(476,660,'把负担往回收',57));
 }else if(mode==='impasto'){
  markup=panel('chain',image('bag',28,50,390,P.triggers.consume,-2)+image('coin',534,50,390,P.triggers.invest,2)+chainLabels(528)+loss())+
   panel('overview',image('bag',5,110,292,0,-2)+image('shield',330,65,292,0,2)+image('weight',655,110,292,0,-1)+labels('three',595))+
   panel('spend',image('bag',15,55,420,0,-2)+image('shield',517,55,420,0,2)+labels('pair'))+
   panel('risk',image('shield',196,0,560,0,-1)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470,0,2)+debtWords());
 }else if(mode==='lacquer-gold'){
  markup=panel('chain',image('bag',25,35,395,P.triggers.consume)+image('coin',532,35,395,P.triggers.invest)+chainLabels(520)+loss())+
   panel('overview',image('bag',8,90,290)+image('shield',331,90,290)+image('weight',654,90,290)+labels('three',570))+
   panel('spend',image('bag',15,25,425)+image('shield',512,25,425)+labels('pair',630))+
   panel('risk',image('shield',196,-5,560)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470)+debtWords()+line('M600 485H855','#997242',3));
 }else if(mode==='enamel-badge'){
  markup=panel('chain',image('bag',35,75,370,P.triggers.consume,-4)+image('coin',546,75,370,P.triggers.invest,4)+chainLabels(530)+loss())+
   panel('overview',image('bag',15,110,275,0,-4)+image('shield',339,110,275,0,3)+image('weight',663,110,275,0,-2)+labels('three',570))+
   panel('spend',image('bag',35,80,385,0,-4)+image('shield',537,80,385,0,4)+labels('pair'))+
   panel('risk',image('shield',206,55,540,0,-3)+tx(476,685,'先守住本金',80))+
   panel('debt',image('weight',25,80,450,0,4)+debtWords());
 }else if(mode==='foil-deboss'){
  markup=panel('chain',image('bag',40,5,255,P.triggers.consume)+image('coin',40,325,255,P.triggers.invest)+tx(610,160,'跟风消费',74,`data-paint-at="${P.triggers.consume}"`)+tx(610,480,'盲目投资',74,`data-paint-at="${P.triggers.invest}"`)+loss())+
   panel('overview',image('bag',75,0,210)+image('shield',75,220,210)+image('weight',75,440,210)+line('M370 0V665','#b19b7b',1.5)+tx(650,140,'少冲动',78)+tx(650,360,'守本金',78)+tx(650,580,'减负债',78))+
   panel('spend',image('bag',15,55,425)+image('shield',512,55,425)+labels('pair'))+
   panel('risk',image('shield',196,0,560)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470)+debtWords());
 }else if(mode==='mosaic'){
  markup=panel('chain',image('bag',25,30,395,P.triggers.consume)+image('coin',532,30,395,P.triggers.invest)+chainLabels(520)+loss())+
   panel('overview',image('bag',5,90,295)+image('shield',329,90,295)+image('weight',653,90,295)+labels('three',580))+
   panel('spend',image('bag',15,35,425)+image('shield',512,35,425)+labels('pair'))+
   panel('risk',image('shield',196,0,560)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470)+debtWords());
 }else if(mode==='stained-glass'){
  const mullions=(three=false)=>line(three?'M317 30V550M635 30V550':'M476 30V550','#090f18',12)+line('M5 20H947M5 555H947','#090f18',10);
  markup=panel('chain',mullions()+image('bag',25,35,395,P.triggers.consume)+image('coin',532,35,395,P.triggers.invest)+chainLabels(520)+loss())+
   panel('overview',mullions(true)+image('bag',12,110,285)+image('shield',335,110,285)+image('weight',658,110,285)+labels('three',520))+
   panel('spend',mullions()+image('bag',15,40,425)+image('shield',512,40,425)+labels('pair',665))+
   panel('risk',image('shield',196,-5,560)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470)+debtWords());
 }else if(mode==='sandstone-relief'){
  markup=panel('chain',image('bag',25,30,395,P.triggers.consume)+image('coin',532,30,395,P.triggers.invest)+chainLabels(520)+loss())+
   panel('overview',image('bag',5,80,295)+image('shield',329,80,295)+image('weight',653,80,295)+labels('three',570))+
   panel('spend',image('bag',15,35,425)+image('shield',512,35,425)+labels('pair'))+
   panel('risk',image('shield',196,0,560)+tx(476,680,'先守住本金',82))+
   panel('debt',image('weight',15,55,470)+debtWords());
 }else throw Error('Unknown original craft/paint material: '+mode);
 container.innerHTML=`<svg viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
 const panels=[...container.querySelectorAll('[data-paint-scene]')],pieces=[...container.querySelectorAll('[data-paint-piece]')];
 return {render(t,id,age,frame){
  const delay=id==='debt'?0:travel,enter=out((age-delay)/.2);
  panels.forEach(p=>p.style.opacity=p.dataset.paintScene===id?String(enter):'0');
  for(const p of pieces){
   const scene=p.closest('[data-paint-scene]').dataset.paintScene;
   const explicit=Number(p.dataset.at),start=explicit||P.scenes.find(s=>s.id===scene).startFrame+(scene==='debt'?0:Math.round(travel*P.fps));
   const u=out((frame-start)/(mode==='sandstone-relief'?10:12)),size=Number(p.dataset.size),angle=Number(p.dataset.angle),rise=mode==='stained-glass'?0:['mosaic','sandstone-relief'].includes(mode)?8:14,scale=mode==='enamel-badge'?.94+.06*u:1;
   p.style.opacity=String(u);
   p.setAttribute('transform',`translate(${p.dataset.x} ${Number(p.dataset.y)+rise*(1-u)}) rotate(${angle*u} ${size/2} ${size/2}) translate(${size*(1-scale)/2} ${size*(1-scale)/2}) scale(${scale})`);
  }
  container.querySelectorAll('[data-paint-at]').forEach(e=>e.style.opacity=String(out((frame-Number(e.dataset.paintAt)-(mode==='mosaic'?12:8))/8)));
  container.querySelectorAll('[data-paint-reading]').forEach(e=>e.style.opacity=String(mode==='mosaic'?out((age-delay-.4)/.2):1));
  container.querySelectorAll('[data-paint-loss]').forEach(e=>e.style.opacity=String(out((frame-P.triggers.loss)/10)));
  window.CRAFT_PAINT_STATE={mode,scene:id,frame,rawPixelsUnmodified:true,manufacturingSimulation:false};
 }};
}
