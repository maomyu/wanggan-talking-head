import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {orchestrations,loadOrchestration,selectOrchestration,orchestrationAxes} from '../runtime/orchestration.mjs';
import {collaborationRoute,resolve,checkCollaborationLibrary} from '../runtime/collaboration.mjs';
import {productionCatalog} from '../runtime/production-entry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args={};
for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
assert(args.source&&args.work&&args.reference,'--source --work --reference required');
const work=path.resolve(args.work),reference=path.resolve(args.reference);assert(!work.startsWith(root+path.sep)&&work!==root&&(!fs.existsSync(work)||args.resume==='true'));if(args.resume==='true'){assert.equal(JSON.parse(fs.readFileSync(path.join(work,'project.json'))).name,'formal-mechanism-integration');for(const n of ['auto','rhythm-only','change'])fs.rmSync(path.join(work,n),{recursive:true,force:true});}fs.mkdirSync(work,{recursive:true});fs.mkdirSync(path.join(work,'qa'),{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const cli=(...a)=>execFileSync(process.execPath,[path.join(root,'scripts/studio.mjs'),...a],{encoding:'utf8',maxBuffer:12e6});
const json=(...a)=>JSON.parse(cli(...a));
const mechanisms=orchestrations().filter(r=>r.kind==='mechanism'),mothers=productionCatalog().families,cases=[],parity=[];
assert.equal(mechanisms.length,8);assert.equal(mothers.length,19);assert.equal(checkCollaborationLibrary().approvedOrchestrations,10);
for(const r of mechanisms){for(const id of [r.id,r.code,r.name])assert.equal(loadOrchestration(id).id,r.id);assert.equal(collaborationRoute(`用我的口播制作完整视频，采用${r.name}编排`).orchestration.id,r.id);assert.equal(collaborationRoute(`保留${r.name}编排，只调整节奏`).orchestration,null);assert.deepEqual(collaborationRoute(`保留${r.name}编排，只调整节奏`).axes,['rhythm']);}
for(const mother of mothers)for(const r of mechanisms){assert(resolve(mother.id).ok);const route=collaborationRoute('制作完整口播',null,r.id);assert.equal(route.axes.length,11);assert.equal(route.orchestration.id,r.id);}
cases.push({name:'19 mother recipes × 8 independent mechanism selection contracts',count:152,scope:'selection/design contracts, not 152 rendered films'});
assert.throws(()=>selectOrchestration('采用同物接力和空间漫游'),/多套/);assert.equal(selectOrchestration('由智能体自由搭配').id,'auto');
const draft=path.join(work,'auto');json('init','--project',draft,'--source',args.source,'--recipe','ink','--orchestration','auto');assert.equal(read(path.join(draft,'project.json')).status,'awaiting-design');
assert.throws(()=>cli('check','--project',draft),/auto编排尚未/);assert.throws(()=>cli('select-orchestration','--project',draft,'--orchestration','spatial'),/reason/);
json('select-orchestration','--project',draft,'--orchestration','G04','--reason','同一条件下比较两个选择，保留相同尺度和读窗');assert.equal(read(path.join(draft,'orchestration.json')).id,'parallel');assert.equal(read(path.join(draft,'project.json')).orchestration.selection,'agent-reasoned');
assert(!fs.existsSync(path.join(draft,'scene-plan.json')));for(const f of fs.readdirSync(path.join(draft,'plans')))assert.equal(read(path.join(draft,'plans',f)).status,'awaiting-design');
assert.throws(()=>cli('select-orchestration','--project',draft,'--orchestration','relay','--reason','换一个'),/revise/);cases.push({name:'agent auto choice must record semantic reason; no old-script injection',passed:true});
const wrong=path.join(work,'wrong.mp4');fs.writeFileSync(wrong,'incorrect');assert.throws(()=>cli('reproduce','--project',path.join(work,'reject'),'--source',wrong,'--recipe','editorial-print','--orchestration','spatial'),/哈希一致/);
assert.throws(()=>cli('reproduce','--project',path.join(work,'reject-style'),'--source',args.source,'--recipe','ink','--orchestration','spatial'),/其他配方组合请init/);
cases.push({name:'source hash and unsupported cross-style fixture guarded',passed:true});
for(const r of mechanisms){
 const dir=path.join(work,r.id);if(args.resume!=='true')json('reproduce','--project',dir,'--source',args.source,'--recipe','editorial-print','--orchestration',r.code);
 if(args.resume!=='true')fs.writeFileSync(path.join(work,r.id+'-build.log'),cli('run','--project',dir,'--until','build'));else json('check','--project',dir);
 assert.equal(read(path.join(dir,'project.json')).orchestration.id,r.id);assert.equal(sha(path.join(dir,'assets/edited-voice.wav')),sha(path.join(reference,r.id,'assets/edited-voice.wav')));
 const files=['scripts/film.mjs','scripts/film.css','scripts/composition.template','assets/config.js','assets/film.css','timing.json','scene-plan.json','edit-plan.json'];
 for(const rel of files)assert.equal(sha(path.join(dir,rel)),sha(path.join(reference,r.id,rel)),r.id+' '+rel);
 parity.push({id:r.id,filesEqual:files,voiceEqual:true,sourceSha256:sha(path.join(dir,'assets/master.mp4'))});console.log('Built and source-parity verified '+r.id);
}
const base=path.join(work,'spatial'),rev=path.join(work,'rhythm-only');json('revise','--from',base,'--out',rev,'--axes','rhythm','--request','只改节奏，保留其他模块');
const revision=read(path.join(rev,'revision.json'));assert.deepEqual(revision.allowedPlanFiles,['timing.json']);assert.equal(read(path.join(rev,'project.json')).orchestration.id,'spatial');json('scope','--project',rev);
const target=path.join(rev,'plans/palette-tokens.json'),prior=fs.readFileSync(target);fs.appendFileSync(target,'\n');assert.throws(()=>cli('scope','--project',rev),/受保护输入/);fs.writeFileSync(target,prior);
assert.throws(()=>cli('revise','--from',base,'--out',path.join(work,'bad-rev'),'--axes','rhythm','--orchestration','relay'),/选择新编排需联动/);
const changed=path.join(work,'change');json('revise','--from',base,'--out',changed,'--orchestration','relay');const cr=read(path.join(changed,'revision.json'));assert.equal(cr.allowedPlanFiles.length,7);assert.equal(Object.keys(cr.protectedSelections).length,4);assert.equal(read(path.join(changed,'orchestration.json')).id,'relay');
cases.push({name:'rhythm-only preserves mechanism and other ten plans; changing mechanism owns seven axes',passed:true});
write(path.join(work,'project.json'),{id:crypto.randomUUID(),name:'formal-mechanism-integration'});const preview=json('preview','--project',work);
const {chromium}=await import(pathToFileURL(path.join(root,'runtime/node_modules/playwright/index.mjs')));const browser=await chromium.launch({headless:true}),frames=[];
try{for(const r of mechanisms){const page=await browser.newPage({viewport:{width:1080,height:1920}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(preview.url+r.id+'/index.html');await page.waitForFunction(()=>window.RESEARCH_READY);const result=await page.evaluate(()=>{let collision=0,caption=0;const fingerprints=[];for(let f=0;f<1100;f++){window.FILM_RENDER(f/30);const s=window.FILM_STATE,p=s.person,cx=p.x+p.diameter/2,cy=p.y+p.diameter/2;for(const t of s.textBoxes){const x=Math.max(t.x,Math.min(cx,t.x+t.w)),y=Math.max(t.y,Math.min(cy,t.y+t.h));if((x-cx)**2+(y-cy)**2<(p.diameter/2+4)**2)collision++;}const b=document.querySelector('#caption').getBoundingClientRect();if(b.top<1599||b.bottom>1765)caption++;if([0,130,324,435,570,657,768,870,925,1099].includes(f))fingerprints.push({f,canvas:document.getElementById('art').toDataURL(),state:s,headline:document.getElementById('headline').textContent,caption:document.getElementById('caption-text').textContent});}return {frames:1100,collision,caption,fingerprints};});assert.equal(result.collision,0,r.id);assert.equal(result.caption,0,r.id);assert.deepEqual(errors,[]);
 // Compare actual canvas pixels/state with the approved test implementation.
 await page.goto(args['reference-url'].replace(/\/$/,'')+'/'+r.id+'/index.html');await page.waitForFunction(()=>window.RESEARCH_READY);const approved=await page.evaluate(fs=>fs.map(f=>{window.FILM_RENDER(f/30);return {f,canvas:document.getElementById('art').toDataURL(),state:window.FILM_STATE,headline:document.getElementById('headline').textContent,caption:document.getElementById('caption-text').textContent};}),result.fingerprints.map(f=>f.f));const pixelChecks=[];for(let i=0;i<approved.length;i++){const a=result.fingerprints[i],b=approved[i];assert.deepEqual({...a,canvas:null},{...b,canvas:null},r.id+' authored state differs at '+a.f);let delta={mean:0,max:0,changedPixels:0,largeDeltaFraction:0};if(a.canvas!==b.canvas){const python=path.join(root,'runtime/.venv/bin/python');delta=JSON.parse(execFileSync(python,['-c',`import sys,json,io,base64
import numpy as np
from PIL import Image
x=json.load(sys.stdin)
a,b=[np.asarray(Image.open(io.BytesIO(base64.b64decode(s.split(',')[1])))).astype(float) for s in x]
d=abs(a-b)
print(json.dumps({'mean':float(d.mean()),'max':float(d.max()),'changedPixels':int((d.max(axis=2)>0).sum()),'largeDeltaFraction':float((d.max(axis=2)>8).mean())}))`],{input:JSON.stringify([a.canvas,b.canvas]),encoding:'utf8',maxBuffer:1024*1024}));assert(delta.mean<.01&&delta.largeDeltaFraction<.001,r.id+' substantive raster change at '+a.f+': '+JSON.stringify(delta));}pixelChecks.push({frame:a.f,...delta});}frames.push({id:r.id,frames:1100,personTextCollisions:0,captionViolations:0,authoredStateParity:10,pixelChecks,rasterTolerance:'mean < 0.01/255 and pixels differing by >8 <0.1%; transparent-edge browser rounding only'});await page.close();console.log('Frame/state parity '+r.id);}}finally{await browser.close();json('stop','--project',work);}
write(path.join(work,'report.json'),{ok:true,version:'1.22.0',cases,parity,frames,sourceUnchanged:sha(args.source)===mechanisms[0].reference.sourceSha256,scope:'8 formal CLI rebuilds; 8800 authored-frame safety checks and 80 actual canvas parity checks. Reuses approved full MP4 evidence; no new full encode, no cross-script or 152-film claim.'});console.log(JSON.stringify({ok:true,report:path.join(work,'report.json')}));
