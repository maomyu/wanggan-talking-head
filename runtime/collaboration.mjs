import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {resolveRecipe,planChange,compileScenes} from './composition-core.mjs';
import {orchestrations,loadOrchestration,selectOrchestration,orchestrationAxes,checkEventTiming} from './orchestration.mjs';
import {loadCombination,combinationOptions} from './combinations.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,d)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n')};
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const data=n=>read(path.join(root,'registry',n+'.json'));
export const axes=data('axes');
export const policy=data('policy');
export const standards=data('standards');
// Families are the canonical visual-language records. Referencing Fxx directly
// avoids inventing another set of near-duplicate art-style standards.
const availableStandards=[...standards,...data('families').map(f=>({id:f.id,axis:'art-style',name:f.name,definition:f.definition,identityRules:f.identityRules,familyIds:[f.id],provides:[],requiresAny:[],availability:'family-reference'}))];
const keys=read(path.join(root,'recipes/index.json')).recipes.filter(r=>r.status==='user-approved').map(r=>r.id);
export function catalog(kind,id){
 if(kind==='orchestrations'&&id)return loadOrchestration(id);
 const rows=kind==='recipes'?read(path.join(root,'recipes/index.json')).recipes:kind==='orchestrations'?orchestrations():kind==='standards'?standards:data(kind);
 if(!id)return rows;
 const found=rows.find(r=>[r.id,r.name,r.key,r.legacyKey,r.defaultLegacyKey].includes(id));
 if(!found)throw Error('未登记'+kind+': '+id);return found;
}
export function loadRecipe(value='minimal'){
 if(value&&typeof value==='object')return structuredClone(value);
 const row=catalog('recipes').find(r=>[r.id,r.name,...(r.aliases||[])].includes(value));
 const f=row?path.join(root,'recipes',row.id+'.json'):path.resolve(value);
 if(!fs.existsSync(f))throw Error('未知配方ID或文件: '+value);return read(f);
}
export function resolve(value){
 const recipe=typeof value==='string'?loadRecipe(value):value;
 const result=resolveRecipe(recipe,axes,availableStandards,policy),h=recipe.hierarchy;
 if(!h)result.errors.push('配方需要hierarchy.familyId；分支和组件不能冒充母画风');
 else{
  const family=data('families').find(f=>f.id===h.familyId);
  if(!family)result.errors.push('未知母画风: '+h.familyId);
  if(h.branchId&&!data('branches').some(b=>b.id===h.branchId&&b.familyId===h.familyId))result.errors.push('分支不属于所选母画风');
  for(const id of h.components??[])if(!data('components').some(c=>c.id===id))result.errors.push('未知组件: '+id);
  const art=result.selections?.['art-style']?.[0];
  if(art?.familyIds&&!art.familyIds.includes(h.familyId))result.errors.push('主画风标准与母画风身份不兼容');
 }
 const classification=h?{family:data('families').find(f=>f.id===h.familyId),branch:h.branchId?data('branches').find(b=>b.id===h.branchId):null,components:(h.components??[]).map(id=>data('components').find(c=>c.id===id)).filter(Boolean)}:null;
 return {...result,ok:result.errors.length===0,hierarchy:h,classification,recipe};
}
export function change(axesToChange){return planChange(axesToChange,axes)}
export function compile(value,plan,project){
 const recipe=typeof value==='string'?loadRecipe(value):value,selection=resolve(recipe);
 const result=compileScenes(recipe,plan,axes,availableStandards,policy);
 result.errors.push(...selection.errors.filter(e=>!result.errors.includes(e)));
 if(plan?.source?.path){const p=path.resolve(project||process.cwd(),plan.source.path);if(!fs.existsSync(p)||hash(p)!==plan.source.sha256)result.errors.push('实际源片SHA256与场景计划不一致');}
 result.ok=result.errors.length===0;return result;
}
export function collaborationRoute(request='',requested,orchestration){
 const arrangement=selectOrchestration(request,orchestration);
 let selected=requested?String(requested).split(','):[];
 if(!selected.length){
  const active=request.split(/[，。；,;\n]/).filter(s=>!/^\s*(保留|沿用|保持|不改|别改|不要改|维持)/.test(s)).join('，');
  const signals={'art-style':/画风|风格/,palette:/配色|颜色/,material:/材质|纹理/,representation:/造型|模型|载体/,'object-motion':/动效|动画|运动/,camera:/镜头|机位|景别/,transition:/转场|衔接/,typography:/排版|字幕|字体|字号|标题|构图/,lighting:/光影|照明|投影/,information:/文案|内容关系|因果|对比|信息组织/,rhythm:/节奏|读窗|停留/};
  selected=Object.entries(signals).filter(([,rx])=>rx.test(active)).map(([id])=>id);
  // A stated single-module boundary owns the route; later clauses can describe
  // a goal such as “让对比更早落定”, which does not rewrite information design.
  const boundaries=[...active.matchAll(/(?:^|，)\s*(?:只|仅)(?:调整|修改|改动|改)?(.+?)(?=[：:，]|$)/g)];
  const scoped=boundaries.map(m=>Object.entries(signals).filter(([,rx])=>rx.test(m[1].split(/让|使|以便/)[0])).map(([id])=>id)).find(ids=>ids.length);
  if(scoped)selected=scoped;
  // “只使用自己的口播” is a source rule, not a single-module boundary.
  if(!selected.length||!scoped&&/制作|重做|做一条|做个|生成/.test(active)&&/完整|整片|口播/.test(active))selected=axes.map(a=>a.id);
  if(arrangement&&!scoped&&/(?:只|仅)(?:修改|改|换|调整)?编排|把编排改|编排(?:换|改)|改成[^，。]*编排/.test(active))selected=orchestrationAxes;
  if(arrangement&&arrangement.id!=='auto'&&selected.length===11&&!/制作|重做|做一条|做个|生成|完整|整片/.test(active))selected=orchestrationAxes;
 }
 if(selected.some(id=>!axes.some(a=>a.id===id)))throw Error('未知十一类技能: '+selected.join(','));
 return {scope:selected.length===11?'full':'module',axes:selected,orchestration:arrangement,change:change(selected),requiredSkills:axes.filter(a=>selected.includes(a.id)).map(a=>({axis:a.id,path:path.join(root,'skills',a.skill,'SKILL.md')})),requiredReferences:[path.join(root,'docs/智能体自由搭配流程.md'),path.join(root,'docs/编排选择与局部节奏.md'),path.join(root,'docs/八类编排机制.md')],entry:path.join(root,'skills/talking-head-composition/SKILL.md'),policy};
}
export function selectRecipe(o){
 let recipe=loadRecipe(o.recipe);
 if(o.branch){const b=data('branches').find(b=>b.id===o.branch);if(!b||b.familyId!==recipe.hierarchy.familyId)throw Error('分支不属于所选母画风');const row=catalog('recipes').find(r=>r.hierarchy.branchId===b.id);if(row)recipe=loadRecipe(row.id);recipe.hierarchy.branchId=b.id;recipe.branchDesign={...b,status:'requires-current-project-adaptation'};}
 if(o.components)recipe.hierarchy.components=String(o.components).split(',').filter(Boolean);
 const check=resolve(recipe);if(!check.ok)throw Error(check.errors.join('; '));return recipe;
}
export function outsidePlugin(value){
 const dest=path.resolve(value);let existing=dest;while(!fs.existsSync(existing))existing=path.dirname(existing);
 const real=path.resolve(fs.realpathSync(existing),path.relative(existing,dest)),base=fs.realpathSync(root);
 if(real===base||real.startsWith(base+path.sep))throw Error('制作工程放插件目录之外');return dest;
}
function emptyProject(o){
 if(!o.project||!o.source)throw Error('需要 --project 新目录及 --source 自有视频');
 const dest=outsidePlugin(o.project),source=path.resolve(o.source);
 if(dest===root||dest.startsWith(root+path.sep))throw Error('制作工程放插件目录之外');
 if(fs.existsSync(dest))throw Error('目标已存在，不覆盖工程');
 if(!fs.statSync(source).isFile())throw Error('源片不存在');
 const recipe=selectRecipe(o);
 const orchestration=selectOrchestration(o.request||'',o.orchestration)||selectOrchestration('','auto');
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',source],{encoding:'utf8'}));
 for(const d of ['plans','assets/fonts','scripts','qa','outputs'])fs.mkdirSync(path.join(dest,d),{recursive:true});
 fs.copyFileSync(source,path.join(dest,'assets/master.mp4'),fs.constants.COPYFILE_FICLONE);
 if(o.transcript)fs.copyFileSync(path.resolve(o.transcript),path.join(dest,'assets/canonical-native.srt'));
 fs.copyFileSync(path.join(root,'assets/gsap.min.js'),path.join(dest,'assets/gsap.min.js'));
 write(path.join(dest,'project.json'),{schemaVersion:2,collaborationVersion:1,id:crypto.randomUUID(),name:path.basename(dest),recipeId:recipe.id,orchestration,status:'awaiting-design',renderer:'custom',request:o.request||'',sourcePolicy:read(path.join(root,'source-policy.json')),sourceSha256:hash(source),referenceFixture:false});
 write(path.join(dest,'orchestration.json'),orchestration.id==='auto'?orchestration:{...orchestration,profile:loadOrchestration(orchestration.id),status:'awaiting-content-design'});
 write(path.join(dest,'recipe.json'),recipe);write(path.join(dest,'source-info.json'),probe);
 write(path.join(dest,'source-ownership.json'),{sha256:hash(source),ownership:o['ownership-basis']?'user-confirmed':'verify-in-current-session',basis:o['ownership-basis']||'由制作代理继承当前用户的自有素材确认，运行器不凭文件名推断'});
 write(path.join(dest,'entry-selection.json'),{recipe:recipe.id,familyId:recipe.hierarchy.familyId,branchId:recipe.hierarchy.branchId||null,components:recipe.hierarchy.components||[],mode:'content-specific-production'});
 write(path.join(dest,'hyperframes.json'),{paths:{blocks:'compositions',components:'compositions/components',assets:'assets'},media:{autoProxy:true},authoringSkill:'general-video'});
 write(path.join(dest,'route.json'),collaborationRoute(o.request||'制作完整口播',null,o.orchestration));
 return {dest,recipe};
}
export function initCollaboration(o){
 o=combinationOptions(o);
 if(o.style||o.example||o.composition||o.system)throw Error('新配方入口使用--recipe；旧画风/编排入口单独使用，避免静默忽略选择');
 const {dest,recipe}=emptyProject(o);
 if(o.combination){
  const row=loadCombination(o.combination),p=read(path.join(dest,'project.json'));
  p.combinationGuidance={id:row.id,mode:'direction-only-new-content',reason:row.reason};write(path.join(dest,'project.json'),p);
 }
 for(const a of axes)write(path.join(dest,'plans',a.artifact),{status:'awaiting-design',axis:a.id,standards:recipe.selections[a.id],ownedFields:a.ownedFields});
 fs.writeFileSync(path.join(dest,'设计交接.md'),'按本次真实文案新建scene-plan.json、timing.json、plans/brief.json及十一份专业计划，落实对象、动作、可见结果和连续交接。实现scripts/build-project.mjs；构建生成index.html与edit-plan.json（原声EDL）。不要复制示例财经文案、耳机、数量或秒点。可复用配方语言与有效机制。原色人像、角落圆窗、字幕上移、一路原声；计划检查不代表已完成视频。读取正式插件docs/分类与配方.md和docs/协作合同.md。\n');
 fs.appendFileSync(path.join(dest,'设计交接.md'),'编排选择见orchestration.json及正式docs/编排选择与局部节奏.md。auto时代理按内容作选择并记录；明确选择优先。编排与画风分开，不复制参考人物尺寸或固定秒点。\n');
 return {project:dest,status:'awaiting-design',recipe:recipe.id,orchestration:read(path.join(dest,'orchestration.json')),axes:axes.map(a=>a.id),next:'根据新文案完成专业设计与帧函数，再run --project；不会直接套入参考片'};
}
export function reproduce(o){
 if(o.combination)return reproduceCombination(o);
 const recipe=selectRecipe(o);if(!keys.includes(recipe.id))throw Error('此配方没有正式复现实现');
 const choice=selectOrchestration(o.request||'',o.orchestration);
 if(choice?.id==='auto')throw Error('复现需要明确编排；自动判断用于新素材init');
 const profile=choice?loadOrchestration(choice.id):null,implementation=profile?.reference||recipe.implementation;
 if(profile&&recipe.id!==implementation.recipeId)throw Error('该编排的认可复现仅为'+(implementation.recipeId==='minimal'?'写实极简':implementation.recipeId)+'；其他配方组合请init后按内容适配');
 if(!o.source||hash(path.resolve(o.source))!==implementation.sourceSha256)throw Error('复现仅接受明确选择的原案例源片且哈希一致；换素材请用init --recipe重新设计');
 if(o.components)throw Error('案例复现不额外组合组件；使用init按本片内容适配');
 const {dest}=emptyProject({...o,recipe}),from=path.join(root,implementation.path);
 fs.cpSync(from,dest,{recursive:true});
 if(implementation.buildMode==='approved-mechanism-case'){
  fs.copyFileSync(path.join(root,'assets/recipe-images/life-objects.png'),path.join(dest,'assets/life-objects.png'));
  for(const name of ['NotoSansSC-500.woff','NotoSansSC-700.woff','NotoSerifSC-700.woff','OFL.txt','LICENSES.md'])fs.copyFileSync(path.join(root,'assets/fonts',name),path.join(dest,'assets/fonts',name));
  execFileSync('ffmpeg',['-v','error','-threads','2','-filter_threads','2','-y','-i',path.join(dest,'assets/master.mp4'),'-an','-vf','crop=1080:1080:0:180,scale=840:840','-frames:v','1100','-c:v','libx264','-crf','17','-preset','fast','-g','30','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dest,'assets/person-proxy.mp4')],{stdio:'pipe'});
  const p=read(path.join(dest,'project.json'));p.id=crypto.randomUUID();p.name=path.basename(dest);p.referenceFixture=true;p.status='reference-awaiting-rebuild';write(path.join(dest,'project.json'),p);
  return {project:dest,status:p.status,recipe:recipe.id,orchestration:p.orchestration,scope:'正式包独立源码；原案例SHA绑定复现，人物代理从明确提供的原片裁切且不调色；原声由EDL重建，未复制历史视频或QA作为新结果'};
 }
 if(!profile&&implementation.buildMode==='preserved-production-case'){
  fs.copyFileSync(path.join(root,'assets/recipe-images/life-objects.png'),path.join(dest,'assets/life-objects.png'));
  fs.cpSync(path.join(root,'assets/fonts'),path.join(dest,'assets/fonts'),{recursive:true});
  if(implementation.vendor)fs.cpSync(path.join(root,'runtime/recipe-vendor'),path.join(dest,'assets/vendor'),{recursive:true});
  const p=read(path.join(dest,'project.json'));p.referenceFixture=true;p.status='reference-awaiting-rebuild';p.orchestration=implementation.orchestration;p.timingContract=implementation.timingContract;p.productionReference={recipe:recipe.id,sourceSha256:implementation.sourceSha256,edlSha256:implementation.edlSha256,voiceSha256:implementation.voiceSha256};write(path.join(dest,'project.json'),p);
  write(path.join(dest,'entry-selection.json'),{recipe:recipe.id,familyId:recipe.hierarchy.familyId,branchId:recipe.hierarchy.branchId||null,mode:'explicit-source-bound-reference'});
  return {project:dest,status:p.status,recipe:recipe.id,scope:'正式库自带源码与资源；仅同源复现，未复制旧视频或QA作为新结果'};
 }

 if(recipe.implementation.photoAsset!==false)fs.copyFileSync(path.join(root,'assets/recipe-images/life-objects.png'),path.join(dest,'assets/life-objects.png'));
 fs.cpSync(path.join(root,'assets/fonts'),path.join(dest,'assets/fonts'),{recursive:true});
 if(recipe.id==='clay')fs.cpSync(path.join(root,'runtime/recipe-vendor'),path.join(dest,'assets/vendor'),{recursive:true});
 fs.copyFileSync(path.join(root,'runtime/recipe-build.mjs'),path.join(dest,'scripts/build-project.mjs'));
 const timing=read(path.join(dest,'timing.json'));
 write(path.join(dest,'plans/brief.json'),{width:timing.width,height:timing.height,fps:timing.fps,source:'explicit-approved-recipe-reference'});
 const p=read(path.join(dest,'project.json'));p.referenceFixture=true;p.status='planned-approved-recipe';if(profile)p.timingContract='symbolic-events-v1';write(path.join(dest,'project.json'),p);
 return {project:dest,status:p.status,recipe:recipe.id,orchestration:p.orchestration,scope:'仅明确选定的历史同源案例复现；新素材必须重新设计'};
}
function reproduceCombination(options){
 const o=combinationOptions(options),row=loadCombination(o.combination),impl=row.reference;
 if(o.branch||o.components)throw Error('组合案例复现不能改分支或组件；使用init按本片适配');
 if(!o.source||hash(path.resolve(o.source))!==impl.sourceSha256)throw Error('组合复现仅接受原案例源片且哈希一致；新素材请init --combination重新设计');
 const {dest}=emptyProject(o),from=path.join(root,impl.path);
 fs.cpSync(from,dest,{recursive:true});
 fs.copyFileSync(path.join(root,'assets/recipe-images/life-objects.png'),path.join(dest,'assets/life-objects.png'));
 for(const name of ['NotoSansSC-500.woff','NotoSansSC-700.woff','NotoSerifSC-700.woff','OFL.txt','NotoSerifSC-OFL.txt','LICENSES.md'])fs.copyFileSync(path.join(root,'assets/fonts',name),path.join(dest,'assets/fonts',name));
 if(impl.vendor)fs.cpSync(path.join(root,'runtime/recipe-vendor'),path.join(dest,'assets/vendor'),{recursive:true});
 execFileSync('ffmpeg',['-v','error','-threads','2','-filter_threads','2','-y','-i',path.join(dest,'assets/master.mp4'),'-an','-vf','crop=1080:1080:0:180,scale=840:840:flags=lanczos','-frames:v','1100','-c:v','libx264','-crf','17','-preset','fast','-g','30','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dest,'assets/person-proxy.mp4')],{stdio:'pipe'});
 const p=read(path.join(dest,'project.json'));p.id=crypto.randomUUID();p.name=path.basename(dest);p.status='reference-awaiting-rebuild';p.userApproved=false;p.productionReference={combination:row.id,sourceSha256:impl.sourceSha256,approvedVideoSha256:impl.videoSha256};write(path.join(dest,'project.json'),p);
 write(path.join(dest,'entry-selection.json'),{recipe:row.recipe,familyId:row.familyId,branchId:row.branchId,components:row.components,combinationId:row.id,mode:'explicit-source-bound-reference'});
 return {project:dest,status:p.status,combination:row.id,recipe:row.recipe,orchestration:p.orchestration,scope:'包内独立源码，原案例SHA绑定；从提供的原片裁切原色代理并重建原声，不复制旧视频作为新结果'};
}
export function validateProject(r){
 const p=read(path.join(r,'project.json'));if(!p.collaborationVersion)return null;
 if(p.orchestration){const selection=read(path.join(r,'orchestration.json'));if(selection.id!==p.orchestration.id)throw Error('编排选择与project.json不一致');if(selection.id!=='auto')loadOrchestration(selection.id);else throw Error('auto编排尚未完成判断：先用select-orchestration记录选择及文案理由');}
 const draft=axes.filter(a=>!fs.existsSync(path.join(r,'plans',a.artifact))||read(path.join(r,'plans',a.artifact)).status==='awaiting-design');
 if(draft.length)throw Error('十一类设计尚未完成: '+draft.map(a=>a.name).join(','));
 const plan=read(path.join(r,'scene-plan.json')),result=compile(read(path.join(r,'recipe.json')),plan,r);
 if(!result.ok)throw Error('场景计划未通过: '+result.errors.join('; '));
 if(plan.source.sha256!==p.sourceSha256)throw Error('场景计划没有绑定init所选源片');
 const t=read(path.join(r,'timing.json'));if(t.frameCount!==plan.frames||t.fps!==plan.fps)throw Error('场景计划与实际时间轴不一致');
 const caps=new Set((t.captions||[]).map(c=>c.id));if(plan.scenes.some(s=>s.sentenceIds.some(id=>!caps.has(id))))throw Error('场景引用未知字幕原句ID');
 result.eventTiming=checkEventTiming(r);write(path.join(r,'qa/scene-plan-check.json'),result);return result;
}
export function reviseCollaboration(o,old){
 const p=read(path.join(old,'project.json'));if(!p.collaborationVersion)return null;
 if(!o.axes&&!o.module&&!o.request&&!o.orchestration)throw Error('需要指定修改轴或实际需求');
 const newChoice=selectOrchestration(o.request||'',o.orchestration);
 const selected=String(o.axes||o.module||(newChoice?orchestrationAxes.join(','):collaborationRoute(o.request||'').axes.join(','))).split(',').filter(Boolean),impact=change(selected);
 if(newChoice&&orchestrationAxes.some(a=>!selected.includes(a)))throw Error('选择新编排需联动信息、造型、排版、动作、镜头、转场、节奏；仅改节奏请保留已有编排');
 if(!o.out)throw Error('需要 --out 新版本目录');const dest=outsidePlugin(o.out);
 if(fs.existsSync(dest)||dest.startsWith(old+path.sep)||dest===root||dest.startsWith(root+path.sep))throw Error('新版本必须放在原项目及插件之外且不能覆盖已有目录');
 const allowed=new Set(selected.map(id=>axes.find(a=>a.id===id).artifact));
 for(const id of String(o['allow-dependent']||'').split(',').filter(Boolean)){const a=axes.find(a=>a.id===id);if(!a||!o.reason)throw Error('兼容修复需要有效关联轴及--reason');allowed.add(a.artifact)}
 fs.mkdirSync(dest,{recursive:true});
 for(const n of ['assets','scripts','plans','project.json','source-info.json','recipe.json','scene-plan.json','timing.json','hyperframes.json','route.json','orchestration.json','font-usage.json','index.motion.json','edit-plan.json','facts.json','entry-selection.json','source-ownership.json','selection-rationale.md'])if(fs.existsSync(path.join(old,n)))fs.cpSync(path.join(old,n),path.join(dest,n),{recursive:true});
 for(const n of ['outputs','qa'])fs.mkdirSync(path.join(dest,n));
 const protectedInputs={};
 for(const a of axes)if(!allowed.has(a.artifact)){const rel='plans/'+a.artifact;protectedInputs[rel]=hash(path.join(old,rel));}
 const protectAssets=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name),rel=path.relative(old,p);if(entry.isSymbolicLink())throw Error('项目输入不能依赖软链接');if(entry.isDirectory()){if(entry.name!=='fonts'||!allowed.has('layout-plan.json'))protectAssets(p)}else if(!['film-config.js','film.css'].includes(entry.name))protectedInputs[rel]=hash(p)}};
 protectAssets(path.join(old,'assets'));
 // Approved event-driven rhythm edits need no implementation rewrite. Freeze
 // their code as well as the other ten plans; a real compatibility change must
 // be declared through allow-dependent with a reason.
 if(selected.length===1&&allowed.size===1&&(selected[0]==='palette'||selected[0]==='rhythm'&&p.timingContract==='symbolic-events-v1')){
  const protectCode=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('项目实现不能依赖软链接');if(e.isDirectory())protectCode(f);else protectedInputs[path.relative(old,f)]=hash(f);}};
  protectCode(path.join(old,'scripts'));
  if(selected[0]==='palette'&&fs.existsSync(path.join(old,'edit-plan.json')))protectedInputs['edit-plan.json']=hash(path.join(old,'edit-plan.json'));
 }
 for(const rel of ['assets/master.mp4','assets/edited-voice.wav','timing.json','facts.json','entry-selection.json','source-ownership.json'])if(fs.existsSync(path.join(old,rel)))protectedInputs[rel]=hash(path.join(old,rel));
 // The scene meanings and source/voice mapping stay fixed in a visual-only revision.
 if(!selected.includes('information'))protectedInputs['scene-plan.json']=hash(path.join(old,'scene-plan.json'));
 if(!newChoice&&fs.existsSync(path.join(old,'orchestration.json')))protectedInputs['orchestration.json']=hash(path.join(old,'orchestration.json'));
 const protectedOrchestration=newChoice?undefined:(p.orchestration??null);
 if(newChoice){p.orchestration=newChoice;write(path.join(dest,'orchestration.json'),newChoice.id==='auto'?newChoice:{...newChoice,profile:loadOrchestration(newChoice.id),status:'awaiting-content-design'});}
 p.id=crypto.randomUUID();p.name=path.basename(dest);p.request=o.request||'';p.status='revision-pending';p.axes=selected;write(path.join(dest,'project.json'),p);
 const beforeRecipe=read(path.join(old,'recipe.json'));
 const protectedSelections=Object.fromEntries(axes.filter(a=>!allowed.has(a.artifact)).map(a=>[a.id,beforeRecipe.selections[a.id]]));
 write(path.join(dest,'revision.json'),{parent:old,module:selected.join(','),protectedInputs,protectedSelections,protectedOrchestration,protectedTimingContract:p.timingContract??null,protectedHierarchy:selected.includes('art-style')?null:beforeRecipe.hierarchy,allowedPlanFiles:[...allowed],impact,reason:o.reason||'',timing:null,voiceBinding:fs.existsSync(path.join(old,'assets/edited-voice.wav'))&&fs.existsSync(path.join(old,'edit-plan.json'))?{sourceSha256:hash(path.join(old,'assets/master.mp4')),edlSha256:hash(path.join(old,'edit-plan.json')),voiceSha256:hash(path.join(old,'assets/edited-voice.wav'))}:null});
 write(path.join(dest,'route.json'),collaborationRoute(o.request||'',selected.join(','),o.orchestration));
 return {project:dest,impact,next:'只改允许轴；复查关联项不等于全部重做。另改EDL需重新建源映射，不能借视觉修改暗改原声。'};
}
export function checkCollaborationLibrary(){
 const families=data('families'),branches=data('branches'),components=data('components'),legacy=data('legacy-map');
 for(const rows of [axes,standards,families,branches,components,legacy])if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('登记ID重复');
 for(const b of branches)if(!families.some(f=>f.id===b.familyId))throw Error('分支母画风不存在');
 const old=read(path.join(root,'style-library/catalog.json')).styles;
 if(legacy.length!==old.length||old.some(s=>!legacy.some(l=>l.id===s.id&&l.key===s.key)))throw Error('旧编号未完整映射');
 for(const l of legacy){for(const k of ['template','look','preview'])if(l.source?.[k]){const p=path.join(root,l.source[k]);if(!fs.existsSync(p))throw Error('保留实现缺失: '+l.id+'/'+k);if(l.source[k+'Sha256']&&hash(p)!==l.source[k+'Sha256'])throw Error('保留实现哈希变化: '+l.id+'/'+k)}}
 for(const a of axes)if(!fs.existsSync(path.join(root,'skills',a.skill,'SKILL.md')))throw Error('缺少协作技能: '+a.id);
 for(const key of keys){const r=loadRecipe(key),result=resolve(r);if(!result.ok)throw Error(key+': '+result.errors.join('; '));const example=path.join(root,r.implementation.path);for(const a of axes)if(!fs.existsSync(path.join(example,'plans',a.artifact)))throw Error('配方实际计划缺失: '+key+'/'+a.id);}
 const arrangements=orchestrations();if(new Set(arrangements.map(r=>r.id)).size!==arrangements.length)throw Error('编排ID重复');
 for(const row of arrangements){const from=path.join(root,row.reference.path);for(const a of axes)if(!fs.existsSync(path.join(from,'plans',a.artifact)))throw Error('编排实际计划缺失: '+row.id+'/'+a.id);if(!fs.existsSync(path.join(root,row.evidence)))throw Error('编排认可证据缺失');const proof=read(path.join(root,row.evidence));for(const [rel,h]of Object.entries(proof.preservedImplementation||{}))if(hash(path.join(root,rel))!==h)throw Error('已认可编排实现变化: '+rel);}
 return {axes:axes.length,designStandards:standards.length,families:families.length,branches:branches.length,components:components.length,legacyIds:legacy.length,approvedRecipes:keys.length,motherRecipes:catalog('recipes').filter(r=>r.kind==='mother').length,branchRecipes:catalog('recipes').filter(r=>r.kind==='branch').length,approvedOrchestrations:arrangements.length,scope:'登记、引用、结构及原案例实现；不是任意组合渲染证明'};
}
