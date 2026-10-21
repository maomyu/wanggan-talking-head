import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {resolveRecipe,planChange,compileScenes} from './composition-core.mjs';

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
const keys=['editorial-print','minimal','blueprint','clay'];
export function catalog(kind,id){
 const rows=kind==='recipes'?read(path.join(root,'recipes/index.json')).recipes:kind==='standards'?standards:data(kind);
 if(!id)return rows;
 const found=rows.find(r=>[r.id,r.name,r.key,r.legacyKey,r.defaultLegacyKey].includes(id));
 if(!found)throw Error('未登记'+kind+': '+id);return found;
}
export function loadRecipe(value='minimal'){
 const row=catalog('recipes').find(r=>[r.id,r.name].includes(value));
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
export function collaborationRoute(request='',requested){
 let selected=requested?String(requested).split(','):[];
 if(!selected.length){
  const active=request.split(/[，。；,;\n]/).filter(s=>!/^\s*(保留|沿用|保持|不改|别改|不要改|维持)/.test(s)).join('，');
  const signals={'art-style':/画风|风格/,palette:/配色|颜色/,material:/材质|纹理/,representation:/造型|模型|载体/,'object-motion':/动效|动画|运动/,camera:/镜头|机位|景别/,transition:/转场|衔接/,typography:/排版|字幕|字体|字号|标题|构图/,lighting:/光影|照明|投影/,information:/文案|内容关系|因果|对比|信息组织/,rhythm:/节奏|读窗|停留/};
  selected=Object.entries(signals).filter(([,rx])=>rx.test(active)).map(([id])=>id);
  if(!selected.length||/制作|重做|做一条|做个|生成/.test(active)&&/完整|整片|口播/.test(active)&&!/只|仅/.test(active))selected=axes.map(a=>a.id);
 }
 if(selected.some(id=>!axes.some(a=>a.id===id)))throw Error('未知十一类技能: '+selected.join(','));
 return {scope:selected.length===11?'full':'module',axes:selected,change:change(selected),requiredSkills:axes.filter(a=>selected.includes(a.id)).map(a=>({axis:a.id,path:path.join(root,'skills',a.skill,'SKILL.md')})),entry:path.join(root,'skills/talking-head-composition/SKILL.md'),policy};
}
function emptyProject(o){
 if(!o.project||!o.source)throw Error('需要 --project 新目录及 --source 自有视频');
 const dest=path.resolve(o.project),source=path.resolve(o.source);
 if(dest===root||dest.startsWith(root+path.sep))throw Error('制作工程放插件目录之外');
 if(fs.existsSync(dest))throw Error('目标已存在，不覆盖工程');
 if(!fs.statSync(source).isFile())throw Error('源片不存在');
 const recipe=loadRecipe(o.recipe),check=resolve(recipe);if(!check.ok)throw Error(check.errors.join('; '));
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',source],{encoding:'utf8'}));
 for(const d of ['plans','assets/fonts','scripts','qa','outputs'])fs.mkdirSync(path.join(dest,d),{recursive:true});
 fs.copyFileSync(source,path.join(dest,'assets/master.mp4'));
 if(o.transcript)fs.copyFileSync(path.resolve(o.transcript),path.join(dest,'assets/canonical-native.srt'));
 fs.copyFileSync(path.join(root,'assets/gsap.min.js'),path.join(dest,'assets/gsap.min.js'));
 write(path.join(dest,'project.json'),{schemaVersion:2,collaborationVersion:1,id:crypto.randomUUID(),name:path.basename(dest),recipeId:recipe.id,status:'awaiting-design',renderer:'custom',request:o.request||'',sourcePolicy:read(path.join(root,'source-policy.json')),sourceSha256:hash(source),referenceFixture:false});
 write(path.join(dest,'recipe.json'),recipe);write(path.join(dest,'source-info.json'),probe);
 write(path.join(dest,'hyperframes.json'),{paths:{blocks:'compositions',components:'compositions/components',assets:'assets'},media:{autoProxy:true},authoringSkill:'general-video'});
 write(path.join(dest,'route.json'),collaborationRoute(o.request||'制作完整口播'));
 return {dest,recipe};
}
export function initCollaboration(o){
 if(o.style||o.example||o.composition||o.system)throw Error('新配方入口使用--recipe；旧画风/编排入口单独使用，避免静默忽略选择');
 const {dest,recipe}=emptyProject(o);
 for(const a of axes)write(path.join(dest,'plans',a.artifact),{status:'awaiting-design',axis:a.id,standards:recipe.selections[a.id],ownedFields:a.ownedFields});
 fs.writeFileSync(path.join(dest,'设计交接.md'),'按本次真实文案新建scene-plan.json、timing.json、plans/brief.json及十一份专业计划，落实对象、动作、可见结果和连续交接。实现scripts/build-project.mjs；构建生成index.html与edit-plan.json（原声EDL）。不要复制示例财经文案、耳机、数量或秒点。可复用配方语言与有效机制。原色人像、角落圆窗、字幕上移、一路原声；计划检查不代表已完成视频。读取正式插件docs/分类与配方.md和docs/协作合同.md。\n');
 return {project:dest,status:'awaiting-design',recipe:recipe.id,axes:axes.map(a=>a.id),next:'根据新文案完成专业设计与帧函数，再run --project；不会直接套入参考片'};
}
export function reproduce(o){
 const recipe=loadRecipe(o.recipe);if(!keys.includes(recipe.id))throw Error('此配方没有正式复现实现');
 if(!o.source||hash(path.resolve(o.source))!==recipe.implementation.sourceSha256)throw Error('复现仅接受明确选择的原案例840方形代理源片且哈希一致；换素材请用init --recipe重新设计');
 const {dest}=emptyProject(o),from=path.join(root,recipe.implementation.path);
 fs.cpSync(from,dest,{recursive:true});
 fs.copyFileSync(path.join(root,'assets/recipe-images/life-objects.png'),path.join(dest,'assets/life-objects.png'));
 fs.cpSync(path.join(root,'assets/fonts'),path.join(dest,'assets/fonts'),{recursive:true});
 if(recipe.id==='clay')fs.cpSync(path.join(root,'runtime/recipe-vendor'),path.join(dest,'assets/vendor'),{recursive:true});
 fs.copyFileSync(path.join(root,'runtime/recipe-build.mjs'),path.join(dest,'scripts/build-project.mjs'));
 const timing=read(path.join(dest,'timing.json'));
 write(path.join(dest,'plans/brief.json'),{width:timing.width,height:timing.height,fps:timing.fps,source:'explicit-approved-recipe-reference'});
 const p=read(path.join(dest,'project.json'));p.referenceFixture=true;p.status='planned-approved-recipe';write(path.join(dest,'project.json'),p);
 return {project:dest,status:p.status,recipe:recipe.id,scope:'仅明确选定的历史同源案例复现；新素材必须重新设计'};
}
export function validateProject(r){
 const p=read(path.join(r,'project.json'));if(!p.collaborationVersion)return null;
 const draft=axes.filter(a=>!fs.existsSync(path.join(r,'plans',a.artifact))||read(path.join(r,'plans',a.artifact)).status==='awaiting-design');
 if(draft.length)throw Error('十一类设计尚未完成: '+draft.map(a=>a.name).join(','));
 const plan=read(path.join(r,'scene-plan.json')),result=compile(read(path.join(r,'recipe.json')),plan,r);
 if(!result.ok)throw Error('场景计划未通过: '+result.errors.join('; '));
 if(plan.source.sha256!==p.sourceSha256)throw Error('场景计划没有绑定init所选源片');
 const t=read(path.join(r,'timing.json'));if(t.frameCount!==plan.frames||t.fps!==plan.fps)throw Error('场景计划与实际时间轴不一致');
 const caps=new Set((t.captions||[]).map(c=>c.id));if(plan.scenes.some(s=>s.sentenceIds.some(id=>!caps.has(id))))throw Error('场景引用未知字幕原句ID');
 write(path.join(r,'qa/scene-plan-check.json'),result);return result;
}
export function reviseCollaboration(o,old){
 const p=read(path.join(old,'project.json'));if(!p.collaborationVersion)return null;
 const selected=String(o.axes||o.module||'').split(',').filter(Boolean),impact=change(selected);
 if(!o.out)throw Error('需要 --out 新版本目录');const dest=path.resolve(o.out);
 if(fs.existsSync(dest)||dest.startsWith(old+path.sep)||dest===root||dest.startsWith(root+path.sep))throw Error('新版本必须放在原项目及插件之外且不能覆盖已有目录');
 const allowed=new Set(selected.map(id=>axes.find(a=>a.id===id).artifact));
 for(const id of String(o['allow-dependent']||'').split(',').filter(Boolean)){const a=axes.find(a=>a.id===id);if(!a||!o.reason)throw Error('兼容修复需要有效关联轴及--reason');allowed.add(a.artifact)}
 fs.mkdirSync(dest,{recursive:true});
 for(const n of ['assets','scripts','plans','project.json','source-info.json','recipe.json','scene-plan.json','timing.json','hyperframes.json','route.json','font-usage.json','index.motion.json','edit-plan.json'])if(fs.existsSync(path.join(old,n)))fs.cpSync(path.join(old,n),path.join(dest,n),{recursive:true});
 for(const n of ['outputs','qa'])fs.mkdirSync(path.join(dest,n));
 const protectedInputs={};
 for(const a of axes)if(!allowed.has(a.artifact)){const rel='plans/'+a.artifact;protectedInputs[rel]=hash(path.join(old,rel));}
 const protectAssets=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name),rel=path.relative(old,p);if(entry.isSymbolicLink())throw Error('项目输入不能依赖软链接');if(entry.isDirectory()){if(entry.name!=='fonts'||!allowed.has('layout-plan.json'))protectAssets(p)}else if(!['film-config.js','film.css'].includes(entry.name))protectedInputs[rel]=hash(p)}};
 protectAssets(path.join(old,'assets'));
 for(const rel of ['assets/master.mp4','assets/edited-voice.wav','timing.json'])if(fs.existsSync(path.join(old,rel)))protectedInputs[rel]=hash(path.join(old,rel));
 // The scene meanings and source/voice mapping stay fixed in a visual-only revision.
 if(!selected.includes('information'))protectedInputs['scene-plan.json']=hash(path.join(old,'scene-plan.json'));
 p.id=crypto.randomUUID();p.name=path.basename(dest);p.request=o.request||'';p.status='revision-pending';p.axes=selected;write(path.join(dest,'project.json'),p);
 const beforeRecipe=read(path.join(old,'recipe.json'));
 const protectedSelections=Object.fromEntries(axes.filter(a=>!allowed.has(a.artifact)).map(a=>[a.id,beforeRecipe.selections[a.id]]));
 write(path.join(dest,'revision.json'),{parent:old,module:selected.join(','),protectedInputs,protectedSelections,protectedHierarchy:selected.includes('art-style')?null:beforeRecipe.hierarchy,allowedPlanFiles:[...allowed],impact,reason:o.reason||'',timing:null});
 write(path.join(dest,'route.json'),collaborationRoute(o.request||'',selected.join(',')));
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
 return {axes:axes.length,designStandards:standards.length,families:families.length,branches:branches.length,components:components.length,legacyIds:legacy.length,approvedRecipes:keys.length,scope:'登记、引用、结构及原案例实现；不是任意组合渲染证明'};
}
