import{makeVolumeLab}from'./volume-lab.js';
export async function makeVolumeStage(ctx,{mode}){
 const {container,P,out}=ctx,travel=Number(document.querySelector('#root').dataset.personTravel||.55);
 const t=(x,y,s,z=60,extra='')=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Body" font-size="'+z+'" font-weight="700" fill="var(--fg)" '+extra+'>'+s+'</text>';
 const panel=(id,s)=>'<g data-volume-scene="'+id+'">'+s+'</g>';
 container.innerHTML='<canvas id="volume-lab"></canvas><svg viewBox="0 0 952 700">'+
 panel('chain',t(225,600,'跟风消费',56,'data-at="'+P.triggers.consume+'"')+t(727,600,'盲目投资',56,'data-at="'+P.triggers.invest+'"')+'<g data-volume-loss>'+t(476,685,'本金受损',80)+'</g>')+
 panel('overview',t(155,620,'少冲动',55)+t(476,620,'守本金',55)+t(797,620,'减负债',55))+
 panel('spend',t(225,640,'想要',82)+t(727,640,'需要',82))+
 panel('risk',t(476,685,'先守住本金',80))+
 panel('debt',t(730,245,'减少',100)+t(730,405,'负债',100))+'</svg>';
 const lab=makeVolumeLab(container.querySelector('canvas'),P,mode),panels=[...container.querySelectorAll('[data-volume-scene]')];
 return {render(t,id,age,frame){
  const u=out((age-(id==='debt'?0:travel))/.2);
  for(const p of panels)p.style.opacity=p.dataset.volumeScene===id?String(u):'0';
  container.querySelectorAll('[data-at]').forEach(e=>e.style.opacity=String(out((frame-Number(e.dataset.at)-8)/8)));
  container.querySelector('[data-volume-loss]').style.opacity=String(out((frame-P.triggers.loss)/10));
  lab.render(t,id,age,frame);
 }};
}
