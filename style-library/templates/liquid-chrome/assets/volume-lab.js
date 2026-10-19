import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './round-box.js';

// Deterministic conceptual models, not a physics solver or financial data display.
export function makeVolumeLab(canvas,P,mode){
 const W=952,H=535,white=mode==='isometric-maquette',glass=mode==='optical-glass',gel=mode==='viscous-gel',chrome=mode==='liquid-chrome',holo=mode==='holographic-volume';
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(W,H,false);renderer.setPixelRatio(1);renderer.setClearColor(0,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=white;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),aspect=W/H;
 const camera=white?new T.OrthographicCamera(-5.1,5.1,5.1/aspect,-5.1/aspect,.1,80):new T.PerspectiveCamera(25,aspect,.1,80);
 camera.position.set(white?7:0,white?6.5:1.5,white?9:11.2);camera.lookAt(0,white?0:holo?-.2:.15,0);
 const envScene=new T.Scene();envScene.background=new T.Color(chrome?'#222a31':'#dfe7e5');
 function envPanel(x,y,z,w,h,color){
  const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);envScene.add(p);
 }
 envPanel(-4,3,2,4,8,'#ffffff');envPanel(5,1,0,2,9,'#f6e8d5');envPanel(0,7,-2,9,3,'#ffffff');envPanel(0,-3,4,10,2,'#5a6e81');envPanel(-3,0,-6,1.2,9,'#1b222a');
 if(chrome)envPanel(0,0,8,9,8,'#7f949f');
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(envScene,0,.1,50,{size:128});scene.environment=environment.texture;
 scene.add(new T.HemisphereLight(0xffffff,0x687777,white?2.6:1.6));
 const key=new T.DirectionalLight(0xffffff,white?4:2);key.position.set(-5,8,5);key.castShadow=white;
 key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.bias=-.001;key.shadow.normalBias=.025;scene.add(key);
 const colors=white?['#efeee9','#ffffff','#e1e3dd']:glass?['#d5eeee','#b8d6da','#d0e8e3']:gel?['#e5b0b4','#dbacbd','#b2ced0']:chrome?['#dce0e2','#c8d4dd','#b6c1ce']:['#76e3e6','#a0f0e8','#83a6ef'];
 const materials=colors.map(c=>white?new T.MeshStandardMaterial({color:c,roughness:.9,metalness:0}):holo?new T.MeshBasicMaterial({color:c,transparent:true,opacity:.17,depthWrite:false,side:T.DoubleSide}):new T.MeshPhysicalMaterial({color:c,metalness:chrome?1:0,roughness:chrome?.13:gel?.12:.075,transmission:chrome?0:gel?.93:.97,thickness:gel?1.2:1.15,ior:gel?1.37:1.5,clearcoat:1,clearcoatRoughness:.12,attenuationColor:new T.Color(c),attenuationDistance:gel?7:5,envMapIntensity:chrome?1.65:1.15}));
 const whiteMat=new T.MeshStandardMaterial({color:0xf9f6ed,roughness:.65});
 const groups={},dynamic=[],emissions=[],allModels=[];
 for(const id of ['chain','overview','spend','risk','debt']){groups[id]=new T.Group();scene.add(groups[id]);}
 function mesh(geo,mat,parent,x=0,y=0,z=0){
  const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=white;m.receiveShadow=white;parent.add(m);return m;
 }
 const round=(w,h,d,r,mat,p,x=0,y=0,z=0)=>mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,p,x,y,z);
 function shieldGeometry(depth=.36){
  const s=new T.Shape();s.moveTo(-.85,.85);s.quadraticCurveTo(0,.8,0,1.12);s.quadraticCurveTo(0,.8,.85,.85);s.lineTo(.7,-.45);s.quadraticCurveTo(.45,-.8,0,-1.15);s.quadraticCurveTo(-.45,-.8,-.7,-.45);s.closePath();
  return new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:chrome?10:5,steps:1,bevelSize:chrome?.22:.08,bevelThickness:chrome?.22:.08,curveSegments:chrome?40:20});
 }
 function pathTube(points,r,mat,parent){
  return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,10,false),mat,parent);
 }
 function deformable(m,strength=1){
  if(!gel&&!chrome)return m;
  const a=m.geometry.getAttribute('position');dynamic.push({m,base:new Float32Array(a.array),strength});return m;
 }
 function body(kind,parent,mat){
  if(kind==='bag'){
   if(chrome||gel){const m=round(1.9,1.65,.8,.3,mat,parent,0,-.12,0);deformable(m);}
   else round(1.75,1.7,.7,.15,mat,parent,0,-.1,0);
   pathTube([[-.55,.6,0],[-.5,1.35,0],[0,1.52,0],[.5,1.35,0],[.55,.6,0]],chrome?.2:.11,mat,parent);
   if(white)round(1.5,.08,.05,.02,materials[2],parent,0,-.55,.39);
  }else if(kind==='coin'){
   for(let i=0;i<2;i++){
    const m=mesh(new T.CylinderGeometry(.8,.8,chrome?.32:.22,56),mat,parent,(i-.5)*.65,(i-.5)*.2,i*.27);m.rotation.x=Math.PI/2;
    mesh(new T.TorusGeometry(.66,.035,8,48),mat,parent,(i-.5)*.65,(i-.5)*.2,i*.27+.15);
   }
  }else if(kind==='shield'){
   if(gel)return; // An enclosed coin, not a second rigid shield beneath the envelope.
   mesh(shieldGeometry(chrome?.48:.3),mat,parent,0,0,-.2);
   const front=chrome?.65:.35;
   pathTube([[-.4,-.05,front],[-.12,-.35,front],[.5,.4,front]],.095,holo?new T.MeshBasicMaterial({color:0xc5ffff}):white?materials[2]:whiteMat,parent);
  }else{
   if(gel||chrome){const m=mesh(new T.SphereGeometry(1,44,30),mat,parent,0,-.2,0);m.scale.set(1.1,.82,.65);deformable(m,.8);}
   else round(1.8,1.25,.85,.13,mat,parent,0,-.35,0);
   mesh(new T.TorusGeometry(.4,.115,12,48),mat,parent,0,.8,0);
  }
 }
 function model(kind,parent,x,y,scale=1,trigger=0){
  const root=new T.Group(),restY=white?-2+1.675*scale:y;
  root.position.set(white?x*.789:x,restY,white?-x*.614:0);root.scale.setScalar(scale);root.userData={kind,trigger,baseScale:scale,x,y:restY};parent.add(root);allModels.push(root);
  if(white){
   // Architectural white maquette: raised block foundations and actual side steps.
   round(2.55,.25,2.1,.025,materials[2],root,0,-1.55,0);
   for(let i=0;i<3;i++)round(.75,.12*(i+1),.4,.01,materials[0],root,1.15,-1.35+.06*(i+1),.8-i*.4);
   body(kind,root,materials[1]);
   if(kind==='shield')for(const x of[-.95,.95])round(.1,1.9,.7,.01,materials[0],root,x,-.15,0);
  }else if(holo){
   const m=materials[0];body(kind,root,m);
   // Separated cross-sectional planes with visible luminous geometry, no points.
   const hull=kind==='shield'?shieldGeometry(.015):kind==='coin'?new T.CylinderGeometry(.8,.8,.015,48).rotateX(Math.PI/2):new RoundedBoxGeometry(1.75,kind==='weight'?1.25:1.7,.025,2,.012);
   for(let i=0;i<7;i++){
    mesh(hull.clone(),new T.MeshBasicMaterial({color:i%2?0x8cf7e6:0x74cfe6,transparent:true,opacity:.075,side:T.DoubleSide,depthWrite:false}),root,0,kind==='weight'?-.35:0,(i-3)*.24);
   }
   const edgeGeo=kind==='shield'?shieldGeometry(.55):kind==='coin'?new T.CylinderGeometry(.8,.8,.5,48).rotateX(Math.PI/2):new RoundedBoxGeometry(1.75,kind==='weight'?1.25:1.7,.72,2,.18);
   const edges=new T.LineSegments(new T.EdgesGeometry(edgeGeo),new T.LineBasicMaterial({color:0xb6ffff,transparent:true,opacity:.75}));edges.position.y=kind==='weight'?-.35:0;root.add(edges);
   const base=mesh(new T.CylinderGeometry(1.35,1.35,.1,64),new T.MeshBasicMaterial({color:0x1c626c}),root,0,-1.55,0);
   mesh(new T.TorusGeometry(1.2,.025,8,72),new T.MeshBasicMaterial({color:0x88eef0}),base).rotation.x=Math.PI/2;
   const beam=mesh(new T.CylinderGeometry(.45,1.16,1.4,48,1,true),new T.MeshBasicMaterial({color:0x67dde0,transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide}),root,0,-.8,0);
   emissions.push(beam);
  }else body(kind,root,materials[gel?2:0]);
  return root;
 }
 const a={};
 a.bag=model('bag',groups.chain,white?-2.7:-2.4,.1,1,P.triggers.consume);a.coin=model('coin',groups.chain,white?2.7:2.4,.1,1.1,P.triggers.invest);
 for(const[kind,x]of[['bag',white?-3.4:-3.05],['shield',0],['weight',white?3.4:3.05]])model(kind,groups.overview,x,.15,.8);
 model('bag',groups.spend,white?-2.7:-2.4,.1,1.15);model('shield',groups.spend,white?2.7:2.4,.1,1.15);
 a.risk=model('shield',groups.risk,0,holo?.35:.3,holo?1.38:1.55);a.debt=model('weight',groups.debt,-2.7,holo?.25:.1,holo?1.15:1.35);
 if(gel){
  // A stable coin remains visible inside a deforming transparent envelope.
  for(const root of allModels){
   if(root.userData.kind!=='shield')continue;
   const m=mesh(new T.SphereGeometry(1.2,40,28),materials[0],root,0,0,0);m.scale.set(.98,1.08,.55);deformable(m,1.1);
   const core=new T.MeshStandardMaterial({color:0x9a704b,metalness:.3,roughness:.3});
   mesh(new T.CylinderGeometry(.65,.65,.16,48),core,root,0,0,.12).rotation.x=Math.PI/2;
   mesh(new T.TorusGeometry(.53,.035,8,48),new T.MeshBasicMaterial({color:0x51404b}),root,0,0,.22);
  }
 }
 // Controlled background detail is present behind optical glass, never behind words.
 const backdrops=[];
 if(glass||gel){
  const board=new T.Group();board.position.set(0,0,-1.6);scene.add(board);
  mesh(new T.PlaneGeometry(16,8),new T.MeshBasicMaterial({color:glass?0xe6efec:0xf1e4e2}),board);
  for(let i=-12;i<=12;i++){
   if(gel)continue;
   const bar=mesh(new T.PlaneGeometry(.055,7),new T.MeshBasicMaterial({color:glass?(i%3===0?0x517d7b:0xa1b8b2):0xd5b9bd}),board,i*.48,0,.01);backdrops.push(bar);
  }
 }
 if(white){
  const floor=mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.22}),scene,0,-2,0);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 }
 const clamp=x=>Math.max(0,Math.min(1,x)),out=x=>1-(1-clamp(x))**3;
 return {render(t,id,age,frame){
  const travel=Number(document.querySelector('#root').dataset.personTravel||.55),delay=id==='debt'?0:travel,enter=out((age-delay)/(gel?1.6:.65));
  for(const[k,g]of Object.entries(groups)){
   g.visible=k===id;g.rotation.y=white?0:chrome?-.22+(.15*(1-enter)):holo?-.24:glass?-.18:0;
   g.position.y=-.13*(1-enter);
  }
  for(const root of allModels){
   const trigger=root.userData.trigger,start=trigger||P.scenes.find(s=>s.id===root.parent.name)?.startFrame||0;
   const active=trigger?out((frame-start)/14):1;root.visible=active>0;
   const settle=gel?enter:1;root.scale.setScalar(root.userData.baseScale*(.96+.04*active));
   root.position.y=root.userData.y+.15*(1-active);
   if(chrome)root.rotation.z=.025*(1-enter)*Math.sin(age*5);
   if(white)root.position.y=root.userData.y+.3*(1-enter);
  }
  // Recompute from immutable base coordinates so reverse seeking is exact.
  for(const d of dynamic){
   const a=d.m.geometry.getAttribute('position'),b=d.base,amplitude=(gel?.2:.1)*(1-enter)*d.strength;
   for(let i=0;i<a.count;i++){
    const x=b[i*3],y=b[i*3+1],z=b[i*3+2],q=Math.sin(y*3.8+age*(gel?1.7:4.5))*Math.cos(x*2.2);
    a.setXYZ(i,x*(1+amplitude*q),y+amplitude*Math.sin(x*3+age*2),z*(1+amplitude*.7*q));
   }
   a.needsUpdate=true;d.m.geometry.computeVertexNormals();
  }
  emissions.forEach((m,i)=>m.material.opacity=.05+.015*Math.sin(t*1.6+i));
  canvas.style.opacity=String(out((age-delay)/.15));
  canvas.style.clipPath=(glass||gel)&&id==='debt'?'inset(0 46% 0 0)':'none';
  renderer.render(scene,camera);
  window.VOLUME_LAB_STATE={mode,frame,scene:id,threeRevision:T.REVISION,physicalSimulation:false,transmission:glass||gel,orthographic:camera.isOrthographicCamera===true,usesPointCloud:false,geometryReturnsToRest:gel||chrome};
 }};
}
