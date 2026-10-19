import * as T from'./vendor/three.module.js';
const polygons={bag:[[-.95,0],[.95,0],[.77,1.5],[.48,1.5],[.48,1.93],[-.48,1.93],[-.48,1.5],[-.77,1.5]],shield:[[-1,1.5],[0,1.97],[1,1.5],[.79,.5],[0,0],[-.79,.5]],coin:Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return[Math.cos(a)*.95,1+Math.sin(a)*.95]}),weight:[[-1,0],[1,0],[.7,1.32],[.34,1.32],[.34,1.8],[-.34,1.8],[-.34,1.32],[-.7,1.32]]};
const circle=(x,y,r)=>Array.from({length:32},(_,i)=>[x+r*Math.cos(i*Math.PI/16),y+r*Math.sin(i*Math.PI/16)]),holes=kind=>kind==='bag'?[[[-.29,1.53],[.29,1.53],[.29,1.75],[-.29,1.75]]]:kind==='weight'?[circle(0,1.57,.16)]:[];
function path(points,Shape=T.Shape){const p=new Shape();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p}
function shape(kind){const s=path(polygons[kind]);s.holes=holes(kind).map(p=>path(p,T.Path));return s}
function intervals(kind,x){const ys=[];for(const points of[polygons[kind],...holes(kind)])for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[0]<=x&&b[0]>x)||(b[0]<=x&&a[0]>x))ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]));}ys.sort((a,b)=>a-b);return Array.from({length:Math.floor(ys.length/2)},(_,i)=>[ys[i*2],ys[i*2+1]])}
export function makePaperModels(canvas,P,mode){
 const corr=mode==='corrugated',renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(952,400,false);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),aspect=952/400,h=4.8,camera=new T.OrthographicCamera(-h*aspect/2,h*aspect/2,h/2,-h/2,.1,80);camera.position.set(.4,5.7,8.2);camera.lookAt(0,.9,0);scene.add(new T.HemisphereLight(0xfffbef,0x9d9076,2.7));const light=new T.DirectionalLight(0xffffff,3.4);light.position.set(-5,8,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:6,bottom:-5});light.shadow.bias=-.001;scene.add(light);
 const floor=new T.Mesh(new T.PlaneGeometry(23,18),new T.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=corr?-.03:-.12;floor.receiveShadow=true;scene.add(floor);
 let seed=48971;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const data=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=210+Math.round(random()*28)-((x+2*y)%29===0?17:0);for(let c=0;c<3;c++)data[(y*128+x)*4+c]=n;data[(y*128+x)*4+3]=255;}
 const fibre=new T.DataTexture(data,128,128,T.RGBAFormat);fibre.needsUpdate=true;fibre.wrapS=fibre.wrapT=T.RepeatWrapping;fibre.repeat.set(3,3);
 const colors={bag:0xb75c3c,shield:0x566a52,coin:0xd6a647,weight:0x61716b},mat=c=>new T.MeshStandardMaterial({color:c,roughness:1,metalness:0,side:T.DoubleSide}),paper=mat(0xf4edd9),edge=mat(0xe5dbc4),kraft=new T.MeshStandardMaterial({color:0xb69160,map:fibre,roughness:1,side:T.DoubleSide}),coreMat=mat(0xcbb185),ink=mat(0x4d3825),glyph=mat(corr?0x4e3926:0xfaf1dc),panels=[],books={},groups={};
 function box(parent,w,h,d,material,x=0,y=0,z=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function symbol(parent,kind,z){const bar=(w,h,x,y,a=0)=>{const b=box(parent,w,h,.016,glyph,x,y,z);b.rotation.z=a;};if(kind==='shield'){bar(.12,.55,-.25,.91,.78);bar(.12,1.02,.2,1.05,-.61)}else if(kind==='coin'){const r=new T.Mesh(new T.RingGeometry(.65,.69,48),glyph);r.position.set(0,1,z);parent.add(r);bar(.07,.7,0,1);bar(.36,.06,0,1.35);bar(.36,.06,0,.65)}else if(kind==='weight')bar(.92,.05,0,.42);}
 function cutout(kind){const g=new T.Group(),s=shape(kind);
  if(corr){
   const geo=new T.ExtrudeGeometry(s,{depth:.027,bevelEnabled:false,curveSegments:32});for(const z of[-.19,.163]){const board=new T.Mesh(geo,kraft);board.position.z=z;board.castShadow=board.receiveShadow=true;g.add(board)}
   const verts=[];for(let i=0;i<160;i++){const x0=-1.03+i*2.06/160,x1=-1.03+(i+1)*2.06/160,mid=(x0+x1)/2,z0=.161*Math.sin(x0*37),z1=.161*Math.sin(x1*37);for(const[lo,hi]of intervals(kind,mid)){verts.push(x0,lo,z0,x1,lo,z1,x1,hi,z1,x0,lo,z0,x1,hi,z1,x0,hi,z0)}}
   const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(verts,3));cg.computeVertexNormals();const core=new T.Mesh(cg,coreMat);core.castShadow=core.receiveShadow=true;g.add(core);symbol(g,kind,.198);
  }else{const f=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false,curveSegments:32}),[mat(colors[kind]),edge]);f.castShadow=f.receiveShadow=true;g.add(f);symbol(g,kind,.045);}
  return g;
 }
 function book(group){const left=new T.Group(),right=new T.Group();group.add(left,right);box(left,4,.07,3.4,paper,-2,0,0);box(right,4,.07,3.4,paper,2,0,0);box(group,.1,.035,3.42,edge,0,.01,0);const lineMat=mat(0xcabca1);for(let i=0;i<5;i++)box(group,8.03,.016,3.43,lineMat,0,-.035-i*.018,0);return{left,right}}
 const configs={chain:[['bag',-2.2,1,P.triggers.consume],['coin',2.2,1,P.triggers.invest]],overview:[['bag',-2.8,.75,0],['shield',0,.75,0],['weight',2.8,.75,0]],spend:[['bag',-2.25,1.1,0],['shield',2.25,1.1,0]],risk:[['coin',0,1.05,0],['shield',0,1.25,P.triggers.risk]],debt:[['weight',-2.4,1.15,0]]};
 for(const[id,objects]of Object.entries(configs)){const group=new T.Group();scene.add(group);groups[id]=group;if(!corr)books[id]=book(group);
  for(const[kind,x,size,at]of objects){const hinge=new T.Group(),card=cutout(kind);hinge.add(card);hinge.scale.setScalar(size);hinge.position.set(x,corr?0:.06,corr?0:.8);(corr?group:x<-.1?books[id].left:x>.1?books[id].right:group).add(hinge);const supportGeo=new T.BufferGeometry();supportGeo.setAttribute('position',new T.Float32BufferAttribute(new Array(9).fill(0),3));const support=new T.Mesh(supportGeo,edge);support.castShadow=true;if(!corr)hinge.add(support);panels.push({id,kind,hinge,card,support,x,size,at});}
 }
 return{render(t,id,age,frame){
  const start=P.scenes.find(s=>s.id===id)?.startFrame??0,opening=1-(1-Math.max(0,Math.min(1,(age-.05)/.65)))**3;
  for(const[k,g]of Object.entries(groups)){g.visible=k===id;if(!corr){books[k].left.rotation.z=-.04-.65*(1-opening);books[k].right.rotation.z=.04+.65*(1-opening)}else{g.rotation.y=-.44;g.rotation.x=.04;}}
  for(const p of panels){const at=p.at||start+7,u=1-(1-Math.max(0,Math.min(1,(frame-at)/15)))**3;p.hinge.visible=p.id===id&&frame>=at;
   if(corr){p.card.position.y=.3*(1-u);p.hinge.rotation.y=-.16*(1-u);p.card.position.z=.12*(1-u)}
   else{const a=-Math.PI/2*(1-u*opening);p.card.rotation.x=a;const ar=p.support.geometry.attributes.position;ar.setXYZ(0,-.54,.002,-.7);ar.setXYZ(1,.54,.002,-.7);ar.setXYZ(2,0,Math.cos(a)*.9,Math.sin(a)*.9);ar.needsUpdate=true;p.support.geometry.computeVertexNormals();}
   if(id==='risk'&&p.kind==='coin')p.hinge.visible=frame<P.triggers.risk+15;
  }
  renderer.render(scene,camera);const anchors={};for(const p of panels)if(p.id===id){const v=p.hinge.getWorldPosition(new T.Vector3()).project(camera);anchors[p.kind]=(v.x*.5+.5)*952;}
  return{anchors,opening,mode,visiblePanels:panels.filter(p=>p.hinge.visible).length};
 }};
}
