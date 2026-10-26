import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import{fileURLToPath}from'node:url';
import{outsidePlugin}from'./collaboration.mjs';import{productionCatalog}from'./production-entry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')},sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export function writeProductionGuides(dest){
 const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 for(const[file,source,title]of[['guide.html','19套配方与统一入口.md','统一入口技术用法'],['usage-guide.html','常用指令与使用指南.md','网感口播使用指南']]){
  const guide=fs.readFileSync(path.join(root,'docs',source),'utf8');
  fs.writeFileSync(path.join(dest,file),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{max-width:900px;margin:40px auto;padding:20px;background:#f4f3ef;color:#1d2a31;font:16px/1.8 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}a{color:#285c68}</style><nav><a href="review/#prompts">返回可复制指令</a> · <a href="usage-guide.md" download>保存使用指南</a></nav><pre>${escape(guide)}</pre></html>`);
 }
 fs.copyFileSync(path.join(root,'docs/常用指令与使用指南.md'),path.join(dest,'usage-guide.md'));
}
export function createProductionReview(o){
 if(!o.project)throw Error('需要 --project 插件外新目录');const dest=outsidePlugin(o.project);if(fs.existsSync(dest))throw Error('目标已存在，请另建入口目录');
 const c=productionCatalog(),media=o['media-map']?read(path.resolve(o['media-map'])):{},entries=[...c.families,...c.implementedBranches];
 // Validate every binding before writing, so missing local media cannot leave a broken page.
 for(const[k,m]of Object.entries(media)){const e=entries.find(e=>e.id===k);if(!e&&k!=='palette')throw Error('未知样片ID：'+k);for(const field of['video','poster'])if(!m[field]||!fs.statSync(m[field]).isFile())throw Error('缺少本地文件：'+k+'/'+field);if(k==='palette'&&sha(m.video)!==read(path.join(root,'examples/production-recipes/palette-only.json')).approvedVideoSha256)throw Error('配色样片与认可证据不一致');if(e&&sha(m.video)!==e.videoSha256)throw Error('所选样片与认可证据不一致：'+k);}
 fs.mkdirSync(path.join(dest,'qa'),{recursive:true});fs.writeFileSync(path.join(dest,'review.html'),'<meta charset="utf-8"><meta http-equiv="refresh" content="0;url=review/"><a href="review/">打开正式配方入口</a>');fs.cpSync(path.join(root,'assets/production-entry'),path.join(dest,'review'),{recursive:true});fs.mkdirSync(path.join(dest,'registry'));fs.mkdirSync(path.join(dest,'recipes'));
 for(const n of ['branches','components','axes','standards'])fs.copyFileSync(path.join(root,'registry',n+'.json'),path.join(dest,'registry',n+'.json'));
 const copy=(from,to)=>{fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to,fs.constants.COPYFILE_FICLONE)};
 for(const e of entries){const recipe=read(path.join(root,e.recipe));copy(path.join(root,e.recipe),path.join(dest,e.recipe));for(const ref of Object.values(recipe.axisReferences))copy(path.join(root,ref.casePlan),path.join(dest,ref.casePlan));
  const m=media[e.id];e.video=m?`media/${e.id}/play.mp4`:null;e.poster=`media/${e.id}/poster.jpg`;
  if(m){copy(m.video,path.join(dest,e.video));copy(m.poster,path.join(dest,e.poster));}
  else{const f=read(path.join(root,'registry/families.json')).find(f=>f.id===e.familyId);copy(path.join(root,f.preview),path.join(dest,e.poster));}
 }
 c.paletteComparison=Boolean(media.palette);if(media.palette){copy(media.palette.video,path.join(dest,'media/palette/play.mp4'));copy(media.palette.poster,path.join(dest,'media/palette/poster.jpg'));}
 writeProductionGuides(dest);
 write(path.join(dest,'registry/catalog.json'),c);write(path.join(dest,'project.json'),{schemaVersion:1,id:crypto.randomUUID(),name:path.basename(dest),kind:'production-catalog',pluginVersion:read(path.join(root,'.codex-plugin/plugin.json')).version});write(path.join(dest,'qa/catalog-bindings.json'),{count:Object.keys(media).length,videoHashes:Object.fromEntries(Object.keys(media).map(k=>[k,sha(media[k].video)])),sourceMediaRetained:true,copyMode:'independent filesystem clone when supported; no symlinks or runtime test dependency'});
 return {project:dest,page:'review/index.html',boundVideos:Object.keys(media).length,next:'preview --project 此目录，打开返回地址下的review/'};
}
