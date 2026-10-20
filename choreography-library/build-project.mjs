import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const R=path.resolve(process.argv[process.argv.indexOf('--project')+1]);
const APP=process.env.WG_PLUGIN_ROOT||path.join(os.homedir(),'plugins/wanggan-talking-head');
const sourceHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(R,'assets/master.mp4'))).digest('hex');
if(sourceHash!=='426a3d57498351e72b77c396dacb47cb5f911f66c91582885da2026a8bd0bf58')throw Error('编排复现器只支持固定样例；新素材请按四个完整模块重新设计，禁止套用财经文案。');
const result=spawnSync(process.execPath,[path.join(APP,'runtime/approved-renderer.mjs'),'--project',R],{stdio:'inherit'});if(result.status!==0)throw Error('Material build failed');
const cfg=JSON.parse(fs.readFileSync(path.join(R,'plans/choreography.json'))),src=path.join(R,'scripts/director.js');
fs.copyFileSync(src,path.join(R,'assets/director.js'));
let html=fs.readFileSync(path.join(R,'index.html'),'utf8');
fs.mkdirSync(path.join(R,'comparison'),{recursive:true});
// Keep document-relative loads inside imported photo/material modules correct.
fs.writeFileSync(path.join(R,'comparison/baseline.html'),html.replace('<head>','<head><base href="../">'));
if(fs.existsSync(path.join(R,'baseline.html')))fs.unlinkSync(path.join(R,'baseline.html'));
html=html.replace('</head>',`<script>window.DIRECTOR_CONFIG=${JSON.stringify(cfg).replaceAll('<','\\u003c')};</script></head>`).replace('</body>','<script type="module" src="assets/director.js"></script></body>');
// Frozen primary implementations retain their verified default pixels. A local
// layout revision can override the caption without changing source or timing.
const caption=JSON.parse(fs.readFileSync(path.join(R,'plans/layout-plan.json'))).caption;
if(!caption||['x','y','width','size'].some(k=>!Number.isFinite(caption[k])))throw Error('字幕排版需明确数值x/y/width/size');
if(caption.x!==64||caption.y!==1600||caption.width!==952||caption.size!==60){
 if(caption.x<0||caption.width<=0||caption.x+caption.width>1080||caption.y<0||caption.size<36||caption.y+caption.size*2*1.28+32>1800)throw Error('字幕排版超出已声明的阅读与安全范围');
 html=html.replace('</head>',`<style id="composition-caption-revision">#captions#captions,#d-caption-backing#d-caption-backing{left:${caption.x}px!important;top:${caption.y}px!important;width:${caption.width}px!important}#caption-text#caption-text{font-size:${caption.size}px!important}</style></head>`);
}
fs.writeFileSync(path.join(R,'index.html'),html);
const generatedFile=path.join(R,'qa/generated-assets.json'),generated=JSON.parse(fs.readFileSync(generatedFile));
generated.files=[...new Set([...generated.files,'assets/director.js'])];fs.writeFileSync(generatedFile,JSON.stringify(generated,null,2));
// Fonts for this study's genuine titles and labels, not a successful static
// scan of the original template before the new content was built.
const text='越努力上班越存不到钱先从自己的选择看起跟风消费盲目投资负债前行跟风的代价最后落在自己身上后果由自己承担本金受损三个财经底线三项并列建议减少无效消费守住本金减少负债分清楚想要和需要下单之前留一点判断的空间一时喜欢实际用途再决定买不买先看风险再做选择夸大收益的说法暗藏风险把压力往回收第三条底线不跟风不浮躁回到自己的判断少冲动守本金减负债选择消费本金负债依据本段口播的解释示意图解舞台照片数字裁切与合成0123456789 / CC BY daveynin';
const fonts=JSON.parse(fs.readFileSync(path.join(APP,'assets/fonts/catalog.json')));
fs.writeFileSync(path.join(R,'font-usage.json'),JSON.stringify({scope:'composition-evolution-real-generated-text',fonts:Object.fromEntries(fonts.map(f=>[f.file,f.file.startsWith('Archivo')?'0123456789CCBYdaveynin/':text]))},null,2));
console.log(JSON.stringify({adaptation:cfg.choreography.key,source:'explicit-approved-fixture',scope:'new-spatial-and-motion-study; source voice preserved'}));
