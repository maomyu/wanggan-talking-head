import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const R=path.resolve(import.meta.dirname,'..'),APP=path.join(process.env.HOME,'plugins/wanggan-talking-head');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const proof=read(path.join(R,'qa/legacy-reading-comparison.json')),state=read(path.join(R,'qa/batch-state.json')),versions=read(path.join(APP,'choreography-library/source-versions.json')),overrides=read(path.join(R,'qa/director-overrides.json'));
const anchor=" const css=document.createElement('style');css.textContent=`";
const patch=" // Retire legacy reading text while retaining its terminal/desktop chrome.\n for(const bar of root.querySelectorAll('.terminal-bar')){const label=document.createElement('span');label.textContent=bar.textContent;label.style.setProperty('visibility','hidden','important');bar.replaceChildren(label);}\n for(const label of root.querySelectorAll('.desktop-bar span'))label.style.setProperty('visibility','hidden','important');\n";
const jobs=[];
for(const key of ['terminal-ascii','early-desktop']){
 const p=path.join(R,'variants',key),backup=path.join(R,'revisions',key+'-before-legacy-reading-retirement'),source=fs.readFileSync(path.join(p,'scripts/director.js'),'utf8'),h=sha(path.join(p,'scripts/director.js')),v=proof[key];
 if(state.jobs[key].status!=='failed'||fs.existsSync(path.join(p,'outputs/final.mp4'))||fs.existsSync(backup)||overrides.styles[key])throw Error('Only failed unrendered original may be revised: '+key);
 if(h!==versions[key].directorSha256||sha(path.join(p,'assets/director.js'))!==h||source.split(anchor).length!==2)throw Error('Original source changed: '+key);
 if(v.states!==48||!v.allChangesWithinLegacyBar||v.captionAreaExactStates!==48)throw Error('Unreviewed raster impact: '+key);
 jobs.push({key,p,backup,source,h});
}
for(const j of jobs)fs.cpSync(j.p,j.backup,{recursive:true});
for(const j of jobs){
 const revised=j.source.replace(anchor,patch+anchor);for(const rel of ['scripts/director.js','assets/director.js'])fs.writeFileSync(path.join(j.p,rel),revised);
 const project=read(path.join(j.p,'project.json'));project.id=crypto.randomUUID();project.revisionParent=path.relative(R,j.backup);project.revisionReason='Retire legacy terminal/desktop text covered by new director; preserve chrome';fs.writeFileSync(path.join(j.p,'project.json'),JSON.stringify(project,null,2));
 overrides.styles[j.key]={oldDirectorSha256:j.h,newDirectorSha256:sha(path.join(j.p,'scripts/director.js')),indexHtmlSha256:sha(path.join(j.p,'index.html')),backup:path.relative(R,j.backup),module:'layout',revisionKind:'retired-legacy-reading-layer',comparisonStates:48,wholeFrameExact:proof[j.key].wholeFrameExact,maxChangedPixels:proof[j.key].maxChangedPixels,proof:'qa/legacy-reading-comparison.json'};
}
overrides.scope='Layout-only revisions with originals preserved. Clipped scroll panels have exact raster proof; retired legacy reading text has measured sliver removal within old bar. No occlusion waivers, facts, voice, timing or portrait geometry changes.';
fs.writeFileSync(path.join(R,'qa/director-overrides.json'),JSON.stringify(overrides,null,2));console.log(JSON.stringify({revised:jobs.map(j=>j.key),originalProjectsPreserved:true}));
