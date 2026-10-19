import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildModels(canvas,P){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(952,700,false);renderer.setPixelRatio(1);renderer.setClearColor(0x0b131c,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,952/700,.1,70);camera.position.set(0,3.8,10.5);camera.lookAt(0,.5,0);
 scene.add(new THREE.HemisphereLight(0xb1efff,0x162131,2.4));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-4,6,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.bias=-.001;scene.add(key);const rim=new THREE.DirectionalLight(0x53dfe3,3);rim.position.set(4,1,-4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,18),new THREE.ShadowMaterial({opacity:.32}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.22;floor.receiveShadow=true;scene.add(floor);
 const steel=new THREE.MeshStandardMaterial({color:0x7a94a5,metalness:.68,roughness:.28}),dark=new THREE.MeshStandardMaterial({color:0x1a3445,metalness:.55,roughness:.35}),gold=new THREE.MeshStandardMaterial({color:0xd6b466,metalness:.65,roughness:.25}),cyan=new THREE.MeshStandardMaterial({color:0x8bf4f7,emissive:0x49a6ba,emissiveIntensity:.6,metalness:.4,roughness:.25});
 const edgeMat=new THREE.LineBasicMaterial({color:0x7be3e9,transparent:true,opacity:.7});
 function mesh(g,m,parent,x=0,y=0,z=0,edge=true){const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);if(edge){const e=new THREE.LineSegments(new THREE.EdgesGeometry(g,25),edgeMat);a.add(e)}return a}
 const box=(w,h,d,m,p,x=0,y=0,z=0)=>mesh(new RoundedBoxGeometry(w,h,d,2,.055),m,p,x,y,z);
 function coin(parent,x,y,z,s=1){const c=new THREE.Group();c.position.set(x,y,z);c.scale.setScalar(s);parent.add(c);const cmesh=mesh(new THREE.CylinderGeometry(.47,.47,.11,36),gold,c);cmesh.rotation.x=Math.PI/2;const ring=mesh(new THREE.TorusGeometry(.35,.016,5,36),cyan,c,0,0,.068,false);return c}
 function wallet(parent,x,y,z,s=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);box(1.5,1.05,.4,dark,g);box(1.36,.82,.06,steel,g,0,0,.24);box(.48,.28,.15,dark,g,.6,0,.31);mesh(new THREE.CylinderGeometry(.07,.07,.1,16),cyan,g,.61,0,.43).rotation.x=Math.PI/2;coin(g,-.2,.25,.37,.48);return g}
 function weight(parent,x,y,z,s=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);box(1.35,1.2,.7,dark,g,0,-.2,0);mesh(new THREE.TorusGeometry(.33,.09,8,32),steel,g,0,.55,0);box(.83,.48,.04,steel,g,0,-.2,.38);return g}
 function safe(parent,x,y,z,s=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);box(1.85,1.85,1.25,dark,g);box(1.6,1.6,.1,steel,g,0,0,.68);const pivot=new THREE.Group();pivot.position.set(-.73,0,.78);g.add(pivot);box(1.48,1.46,.15,dark,pivot,.73,0,0);mesh(new THREE.CylinderGeometry(.38,.38,.1,36),steel,pivot,.73,0,.14).rotation.x=Math.PI/2;for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const spoke=box(.54,.08,.1,cyan,pivot,.73+Math.cos(a)*.15,Math.sin(a)*.15,.23);spoke.rotation.z=a}coin(g,0,0,.84,.9);return {g,pivot}}
 const groups={},animated={};for(const id of ['chain','overview','spend','risk','debt']){const g=new THREE.Group();scene.add(g);groups[id]=g;}
 animated.wallet=wallet(groups.chain,-2.75,.2,0,1);animated.coin=coin(groups.chain,0,.2,0,1.3);animated.loss=coin(groups.chain,2.8,.2,0,1.3);
 wallet(groups.overview,-2.8,.1,0);safe(groups.overview,0,.2,0,.75);weight(groups.overview,2.8,.1,0);
 animated.want=wallet(groups.spend,-2.2,.3,0,1.45);animated.need=safe(groups.spend,2.2,.3,0,.95);
 animated.safe=safe(groups.risk,0,.2,0,1.6);animated.safe.pivot.rotation.y=-.7;
 animated.debt=weight(groups.debt,0,.2,0,1.7);
 const wire=mesh(new THREE.IcosahedronGeometry(1.95,0),new THREE.MeshBasicMaterial({color:0x7be3e9,wireframe:true,transparent:true,opacity:.18}),groups.risk,0,.2,0,false);
 const clamp=x=>Math.max(0,Math.min(1,x)),out=x=>1-Math.pow(1-clamp(x),3);
 function render(t,id){for(const [k,g]of Object.entries(groups))g.visible=k===id;const s=P.scenes.find(s=>s.id===id),age=s?t-s.startFrame/30:0,entry=out((age-.35)/.65);const group=groups[id];if(group){group.position.y=-.18*(1-entry);group.scale.setScalar(.94+.06*entry);group.rotation.y=-.22+.07*Math.sin(Math.min(age,4)*.6)}
  if(id==='chain'){animated.loss.position.y=.2-.65*out((t-P.triggers.loss/30)/.55);animated.loss.rotation.z=-.32*out((t-P.triggers.loss/30)/.55);animated.coin.rotation.y=.45;animated.wallet.rotation.y=-.15;}
  if(id==='spend'){animated.want.rotation.y=.12;animated.need.g.rotation.y=-.22;animated.need.pivot.rotation.y=0;}
  if(id==='risk'){const u=out((t-P.triggers.risk/30)/.65);animated.safe.pivot.rotation.y=-1.0*(1-u);wire.rotation.y=age*.1;wire.material.opacity=.22*(1-u)+.07;}
  if(id==='debt'){animated.debt.position.y=.2+.8*out(age/.35);animated.debt.scale.setScalar(1.7-.45*out(age/.4));}
  renderer.render(scene,camera);
 }
 render(0,'hook');return {render};
}
