import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const R=path.resolve(import.meta.dirname,'..'),APP=path.join(process.env.HOME,'plugins/wanggan-talking-head'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const keys=process.argv.slice(2),state=read(path.join(R,'qa/batch-state.json')),versions=read(path.join(APP,'choreography-library/source-versions.json')),probe=read(path.join(R,'qa/scroll-clip-probe.json')),comparison=read(path.join(R,'qa/scroll-clip-comparison.json'));
const before='gsap.set(scrollWorld,{y:-progress*900});scrollViewport.style.opacity=',after="gsap.set(scrollWorld,{y:-progress*900});const clipBounds=scrollViewport.getBoundingClientRect();for(const panel of scrollWorld.children){const panelBounds=panel.getBoundingClientRect();panel.style.visibility=panelBounds.bottom<=clipBounds.top||panelBounds.top>=clipBounds.bottom?'hidden':'visible';}scrollViewport.style.opacity=";
const overrideFile=path.join(R,'qa/director-overrides.json'),overrides=fs.existsSync(overrideFile)?read(overrideFile):{scope:'Layout implementation revision only: explicit visibility for panels wholly outside the declared overflow-hidden viewport; no allow-occlusion flags, facts, voice, timings, geometry or visible raster changes.',styles:{}};
const planned=[];
for(const key of keys){
 const p=path.join(R,'variants',key),source=fs.readFileSync(path.join(p,'scripts/director.js'),'utf8'),backup=path.join(R,'revisions',key+'-before-scroll-visibility');
 if(state.jobs[key].status!=='failed'||fs.existsSync(path.join(p,'outputs/final.mp4'))||fs.existsSync(path.join(p,'qa/batch-verification.json'))||fs.existsSync(backup)||overrides.styles[key])throw Error('Only an unrendered failed original may be revised: '+key);
 const oldSha=sha(path.join(p,'scripts/director.js'));if(oldSha!==versions[key].directorSha256||sha(path.join(p,'assets/director.js'))!==oldSha||source.split(before).length!==2)throw Error('Original director differs: '+key);
 const rows=comparison.rows.filter(x=>x.key===key);if(rows.length!==48||rows.some(x=>x.wholeFrameDifferenceBox!==null))throw Error('Raster equivalence missing: '+key);
 const raw=fs.readFileSync(path.join(p,'qa/batch-check.log'),'utf8'),report=JSON.parse(raw.slice(raw.indexOf('{\n  "ok"'))),errors=['runtime','layout','motion','contrast'].flatMap(part=>report[part].findings.filter(f=>f.severity==='error'));
 if(!errors.length)throw Error('Expected original clipping diagnostic');
 for(const error of errors){const panel=error.selector.match(/section:nth-of-type\((\d+)\)/)?.[1];if(error.code!=='text_occluded'||error.containerSelector!=='#captions'||!panel)throw Error('Unreviewed error '+key);
  for(const t of error.times||[error.time]){const sample=probe.states.find(s=>s.key===key&&s.t===t);if(!sample?.panels[Number(panel)-1]?.hidden)throw Error('Reported text may actually be visible: '+key+'/'+t);}}
 planned.push({key,p,backup,source,oldSha});
}
// Preserve full original projects before changing either implementation.
for(const item of planned)fs.cpSync(item.p,item.backup,{recursive:true});
for(const item of planned){const revised=item.source.replace(before,after);for(const rel of ['scripts/director.js','assets/director.js'])fs.writeFileSync(path.join(item.p,rel),revised);const newSha=sha(path.join(item.p,'scripts/director.js'));const project=read(path.join(item.p,'project.json'));project.id=crypto.randomUUID();project.revisionParent=path.relative(R,item.backup);project.revisionReason='Match wholly clipped panel visibility to actual overflow-hidden rendering';fs.writeFileSync(path.join(item.p,'project.json'),JSON.stringify(project,null,2));overrides.styles[item.key]={oldDirectorSha256:item.oldSha,newDirectorSha256:newSha,indexHtmlSha256:sha(path.join(item.p,'index.html')),backup:path.relative(R,item.backup),module:'layout',comparisonStates:48,wholeFrameExact:48};}
fs.writeFileSync(overrideFile,JSON.stringify(overrides,null,2));console.log(JSON.stringify({revised:planned.map(x=>x.key),originalProjectsPreserved:true,visibleRasterChanges:0}));
