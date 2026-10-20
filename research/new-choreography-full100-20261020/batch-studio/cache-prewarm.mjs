// Share immutable decoded source PNGs for byte-identical fixed footage.
// Every style still runs its own complete1100-frame composite render.
import fs from'node:fs';import path from'node:path';import os from'node:os';import crypto from'node:crypto';
const R=path.resolve(import.meta.dirname,'..'),root=path.join(os.tmpdir(),'hyperframes-extract-cache-'+process.getuid()),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical='426a3d57498351e72b77c396dacb47cb5f911f66c91582885da2026a8bd0bf58';
function entryFor(key){const videoPath=path.join(R,'variants',key,'assets/master.mp4'),s=fs.statSync(videoPath),blob={p:videoPath,m:Math.floor(s.mtimeMs),s:s.size,ms:0,d:1100/30,f:'30',fmt:'png'};return path.join(root,'hfcache-v8-'+crypto.createHash('sha256').update(JSON.stringify(blob)).digest('hex').slice(0,16));}
const source=entryFor('charcoal'),sourceMovie=path.join(R,'variants/charcoal/assets/master.mp4');
if(sha(sourceMovie)!==canonical||!fs.existsSync(path.join(source,'.hf-complete')))throw Error('Canonical completed source cache unavailable');
const frames=fs.readdirSync(source).filter(n=>/^frame_\d+\.png$/.test(n)).sort();if(frames.length!==1100)throw Error('Incomplete canonical PNG cache');
const cat=JSON.parse(fs.readFileSync(path.join(R,'catalogue-full.json'),'utf8')),result=[];
for(const s of cat.styles){
 const project=path.join(R,'variants',s.key),movie=path.join(project,'assets/master.mp4'),html=fs.readFileSync(path.join(project,'index.html'),'utf8'),videos=html.match(/<video\b[^>]*>/g)||[];
 const attr=(name)=>videos[0]?.match(new RegExp(name+'="([^"]+)"'))?.[1];
 if(sha(movie)!==canonical||videos.length!==1||attr('src')!=='assets/master.mp4'||Number(attr('data-media-start'))!==0||Number(attr('data-duration'))!==1100/30||/data-playback-rate=/.test(videos[0]))throw Error('Nonidentical source extraction: '+s.key);
 if(fs.existsSync(path.join(project,'outputs/final.mp4'))){result.push({key:s.key,status:'complete-output-preserved'});continue;}
 const dest=entryFor(s.key);if(fs.existsSync(dest)){result.push({key:s.key,cacheKey:path.basename(dest),status:'existing-preserved'});continue;}
 const temp=dest+'.source-share-'+process.pid+'-'+crypto.randomUUID();fs.mkdirSync(temp);
 try{for(const file of frames)fs.linkSync(path.join(source,file),path.join(temp,file));fs.writeFileSync(path.join(temp,'.hf-complete'),'');fs.renameSync(temp,dest);result.push({key:s.key,cacheKey:path.basename(dest),status:'shared-immutable-source-pngs',frames:frames.length});}
 catch(e){fs.rmSync(temp,{recursive:true,force:true});throw e;}
}
const report={kind:'same-source-native-cache-prewarm',sourceMovieSha256:canonical,sourceCacheKey:path.basename(source),pinnedCacheSchema:'HF0.8.174 hfcache-v8 local-file key',sourceFrameCount:1100,firstPNG:{file:frames[0],sha256:sha(path.join(source,frames[0]))},lastPNG:{file:frames.at(-1),sha256:sha(path.join(source,frames.at(-1)))},method:'Hard links only within temporary decoded source cache; source projects and deliverable MP4s remain independent. No encoded composite reuse.',newEntries:result.filter(x=>x.status==='shared-immutable-source-pngs').length,entries:result};fs.writeFileSync(path.join(R,'qa/cache-prewarm.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({prewarmed:report.newEntries,sourceFrames:1100,qualityChange:false}));
