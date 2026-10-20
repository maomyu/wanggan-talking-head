import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';
const R=path.resolve(process.argv[process.argv.indexOf('--project')+1]);
const APP=process.env.WG_PLUGIN_ROOT||path.join(os.homedir(),'plugins/wanggan-talking-head');
const result=spawnSync(process.execPath,[path.join(APP,'runtime/approved-renderer.mjs'),'--project',R],{stdio:'inherit'});if(result.status!==0)throw Error('Material build failed');
const cfg=JSON.parse(fs.readFileSync(path.join(R,'plans/choreography.json'))),src=path.join(R,'scripts/director.js');
fs.copyFileSync(src,path.join(R,'assets/director.js'));
let html=fs.readFileSync(path.join(R,'index.html'),'utf8');
fs.mkdirSync(path.join(R,'comparison'),{recursive:true});
// Keep document-relative loads inside imported photo/material modules correct.
fs.writeFileSync(path.join(R,'comparison/baseline.html'),html.replace('<head>','<head><base href="../">'));
if(fs.existsSync(path.join(R,'baseline.html')))fs.unlinkSync(path.join(R,'baseline.html'));
html=html.replace('</head>',`<script>window.DIRECTOR_CONFIG=${JSON.stringify(cfg).replaceAll('<','\\u003c')};</script></head>`).replace('</body>','<script type="module" src="assets/director.js"></script></body>');
fs.writeFileSync(path.join(R,'index.html'),html);
// Fonts for this study's genuine titles and labels, not a successful static
// scan of the original template before the new content was built.
const text='越努力上班越存不到钱先从自己的选择看起跟风消费盲目投资负债前行跟风的代价最后落在自己身上后果由自己承担本金受损三个财经底线三项并列建议减少无效消费守住本金减少负债分清楚想要和需要下单之前留一点判断的空间一时喜欢实际用途再决定买不买先看风险再做选择夸大收益的说法暗藏风险把压力往回收第三条底线不跟风不浮躁回到自己的判断少冲动守本金减负债选择消费本金负债依据本段口播的解释示意图解舞台照片数字裁切与合成0123456789 / CC BY daveynin';
const fonts=JSON.parse(fs.readFileSync(path.join(APP,'assets/fonts/catalog.json')));
fs.writeFileSync(path.join(R,'font-usage.json'),JSON.stringify({scope:'composition-evolution-real-generated-text',fonts:Object.fromEntries(fonts.map(f=>[f.file,f.file.startsWith('Archivo')?'0123456789CCBYdaveynin/':text]))},null,2));
console.log(JSON.stringify({adaptation:cfg.choreography.key,source:'explicit-approved-fixture',scope:'new-spatial-and-motion-study; source voice preserved'}));
