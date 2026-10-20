import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const plugin=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const library=path.join(plugin,'choreography-library');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const systems=()=>read(path.join(library,'systems.json'));
export function system(id){
 const result=systems().systems.find(s=>[s.id,s.key,s.name].includes(id));
 if(!result)throw Error('未登记编排:'+id);
 return result;
}
export function compositionRecipe(style,o={}){
 const mapping=read(path.join(library,'style-map.json')).styles.find(s=>s.key===style.key);
 if(o.composition&&o.system&&o.composition!==o.system)throw Error('composition与system不能指定不同编排');
 const requested=o.composition||o.system||'auto';
 const selected=system(requested==='auto'?(mapping?.primarySystem||'C01'):requested);
 const kind=o.kind;
 if(kind&&!['statement','judgment','closing','comparison','evidence','process','cause','list','spatial'].includes(kind))throw Error('未知内容关系:'+kind);
 const primary=selected.id===mapping?.primarySystem;
 return {
  selectedSystem:selected,
  selection:requested==='auto'?(mapping?'画风主搭配；仍需代理根据本片语义判断':'待选起点，尚无该画风已验证的主搭配'):'用户指定编排',
  primarySystem:mapping?.primarySystem||null,
  validation:primary?(mapping.fullFilmRepresentative?'代表方案已完成固定素材整片实测':'已完成固定素材原生样帧；本编排新版整片未逐条验收'):'自由组合候选，需本片样帧和视频验证',
  contentFit:kind&&!selected.contentKinds.includes(kind)?'主编排未覆盖该关系，优先比较候选':'根据真实材料、字数与阅读窗口落实',
  alternatives:kind?systems().systems.filter(s=>s.id!==selected.id&&s.contentKinds.includes(kind)).map(s=>({id:s.id,name:s.name,reason:s.decision})):[],
  scope:'12套跨模块基础系统；不改变14排版/14动效/10剪辑/10声音的原有配方数量；不代表100×12组合全部验收。'
 };
}
export function installCompositionExample(project,style,o){
 const selection=compositionRecipe(style,o),manifest=read(path.join(library,'manifest.json'));
 if(sha(path.join(project,'assets/master.mp4'))!==manifest.masterSha256)throw Error('编排复现仅支持固定样例；新素材必须重新设计');
 fs.cpSync(path.join(library,'examples',style.key),path.join(project,'plans'),{recursive:true});
 const primary=selection.selectedSystem.id===selection.primarySystem;
 if(!selection.primarySystem)throw Error('该新方向尚无编排样例；请用--source按本片内容设计');
 const versions=read(path.join(library,'source-versions.json'));
 const directorSha=primary?versions[style.key].directorSha256:manifest.alternateDirectorSha256;
 if(!primary){
  const plan=read(path.join(project,'plans/choreography.json'));
  plan.choreography=selection.selectedSystem;
  fs.writeFileSync(path.join(project,'plans/choreography.json'),JSON.stringify(plan,null,2));
  for(const name of ['layout-plan','motion-plan','edit-plan']){
   const filename=path.join(project,'plans',name+'.json'),p=read(filename);
   p.compositionStudy={...p.compositionStudy,system:selection.selectedSystem.id,key:selection.selectedSystem.key,intent:selection.selectedSystem.intent,spatial:selection.selectedSystem.states,motion:selection.selectedSystem.motion,visualEditing:selection.selectedSystem.editing,revision:'candidate-cross-combination'};
   fs.writeFileSync(filename,JSON.stringify(p,null,2));
  }
 }
 const director=path.join(library,'directors',directorSha+'.js');
 if(sha(director)!==directorSha)throw Error('编排实现文件哈希不同');
 fs.copyFileSync(director,path.join(project,'scripts/director.js'));
 fs.copyFileSync(path.join(library,'build-project.mjs'),path.join(project,'scripts/build-project.mjs'));
 return {...selection,fixture:true,directorSha256:directorSha,status:'planned-unrendered',priorEvidenceIsNotCurrentDelivery:true};
}
export function checkCompositionLibrary(){
 const lib=systems(),map=read(path.join(library,'style-map.json')).styles,versions=read(path.join(library,'source-versions.json')),manifest=read(path.join(library,'manifest.json'));
 if(lib.systems.length!==manifest.systems||map.length!==manifest.nativeMappings||new Set(map.map(s=>s.key)).size!==map.length)throw Error('编排数量或唯一性不符');
 if(sha(path.join(library,'directors',manifest.alternateDirectorSha256+'.js'))!==manifest.alternateDirectorSha256)throw Error('候选组合源码哈希不同');
 const styles=read(path.join(plugin,'style-library/catalog.json')).styles;
 for(const row of map){
  if(!styles.some(s=>s.id===row.id&&s.key===row.key))throw Error('画风与编排编号不对应:'+row.key);
  system(row.primarySystem);
  const v=versions[row.key];
  if(!v||sha(path.join(library,'directors',v.directorSha256+'.js'))!==v.directorSha256)throw Error('编排源码缺失:'+row.key);
  for(const name of ['brief','art-direction','layout-plan','motion-plan','edit-plan','choreography'])if(!fs.existsSync(path.join(library,'examples',row.key,name+'.json')))throw Error('编排方案缺失:'+row.key+'/'+name);
 }
 return {systems:lib.systems.length,nativeMappings:map.length,fullFilmRepresentatives:map.filter(s=>s.fullFilmRepresentative).length,compositePixelExact:manifest.nativeCompositeExact};
}
