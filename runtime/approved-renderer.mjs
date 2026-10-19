import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath}from'node:url';
const plugin=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.resolve(process.argv[process.argv.indexOf('--project')+1]);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),put=(p,d)=>fs.writeFileSync(path.join(root,p),JSON.stringify(d,null,2));
const plans=Object.fromEntries(['brief','art-direction','layout-plan','motion-plan','edit-plan'].map(k=>[k,read(path.join(root,'plans',k+'.json'))])),art=plans['art-direction'],layout=plans['layout-plan'],motion=plans['motion-plan'],edit=plans['edit-plan'],brief=plans.brief;
const catalogue=read(path.join(plugin,'style-library/catalog.json')),style=catalogue.styles.find(s=>s.key===art.styleId||s.id===art.styleId||s.name===art.styleId);if(!style)throw Error('画风未登记，请先按新增画风流程实现并验证');
if(edit.fixtureId!=='approved-finance-20261019'||edit.fps!==30||edit.frameCount!==1100||brief.width!==1080||brief.height!==1920)throw Error('已认可案例复现器只适用于完整财经样例；新内容与新剪辑由完整模块实现custom构建，不套样例');
const timing={...edit,duration:edit.frameCount/edit.fps,source:{kind:'project-master',sha256:sha(path.join(root,'assets/master.mp4'))}};
fs.cpSync(path.join(plugin,'style-library/runtime/vendor'),path.join(root,'assets/vendor'),{recursive:true});fs.cpSync(path.join(plugin,'assets/fonts'),path.join(root,'assets/fonts'),{recursive:true});
const base=path.dirname(path.join(plugin,'style-library',style.implementation));fs.cpSync(path.join(base,'assets'),path.join(root,'assets'),{recursive:true});
fs.writeFileSync(path.join(root,'assets/timing.js'),'window.STUDY_TIMING='+JSON.stringify(timing)+';');
let html=fs.readFileSync(path.join(base,'index.html'),'utf8').replaceAll('assets/presenter.mp4','assets/master.mp4').replaceAll('data-has-audio="true"','data-has-audio="false" muted');
html=html.replace(/<audio\b[^>]*\bid=["']voice["'][\s\S]*?<\/audio>/g,'');
html=html.replace('</main>',`<audio id="voice" src="assets/edited-voice.wav" data-start="0" data-duration="${timing.duration}" data-track-index="1"></audio></main>`);
const c=layout.caption||{},num=(v,f)=>Number.isFinite(v)?v:f;for(const [k,v]of Object.entries(c))if(!Number.isFinite(v))throw Error('非数值排版参数:'+k);
const css=`#captions{left:${num(c.x,64)}px;top:${num(c.y,1600)}px;width:${num(c.width,952)}px}#caption-text{font-size:${num(c.size,60)}px}`;
html=html.replace('</head>','<style id="project-layout">'+css+'</style></head>');
if(motion.travelSeconds!==undefined){if(!(motion.travelSeconds>.05&&motion.travelSeconds<=3))throw Error('人物交接时长超出有效范围');html=html.replace(/(?<!\d)\.6(?!\d)/g,String(motion.travelSeconds));}
fs.writeFileSync(path.join(root,'index.html'),html);put('timing.json',timing);put('edit-plan.json',edit);put('facts.json',{source:timing.source,claims:timing.captions.map(c=>({text:c.text,sourceStart:c.sourceStart,sourceEnd:c.sourceEnd})),graphics:'已认可财经原稿的解释示意；不作新素材自动内容模板'});
const materialKeys=['chalk','paper-stage','type-poster','cel','sci-fi-wireframe'];
if(materialKeys.includes(style.key)){
 const text=[...new Set(Array.from(html+JSON.stringify(timing)).filter(c=>/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\u0020-\u007e]/u.test(c)))].join('');
 const fonts={'NotoSansSC-700.woff':text,'NotoSansSC-900.woff':text};if(style.key==='chalk')fonts['LXGWWenKai-500.woff']=text;
 put('font-usage.json',{scope:'approved-reference-declared-font-roles',fonts,note:'Noto700/900为Study正文与标题；仅粉笔画风使用Pen。字符集包含HTML、内嵌图解与完整动态时间轴，后续仍检查实际渲染。'});
}else if(fs.existsSync(path.join(root,'font-usage.json')))fs.rmSync(path.join(root,'font-usage.json'));
const generated=[];function walk(dir){for(const n of fs.readdirSync(dir)){const f=path.join(dir,n);if(fs.statSync(f).isDirectory())walk(f);else if(!['master.mp4','canonical-native.srt','edited-voice.wav','gsap.min.js'].includes(n))generated.push(path.relative(root,f));}}walk(path.join(root,'assets'));put('qa/generated-assets.json',{files:generated});
put('run-record.json',{renderer:'approved-style-reference',style:style.key,modules:['art-direction','layout','motion','editing'].map((name,i)=>{const rel='plans/'+['art-direction','layout-plan','motion-plan','edit-plan'][i]+'.json';return {module:name,input:rel,sha256:sha(path.join(root,rel))};}),frameCount:timing.frameCount,sourceSha256:timing.source.sha256,captionCount:timing.captions.length,outputHtmlSha256:sha(path.join(root,'index.html'))});
console.log(JSON.stringify({style:style.key,frames:timing.frameCount,modules:4,captions:timing.captions.length}));
