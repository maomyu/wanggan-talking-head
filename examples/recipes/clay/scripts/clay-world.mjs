import * as T from 'three';import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export async function createClayWorld(mount,C){
 const angles=C.camera.viewTransforms.orbitDegrees, W=980,H=1030,cl=x=>Math.max(0,Math.min(1,x)),e=x=>{x=cl(x);return x*x*(3-2*x)},p=(f,a,b)=>e((f-a)/(b-a)),mix=(a,b,u)=>a+(b-a)*u;
 const r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.setSize(W,H,false);r.setPixelRatio(1);r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.07;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.setClearColor(0,0);mount.append(r.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-5,5,5*H/W,-5*H/W,.1,100),root=new T.Group();scene.add(root);
 const colors={purple:'#9471ac',pale:'#d6c0de',gold:'#e6ba78',cream:'#ead9c5',ink:'#514159',red:C.palette.colorRoles.risk};let meshes=0;
 const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:C.material.roughness,metalness:0})]));
 scene.add(new T.HemisphereLight(0xfff4e8,0xbca8ca,C.lighting.lightAssignments.ambient));const sun=new T.DirectionalLight(0xfff1de,C.lighting.lightAssignments.key);sun.position.set(...C.lighting.lightAssignments.direction);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:30});sun.shadow.normalBias=.03;scene.add(sun);const fill=new T.DirectionalLight(0xe8e1ff,1.5);fill.position.set(7,3,-6);scene.add(fill);
 function mesh(parent,geo,mat){let m=new T.Mesh(geo,materials[mat]);m.castShadow=m.receiveShadow=true;parent.add(m);meshes++;return m;}
 const box=(g,w,h,d,mat,rad=.13)=>mesh(g,new RoundedBoxGeometry(w,h,d,4,Math.min(rad,w*.4,h*.4,d*.4)),mat);
 function group(){let g=new T.Group();root.add(g);return g;}
 const floor=new T.Mesh(new T.PlaneGeometry(40,25),new T.ShadowMaterial({color:C.lighting.shadowRules.color,opacity:C.lighting.shadowRules.opacity}));floor.rotation.x=-Math.PI/2;floor.position.y=-.14;floor.receiveShadow=true;root.add(floor);
 function base(g,radius=1.3){let m=mesh(g,new T.CylinderGeometry(radius,radius+.08,.18,64),'cream');m.position.y=-.04;return m;}
 function headphones(){const g=group();base(g);const arch=mesh(g,new T.TorusGeometry(.72,.11,20,64,Math.PI),'purple');arch.position.y=1.2;for(const s of[-1,1]){let cup=box(g,.45,.83,.48,'purple');cup.position.set(s*.73,.88,0);let pad=box(g,.15,.65,.39,'pale',.06);pad.position.set(s*.51,.88,.04);}return g;}
 const h=headphones(),extra=headphones();extra.children[0].visible=false;
 const food=group();base(food);let bag=box(food,1.25,1.12,.75,'pale',.15);bag.position.y=.66;const handle=mesh(food,new T.TorusGeometry(.37,.09,16,40,Math.PI),'purple');handle.position.set(0,1.22,0);for(let i=0;i<3;i++){const pack=box(food,.25,.42,.25,i%2?'gold':'cream',.05);pack.position.set((i-1)*.32,1.3,0);}
 const capital=group();base(capital,1.55);const tray=box(capital,2.8,.18,1.75,'purple');tray.position.y=.14;const units=[];for(let i=0;i<C.representation.objectGeometry.unitCount;i++){let m=box(capital,.53,.14,.58,'gold',.05);m.position.set(-.96+(i%4)*.64,.34,Math.floor(i/4)*.75-.38);units.push(m);}
 // A thick hinged enclosure behind the unchanged principal tray.
 const enclosure=new T.Group();capital.add(enclosure);enclosure.position.set(0,.26,-1.16);const pad=box(enclosure,2.3,.16,1.2,'pale');pad.position.y=.1;const hinge=new T.Group();enclosure.add(hinge);hinge.position.set(0,.2,-.64);const lid=box(hinge,2.35,1.05,1.34,'purple',.2);lid.position.set(0,.45,.62);const warning=new T.Group();enclosure.add(warning);let stem=box(warning,.16,.47,.16,'red',.06);stem.position.y=.58;let dot=mesh(warning,new T.SphereGeometry(.11,20,12),'red');dot.position.y=.18;warning.position.z=.18;
 const debt=group();base(debt,1.4);const blocks=[];for(let i=0;i<C.representation.objectGeometry.debtCount;i++){const m=box(debt,2.1,.28,1.25,i%2?'pale':'purple',.1);m.position.set(0,.23+i*.31,0);blocks.push(m);}
 const slash=new T.Group();root.add(slash);const ring=mesh(slash,new T.TorusGeometry(1.03,.055,12,64),'red');ring.position.y=1.06;const sl=box(slash,2.0,.08,.08,'red',.035);sl.rotation.z=.85;sl.position.set(0,1.06,.07);
 const graph=group();const points=[[-1.4,.2,0],[-.7,.8,0],[0,.65,0],[.8,1.5,0],[1.4,1.9,0]],segments=[];function tube(a,b,mat){a=new T.Vector3(...a);b=new T.Vector3(...b);let m=mesh(graph,new T.CylinderGeometry(.05,.05,a.distanceTo(b),16),mat);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return m;}for(let i=1;i<points.length;i++)segments.push(tube(points[i-1],points[i],'purple'));const drop=tube(points.at(-1),[2.0,.1,0],'red');
 let last=null;
 function draw(f){
  const A=C.motion.actionWindows,opening=p(f,90,124),ending=p(f,918,960);mount.style.opacity=opening;
  let tx=0,ty=.8,span=10,yaw=angles[0],rootY=0;
  if(f>=149&&f<388){let focus=f<198?-3:f<224?0:f<266?3:0;let prev=f<198?0:f<224?-3:f<266?0:3;let start=f<198?149:f<224?198:f<266?224:266;tx=mix(prev,focus,p(f,start,start+15));span=f<266?mix(start===149?10:6,6,p(f,start,start+15)):7;}
  if(f>=388&&f<461){tx=mix(0,0,p(f,388,410));span=10;yaw=angles[0];}
  if(f>=461&&f<563){tx=-3;span=5.8;yaw=angles[1];}
  if(f>=563&&f<616){tx=mix(-3,0,p(f,563,582));span=mix(5.8,8.2,p(f,563,582));yaw=mix(angles[1],0,p(f,563,582));}
  if(f>=616&&f<856){tx=0;span=mix(8.2,5.8,p(f,616,640));yaw=mix(0,angles[2],p(f,686,716));}
  if(f>=856&&f<898){tx=mix(0,3,p(f,856,868));span=5.8;yaw=angles[2];}
  if(f>=898){tx=mix(3,0,p(f,898,930));span=mix(5.8,10,p(f,898,940));yaw=mix(angles[2],0,p(f,898,945));rootY=-3.25*ending;}
  root.position.y=rootY;root.rotation.y=0;
  h.position.set(f>=563&&f<616?-2.1:-3,0,0);h.rotation.set(0,.08,0);h.scale.setScalar(1);
  extra.visible=f>=461&&f<563;const take=p(f,461,482),reject=p(f,516,538);extra.position.set(-3+mix(3.4,1.85,take)+reject*4.8,Math.sin(Math.PI*take)*1.3+Math.sin(Math.PI*reject)*1.1,.45);extra.rotation.set(0,reject*1.7,.12*take);extra.scale.setScalar(.68);
  food.visible=f>=563&&f<616;food.position.set(2.1,0,0);
  capital.position.set(0,0,0);capital.rotation.set(0,0,0);capital.scale.setScalar(1);
  enclosure.visible=f>=686&&f<856;const reveal=p(f,...A.riskReveal);hinge.rotation.x=-1.85*reveal;warning.visible=f>=751;warning.scale.setScalar(p(f,751,755));
  if(f>=310&&f<388){capital.rotation.z=-.06*p(f,...A.loss);capital.position.y=-.12*p(f,...A.loss);}
  debt.position.set(3,0,0);debt.scale.setScalar(1);for(let i=0;i<blocks.length;i++){let u=i>=2&&f>=856?p(f,856+(5-i)*3,872+(5-i)*3):0;let m=blocks[i];m.visible=u<1;m.position.set(u*4.2,.23+i*.31+Math.sin(Math.PI*u)*1.4,u*.6);m.rotation.set(0,u*.6,u*.55);}
  graph.visible=f>=266&&f<349;graph.position.set(0,0,1.4);drop.visible=f>=310;
  slash.visible=f>=466&&f<538;slash.position.copy(extra.position);slash.position.z+=.25;slash.rotation.copy(extra.rotation);slash.scale.setScalar(extra.scale.x*p(f,...A.cut));
  h.visible=f<686||f>=898;capital.visible=f<461||f>=616;debt.visible=f<461||f>=856;
  if(f>=783&&f<856){enclosure.position.set(p(f,783,804)*-3.3,.26,-1.16);enclosure.rotation.y=p(f,783,804)*-.5;}else{enclosure.position.set(0,.26,-1.16);enclosure.rotation.y=0;}
  const rad=yaw*Math.PI/180,distance=14;camera.left=-span/2;camera.right=span/2;camera.top=span/2*H/W;camera.bottom=-span/2*H/W;camera.position.set(tx+Math.sin(rad)*distance,ty+8,Math.cos(rad)*distance);camera.lookAt(tx,ty,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();root.updateMatrixWorld(true);if(!window.FILM_AUDIT_GEOMETRY)r.render(scene,camera);
  last={real3D:true,meshes,span,yaw,target:[tx,ty,0],rootY,hingeRadians:hinge.rotation.x,principalUnits:units.length,debtUnits:f>=882?2:6,roughness:C.material.roughness,extraPosition:extra.position.toArray(),extraVisible:extra.visible,slashPosition:slash.position.toArray(),slashVisible:slash.visible,slashTracksExtra:true};return last;
 }
 draw(0);return{draw};
}
