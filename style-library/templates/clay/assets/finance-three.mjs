import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

export async function createFinanceScene({mount,look,P}){
 const blue=look==='blueprint',W=952,H=700;
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=!blue;renderer.shadowMap.type=THREE.VSMShadowMap;
 if(!blue){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;}
 mount.append(renderer.domElement);renderer.domElement.setAttribute('aria-label',blue?'财经关系的真实三维线框示意':'财经关系的哑光柔质三维示意');
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5.4,5.4,5.4*H/W,-5.4*H/W,.1,80);
 camera.position.set(7.7,6.8,11.8);camera.lookAt(0,.65,0);camera.updateMatrixWorld();
 if(!blue){scene.add(new THREE.HemisphereLight(0xfff4e8,0xb59bc9,2.3));const key=new THREE.DirectionalLight(0xfff2da,3.4);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});key.shadow.bias=-.0004;key.shadow.normalBias=.025;key.shadow.radius=4;key.shadow.blurSamples=6;scene.add(key);const fill=new THREE.DirectionalLight(0xd9c9ef,1.15);fill.position.set(6,3,-5);scene.add(fill);}
 const palette={purple:0x80539e,pale:0xd2b9e4,gold:0xedbd60,cream:0xf2dfc4,ivory:0xfff5e6,ink:0x422d55};
 let meshes=0,segments=0;
 function primitive(geo,color,parent){
  const g=new THREE.Group();parent.add(g);
  if(blue){
   const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x2b73b7,transparent:true,opacity:.10,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,depthWrite:false}));g.add(mesh);
   const edges=new THREE.EdgesGeometry(geo,28),lg=new LineSegmentsGeometry();lg.setPositions(Array.from(edges.attributes.position.array));
   const mat=new LineMaterial({color:color===palette.gold?0xd6f5a2:0xc9e9ff,linewidth:2,transparent:true,opacity:.95,resolution:new THREE.Vector2(W,H)});const wire=new LineSegments2(lg,mat);g.add(wire);segments+=edges.attributes.position.count/2;edges.dispose();
  }else{const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.9,metalness:0}));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
  meshes++;return g;
 }
 const box=(p,w,h,d,color,r=.16)=>primitive(blue?new THREE.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,4,r),color,p);
 function disk(p,r,h,color){const rr=Math.min(.09,h*.4),points=[new THREE.Vector2(0,-h/2),new THREE.Vector2(r-rr,-h/2)];for(let j=0;j<=6;j++){const a=j*Math.PI/12;points.push(new THREE.Vector2(r-rr+rr*Math.sin(a),-h/2+rr*(1-Math.cos(a))));}points.push(new THREE.Vector2(r,h/2-rr));for(let j=0;j<=6;j++){const a=j*Math.PI/12;points.push(new THREE.Vector2(r-rr+rr*Math.cos(a),h/2-rr+rr*Math.sin(a)));}points.push(new THREE.Vector2(0,h/2));const g=primitive(new THREE.LatheGeometry(points,48),color,p);if(blue){const coords=[];for(const y of [-h/2,h/2])for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;coords.push(r*Math.cos(a),y,r*Math.sin(a),r*Math.cos(b),y,r*Math.sin(b));}const geo=new LineSegmentsGeometry();geo.setPositions(coords);g.add(new LineSegments2(geo,new LineMaterial({color:color===palette.gold?0xd6f5a2:0xa9d9ff,linewidth:1.7,transparent:true,opacity:.8,resolution:new THREE.Vector2(W,H)})));segments+=96;}return g;}
 function wallet(parent,scale=1){const g=new THREE.Group();parent.add(g);g.scale.setScalar(scale);const back=box(g,3.9,2.45,.65,palette.purple);back.position.y=1.35;const front=box(g,3.9,1.95,.32,palette.pale);front.position.set(0,1.12,.47);const strap=box(g,1.2,.58,.26,palette.purple,.12);strap.position.set(1.2,1.35,.72);const stud=primitive(new THREE.SphereGeometry(.13,20,12),palette.gold,g);stud.position.set(1.49,1.35,.88);const coins=[];for(let i=0;i<3;i++){const c=disk(g,.51,.18,palette.gold);c.rotation.x=Math.PI/2;c.position.set(-.8+i*.62,2.36+i*.13,.08);coins.push(c);}return {g,back,front,coins,strap};}
 function shield(parent,scale=1){const g=new THREE.Group();parent.add(g);g.scale.setScalar(scale);const s=new THREE.Shape();s.moveTo(-1.5,1.1);s.lineTo(0,1.65);s.lineTo(1.5,1.1);s.lineTo(1.25,-.65);s.quadraticCurveTo(.6,-1.5,0,-1.85);s.quadraticCurveTo(-.6,-1.5,-1.25,-.65);s.closePath();const body=primitive(new THREE.ExtrudeGeometry(s,{depth:.35,bevelEnabled:!blue,bevelSegments:4,steps:1,bevelSize:.12,bevelThickness:.12}),palette.purple,g);body.position.y=1.8;const check1=box(g,.75,.19,.19,palette.gold,.08);check1.position.set(-.38,1.85,.55);check1.rotation.z=-.7;const check2=box(g,1.45,.19,.19,palette.gold,.08);check2.position.set(.38,2.08,.55);check2.rotation.z=.8;return {g,body};}
 function stack(parent,scale=1){const g=new THREE.Group();parent.add(g);g.scale.setScalar(scale);const blocks=[];for(let i=0;i<3;i++){const b=box(g,3.1,.55,1.8,i%2?palette.pale:palette.purple,.18);b.position.set(i%2?.15:-.12,.37+i*.65,0);blocks.push(b);}return {g,blocks};}
 function platform(parent,r=2.8){const p=disk(parent,r,.22,palette.cream);p.position.y=-.1;return p;}
 const root=new THREE.Group();scene.add(root);const floor=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({color:0x674e77,opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.25;floor.receiveShadow=true;if(!blue)root.add(floor);
 const chain=new THREE.Group();root.add(chain);platform(chain,3.6);const purse=wallet(chain);purse.g.position.x=-.65;const loose=[];for(let i=0;i<3;i++){const c=disk(chain,.55,.22,palette.gold);c.position.set(2.4,.13+i*.23,.4);loose.push(c);}
 const overview=new THREE.Group();root.add(overview);const ow=wallet(overview,.55);ow.g.position.set(-3.15,0,0);const os=shield(overview,.58);os.g.position.set(0,0,0);const od=stack(overview,.63);od.g.position.set(3.15,0,0);platform(overview,4.6);
 const compare=new THREE.Group();root.add(compare);const choices=[];
 for(let i=0;i<2;i++){const g=new THREE.Group();compare.add(g);g.position.x=i?2.05:-2.05;platform(g,1.75);const tile=box(g,2.25,2.5,.42,i?palette.purple:palette.pale,.3);tile.position.y=1.35;const inset=box(g,1.3,.18,.15,palette.ivory,.07);inset.position.set(0,1.45,.3);if(i){const a=box(g,.64,.2,.2,palette.gold,.08);a.position.set(-.35,1.4,.45);a.rotation.z=-.7;const b=box(g,1.2,.2,.2,palette.gold,.08);b.position.set(.3,1.62,.45);b.rotation.z=.75;}else{const ring=primitive(new THREE.TorusGeometry(.54,.12,12,40),palette.gold,g);ring.position.set(0,1.65,.44);}choices.push(g);}
 const risk=new THREE.Group();root.add(risk);platform(risk,3.7);const rw=wallet(risk,.78);rw.g.position.set(-1.3,0,-.25);const guard=shield(risk,.88);guard.g.position.set(1.25,0,1.0);
 const debt=new THREE.Group();root.add(debt);platform(debt,3);const ds=stack(debt,1.3);
 const groups={chain,overview,spend:compare,risk,debt};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.classList.add('object-leaders');mount.append(svg);
 const labelMount=document.createElement('div');labelMount.className='object-labels';mount.append(labelMount);
 const configurations={
  chain:[['跟风消费',[-2,2.5,0],20,10],['本金受损',[0,1.3,0],590,455],['压力增加',[2.8,.5,0],40,535]],
  overview:[['无效消费',[-3.15,1.6,0],0,465],['守住本金',[0,1.5,0],335,60],['减少负债',[3.15,1.4,0],635,500]],
  spend:[['想要',[-2.05,2.6,0],40,35],['需要',[2.05,2.6,0],625,35]],
  risk:[['夸大收益',[-1.4,2.3,0],0,40],['守住本金',[1.25,2.2,1],600,480]],
  debt:[['减少负债',[0,2.7,0],50,40]]};
 const labels=[];for(const [id,items] of Object.entries(configurations)){for(const [text,anchor,x,y]of items){const el=document.createElement('div');el.className='object-label';el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';labelMount.append(el);const line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('fill','none');line.setAttribute('stroke','#a9d9ff');line.setAttribute('stroke-width','2');const dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('r','4');dot.setAttribute('fill','#d6f5a2');svg.append(line,dot);labels.push({id,el,line,dot,anchor:new THREE.Vector3(...anchor),x,y});}}
 function render(t,id){
  for(const [k,g]of Object.entries(groups))g.visible=k===id;
  root.position.set(0,-.45,0);root.rotation.set(0,blue?-.1:.05,0);
  const age=t-(P.scenes.find(s=>s.id===id)?.startFrame||0)/P.fps,enter=ease(age/.5);root.scale.setScalar(.94+.06*enter);
  const spend=ease((t-P.triggers.consume/P.fps)/1),invest=ease((t-P.triggers.invest/P.fps)/1),loss=ease((t-P.triggers.loss/P.fps)/.6);
  purse.front.position.z=.47+(blue?.55:0)*ease((age-.2)/.8);purse.back.position.z=blue?-.25*enter:0;
  purse.coins.forEach((c,i)=>{const u=ease((t-P.triggers.consume/P.fps-i*.22)/1.15);c.position.set(-.8+i*.62+u*1.1,2.36+i*.13-u*.7,.08+u*.65);c.rotation.set(Math.PI/2,0,u*.5);});
  loose.forEach((c,i)=>{c.position.set(2.25+.12*i,.13+i*.23+(1-loss)*.25,.45);c.rotation.z=loss*.15*(i-1);});
  choices[0].rotation.y=-.10*(1-enter);choices[1].rotation.y=.10*(1-enter);choices[0].position.y=.12*ease((t-P.triggers.want/P.fps)/.35);choices[1].position.y=.12*ease((t-P.triggers.want/P.fps-.15)/.35);
  guard.g.position.z=1+ease((t-P.triggers.risk/P.fps)/.6)*.5;guard.g.rotation.y=-.15*(1-ease((t-P.triggers.risk/P.fps)/.6));
  ds.blocks.forEach((b,i)=>{b.position.y=.37+i*(.65-.3*ease(age/.8));});
  camera.position.set(7.7-(blue?.25:.35)*enter,6.8,11.8);camera.lookAt(0,.65,0);camera.updateMatrixWorld();root.updateMatrixWorld(true);
  for(const l of labels){const visible=l.id===id&&(id!=='chain'||(l.el.textContent==='跟风消费'?t>=P.triggers.consume/P.fps:l.el.textContent==='本金受损'?t>=P.triggers.loss/P.fps:t>=P.triggers.pressure/P.fps));l.el.style.opacity=visible?'1':'0';l.line.style.opacity=l.dot.style.opacity=visible&&blue?'1':'0';if(visible&&blue){const v=root.localToWorld(l.anchor.clone()).project(camera),x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*H;l.line.setAttribute('d',`M${l.x+145} ${l.y+72}L${l.x+145} ${l.y+95}L${x} ${y}`);l.dot.setAttribute('cx',x);l.dot.setAttribute('cy',y);}}
  renderer.render(scene,camera);
 }
 render(0,'hook');return {render,stats:{real3D:true,meshes,wireSegments:segments,lighting:blue?'unlit structural lines':'hemisphere, warm key, cool fill, physical shadows'}};
}
