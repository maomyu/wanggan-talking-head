import * as T from 'three';import{RoundedBoxGeometry}from'three/addons/geometries/RoundedBoxGeometry.js';
export async function create(H){const{C,$,ph,mix,txt,line}=H,mount=$('world3d'),W=1000,HH=850;
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(W,HH,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0,0);mount.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-5.4,5.4,4.59,-4.59,.1,80),root=new T.Group();scene.add(root);
 const mats=Object.fromEntries(Object.entries({plum:'#89679d',light:'#d8c0da',gold:'#dba46a',cream:'#e5d5c1',red:'#c57161',ink:'#584164',mint:'#94ad9a'}).map(([k,col])=>[k,new T.MeshStandardMaterial({color:col,roughness:.72,metalness:0})]));let meshCount=0;
 function mesh(g,geo,mat){const m=new T.Mesh(geo,mats[mat]);m.castShadow=m.receiveShadow=true;g.add(m);meshCount++;return m;}
 const box=(g,w,h,d,mat,rad=.12)=>mesh(g,new RoundedBoxGeometry(w,h,d,4,Math.min(rad,w*.4,h*.4,d*.4)),mat);
 const group=()=>{const g=new T.Group();root.add(g);return g;};
 scene.add(new T.HemisphereLight(0xfff7e8,0x9c80ab,2.5));const sun=new T.DirectionalLight(0xfff0dd,4.5);sun.position.set(-7,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:30});sun.shadow.normalBias=.035;scene.add(sun);const fill=new T.DirectionalLight(0xe8deff,1.4);fill.position.set(6,4,-5);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(30,25),new T.ShadowMaterial({color:'#57475f',opacity:.18}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.18;floor.receiveShadow=true;scene.add(floor);
 const support=group();const stem=mesh(support,new T.CylinderGeometry(.5,.75,.7,48),'plum');stem.position.y=-.75;const foot=mesh(support,new T.CylinderGeometry(3.85,3.98,.2,80),'cream');foot.position.y=-1.08;
 const balance=group(),plank=box(balance,7.4,.3,3.25,'light',.15);plank.position.y=-.28;
 const rail=box(balance,7.45,.11,.15,'plum',.05);rail.position.set(0,-.12,1.58);
 function headphones(parent){const g=new T.Group();parent.add(g);const arch=mesh(g,new T.TorusGeometry(.65,.12,16,48,Math.PI),'plum');arch.position.y=1.04;for(const s of[-1,1]){const cup=box(g,.42,.7,.5,'plum');cup.position.set(s*.65,.69,0);const pad=box(g,.13,.55,.42,'cream',.05);pad.position.set(s*.45,.69,.03);}return g;}
 const h=headphones(balance),extra=headphones(balance);const food=new T.Group();balance.add(food);let bag=box(food,1.25,1.15,.85,'mint',.17);bag.position.y=.58;let handle=mesh(food,new T.TorusGeometry(.36,.08,12,32,Math.PI),'plum');handle.position.set(0,1.15,0);for(let i=0;i<3;i++){const pack=box(food,.25,.38,.28,i%2?'gold':'cream',.07);pack.position.set((i-1)*.32,1.21,0);}
 const capital=new T.Group();balance.add(capital);const tray=box(capital,2.6,.18,1.6,'cream',.1);tray.position.y=.1;const coins=[];for(let i=0;i<6;i++){const m=box(capital,.62,.18,.56,'gold',.07);m.position.set((i%3-1)*.77,.28,Math.floor(i/3)*.7-.35);coins.push(m);}
 const walls=[];for(const [w,d,x,z]of[[.16,2,-1.5,0],[.16,2,1.5,0],[3.15,.16,0,-.96]]){const m=box(capital,w,1.7,d,'plum',.07);m.position.set(x,.95,z);walls.push(m);}
 const weights=new T.Group();balance.add(weights);const blocks=[];for(let i=0;i<3;i++){const m=box(weights,1.35,.42,1,'red',.15);m.position.y=.21+i*.46;blocks.push(m);}
 const promise=group();let block=box(promise,2.35,1.65,.7,'red',.2);block.position.y=.83;
 await document.fonts.load('700 88px Caption');const faceCanvas=document.createElement('canvas');faceCanvas.width=640;faceCanvas.height=300;const face=faceCanvas.getContext('2d');face.fillStyle='#43364d';face.font='700 100px Caption';face.textAlign='center';face.fillText('高回报',320,175);const faceTexture=new T.CanvasTexture(faceCanvas);faceTexture.colorSpace=T.SRGBColorSpace;const frontLabel=new T.Mesh(new T.PlaneGeometry(2.05,.96),new T.MeshBasicMaterial({map:faceTexture,transparent:true,depthWrite:false,toneMapped:false}));frontLabel.position.set(0,.88,.36);promise.add(frontLabel);
 // Back-side exclamation is geometry, revealed only after turning the same block.
 const bang=new T.Group();promise.add(bang);bang.position.set(0,.82,-.4);const stroke=box(bang,.14,.57,.1,'cream',.06);stroke.position.y=.19;const dot=mesh(bang,new T.SphereGeometry(.105,20,12),'cream');dot.position.y=-.31;
 const boundary=group();let gate=box(boundary,.17,2.35,2.75,'plum',.06);gate.position.y=.91;
 let stage={};
 function draw(f){mount.style.opacity=ph(f,148,168)*(1-ph(f,898,908));
  const loss=ph(f,310,333),remove=ph(f,856,879),load=ph(f,224,249),reject=ph(f,482,518);
  root.position.set(0,0,0);root.rotation.set(0,0,0);support.visible=true;balance.visible=true;balance.position.set(0,0,0);balance.rotation.set(0,0,0);balance.scale.set(1,1,1);
  h.visible=true;h.position.set(-2,0,.1);h.scale.setScalar(1);h.rotation.set(0,.08,0);
  extra.visible=f>=149&&f<198||f>=461&&f<563;extra.position.set(-.35,0,.3);extra.scale.setScalar(.8);extra.rotation.set(0,0,0);food.visible=f>=563&&f<616;food.position.set(2,0,.2);
  capital.visible=f>=198&&f<224||f>=266&&f<461||f>=616;capital.position.set(1.75,0,.1);capital.rotation.set(0,0,0);capital.scale.setScalar(1);
  for(let i=0;i<6;i++){const q=i>=4?loss:0;coins[i].visible=q<1;coins[i].position.set((i%3-1)*.77+q*2.2,.28-q*1.5,Math.floor(i/3)*.7-.35+q*.6);coins[i].rotation.set(q*.9,0,q*.65);coins[i].scale.setScalar(1);}
  const protect=ph(f,616,650);for(const m of walls){m.visible=f>=616;m.scale.y=Math.max(.001,protect);m.position.y=.1+.85*protect;}
  weights.visible=f>=224&&f<266||f>=349&&f<461||f>=856;weights.position.set(-2,0,.15);weights.rotation.set(0,0,0);for(let i=0;i<3;i++){const q=i?remove:0;blocks[i].visible=q<1;blocks[i].position.set(q*4.6,.21+i*.46+Math.sin(q*Math.PI)*1.4,q*.7);blocks[i].rotation.set(q*.2,q*.8,q*.4);}
  promise.visible=f>=686&&f<856;boundary.visible=f>=686&&f<856;promise.position.set(2.9,.1,0);promise.rotation.set(0,0,0);boundary.position.set(.2,0,0);
  let yaw=-.22,span=10.8,targetX=0,targetY=.1;
  if(f>=149&&f<198){extra.position.y=2.7*(1-ph(f,157,179));const hit=ph(f,176,185)-ph(f,185,196);balance.rotation.z=.08*ph(f,178,192);balance.position.y=-.14*hit;}
  else if(f>=198&&f<224){h.visible=false;capital.position.set(0,0,0);}
  else if(f>=224&&f<266){h.visible=false;weights.position.set(-1.8,1.7*(1-load),0);balance.rotation.z=.12*load;balance.position.y=-.2*load;}
  else if(f>=266&&f<388){h.visible=false;capital.position.set(.8,0,0);balance.rotation.z=-.06*loss;weights.visible=f>=349;}
  else if(f>=388&&f<461){h.position.set(-2.5,0,.1);h.scale.setScalar(.7);capital.position.set(0,0,.1);capital.scale.setScalar(.85);weights.position.set(2.55,0,.1);weights.scale.setScalar(.8);}
  else if(f>=461&&f<616){capital.visible=false;weights.visible=false;extra.position.set(.4+reject*4.5,Math.sin(reject*Math.PI)*1.2,.15);extra.rotation.z=-reject*.45;extra.visible=f<563&&reject<1;balance.rotation.z=.08*(1-reject);h.position.x=-2.15;span=10;}
  else if(f>=616&&f<686){h.visible=false;capital.position.set(0,0,0);span=mix(10,8.5,protect);}
  else if(f>=686&&f<856){h.visible=false;capital.position.set(-1.65,0,0);capital.scale.setScalar(.85);for(const m of walls)m.visible=false;const push=ph(f,695,724),turn=ph(f,742,761),away=ph(f,783,810);promise.position.set(mix(4.5,1.7,push)+away*2.8,.1+Math.sin(Math.PI*push)*.2,0);promise.rotation.y=-Math.PI*turn;promise.rotation.z=.1*Math.sin(Math.PI*push);promise.visible=away<1;boundary.scale.y=1;span=10.6;yaw=mix(-.22,.18,ph(f,686,717));}
  else if(f>=856){h.visible=false;for(const m of walls)m.visible=false;capital.position.set(-1.7,0,.1);capital.scale.setScalar(.85);weights.position.set(1.7,0,.1);weights.scale.setScalar(1);balance.rotation.z=-.08*(1-remove);balance.position.y=-.22*(1-remove);yaw=.18;}
  if(!(f>=388&&f<461)&&f<856)weights.scale.setScalar(1);
  const alpha=ph(f,148,168)*(1-ph(f,898,908));const d=14;camera.left=-span/2;camera.right=span/2;camera.top=span/2*HH/W;camera.bottom=-span/2*HH/W;camera.position.set(Math.sin(yaw)*d,8,Math.cos(yaw)*d);camera.lookAt(targetX,targetY,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();root.updateMatrixWorld(true);if(!window.FILM_AUDIT_GEOMETRY)renderer.render(scene,camera);
  const label=f<198?'跟风加购 → 托盘承压':f<224?'盲目打理，不等于守住本金':f<266?'负担叠加，托盘下沉':f<310?'跟风选择，忽略了判断':f<349?'本金受损，单位滑落':f<388?'本金减少，负担仍在':f<461?'消费 · 本金 · 负债':f<563?'移走额外加购，承压减轻':f<616?'想要 / 日常需要':f<686?'边界立起，守住剩余本金':f<742?'夸大收益的说法 · 示意':f<783?'同一块翻面：看见风险':f<856?'保护边界挡住投机风险':f<898?'卸下部分，负担仍有剩余':'把判断留给自己';
  txt(label,540,1260,39,C.fg,'center');line(390,1387,1004,1387,'#cbb7ce',2);txt('动作发生，结果留下',1000,1430,41,C.muted,'right');
  stage={real3D:true,meshCount,span,yaw,balanceTilt:balance.rotation.z,principal:coins.filter(m=>m.visible).length,debt:blocks.filter(m=>m.visible).length,promiseTurn:promise.rotation.y,originalPersonNotIn3D:true,alpha};return stage;
 }
 renderer.compile(scene,camera);return{draw};
}
