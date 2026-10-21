// Installed into an explicitly selected, hash-bound reference project.
// The scene code remains source-specific; new footage follows the design workflow.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const i=process.argv.indexOf('--project');
const R=i>=0?path.resolve(process.argv[i+1]):path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=n=>JSON.parse(fs.readFileSync(path.join(R,n),'utf8'));
const write=(n,d)=>fs.writeFileSync(path.join(R,n),JSON.stringify(d,null,2)+'\n');
const project=read('project.json'),key=project.recipeId;
if(!project.referenceFixture)throw Error('历史配方编译器只用于显式案例复现；新素材需要本片build-project实现');
const map={style:'style-contract',palette:'palette-tokens',material:'material-tokens',representation:'object-spec',motion:'motion-events',camera:'camera-plan',transition:'transition-plan',typography:'layout-plan',lighting:'finish-plan',information:'semantic-plan',rhythm:'timing'};
if(key==='editorial-print')execFileSync(process.execPath,[path.join(R,'scripts/build.mjs')],{cwd:R,stdio:'inherit'});
else{
 const C={key,source:read('timing.json')};for(const[k,n]of Object.entries(map))C[k]=read('plans/'+n+'.json');
 const anchorMap={cut:'cut',pause:'pause',compare:'distinguish',avoid:'avoid',reduce:'debt'};
 for(const[action,anchor]of Object.entries(anchorMap)){const w=C.motion.actionWindows[action],d=w[1]-w[0],a=C.rhythm.eventSchedule[anchor];C.motion.actionWindows[action]=[a,a+d];}
 const reveal=C.rhythm.eventSchedule.riskReveal;C.motion.actionWindows.riskReveal=[reveal-15,reveal+2];
 fs.writeFileSync(path.join(R,'assets/film-config.js'),'window.FILM_CONFIG='+JSON.stringify(C)+';window.STUDY_TIMING=window.FILM_CONFIG.source;\n');
 const colors=C.palette.colorRoles,L=C.typography;
 const css=`:root{${Object.entries(colors).map(([k,v])=>`--${k}:${v}`).join(';')};--grid-step:${C.lighting.finishLayers.gridStep}px}#headline-box{left:${L.readingZones.title[0]}px;top:${L.readingZones.title[1]}px;width:${L.readingZones.title[2]}px}#captions{left:${L.captionZones.box[0]}px;top:${L.captionZones.box[1]}px;width:${L.captionZones.box[2]}px}#caption-text{font-size:${L.captionZones.fontSize}px}@font-face{font-family:FilmSans;src:url(assets/fonts/${L.fontRoles.title});font-weight:700}@font-face{font-family:FilmSans;src:url(assets/fonts/${L.fontRoles.body});font-weight:500}`;
 const html=fs.readFileSync(path.join(R,'scripts/composition.template'),'utf8').replace('__TOKENS__',css).replaceAll('__KEY__',key).replaceAll('__NAME__',C.style.name);
 fs.writeFileSync(path.join(R,'index.html'),html);
}
const t=read('timing.json');
write('plans/brief.json',{width:t.width,height:t.height,fps:t.fps,source:'explicit-approved-recipe-reference'});
write('edit-plan.json',{fps:t.fps,frameCount:t.frameCount,audioSegments:t.audioSegments,audio:{fadeSamplesAtActualSeams:0}});
// Existing media preparation checks the actual declared local font inventory.
const plugin=process.env.WG_PLUGIN_ROOT;if(!plugin)throw Error('请经正式studio入口构建，以共享固定依赖');
const fonts=JSON.parse(fs.readFileSync(path.join(plugin,'assets/fonts/catalog.json')));
const allText=JSON.stringify(t)+JSON.stringify(read('plans/semantic-plan.json'))+fs.readFileSync(path.join(R,'index.html'),'utf8').replace(/<[^>]*>/g,'');
const roles=Object.values(read('plans/layout-plan.json').fontRoles);
write('font-usage.json',{scope:'approved case timing, semantic text and markup; visual readability checked separately',fonts:Object.fromEntries(fonts.map(f=>[f.file,roles.includes(f.file)?allText:'']))});
write('qa/module-bindings.json',{axes:Object.keys(map),artifacts:map,recipe:key,scope:'eleven plans compiled into actual frame function; original case only'});
