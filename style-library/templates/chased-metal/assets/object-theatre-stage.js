// Original concept atlases. The performer video is a separate, unfiltered layer.
export async function makeObjectTheatre(ctx,{mode,geometry:g}){
 const {container,P,out}=ctx,travel=Number(document.querySelector('#root').dataset.personTravel||.55);
 const preload=new Image();preload.src='assets/atlas.png';await preload.decode();
 let serial=0;
 const txt=(x,y,t,size=60,extra='')=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Body" font-size="'+size+'" font-weight="700" fill="var(--fg)" '+extra+'>'+t+'</text>';
 const panel=(id,body)=>'<g data-object-scene="'+id+'">'+body+'</g>';
 function pic(kind,x,y,size,at=0){
  const b=g.boxes[kind],s=size/Math.max(b[2],b[3]),dx=(size-b[2]*s)/2,dy=(size-b[3]*s)/2,id='obj-'+serial++;
  return '<g data-object-piece data-kind="'+kind+'" data-at="'+at+'" data-size="'+size+'" data-x="'+x+'" data-y="'+y+'"><defs><clipPath id="'+id+'"><rect x="'+dx+'" y="'+dy+'" width="'+b[2]*s+'" height="'+b[3]*s+'"/></clipPath></defs><g clip-path="url(#'+id+')"><image href="assets/atlas.png" x="'+(dx-b[0]*s)+'" y="'+(dy-b[1]*s)+'" width="'+g.width*s+'" height="'+g.height*s+'"/></g></g>';
 }
 const labelAt=(at,x,y,t,size=56)=>txt(x,y,t,size,'data-object-label-at="'+at+'"');
 const three=(y=620)=>txt(155,y,'少冲动',55)+txt(476,y,'守本金',55)+txt(797,y,'减负债',55);
 const pair=(y=640)=>txt(225,y,'想要',82)+txt(727,y,'需要',82);
 const loss='<g data-object-loss>'+txt(476,685,'本金受损',80)+'</g>';
 const line=(d,c='var(--accent)',w=2)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"/>';
 let m='';
 if(mode==='miniature-puppet'){
  // One recurring puppet changes pose; off-stage strings deliberately exit above.
  const actor=(kind,at=0,until=0)=>'<g data-actor-until="'+until+'">'+pic(kind,95,-8,590,at)+'</g>';
  m=panel('chain',actor('bag',P.triggers.consume,P.triggers.invest)+actor('coin',P.triggers.invest)+labelAt(P.triggers.consume,795,200,'跟风',62)+labelAt(P.triggers.consume,795,278,'消费',62)+labelAt(P.triggers.invest,795,400,'盲目',62)+labelAt(P.triggers.invest,795,478,'投资',62)+loss)+
    panel('overview',pic('bag',10,40,310)+pic('shield',321,40,310)+pic('weight',632,40,310)+three(525))+
    panel('spend',actor('bag')+txt(790,235,'想要',83)+txt(790,385,'需要？',66)+txt(476,680,'下单之前，先做判断',52))+
    panel('risk',actor('shield')+txt(476,685,'先守住本金',80))+
    panel('debt',pic('weight',25,-5,600)+txt(780,260,'减少',86)+txt(780,410,'负债',86));
 }else if(mode==='chased-metal'){
  m=panel('chain',pic('bag',15,30,405,P.triggers.consume)+pic('coin',533,30,405,P.triggers.invest)+labelAt(P.triggers.consume,225,555,'跟风消费')+labelAt(P.triggers.invest,727,555,'盲目投资')+loss)+
    panel('overview',pic('bag',25,5,205)+pic('shield',25,225,205)+pic('weight',25,445,205)+txt(610,145,'少冲动',76)+txt(610,365,'守本金',76)+txt(610,585,'减负债',76))+
    panel('spend',pic('bag',20,25,420)+pic('shield',512,25,420)+pair())+
    panel('risk',pic('shield',206,0,540)+txt(476,685,'先守住本金',80))+
    panel('debt',pic('weight',10,45,460)+txt(730,270,'减少',100)+txt(730,425,'负债',100));
 }else if(mode==='building-blocks'){
  const shelf=line('M18 470H440M512 470H934','var(--accent)',6);
  m=panel('chain',shelf+pic('bag',25,25,395,P.triggers.consume)+pic('coin',532,25,395,P.triggers.invest)+labelAt(P.triggers.consume,225,565,'跟风消费')+labelAt(P.triggers.invest,727,565,'盲目投资')+loss)+
    panel('overview',line('M12 435H940','var(--accent)',6)+pic('bag',10,70,285)+pic('shield',334,70,285)+pic('weight',658,70,285)+three(570))+
    panel('spend',shelf+pic('bag',15,20,425)+pic('shield',512,20,425)+pair())+
    panel('risk',pic('shield',206,0,540)+line('M200 555H752','var(--accent)',6)+txt(476,685,'先守住本金',80))+
    panel('debt',pic('weight',20,35,465)+txt(730,270,'减少',100)+txt(730,425,'负债',100));
 }else if(mode==='ceramic-objects'){
  const plinth=(x,w)=>'<path d="M'+x+' 445H'+(x+w)+'L'+(x+w-25)+' 485H'+(x-25)+'Z" fill="#c2c4b4"/>';
  m=panel('chain',plinth(45,370)+plinth(555,350)+pic('bag',25,10,395,P.triggers.consume)+pic('coin',532,10,395,P.triggers.invest)+labelAt(P.triggers.consume,225,565,'跟风消费')+labelAt(P.triggers.invest,727,565,'盲目投资')+loss)+
    panel('overview',pic('bag',10,45,285)+pic('shield',334,45,285)+pic('weight',658,45,285)+line('M10 402H940','#9da594',2)+three(560))+
    panel('spend',plinth(45,370)+plinth(555,350)+pic('bag',15,5,425)+pic('shield',512,5,425)+pair())+
    panel('risk',pic('shield',206,0,540)+txt(476,685,'先守住本金',80))+
    panel('debt',pic('weight',20,25,465)+txt(730,270,'减少',100)+txt(730,425,'负债',100));
 }else if(mode==='inflatable-sculpture'){
  m=panel('chain',pic('bag',20,25,405,P.triggers.consume)+pic('coin',532,25,405,P.triggers.invest)+labelAt(P.triggers.consume,225,555,'跟风消费')+labelAt(P.triggers.invest,727,555,'盲目投资')+loss)+
    panel('overview',pic('bag',5,60,295)+pic('shield',329,95,295)+pic('weight',653,60,295)+three(610))+
    panel('spend',pic('bag',15,20,425)+pic('shield',512,55,425)+pair())+
    panel('risk',pic('shield',196,0,560)+txt(476,685,'先守住本金',80))+
    panel('debt',pic('weight',20,45,465)+txt(730,270,'减少',100)+txt(730,425,'负债',100));
 }else throw Error('Unknown original object stage '+mode);
 container.innerHTML='<svg viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg">'+m+'</svg>';
 const panels=[...container.querySelectorAll('[data-object-scene]')],pieces=[...container.querySelectorAll('[data-object-piece]')];
 return {render(t,id,age,frame){
  const delay=id==='debt'?0:travel;
  for(const p of panels)p.style.opacity=p.dataset.objectScene===id?String(out((age-delay)/.15)):'0';
  for(const p of pieces){
   const scene=p.closest('[data-object-scene]').dataset.objectScene,start=Number(p.dataset.at)||P.scenes.find(s=>s.id===scene).startFrame+(scene==='debt'?0:Math.round(travel*P.fps)),dt=(frame-start)/P.fps,u=out(dt/(mode==='inflatable-sculpture'?.65:.28)),s=Number(p.dataset.size);
   let x=Number(p.dataset.x),y=Number(p.dataset.y),angle=0,sx=1,sy=1;
   if(mode==='miniature-puppet'){angle=dt>=0?1.7*Math.sin(dt*8)*Math.exp(-dt*3):0;y+=6*(1-u);}
   else if(mode==='building-blocks')y+=10*(1-u);
   else if(mode==='inflatable-sculpture'){const settle=dt>=0?Math.sin(dt*7)*Math.exp(-dt*3):0;sx=1+.025*settle;sy=1-.025*settle;y+=12*(1-u);}
   else y+=7*(1-u);
   p.style.opacity=String(u);
   p.setAttribute('transform','translate('+x+' '+y+') rotate('+angle+' '+s/2+' 0) translate('+(s*(1-sx)/2)+' '+(s*(1-sy))+') scale('+sx+' '+sy+')');
  }
  container.querySelectorAll('[data-object-label-at]').forEach(e=>e.style.opacity=String(out((frame-Number(e.dataset.objectLabelAt)-9)/8)));
  container.querySelectorAll('[data-object-loss]').forEach(e=>e.style.opacity=String(out((frame-P.triggers.loss)/10)));
  container.querySelectorAll('[data-actor-until]').forEach(e=>e.style.opacity=Number(e.dataset.actorUntil)&&frame>=Number(e.dataset.actorUntil)?'0':'1');
  window.OBJECT_THEATRE_STATE={mode,frame,scene:id,originalAtlasUnchanged:true,physicalSimulation:false,puppetPoseAnimation:mode==='miniature-puppet'?'whole-pose-change-and-small-swing-not-jointed-rig':undefined};
 }};
}
