// Real source photography, unmodified originals. Crops/gray/annotations are digital composites.
export async function makePhotographyStage(ctx,{mode,sources}){
 const {container,P,out}=ctx,travel=Number(document.querySelector('#root').dataset.personTravel||.55);
 for(const s of sources){const img=new Image();img.src='assets/photo-'+s.key+(s.key==='coins'?'.png':'.jpg');await img.decode()}
 const by=Object.fromEntries(sources.map(s=>[s.key,s]));let seq=0;
 const txt=(x,y,t,size=58,attrs='')=>'<text x="'+x+'" y="'+y+'" '+(attrs.includes('text-anchor=')?'':'text-anchor="middle"')+' font-family="Body" font-size="'+size+'" font-weight="700" '+(attrs.includes('fill=')?'':'fill="var(--fg)"')+' '+attrs+'>'+t+'</text>';
 const left=(x,y,t,size=50,attrs='')=>txt(x,y,t,size,'text-anchor="start" '+attrs);
 const rect=(x,y,w,h,fill='var(--caption)',attrs='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" '+attrs+'/>';
 const line=(d,w=2)=>'<path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="'+w+'"/>';
 const panel=(id,body)=>'<g data-photo-scene="'+id+'">'+body+'</g>';
 const at=(frame,body)=>'<g data-photo-at="'+frame+'">'+body+'</g>';
 function photo(key,x,y,w,h,crop,gray=false,round=0){
  const s=by[key];if(!s)throw Error('Missing real photographic source '+key);
  const cropProvided=Boolean(crop);crop=crop||[0,0,s.width,s.height];const id='ph-'+seq++;
  return '<g transform="translate('+x+' '+y+')"><defs><clipPath id="'+id+'"><rect width="'+w+'" height="'+h+'" rx="'+round+'"/></clipPath></defs><g clip-path="url(#'+id+')"><svg width="'+w+'" height="'+h+'" viewBox="'+crop.join(' ')+'" preserveAspectRatio="'+(key==='coins'&&!cropProvided?'xMidYMid meet':'xMidYMid slice')+'"><g data-photo-move data-cx="'+(crop[0]+crop[2]/2)+'" data-cy="'+(crop[1]+crop[3]/2)+'"'+(gray?' style="filter:grayscale(1)"':'')+'><image href="assets/photo-'+key+(key==='coins'?'.png':'.jpg')+'" width="'+s.width+'" height="'+s.height+'"/></g></svg></g></g>';
 }
 const trio=(y=656)=>txt(159,y,'少冲动',54)+txt(476,y,'守本金',54)+txt(793,y,'减负债',54);
 const pair=(y=655)=>txt(238,y,'想要',74)+txt(714,y,'需要',74);
 const labels=(id)=>id==='chain'?at(P.triggers.consume,txt(235,575,'跟风消费'))+at(P.triggers.invest,txt(717,575,'盲目投资'))+at(P.triggers.loss,txt(476,685,'本金受损',76)):id==='overview'?trio():id==='spend'?pair():id==='risk'?txt(476,685,'先守住本金',80):txt(760,290,'减少',90)+txt(760,425,'负债',90);
 const photoNotice=(t)=>left(18,40,t,25,'fill="var(--muted)"');
 let html='';
 if(mode==='documentary'){
  for(const id of ['chain','overview','spend','risk','debt']){
   const wide=id==='debt'?photo('street',0,55,585,510,[300,450,2700,2400]):photo('street',0,55,952,440,[0,300,3992,2247]);
   html+=panel(id,photoNotice('城市资料 · 非本段事件')+wide+labels(id));
  }
 }else if(mode==='tabletop-stilllife'){
  for(const id of ['chain','overview','spend','risk','debt']){
   const base=photo('desk',0,55,645,505,[250,750,3000,2250]);
   const words=id==='chain'?['跟风消费','盲目投资']:id==='overview'?['少冲动','守本金','减负债']:id==='spend'?['想要','需要']:id==='risk'?['先看风险','再做选择']:['减少','负债'];
   const list=words.map((s,i)=>line('M695 '+(85+i*170)+'H930',2)+txt(812,170+i*170,s,53)).join('');
   html+=panel(id,photoNotice('真实斜视桌面静物 · 侧注为数字叠加')+base+list+(id==='chain'?at(P.triggers.loss,txt(476,685,'本金受损',76)):id==='risk'?txt(476,685,'先守住本金',80):''));
  }
 }else if(mode==='macro-material'){
  const detail=(x,y,size,crop)=>photo('coins',x,y,size,size,crop,false,size/2);
  const source=photo('coins',665,42,267,150)+left(668,225,'原图索引',27,'fill="var(--muted)"');
  const crop=[1320,180,720,720];
  html+=panel('chain',photoNotice('历史币表面资料 · 非当代投资标的')+detail(15,70,430,[70,200,900,900])+detail(490,70,430,crop)+labels('chain'));
  html+=panel('overview',photoNotice('材质局部与原图索引')+detail(15,60,520,crop)+source+trio());
  html+=panel('spend',photoNotice('同一资料的整体与局部 · 无价格推断')+photo('coins',0,90,460,350)+detail(500,70,430,crop)+pair());
  html+=panel('risk',photoNotice('表面细节示意 · 非鉴定或收益依据')+detail(234,75,484,crop)+txt(476,685,'先守住本金',80));
  html+=panel('debt',photoNotice('历史币材质资料 · 负担为文字意象')+detail(10,60,500,[130,150,900,900])+txt(770,295,'减少',90)+txt(770,430,'负债',90));
 }else if(mode==='overhead-workbench'){
  const page=photo('workbench',0,50,575,505,[470,1410,900,1000]);
  for(const id of ['chain','overview','spend','risk','debt']){
   const words=id==='chain'?['跟风消费','盲目投资']:id==='overview'?['少冲动','守本金','减负债']:id==='spend'?['想要','需要？']:id==='risk'?['先看风险','守住本金']:['减少负债'];
   const notes=words.map((s,i)=>rect(614,70+i*180,320,130,'var(--caption)')+left(635,155+i*180,s,51)).join('');
   html+=panel(id,photoNotice('真实俯拍载体 · 右侧为数字注释')+page+notes+(id==='chain'?at(P.triggers.loss,txt(476,685,'本金受损',76)):id==='risk'?txt(476,685,'先守住本金',80):''));
  }
 }else if(mode==='architectural-light'){
  for(const id of ['chain','overview','spend','risk','debt']){
   const main=photo('interior',0,55,590,505,[1350,0,2500,3071]);
   const detail=photo('interior',642,55,310,215,[1650,500,1300,850]);
   const words=id==='chain'?['跟风消费','盲目投资']:id==='overview'?['少冲动','守本金','减负债']:id==='spend'?['想要','需要']:id==='risk'?['先看风险','再做选择']:['减少','负债'];
   const list=words.map((s,i)=>txt(797,355+i*85,s,49)).join('');
   html+=panel(id,photoNotice('建筑空间资料 · 空间切片与光窗细节')+main+detail+list+(id==='chain'?at(P.triggers.loss,txt(476,685,'本金受损',76)):id==='risk'?txt(476,685,'先守住本金',80):''));
  }
 }else if(mode==='everyday-story'){
  const tag=photoNotice('生活资料组图 · 非同一交易或说话者经历');
  html+=panel('chain',tag+photo('groceries',0,55,455,435)+photo('desk',497,55,455,435)+labels('chain'));
  html+=panel('overview',tag+photo('groceries',0,65,290,470)+photo('desk',331,65,290,470)+photo('coins',662,65,290,470,[1230,80,1150,1150])+trio());
  html+=panel('spend',tag+photo('groceries',0,55,952,480)+pair());
  html+=panel('risk',tag+photo('desk',0,55,952,480,[0,250,4032,2500])+txt(476,685,'先守住本金',80));
  html+=panel('debt',tag+photo('coins',0,85,570,390)+txt(770,295,'减少',90)+txt(770,430,'负债',90));
 }else if(mode==='spotlight-stage'){
  const floor=photo('stage',0,55,952,490,[100,1600,1250,700]);
  const spot='<ellipse cx="476" cy="470" rx="400" ry="62" fill="#e6c799" opacity=".17"/>';
  const coin=(x,y,s)=>photo('coins',x,y,s,s,[1320,180,720,720],false,s/2);
  const dark='<rect x="0" y="55" width="952" height="490" fill="#101217" opacity=".2"/>';
  for(const id of ['chain','overview','spend','risk','debt']){
   const body=id==='chain'?coin(80,100,340)+coin(532,100,340):id==='overview'?coin(266,55,420):id==='spend'?coin(200,80,420):id==='risk'?coin(234,75,484):coin(10,80,460);
   html+=panel(id,photoNotice('舞台地板与币摄影合成 · 非真实布景')+floor+dark+spot+body+labels(id));
  }
 }else if(mode==='darkroom-prints'){
  const print=(key,x,y,w,h,n,crop)=>rect(x-10,y-10,w+20,h+58,'#f3f0e7')+photo(key,x,y,w,h,crop,true)+left(x+8,y+h+35,String(n).padStart(2,'0'),25,'fill="#25272a"');
  const tag=photoNotice('数字黑白资料 · 编号为图像索引');
  html+=panel('chain',tag+print('groceries',12,60,440,380,1)+print('desk',500,60,440,380,2)+labels('chain'));
  html+=panel('overview',tag+print('groceries',12,75,282,420,1)+print('desk',335,75,282,420,2)+print('coins',658,75,282,420,3,[1230,80,1150,1150])+trio());
  html+=panel('spend',tag+print('groceries',40,65,580,440,1)+print('desk',688,65,235,195,2)+pair());
  html+=panel('risk',tag+print('coins',120,55,712,430,3)+txt(476,685,'先守住本金',80));
  html+=panel('debt',tag+print('desk',18,65,520,440,2)+txt(770,295,'减少',90)+txt(770,430,'负债',90));
 }else throw Error('Unknown photographic mode '+mode);
 container.innerHTML='<svg viewBox="0 0 952 700" xmlns="http://www.w3.org/2000/svg">'+html+'</svg>';
 const panels=[...container.querySelectorAll('[data-photo-scene]')];
 return{render(t,id,age,frame){
  const delay=id==='debt'?0:travel,u=out((age-delay)/.18),v=out((age-delay)/1.2);
  for(const p of panels)p.style.opacity=p.dataset.photoScene===id?String(u):'0';
  for(const e of container.querySelectorAll('[data-photo-move]')){const cx=Number(e.dataset.cx),cy=Number(e.dataset.cy),s=1+.025*(1-v);e.setAttribute('transform','translate('+cx+' '+cy+') scale('+s+') translate('+(-cx)+' '+(-cy)+')')}
  container.querySelectorAll('[data-photo-at]').forEach(e=>e.style.opacity=String(out((frame-Number(e.dataset.photoAt))/10)));
  window.PHOTOGRAPHY_STATE={mode,frame,scene:id,sourcePixelsUnchanged:true,digitalCrop:true,photoOnlyGray:mode==='darkroom-prints',singleOriginalVoice:true};
 }};
}
