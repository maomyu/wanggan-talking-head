#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const checks=[];
function check(name,fn){try{checks.push({name,ok:true,result:fn()})}catch(e){checks.push({name,ok:false,error:e.message})}}
function requireThat(value,message){if(!value)throw Error(message)}
export function sourceFiles(dir=root){
 const result=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(['.git','node_modules','.venv','__pycache__','.DS_Store','package-manifest.json'].includes(entry.name))continue;
  const f=path.join(dir,entry.name);
  if(entry.isSymbolicLink())throw Error('源包不能含软链接: '+f);
  if(entry.isDirectory())result.push(...sourceFiles(f));else result.push(path.relative(root,f).split(path.sep).join('/'));
 }
 return result.sort();
}
check('plugin metadata',()=>{
 const p=read('.codex-plugin/plugin.json');
 requireThat(p.name==='wanggan-talking-head'&&/^\d+\.\d+\.\d+/.test(p.version)&&p.skills==='./skills/','插件名称、版本或skills路径不正确');
 requireThat(fs.statSync(path.join(root,p.skills)).isDirectory(),'skills目录不存在');return {name:p.name,version:p.version};
});
check('five discoverable skills',()=>{
 const names=fs.readdirSync(path.join(root,'skills')).sort();requireThat(names.length===5,'应有四专业模块与一个统筹入口');
 for(const name of names){
  const text=fs.readFileSync(path.join(root,'skills',name,'SKILL.md'),'utf8');
  const front=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);requireThat(front,'缺少frontmatter: '+name);
  requireThat(new RegExp('^name: '+name+'$','m').test(front[1]),'name与目录不一致: '+name);
  requireThat(/^description: .+/m.test(front[1]),'缺少description: '+name);
  requireThat(!/\[TODO[^\]]*\]|TODO:|TBD/.test(text),'残留脚手架占位: '+name);
  requireThat(fs.existsSync(path.join(root,'skills',name,'agents/openai.yaml')),'缺少UI元数据: '+name);
 }return names;
});
check('four full texts preserved',()=>{
 const modules=read('module-manifest.json').modules;requireThat(modules.length===4,'缺少专业模块');
 for(const m of modules)requireThat(sha(path.join(root,m.frozenCopy,'SKILL.md'))===m.sha256,'模块正文发生变化: '+m.name);
 for(const m of modules){const full=fs.readFileSync(path.join(root,m.frozenCopy,'SKILL.md'),'utf8'),body=full.split('</formal_plugin_contract>\n')[1];requireThat(body&&crypto.createHash('sha256').update(body).digest('hex')===m.preservedExpertBodySha256,'原始专家正文未完整保留:'+m.name);}
 return {modules:4,characters:modules.reduce((n,m)=>n+m.characters,0)};
});
check('local Markdown references',()=>{
 let count=0;
 for(const rel of sourceFiles().filter(p=>p.endsWith('.md'))){
  const text=fs.readFileSync(path.join(root,rel),'utf8');
  for(const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
   const href=match[1].replace(/^<|>$/g,'').split('#')[0];
   if(!href||/^[a-z][a-z\d+.-]*:/i.test(href))continue;
   const target=path.resolve(path.dirname(path.join(root,rel)),decodeURIComponent(href));
   requireThat(target.startsWith(root+path.sep)&&fs.existsSync(target),'断开或越界引用: '+rel+' -> '+href);count++;
  }
 }return count;
});
check('fixed runtime and bundled resources',()=>{
 const p=read('runtime/package.json'),lock=read('runtime/package-lock.json');
 requireThat(p.dependencies.hyperframes==='0.8.174'&&lock.packages['node_modules/hyperframes'].version===p.dependencies.hyperframes,'渲染器未锁定');
 const requirements=fs.readFileSync(path.join(root,'runtime/requirements.txt'),'utf8');
 for(const item of ['numpy==2.4.4','Pillow==12.1.0','fonttools==4.62.1'])requireThat(requirements.includes(item),'缺少锁定依赖: '+item);
 const fonts=read('assets/fonts/catalog.json');for(const f of fonts)requireThat(sha(path.join(root,'assets/fonts',f.file))===f.sha256,'字体变化: '+f.file);
 for(const rel of ['assets/gsap.min.js','assets/fonts/OFL.txt','assets/fonts/LICENSES.md','docs/第三方来源.md','templates/approved-reference/assets/master.mp4','templates/approved-reference/plans/edit-plan.json'])requireThat(fs.statSync(path.join(root,rel)).size>0,'资源为空: '+rel);
 for(const rel of sourceFiles().filter(f=>/\.(mjs|py)$/.test(f)))requireThat(!/\/Users\/|C:\\\\Users\\/.test(fs.readFileSync(path.join(root,rel),'utf8')),'执行代码依赖本机绝对路径: '+rel);
 return {hyperframes:p.dependencies.hyperframes,fonts:fonts.length};
});
check('approved style library',()=>{const c=read('style-library/catalog.json');requireThat((c.implementedCount??c.approvedCount)===c.styles.length&&new Set(c.styles.map(s=>s.key)).size===c.styles.length,'画风登记不一致');for(const s of c.styles)for(const f of [s.preview,s.implementation,s.evidence])requireThat(fs.existsSync(path.join(root,'style-library',f)),'画风资源缺失:'+f);return {implemented:c.styles.length,userApproved:c.styles.filter(s=>s.status==='approved-video').length,productionVerified:c.styles.filter(s=>s.status==='verified-video').length,candidates:c.extensions.length};});
check('declared portrait motion contracts',()=>{const c=read('style-library/catalog.json'),declared=[];for(const s of c.styles){const html=fs.readFileSync(path.join(root,'style-library',s.implementation),'utf8'),match=html.match(/data-person-travel="([^"]+)"/);if(!match&&!s.motionParameter)continue;requireThat(s.motionParameter==='data-person-travel'&&match&&Number(match[1])===s.personTravelSeconds,'人物运动参数声明与模板不符:'+s.key);requireThat(Number.isFinite(s.personTravelSeconds)&&s.personTravelSeconds>.05&&s.personTravelSeconds<=3,'人物运动默认值无效:'+s.key);requireThat(Array.isArray(s.portraitBase)&&s.portraitBase.length===4&&s.portraitBase.every(Number.isFinite)&&s.portraitBase[2]===s.portraitBase[3]&&s.portraitBase[2]>0,'人物基础几何声明无效:'+s.key);declared.push(s.key)}return {declared,scope:'只核验明确声明参数的模板；实际修改行为另以运行证据验证'};});
check('style recipes and validation boundary',()=>{const c=read('style-library/catalog.json'),profiles=read('style-library/profiles.json'),all=[...c.styles,...c.extensions];requireThat(c.totalCount>=100&&(c.implementedCount??c.approvedCount)===c.styles.length&&c.approvedCount===c.styles.filter(s=>s.status==='approved-video').length&&c.plannedCount===c.extensions.length&&all.length===c.totalCount,'数量不一致');requireThat(new Set(all.map(s=>s.id)).size===all.length&&new Set(all.map(s=>s.key)).size===all.length,'编号或key重复');for(const s of c.styles)requireThat(['approved-video','verified-video'].includes(s.status)&&s.videoSha256,'认可条目缺证据');for(const s of c.extensions)requireThat(s.status==='candidate-planned'&&!s.implementation&&!s.preview&&!s.videoSha256,'候选冒充已实现模板');for(const s of all)for(const module of ['layout','motion','editing','sound'])requireThat(profiles[module][s.profiles[module]],'配方不存在:'+s.id+'/'+module);const families=new Set(c.families.map(f=>f.key));requireThat(families.size===c.families.length&&all.every(s=>families.has(s.familyKey)),'家族分配错误');return {implemented:c.styles.length,userApproved:c.approvedCount,productionVerified:c.styles.filter(s=>s.status==='verified-video').length,planned:c.plannedCount,total:c.totalCount,families:c.families.length};});
check('sealed source manifest',()=>{
 const manifest=read('package-manifest.json'),files=sourceFiles();
 requireThat(JSON.stringify(Object.keys(manifest.files).sort())===JSON.stringify(files),'源文件清单不一致');
 for(const rel of files)requireThat(sha(path.join(root,rel))===manifest.files[rel],'文件校验失败: '+rel);
 return {files:files.length,scope:'源包结构与内容；不包含全局安装验收'};
});
const result={ok:checks.every(c=>c.ok),root,checks};console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
