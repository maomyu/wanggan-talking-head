// Integration check against user-supplied, hash-bound reference media.
// Keep the work directory outside the plugin; remove only after preserving evidence.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {collaborationRoute,checkCollaborationLibrary} from '../runtime/collaboration.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args={};
for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].slice(2)]=process.argv[i+1];
for(const k of ['source','reference-root','work','preview-url'])assert(args[k],'missing --'+k);
const work=path.resolve(args.work),reference=path.resolve(args['reference-root']);
assert(!work.startsWith(root+path.sep)&&work!==root,'work must be outside plugin');
assert(!fs.existsSync(work),'use a new work directory');fs.mkdirSync(work,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const cli=(...a)=>execFileSync(process.execPath,[path.join(root,'scripts/studio.mjs'),...a],{encoding:'utf8',maxBuffer:8*1024*1024});
const json=(...a)=>JSON.parse(cli(...a)),cases=[];
const reject=(name,fn,pattern)=>{assert.throws(fn,pattern);cases.push({name,passed:true});};
const sourceHash=sha(args.source),sourceVoiceHash=sha(path.join(reference,'diagram/assets/edited-voice.wav'));
assert.equal(checkCollaborationLibrary().approvedOrchestrations,2);
assert.equal(checkCollaborationLibrary().approvedRecipes,7);
assert.equal(json('orchestrations','--id','diagram').name,'连续图解');
const route=collaborationRoute('保留画风、连续图解编排和字幕，只调整节奏，让对比更早落定');
assert.deepEqual(route.axes,['rhythm']);assert.equal(route.orchestration,null);
assert.equal(collaborationRoute('用我的口播做完整视频，采用人物主导编排').orchestration.id,'presenter');
assert.equal(collaborationRoute('改成连续图解编排').axes.length,7);
reject('ambiguous orchestration',()=>collaborationRoute('人物主导、连续图解'),/多套编排/);
assert.equal(collaborationRoute('比较人物主导和连续图解',null,'diagram').orchestration.id,'diagram');
cases.push({name:'orthogonal selection and rhythm-only natural-language route',passed:true});
const draft=path.join(work,'draft');
json('init','--project',draft,'--source',args.source,'--recipe','ink','--orchestration','diagram');
assert.equal(read(path.join(draft,'project.json')).status,'awaiting-design');
assert.equal(read(path.join(draft,'project.json')).recipeId,'ink');
assert.equal(read(path.join(draft,'orchestration.json')).id,'diagram');
for(const f of fs.readdirSync(path.join(draft,'plans')))assert.equal(read(path.join(draft,'plans',f)).status,'awaiting-design');
assert(!fs.existsSync(path.join(draft,'scene-plan.json'))&&!fs.existsSync(path.join(draft,'scripts/motion.mjs')));
cases.push({name:'new material stays awaiting-design without finance template injection',passed:true});
reject('unverified cross-recipe reproduction',()=>cli('reproduce','--project',path.join(work,'invalid-combo'),'--source',args.source,'--recipe','ink','--orchestration','diagram'),/认可复现仅为写实极简/);
const wrong=path.join(work,'wrong-source.mp4');fs.writeFileSync(wrong,'not the approved source');
reject('source hash guard',()=>cli('reproduce','--project',path.join(work,'invalid-source'),'--source',wrong,'--recipe','minimal','--orchestration','diagram'),/哈希一致/);
const parity=[];
for(const key of ['presenter','diagram']){
 const out=path.join(work,key);
 json('reproduce','--project',out,'--source',args.source,'--recipe','minimal','--orchestration',key);
 fs.writeFileSync(path.join(work,key+'-build.log'),cli('run','--project',out,'--until','build'));
 const files=['index.html','assets/film-config.js','assets/film.css','scripts/motion.mjs','scripts/build-core.mjs','scripts/composition.template','timing.json','recipe.json','scene-plan.json','assets/edited-voice.wav',...fs.readdirSync(path.join(reference,key,'plans')).filter(n=>n!=='brief.json').map(n=>'plans/'+n)];
 const inputs=Object.fromEntries(files.map(n=>{assert.equal(sha(path.join(out,n)),sha(path.join(reference,key,n)),key+' differs: '+n);return[n,sha(path.join(out,n))];}));
 parity.push({orchestration:key,files:inputs,allEqual:true});
}
const base=path.join(work,'diagram'),variant=path.join(work,'rhythm');
json('revise','--from',base,'--out',variant,'--request','保留连续图解编排、画风和原声，只修改节奏');
const revision=read(path.join(variant,'revision.json'));
assert.equal(revision.module,'rhythm');assert.deepEqual(revision.allowedPlanFiles,['timing.json']);
const sample=read(path.join(root,'examples/orchestrations/rhythm-only.json'));
assert.equal(sha(path.join(variant,'plans/timing.json')),sample.basePlanSha256);
write(path.join(variant,'plans/timing.json'),sample.afterPlan);
fs.writeFileSync(path.join(work,'rhythm-build.log'),cli('run','--project',variant,'--until','build'));
const protectedFiles=Object.entries(revision.protectedInputs).map(([n,h])=>{assert.equal(sha(path.join(variant,n)),h,'protected '+n);return n;});
assert.deepEqual(read(path.join(base,'orchestration.json')),read(path.join(variant,'orchestration.json')));
assert.equal(sha(path.join(variant,'assets/film-config.js')),sha(path.join(reference,'diagram-rhythm/assets/film-config.js')));
function tamper(rel,mutate,pattern,name){const file=path.join(variant,rel),before=fs.readFileSync(file);try{const v=read(file);mutate(v);write(file,v);reject(name,()=>cli('run','--project',variant,'--until','build'),pattern);}finally{fs.writeFileSync(file,before);}}
tamper('plans/palette-tokens.json',v=>v.colorRoles.ink='#ffffff',/受保护输入/,'unselected palette plan cannot change');
tamper('project.json',v=>v.orchestration.id='presenter',/受保护编排/,'orchestration selection cannot drift');
tamper('project.json',v=>v.timingContract='disabled',/受保护事件合同/,'event timing guard cannot be disabled');
tamper('timing.json',v=>v.captions[0].text='被误改的字幕',/受保护输入/,'caption/source timeline cannot change');
tamper('plans/timing.json',v=>delete v.eventSchedule.compareReady,/事件缺失或越界/,'undefined event rejected');
tamper('plans/timing.json',v=>v.eventSchedule.compareReady=10,/路径倒序/,'event reordering rejected');
const code=path.join(variant,'scripts/motion.mjs'),codeBefore=fs.readFileSync(code);
try{fs.appendFileSync(code,'\n// accidental implementation edit\n');reject('rhythm-only implementation stays frozen',()=>cli('run','--project',variant,'--until','build'),/受保护输入/);}finally{fs.writeFileSync(code,codeBefore);}
reject('orchestration change cannot hide inside rhythm-only edit',()=>cli('revise','--from',base,'--out',path.join(work,'invalid-revision'),'--axes','rhythm','--orchestration','presenter'),/选择新编排需联动/);
const changed=path.join(work,'change-orchestration');
json('revise','--from',base,'--out',changed,'--orchestration','presenter','--request','保留画风，改成人物主导');
assert.equal(read(path.join(changed,'revision.json')).allowedPlanFiles.length,7);
assert.equal(read(path.join(changed,'orchestration.json')).id,'presenter');
cases.push({name:'explicit orchestration change owns seven relevant axes and keeps visual identity',passed:true});
const{chromium}=await import(pathToFileURL(path.join(root,'runtime/node_modules/playwright/index.mjs'))),browser=await chromium.launch({headless:true});
const states=[];
try{for(const key of ['presenter','diagram','rhythm']){
 const page=await browser.newPage({viewport:{width:1080,height:1920}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(args['preview-url'].replace(/\/$/,'')+'/'+key+'/index.html');
 await page.waitForFunction(()=>window.SELECTOR_READY&&document.fonts.status==='loaded');
 states.push(await page.evaluate(()=>{const frames=[];for(let f=0;f<1100;f++){window.FILM_RENDER(f/30);frames.push({state:JSON.parse(JSON.stringify(window.FILM_STATE)),caption:document.querySelector('#caption-text').textContent,title:document.querySelector('#headline').textContent});}return frames;}));
 assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close();}
let changedFrames=0;
for(let f=0;f<1100;f++){
 const a=states[1][f],b=states[2][f];assert.equal(a.caption,b.caption);assert.equal(a.title,b.title);assert.deepEqual(a.state.person,b.state.person);
 if(JSON.stringify(a.state.actors)!==JSON.stringify(b.state.actors)||JSON.stringify(a.state.camera)!==JSON.stringify(b.state.camera))changedFrames++;
}
assert.equal(changedFrames,142);
for(const f of [615,685,782,897,1099]){assert.deepEqual(states[1][f].state.actors,states[2][f].state.actors);assert.deepEqual(states[1][f].state.camera,states[2][f].state.camera);}
assert.notDeepEqual(states[0][598].state.person,states[1][598].state.person);
assert.equal(sha(args.source),sourceHash);assert.equal(sha(path.join(reference,'diagram/assets/edited-voice.wav')),sourceVoiceHash);
const report={ok:true,version:read(path.join(root,'.codex-plugin/plugin.json')).version,cases,parity,revision:{protectedFiles,otherProfessionalPlans:10,changedEvents:Object.keys(sample.changedEvents),framesChecked:1100,changedSpatialStateFrames:changedFrames,identicalResultFrames:[615,685,782,897,1099],voiceCaptionsPersonAndOrchestrationPreserved:true},sourceUnchanged:true,scope:'formal CLI integration and actual authored-frame states; approved MP4 evidence reused only because visual inputs match; no new full encode or independent review'};
write(path.join(work,'report.json'),report);console.log(JSON.stringify({ok:true,cases:cases.length,parity:parity.map(r=>r.orchestration),framesChecked:1100,changedFrames,report:path.join(work,'report.json')}));
