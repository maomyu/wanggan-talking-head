#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as loaderHooks from 'node:module';
import {systems,system,compositionRecipe,installCompositionExample,checkCompositionLibrary} from '../runtime/choreography.mjs';
export const plugin=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(plugin,'runtime'),hf=path.join(runtime,'node_modules/hyperframes/bin/hyperframes.mjs');
const modes={'art-direction':'talking-head-art-direction',layout:'talking-head-layout',motion:'talking-head-motion',editing:'talking-head-editing'};
const planNames={'art-direction':'art-direction.json',layout:'layout-plan.json',motion:'motion-plan.json',editing:'edit-plan.json'};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(p,d)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))},sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const localPython=()=>[path.join(runtime,'.venv/bin/python'),path.join(runtime,'.venv/Scripts/python.exe')].find(fs.existsSync);
const py=()=>{const interpreter=process.env.WG_PYTHON||localPython();if(!interpreter)throw Error('本插件Python环境未就绪，请运行 setup');return interpreter};
const run=(cmd,args,options={})=>execFileSync(cmd,args,{cwd:plugin,encoding:'utf8',maxBuffer:16*1024*1024,...options});
const normalHtml=p=>crypto.createHash('sha256').update(fs.readFileSync(p,'utf8').replace(/ data-hf-id="[^"]+"/g,'')).digest('hex');
function parse(args){const result={};for(let i=0;i<args.length;i++){if(!args[i].startsWith('--'))throw Error('未知参数: '+args[i]);const k=args[i].slice(2);result[k]=args[i+1]&&!args[i+1].startsWith('--')?args[++i]:true}return result}
function rootOf(o){if(!o.project)throw Error('需要 --project 项目路径');const r=path.resolve(o.project);if(!fs.existsSync(path.join(r,'project.json')))throw Error('不是本插件项目，请先 init');return r}
export function route(request='',mode){
 if(mode && mode!=='full' && !(mode in modes))throw Error('未知模式: '+mode);
 let selected=mode==='full'?Object.keys(modes):mode?[mode]:[];
 if(!mode){
  const active=request.split(/[，。；,;\n]/).filter(s=>!/^\s*(保留|沿用|保持|不改|别改|不要改|维持)/.test(s)).join('，');
  const signals={'art-direction':/画风|风格|配色|材质/,layout:/排版|字幕|字体|字号|标题|构图/,motion:/动效|动画|运动|入场|出场/,editing:/剪辑|转场|重剪|停顿|剪点/};
  selected=Object.entries(signals).filter(([,rx])=>rx.test(active)).map(([k])=>k);
  if(!selected.length || /制作|做一条|做个|生成/.test(active)&&/完整|整片|口播视频/.test(active)&&!/只|仅/.test(active))selected=Object.keys(modes);
 }
 const scope=selected.length===4?'full':selected.length===1?'module':'multi';
 return {scope,modules:selected,selection:mode?'explicit':'keyword hint; 由代理结合上下文确认，不代替语义判断',entry:path.join(plugin,'skills/talking-head-video/SKILL.md'),requiredSkills:selected.map(k=>({module:k,path:path.join(plugin,'skills',modes[k],'SKILL.md')})),request};
}
function styleList(id){const c=read(path.join(plugin,'style-library/catalog.json'));if(!id)return c;const row=[...c.styles,...c.extensions].find(s=>[s.key,s.id,s.name,...(s.aliases||[])].includes(id));if(!row)throw Error('未登记画风:'+id);return row;}
function recipe(o){const style=styleList(o.style||o.id||'minimal'),library=read(path.join(plugin,'style-library/profiles.json'));const modules={};for(const name of ['layout','motion','editing','sound']){const code=o[name]||style.profiles[name];if(!library[name][code])throw Error('未知'+name+'配方:'+code);modules[name]={code,...library[name][code],selection:o[name]?'requested':'suggested'};}return {style:{id:style.id,key:style.key,name:style.name,status:style.status,visualMechanism:style.visualMechanism},modules,composition:compositionRecipe(style,o),principles:['人物原色','角落正圆窗','字幕上移'],scope:'设计交接建议；不自动生成未验证模板、音乐或新素材。先完成四个完整模块的本片方案。'};}
function doctor(){
 const checks=[];const probe=(name,fn)=>{try{checks.push({name,ok:true,value:fn()})}catch(e){checks.push({name,ok:false,error:e.message.split('\n')[0]})}};
 probe('node',()=>{if(typeof loaderHooks.registerHooks!=='function')throw Error('需要支持module.registerHooks的Node22.15+/23.5+');return process.version});
 probe('hyperframes',()=>{const v=read(path.join(runtime,'node_modules/hyperframes/package.json')).version;const expected=read(path.join(runtime,'package.json')).dependencies.hyperframes;if(v!==expected)throw Error('需要锁定HyperFrames'+expected);return v});
 probe('python',()=>JSON.parse(run(py(),['-c',"import sys,json; from importlib.metadata import version; print(json.dumps({'python':sys.version.split()[0],'executable':sys.executable,'prefix':sys.prefix,'numpy':version('numpy'),'Pillow':version('Pillow'),'fonttools':version('fonttools')}))"])));
 probe('ffmpeg',()=>run('ffmpeg',['-version']).split('\n')[0]);probe('ffprobe',()=>run('ffprobe',['-version']).split('\n')[0]);
 probe('fonts',()=>{const files=read(path.join(plugin,'assets/fonts/catalog.json'));for(const f of files)if(sha(path.join(plugin,'assets/fonts',f.file))!==f.sha256)throw Error('字体哈希不同: '+f.file);return files.length});
 probe('four-full-skills',()=>{const files=read(path.join(plugin,'module-manifest.json')).modules;for(const m of files)if(sha(path.join(plugin,m.frozenCopy,'SKILL.md'))!==m.sha256)throw Error('完整模块正文有改动: '+m.name);return files.length});
 probe('choreography-library',checkCompositionLibrary);
 probe('implemented-style-library',()=>{const c=styleList();if(c.styles.length!==(c.implementedCount??c.approvedCount)||!c.styles.length)throw Error('画风数量与登记不一致');for(const s of c.styles)for(const f of [s.preview,s.implementation,s.evidence])if(!fs.existsSync(path.join(plugin,'style-library',f)))throw Error('画风资源缺失:'+f);return {implemented:c.styles.length,userApproved:c.styles.filter(s=>s.status==='approved-video').length,productionVerified:c.styles.filter(s=>s.status==='verified-video').length}});
 probe('style-recipes',()=>{const c=styleList(),all=[...c.styles,...c.extensions];if(all.length!==c.totalCount||c.extensions.length!==c.plannedCount||new Set(all.map(s=>s.id)).size!==all.length||new Set(all.map(s=>s.key)).size!==all.length)throw Error('创意目录登记不一致');for(const s of all)recipe({style:s.key});return {implemented:c.styles.length,userApproved:c.approvedCount,productionVerified:c.styles.filter(s=>s.status==='verified-video').length,planned:c.plannedCount,total:c.totalCount}});
 const versions=checks.find(c=>c.name==='python');if(versions?.ok){for(const [k,v] of Object.entries({numpy:'2.4.4',Pillow:'12.1.0',fonttools:'4.62.1'}))if(versions.value[k]!==v){versions.ok=false;versions.error=k+'版本需为'+v}}
 return {ready:checks.every(c=>c.ok),checks,setup:'node scripts/studio.mjs setup（仅安装本包runtime依赖，不注册插件）'};
}
function setup(){
 run(process.platform==='win32'?'npm.cmd':'npm',['ci','--ignore-scripts','--no-audit','--no-fund'],{cwd:runtime,stdio:'inherit'});
 if(!localPython()){let bootstrap=process.env.WG_BOOTSTRAP_PYTHON;for(const candidate of bootstrap?[bootstrap]:['python3.14','python3.13','python3.12','python3.11','python3','python']){try{if(run(candidate,['-c',"import sys;assert sys.version_info>=(3,11);print(sys.version)"]).trim()){bootstrap=candidate;break;}}catch{}}if(!bootstrap)throw Error('需要已安装的Python3.11+');run(bootstrap,['-m','venv','--copies',path.join(runtime,'.venv')],{stdio:'inherit'});}
 run(py(),['-m','pip','install','--disable-pip-version-check','-r',path.join(runtime,'requirements.txt')],{stdio:'inherit'});return doctor();
}
function init(o){
 if(!o.project)throw Error('需要 --project 新项目路径');const r=path.resolve(o.project);if(fs.existsSync(r))throw Error('目标已存在，init不覆盖；修改现有项目请用revise');
 if(o.example && o.example!=='approved')throw Error('正式包使用 --example approved --style 画风；新素材使用--source，由完整模块设计');
 if(!o.example && !o.source)throw Error('新项目需 --source 视频，或显式选择 --example approved');
 const source=o.source?path.resolve(o.source):null,transcript=o.transcript?path.resolve(o.transcript):null;
 if(o.example&&(source||transcript))throw Error('参考样例与新素材不能混用；新视频请用--source，按本片内容设计时间轴');
 if(source&&!fs.existsSync(source)||transcript&&!fs.existsSync(transcript))throw Error('输入素材不存在');
 const requestedStyle=o.style?styleList(o.style):(o.composition||o.system)?styleList('minimal'):null;
 if(requestedStyle)compositionRecipe(requestedStyle,o);
 if(o.example&&requestedStyle&&!['approved-video','verified-video'].includes(requestedStyle.status))throw Error('该方向尚无已实现模板；新素材可用--source开始设计，不能用--example approved复现');
 for(const d of ['plans','assets/fonts','scripts','outputs','qa'])fs.mkdirSync(path.join(r,d),{recursive:true});
 if(o.example)fs.cpSync(path.join(plugin,'templates/approved-reference'),r,{recursive:true});
 if(source)fs.copyFileSync(source,path.join(r,'assets/master.mp4'));
 if(transcript)fs.copyFileSync(transcript,path.join(r,'assets/canonical-native.srt'));
 const isReference=Boolean(o.example&&!source&&!transcript);
 if(requestedStyle&&isReference){const a=read(path.join(r,'plans/art-direction.json'));a.styleId=requestedStyle.key;write(path.join(r,'plans/art-direction.json'),a);if(requestedStyle.portraitBase){const l=read(path.join(r,'plans/layout-plan.json'));l.portrait.baseBox=requestedStyle.portraitBase;write(path.join(r,'plans/layout-plan.json'),l)}if(requestedStyle.personTravelSeconds){const m=read(path.join(r,'plans/motion-plan.json'));m.travelSeconds=requestedStyle.personTravelSeconds;write(path.join(r,'plans/motion-plan.json'),m)}}
 const composition=isReference&&(o.composition||o.system)?installCompositionExample(r,requestedStyle,o):requestedStyle?{...compositionRecipe(requestedStyle,o),fixture:false,status:isReference?'guidance-only-legacy-reference':'awaiting-source-design'}:null;
 const metadata=JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path.join(r,'assets/master.mp4')]));
 const routeResult=route(o.request||'制作完整口播',o.mode);const project={schemaVersion:1,id:crypto.randomUUID(),name:path.basename(r),request:o.request||'',scope:routeResult.scope,modules:routeResult.modules,renderer:isReference?'approved-reference':'custom',status:isReference?'planned-reference':'awaiting-design',referenceFixture:isReference,sourceSha256:sha(path.join(r,'assets/master.mp4'))};
 write(path.join(r,'project.json'),project);write(path.join(r,'source-info.json'),metadata);write(path.join(r,'route.json'),routeResult);
 if(composition){write(path.join(r,'composition-selection.json'),composition);if(composition.fixture){project.renderer='custom';project.compositionFixture=true;project.status='planned-composition-reference';write(path.join(r,'project.json'),project)}}
 if(requestedStyle){project.requestedStyle={id:requestedStyle.id,key:requestedStyle.key,status:requestedStyle.status};write(path.join(r,'project.json'),project);write(path.join(r,'style-recipe.json'),recipe({...o,style:requestedStyle.key}));}
 fs.copyFileSync(path.join(plugin,'assets/gsap.min.js'),path.join(r,'assets/gsap.min.js'));
 write(path.join(r,'hyperframes.json'),{paths:{blocks:'compositions',components:'compositions/components',assets:'assets'},media:{autoProxy:true},authoringSkill:'general-video'});
 if(!isReference){if(o.example)fs.rmSync(path.join(r,'plans'),{recursive:true});fs.mkdirSync(path.join(r,'plans'),{recursive:true});fs.writeFileSync(path.join(r,'设计交接.md'),'素材已导入。请按route.json读取完整skill，完成本片四模块方案与scripts/build-project.mjs；设计完成前不会套用参考时间线或输出成片。\n')}
 return {project:r,status:project.status,route:routeResult,next:isReference?'run --project <此路径>':'按完整skill完成本片设计，然后run'};
}
function inputFiles(r){const derivedFile=path.join(r,'qa/generated-assets.json'),derived=new Set(fs.existsSync(derivedFile)?read(derivedFile).files:[]);const list=[];for(const folder of ['plans','assets','scripts']){const walk=d=>{if(!fs.existsSync(d))return;for(const n of fs.readdirSync(d)){const f=path.join(d,n);if(fs.lstatSync(f).isSymbolicLink())throw Error('项目输入不能依赖软链接: '+f);if(fs.statSync(f).isDirectory())walk(f);else if(!['edited-voice.wav'].includes(n)&&(!derived.has(path.relative(r,f))||['master.mp4','canonical-native.srt'].includes(n))&&!f.includes(path.sep+'fonts'+path.sep))list.push(f)}};walk(path.join(r,folder))}return Object.fromEntries(list.sort().map(f=>[path.relative(r,f),sha(f)]))}
function revise(o){
 const old=rootOf({...o,project:o.from||o.project});if(!(o.module in modes))throw Error('单模块修改需 --module art-direction|layout|motion|editing');if(!o.out)throw Error('需要 --out 新版本目录');const dest=path.resolve(o.out);if(fs.existsSync(dest)||dest.startsWith(old+path.sep))throw Error('版本目录必须不存在且位于原项目外');
 const allowed=new Set([planNames[o.module]]);if(o['allow-dependent']){if(!o.reason)throw Error('扩展相关模块需 --reason 说明实际依赖');for(const k of String(o['allow-dependent']).split(',')){if(!(k in modes))throw Error('未知关联模块');allowed.add(planNames[k])}}
 fs.mkdirSync(dest,{recursive:true});for(const name of ['plans','assets','scripts','project.json','hyperframes.json','source-info.json','composition-selection.json','style-recipe.json','route.json','index.motion.json']){const from=path.join(old,name);if(fs.existsSync(from))fs.cpSync(from,path.join(dest,name),{recursive:true})}for(const n of ['outputs','qa'])fs.mkdirSync(path.join(dest,n));
 const project=read(path.join(dest,'project.json'));project.id=crypto.randomUUID();project.name=path.basename(dest);project.request=o.request||'';project.scope='module';project.modules=[o.module];project.status='revision-pending';write(path.join(dest,'project.json'),project);
 const files=inputFiles(old);const protectedInputs=Object.fromEntries(Object.entries(files).filter(([f])=>(!f.startsWith('plans/')||!allowed.has(path.basename(f)))&&!f.startsWith('scripts/')));
 const timing=fs.existsSync(path.join(old,'timing.json'))?read(path.join(old,'timing.json')):null;
 write(path.join(dest,'revision.json'),{parent:old,module:o.module,request:o.request||'',allowedPlanFiles:[...allowed],allowedImplementation:['scripts/（必要创意实现；其他模块方案、源片和非剪辑时序仍受保护）'],reason:o.reason||'',protectedInputs,timing:o.module==='editing'?null:timing&&{frameCount:timing.frameCount,shots:timing.shots,captions:timing.captions.map(c=>({startFrame:c.startFrame,endFrame:c.endFrame,text:c.text}))},voiceWavSha256:o.module==='editing'?null:fs.existsSync(path.join(old,'assets/edited-voice.wav'))?sha(path.join(old,'assets/edited-voice.wav')):null});
 return {project:dest,module:o.module,edit:'仅编辑所选模块方案，再run；此命令本身不冒称完成创意修改',protectedPlans:Object.values(planNames).filter(n=>!allowed.has(n))};
}
function scopeCheck(r,derived=false){
 const file=path.join(r,'revision.json');if(!fs.existsSync(file))return {revision:false};const rev=read(file);
 for(const [rel,hash] of Object.entries(rev.protectedInputs)){const f=path.join(r,rel);if(!fs.existsSync(f)||sha(f)!==hash)throw Error('局部修改触及受保护输入: '+rel)}
 if(derived&&rev.timing){const t=read(path.join(r,'timing.json'));for(const k of ['frameCount','shots'])if(JSON.stringify(t[k])!==JSON.stringify(rev.timing[k]))throw Error('局部修改改变了时序: '+k);const caps=t.captions.map(c=>({startFrame:c.startFrame,endFrame:c.endFrame,text:c.text}));if(JSON.stringify(caps)!==JSON.stringify(rev.timing.captions))throw Error('局部修改改变了口播字幕与时序');if(sha(path.join(r,'assets/edited-voice.wav'))!==rev.voiceWavSha256)throw Error('局部修改改变了原声参考轨')}
 return {revision:true,module:rev.module,protectedInputsPassed:Object.keys(rev.protectedInputs).length,timingAndVoicePreserved:derived&&Boolean(rev.timing)};
}
function build(r){
 const project=read(path.join(r,'project.json'));scopeCheck(r);const missing=Object.values(planNames).filter(n=>!fs.existsSync(path.join(r,'plans',n)));if(!fs.existsSync(path.join(r,'plans/brief.json'))||missing.length)throw Error('设计尚未完成，缺少brief或四模块方案：'+missing.join(','));
 if(project.renderer==='approved-reference')run(process.execPath,[path.join(runtime,'approved-renderer.mjs'),'--project',r],{stdio:'inherit'});
 else{const script=path.join(r,'scripts/build-project.mjs');if(!fs.existsSync(script))throw Error('请先按本片设计实现scripts/build-project.mjs；不会把任意新素材套成参考片');run(process.execPath,[script,'--project',r],{cwd:r,stdio:'inherit',env:{...process.env,WG_PLUGIN_ROOT:plugin}})}
 run(py(),[path.join(runtime,'scripts/media.py'),'prepare',r],{stdio:'inherit'});const scope=scopeCheck(r,true);write(path.join(r,'qa/scope-check.json'),scope);
 fs.copyFileSync(path.join(plugin,'assets/viewer.html'),path.join(r,'review.html'));write(path.join(r,'qa/build-state.json'),{inputs:inputFiles(r),normalizedHtmlSha256:normalHtml(path.join(r,'index.html')),scope});project.status='built';write(path.join(r,'project.json'),project);return scope;
}
function hfRun(r,args,label){try{const output=run(process.execPath,args[0]==='check'?[path.join(runtime,'check-with-budget.mjs'),hf,r,'--timeout','120000',...args.slice(1)]:[hf,...args,r],{maxBuffer:32*1024*1024});fs.writeFileSync(path.join(r,'qa',label+'.log'),output);return output}catch(e){fs.writeFileSync(path.join(r,'qa',label+'.log'),String(e.stdout||'')+'\n'+String(e.stderr||''));throw Error(label+'失败，查看qa/'+label+'.log')}}
async function preview(r,o){
 const status=path.join(r,'qa/preview-server.json');if(fs.existsSync(status)){const old=read(status);try{const health=await(await fetch(old.url+'health')).json();if(health.projectId===read(path.join(r,'project.json')).id)return old}catch{}}
 const log=fs.openSync(path.join(r,'qa/preview-server.log'),'a');const child=spawn(py(),[path.join(runtime,'scripts/serve.py'),'--project',r,'--port',String(o.port||0)],{cwd:plugin,stdio:['ignore',log,log],detached:true});child.unref();fs.closeSync(log);
 for(let n=0;n<60;n++){await new Promise(done=>setTimeout(done,100));if(fs.existsSync(status)){const d=read(status);if(d.pid===child.pid)return d}}throw Error('预览服务未就绪，请看qa/preview-server.log');
}
async function main(){
 const [command,...args]=process.argv.slice(2),o=parse(args);
 if(command==='styles'){if(o.id||o.style)return styleList(o.id||o.style);const c=styleList();if(o.all||o.status){if(o.status&&!['approved','implemented','production','candidate'].includes(o.status))throw Error('status需为approved、implemented、production或candidate');const rows=o.status==='approved'?c.styles.filter(s=>s.status==='approved-video'):o.status==='production'?c.styles.filter(s=>s.status==='verified-video'):o.status==='implemented'?c.styles:o.status==='candidate'?c.extensions:[...c.styles,...c.extensions];return {implementedCount:c.styles.length,approvedCount:c.styles.filter(s=>s.status==='approved-video').length,productionVerifiedCount:c.styles.filter(s=>s.status==='verified-video').length,plannedCount:c.plannedCount,totalCount:c.totalCount,styles:rows.sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)))}}return c;}
 if(command==='recipe')return recipe(o);
 if(command==='choreographies'||command==='systems')return o.id?system(o.id):systems();
 if(command==='route')return {...route(o.request||'',o.mode),styleLibrary:path.join(plugin,'style-library/catalog.json'),commonRules:path.join(plugin,'docs/共同制作规范.md')};
 if(command==='doctor')return doctor();
 if(command==='setup')return setup();
 if(command==='init')return init(o);
 if(command==='revise')return revise(o);
 if(command==='help'||!command)return {commands:['doctor','setup','styles [--id 编号或名称 | --all | --status approved|implemented|production|candidate]','choreographies [--id C01]','recipe --style A58 [--composition auto|C06 --kind cause --layout L10 --motion M09 --editing E04 --sound S01]','route --request 中文需求 [--mode full|layout|motion|editing|art-direction]','init --project 新路径 --source 视频 [--transcript 字幕 --style A58 --composition C06 --request 需求]','init --project 新路径 --example approved --style magazine [--composition auto|C05]','revise --from 原项目 --out 新版本 --module layout --request 需求','run --project 项目 [--until build|check|render|verify]','preview --project 项目 [--port 端口]','stop --project 项目'],guide:'docs/使用说明.md'};
 const r=rootOf(o);
 if(command==='preview')return await preview(r,o);
 if(command==='stop'){const d=read(path.join(r,'qa/preview-server.json'));const health=await(await fetch(d.url+'health')).json();if(health.projectId!==read(path.join(r,'project.json')).id)throw Error('服务不属于当前项目');process.kill(d.pid);return {stopped:true}}
 if(command!=='run')throw Error('未知命令: '+command);
 const env=doctor();if(!env.ready)throw Error('运行依赖未就绪，请先doctor/setup：'+JSON.stringify(env.checks.filter(c=>!c.ok)));
 const until=o.until||'verify';if(!['build','check','render','verify'].includes(until))throw Error('未知until阶段');
 console.log('[1/4] 构建同一时间轴与原声');const scope=build(r);if(until==='build')return {stage:'built',scope};
 console.log('[2/4] 检查布局、运行与对比');const raw=hfRun(r,['check','--json'],'check');const check=JSON.parse(raw.slice(raw.indexOf('{')));write(path.join(r,'qa/check.json'),check);if(!check.ok)throw Error('检查未通过，请查看qa/check.json');if(until==='check')return {stage:'checked',scope};
 console.log('[3/4] 渲染实际MP4');hfRun(r,['render','--output',path.join(r,'outputs/final.mp4'),'--fps',String(read(path.join(r,'timing.json')).fps),'--quality','delivery','--gpu','--workers','3','--video-frame-format','png','--skill','general-video'],'render');if(until==='render')return {stage:'rendered',scope};
 console.log('[4/4] 核验编码与声音并生成抽帧');run(py(),[path.join(runtime,'scripts/media.py'),'verify',r],{stdio:'inherit'});scopeCheck(r,true);const project=read(path.join(r,'project.json'));project.status='verified';write(path.join(r,'project.json'),project);return {stage:'verified',project:r,video:path.join(r,'outputs/final.mp4'),report:path.join(r,'qa/delivery.json'),scope};
}
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url))main().then(result=>{console.log(JSON.stringify(result,null,2));if(result?.ready===false)process.exitCode=1}).catch(e=>{console.error(e.message);process.exitCode=1});
