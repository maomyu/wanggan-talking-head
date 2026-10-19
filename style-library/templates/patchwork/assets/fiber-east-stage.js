import {shapes} from './material-stage.js';

export async function makeFiberEast(ctx,{mode,geometry:g=null}){
 const {container,P,out,smooth,mix}=ctx;
 const travel=Number(document.querySelector('#root').dataset.personTravel||.55);
 const illustrated=['patchwork','silk-layers','blue-green-landscape','mural','folk-woodblock','porcelain-painting'].includes(mode);
 const panorama=['blue-green-landscape','mural'].includes(mode);
 if(illustrated){const im=new Image();im.src='assets/'+(panorama?'scene.png':'atlas.png');await im.decode();}
 let serial=0;
 const tx=(x,y,text,size=56,extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="${['seal-carving','blue-green-landscape','mural','folk-woodblock'].includes(mode)?'Serif':'Body'}" font-size="${size}" font-weight="700" fill="var(--fg)" ${extra}>${text}</text>`;
 const panel=(id,body)=>`<g data-craft-scene="${id}">${body}</g>`;
 const line=(d,color='var(--accent)',width=3)=>`<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
 const glyph=(kind,x,y,size=200,at=0)=>`<g ${at?`data-craft-at="${at}"`:''} transform="translate(${x} ${y}) scale(${size/300})"><path d="${shapes[kind]}" fill="none" stroke="var(--fg)" stroke-width="9" stroke-linejoin="round"/>${kind==='shield'?line('M95 143L138 187L210 102','var(--fg)',15):kind==='bag'?line('M92 85V28H207V85','var(--fg)',10):''}</g>`;
 function raster(kind,x,y,size,at=0,opacity=1,rotation=0){
  const b=g.boxes[kind],sc=size/Math.max(b[2],b[3]),dx=(size-b[2]*sc)/2,dy=(size-b[3]*sc)/2,id='craft-crop-'+serial++;
  return `<g data-craft-piece data-at="${at}" data-x="${x}" data-y="${y}" data-size="${size}" data-angle="${rotation}" data-opacity="${opacity}" transform="translate(${x} ${y})"><defs><clipPath id="${id}"><rect x="${dx}" y="${dy}" width="${b[2]*sc}" height="${b[3]*sc}"/></clipPath></defs><g clip-path="url(#${id})"><image href="assets/atlas.png" x="${dx-b[0]*sc}" y="${dy-b[1]*sc}" width="${g.width*sc}" height="${g.height*sc}"/></g></g>`;
 }
 const loss=()=>`<g data-craft-loss>${tx(476,654,'本金受损',84)}</g>`;
 const pairLabels=()=>tx(230,628,'想要',84)+tx(722,628,'需要',84);
 const overviewLabels=()=>tx(152,590,'少冲动',56)+tx(476,590,'守本金',56)+tx(800,590,'减负债',56);
 const keyedLabel=(x,y,text,at)=>tx(x,y,text,52,`data-craft-at="${at}"`);

 // A projected open rope knot: segment depth determines genuine over/under
 // crossings. This is a deterministic illustration, not a knot-tying lesson.
 function ropePath(d,width=20,color='#ae7f44'){
  return `<path d="${d}" fill="none" stroke="#5b422a" stroke-width="${width+5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f4d8a3" stroke-width="${width*.22}" stroke-dasharray="2 5" stroke-linecap="round"/>`;
 }
 function knot(x,y,size,color='#ae7f44',at=0){
  const N=100,points=[];
  for(let i=0;i<=N;i++){const t=.12+i*(Math.PI*2-.24)/N;points.push({x:Math.sin(t)+2*Math.sin(2*t),y:Math.cos(t)-2*Math.cos(2*t),z:-Math.sin(3*t)});}
  const pieces=points.slice(1).map((b,i)=>{const a=points[i];return {z:(a.z+b.z)/2,d:`M${a.x*47} ${a.y*47}L${b.x*47} ${b.y*47}`};}).sort((a,b)=>a.z-b.z);
  const strands=pieces.map(s=>ropePath(s.d,19,color)).join('');
  return `<g data-craft-piece data-knot data-at="${at}" data-x="${x}" data-y="${y}" data-size="${size}" data-angle="0" data-opacity="1"><g transform="translate(${size/2} ${size/2}) scale(${size/300})">${strands}</g></g>`;
 }
 function stamp(kind,x,y,size,negative=false,at=0){
  const id='stamp-'+serial++,holes=Array.from({length:65},(_,i)=>`<rect x="${(i*47+13)%292}" y="${(i*83+19)%292}" width="${2+i%4}" height="${2+(i*3)%5}" fill="black"/>`).join('');
  const symbol=`<path d="${shapes[kind]}" ${negative?'fill="black"':'fill="#a23b2c"'}/>${kind==='shield'?`<path d="M95 143L138 187L210 102" fill="none" stroke="${negative?'white':'#f2e4ca'}" stroke-width="22"/>`:kind==='bag'?`<path d="M92 85V28H207V85" fill="none" stroke="${negative?'black':'#a23b2c'}" stroke-width="13"/>`:''}`;
  const ink=negative?`<mask id="${id}-ink"><rect width="300" height="300" fill="white"/><g transform="translate(28 25) scale(.82)">${symbol}</g>${holes}</mask><rect x="0" y="0" width="300" height="300" fill="#a23b2c" mask="url(#${id}-ink)"/>`:`<mask id="${id}-ink"><rect width="300" height="300" fill="white"/>${holes}</mask><g mask="url(#${id}-ink)"><rect x="5" y="5" width="290" height="290" fill="none" stroke="#a23b2c" stroke-width="11"/><g transform="translate(28 25) scale(.82)">${symbol}</g></g>`;
  return `<g data-craft-piece data-stamp data-at="${at}" data-x="${x}" data-y="${y}" data-size="${size}" data-angle="0" data-opacity="1"><g transform="scale(${size/300})"><defs></defs>${ink}</g></g>`;
 }
 function arch(x,w,h=500){return `<path d="M${x} ${h+45}V115Q${x+w/2} -30 ${x+w} 115V${h+45}Z" fill="#efd78f" stroke="#453b26" stroke-width="5"/><path d="M${x+13} ${h+30}V123Q${x+w/2} 2 ${x+w-13} 123V${h+30}" fill="none" stroke="#a3442c" stroke-width="3"/>`;}
 let markup='';
 if(mode==='patchwork'){
  const seam=(x)=>line(`M${x} 25V675`,'#9c8465',4)+`<path d="M${x-5} 25V675" fill="none" stroke="#f9f0d6" stroke-width="3" stroke-dasharray="8 8"/>`;
  const ground=(n)=>`<rect x="6" y="12" width="940" height="672" rx="5" fill="#dcd2b7" stroke="#ab9978" stroke-width="2"/>`+(n===3?seam(318)+seam(634):n===2?seam(476):'');
  markup=panel('chain',ground(2)+raster('bag',45,55,350,P.triggers.consume)+raster('coin',560,85,335,P.triggers.invest)+keyedLabel(220,493,'跟风消费',P.triggers.consume)+keyedLabel(730,493,'盲目投资',P.triggers.invest)+loss())+
   panel('overview',ground(3)+raster('bag',23,100,260)+raster('shield',346,100,260)+raster('weight',668,100,260)+overviewLabels())+
   panel('spend',ground(2)+raster('bag',40,70,380)+raster('shield',530,70,380)+pairLabels())+
   panel('risk',ground(1)+raster('coin',20,170,255)+raster('shield',315,45,470)+tx(476,650,'先守住本金',85))+
   panel('debt',ground(1)+raster('weight',35,60,470)+tx(720,260,'减少',100)+tx(720,410,'负债',100)+line('M610 475H830','#9c8465',5));
 }else if(mode==='knotted-cord'){
  markup=panel('chain',knot(60,30,350,'#ac7948',P.triggers.consume)+knot(560,30,350,'#7b6b43',P.triggers.invest)+keyedLabel(230,475,'跟风消费',P.triggers.consume)+keyedLabel(725,475,'盲目投资',P.triggers.invest)+`<g data-craft-loss>${ropePath('M220 510Q475 590 735 510',12)}${tx(476,665,'本金受损',83)}</g>`)+
   panel('overview',knot(16,85,275)+knot(340,85,275,'#7b6b43')+knot(664,85,275,'#aa6844')+overviewLabels())+
   panel('spend',knot(28,38,390)+knot(532,38,390,'#7b6b43')+pairLabels())+
   panel('risk',knot(202,5,545,'#8b7a45')+tx(476,670,'先守住本金',85))+
   panel('debt',knot(24,70,460,'#aa6844')+tx(716,270,'减少',105)+tx(716,425,'负债',105)+tx(476,655,'把负担往回收',57));
 }else if(mode==='seal-carving'){
  const border=`<path d="M8 6H944V694H8Z" fill="none" stroke="#a23b2c" stroke-width="2"/>`;
  markup=panel('chain',border+stamp('bag',44,65,355,false,P.triggers.consume)+stamp('coin',550,65,355,true,P.triggers.invest)+keyedLabel(220,490,'跟风消费',P.triggers.consume)+keyedLabel(730,490,'盲目投资',P.triggers.invest)+loss())+
   panel('overview',border+stamp('bag',28,112,252,false)+stamp('shield',350,112,252,true)+stamp('weight',672,112,252,false)+overviewLabels())+
   panel('spend',border+stamp('bag',38,75,380,false)+stamp('shield',532,75,380,true)+pairLabels())+
   panel('risk',border+stamp('shield',215,40,520,true)+tx(476,665,'先守住本金',85))+
   panel('debt',border+stamp('weight',40,85,450,false)+tx(715,275,'减少',105)+tx(715,430,'负债',105));
 }else if(mode==='silk-layers'){
  const sheet=(kind,x,y,size,opacity=.65,angle=0)=>raster(kind,x,y,size,0,opacity,angle);
  const woven=(count)=>count===3?sheet('bag',10,50,560,.65,-7)+sheet('coin',220,80,560,.65,5)+sheet('shield',425,45,535,.65,-5):sheet('bag',5,70,590,.72,-6)+sheet('coin',362,75,590,.72,5);
  markup=panel('chain',woven(2)+glyph('bag',130,125,255,P.triggers.consume)+glyph('coin',575,130,255,P.triggers.invest)+keyedLabel(240,525,'跟风消费',P.triggers.consume)+keyedLabel(730,525,'盲目投资',P.triggers.invest)+loss())+
   panel('overview',woven(3)+glyph('bag',40,150,235)+glyph('shield',360,150,235)+glyph('weight',680,150,235)+overviewLabels())+
   panel('spend',woven(2)+glyph('bag',105,130,290)+glyph('shield',565,130,290)+pairLabels())+
   panel('risk',sheet('shield',185,25,610,.65,-7)+sheet('weight',270,80,530,.65,8)+glyph('shield',290,100,380)+tx(476,665,'先守住本金',85))+
   panel('debt',sheet('bag',0,35,560,.7,-8)+sheet('shield',155,90,495,.58,6)+glyph('weight',80,145,335)+tx(730,275,'减少',105)+tx(730,430,'负债',105));
 }else if(mode==='folk-woodblock'){
  const three=arch(10,280)+arch(336,280)+arch(662,280),two=arch(15,416)+arch(521,416);
  markup=panel('chain',two+raster('bag',50,110,345,P.triggers.consume)+raster('coin',553,125,345,P.triggers.invest)+keyedLabel(220,515,'跟风消费',P.triggers.consume)+keyedLabel(730,515,'盲目投资',P.triggers.invest)+loss())+
   panel('overview',three+raster('bag',25,135,250)+raster('shield',350,135,250)+raster('weight',677,135,250)+overviewLabels())+
   panel('spend',two+raster('bag',50,115,345)+raster('shield',556,115,345)+pairLabels())+
   panel('risk',arch(176,600,535)+raster('shield',260,92,430)+tx(476,665,'先守住本金',85))+
   panel('debt',arch(5,500,560)+raster('weight',60,115,400)+tx(735,280,'减少',105)+tx(735,435,'负债',105));
 }else if(mode==='porcelain-painting'){
  const shelf=(y)=>line(`M10 ${y}H942`,'#738b9b',2);
  markup=panel('chain',raster('bag',30,50,380,P.triggers.consume)+raster('coin',542,50,380,P.triggers.invest)+shelf(448)+keyedLabel(220,525,'跟风消费',P.triggers.consume)+keyedLabel(730,525,'盲目投资',P.triggers.invest)+loss())+
   panel('overview',raster('bag',6,120,290)+raster('shield',331,120,290)+raster('weight',656,120,290)+shelf(435)+overviewLabels())+
   panel('spend',raster('bag',15,65,425)+raster('shield',512,65,425)+shelf(505)+pairLabels())+
   panel('risk',raster('shield',186,20,580)+shelf(612)+tx(476,685,'先守住本金',78))+
   panel('debt',raster('weight',15,65,490)+tx(740,280,'减少',105)+tx(740,435,'负债',105)+shelf(585));
 }else if(panorama){
  const frame=mode==='blue-green-landscape'?`<rect x="12" y="10" width="928" height="558" fill="#e3d3ad" stroke="#9d8764" stroke-width="2"/><path d="M15 20V558M937 20V558" stroke="#9d8764" stroke-width="18"/>`:`<path d="M12 12L939 18L945 554L6 568Z" fill="#c6ad8a" stroke="#8e7355" stroke-width="5"/>`;
  markup=`<defs><clipPath id="craft-world-window"><rect x="27" y="25" width="898" height="528"/></clipPath></defs>${frame}<g clip-path="url(#craft-world-window)"><g data-craft-world><image href="assets/scene.png" width="952" height="${952*g.height/g.width}"/></g></g><g data-craft-world-copy>${tx(476,654,'',74)}</g>`;
 }
 container.innerHTML=`<svg viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
 const panels=[...container.querySelectorAll('[data-craft-scene]')],pieces=[...container.querySelectorAll('[data-craft-piece]')];
 const copies={hook:'',chain:'跟风之后，代价自己承担',overview:'少冲动 · 守本金 · 减负债',spend:'想要 / 需要',risk:'先守住本金',debt:'把负担往回收',recap:''};
 const views=g?.views||{hook:[.5,.5,1.08],chain:[.5,.5,1.08],overview:[.5,.5,1.08],spend:[.25,.48,1.55],risk:[.5,.48,1.65],debt:[.79,.48,1.55],recap:[.5,.5,1.08]};
 return {render(t,id,age,frame){
  const delay=id==='debt'?0:travel,enter=out((age-delay)/.28);
  panels.forEach(p=>p.style.opacity=p.dataset.craftScene===id?String(enter):'0');
  for(const p of pieces){
   const scene=p.closest('[data-craft-scene]').dataset.craftScene,start=Number(p.dataset.at)||P.scenes.find(s=>s.id===scene).startFrame+(scene==='debt'?0:Math.round(travel*P.fps));
   const u=out((frame-start)/(scene==='debt'?10:15)),step=mode==='patchwork'?Math.round(u*10)/10:u,size=Number(p.dataset.size),angle=Number(p.dataset.angle);
   p.style.opacity=String(step*Number(p.dataset.opacity));
   p.setAttribute('transform',`translate(${p.dataset.x} ${Number(p.dataset.y)+12*(1-step)}) rotate(${angle} ${size/2} ${size/2})`);
  }
  container.querySelectorAll('[data-craft-at]').forEach(e=>e.style.opacity=out((frame-Number(e.dataset.craftAt)-8)/8));
  container.querySelectorAll('[data-craft-loss]').forEach(e=>e.style.opacity=out((frame-P.triggers.loss)/10));
  if(panorama){
   const i=P.scenes.findIndex(s=>s.id===id),a=views[P.scenes[Math.max(0,i-1)].id],b=views[id],u=smooth((age-delay)/(id==='debt'?.32:.55)),v=a.map((n,j)=>mix(n,b[j],u)),W=952,H=952*g.height/g.width,z=Math.max(v[2],528/H),x=Math.max(925-W*z,Math.min(27,476-v[0]*W*z)),y=Math.max(553-H*z,Math.min(25,289-v[1]*H*z));
   container.querySelector('[data-craft-world]').setAttribute('transform',`translate(${x} ${y}) scale(${z})`);
   const text=container.querySelector('[data-craft-world-copy] text');text.textContent=copies[id];text.style.opacity=enter;
  }
  window.FIBER_EAST_STATE={mode,scene:id,frame,rawAssetPixelsUnmodified:illustrated,actualHandcraftFootage:false};
 }};
}
