"""Promote only a fully completed, source-bound 100-film batch."""
from pathlib import Path
import hashlib,json,shutil

R=Path(__file__).resolve().parents[1]
APP=Path.home()/'plugins/wanggan-talking-head'
def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def replace(p,a,b):
    text=p.read_text()
    if a not in text:raise RuntimeError('Expected release text not found: '+str(p))
    p.write_text(text.replace(a,b))

final=read(R/'qa/all100-final.json');page=read(R/'qa/all100-page-check.json')
review=read(R/'qa/batch-author-review.json')
assert final['fullFilms']==100 and final['videoRangeURLs']==200 and page['ok']
assert len({x['key']for x in review['viewed']})==100 and not review['blockingFindings']
lib=APP/'choreography-library';manifest=read(lib/'manifest.json');mapping=read(lib/'style-map.json');versions=read(lib/'source-versions.json')
overrides=read(R/'qa/director-overrides.json')if(R/'qa/director-overrides.json').exists()else{'styles':{}}
for key,change in overrides['styles'].items():
    assert versions[key]['directorSha256']==change['oldDirectorSha256']
    assert versions[key]['htmlSha256']==change['indexHtmlSha256']
    assert change['comparisonStates']==48
    if change.get('revisionKind')=='retired-legacy-reading-layer':
        proof=read(R/'qa/legacy-reading-comparison.json')[key]
        assert proof['states']==48 and proof['allChangesWithinLegacyBar'] and proof['captionAreaExactStates']==48
        assert proof['maxChangedPixels']==change['maxChangedPixels']
    else:assert change['wholeFrameExact']==48
    assert sha(R/'variants'/key/'scripts/director.js')==change['newDirectorSha256']
    versions[key]['directorSha256']=change['newDirectorSha256']
    versions[key]['implementationRevision']='Retire only legacy reading text while retaining window chrome;48 measured same-frame comparisons'if change.get('revisionKind')=='retired-legacy-reading-layer'else'Wholly clipped scroll panels have explicit hidden visibility;48 exact same-frame raster comparisons'
assert read(APP/'.codex-plugin/plugin.json')['version']=='1.14.0','Release already changed; inspect before rerunning'
assert {s['key']for s in mapping['styles']}=={s['key']for s in final['films']}
# Validate all evidence against local final media and the actual shipping implementations before any mutation.
for item in final['films']:
    key=item['key'];p=R/'variants'/key;v=read(p/'qa/batch-verification.json');inputs=v['source']['inputs']
    assert sha(p/'outputs/final.mp4')==v['video']['sha256']==item['videoSha256']
    assert all(sha(p/f)==h for f,h in inputs.items())
    assert inputs['scripts/director.js']==versions[key]['directorSha256']
    assert inputs['index.html']==versions[key]['htmlSha256']
    assert inputs['scripts/build-project.mjs']==sha(lib/'build-project.mjs')
    for name in ['art-direction','layout-plan','motion-plan','edit-plan','choreography']:
        assert inputs['plans/'+name+'.json']==sha(lib/'examples'/key/(name+'.json'))
    assert inputs['assets/master.mp4']==manifest['masterSha256'] and inputs['assets/edited-voice.wav']==manifest['voiceSha256']
    assert v['motionSamples']==300 and v['captionCount']==21 and v['audio']['offsetSamples']==0
    assert v['video']['frames']==1100 and v['status']=='verified'

dest=lib/'evidence/full100';dest.mkdir(parents=True,exist_ok=True)
for key,change in overrides['styles'].items():shutil.copy2(R/'variants'/key/'scripts/director.js',lib/'directors'/(change['newDirectorSha256']+'.js'))
write(lib/'source-versions.json',versions)
for name in ['all100-final.json','all100-page-check.json','all100-cua-check.json','batch-dom-audit.json','batch-author-review.json','director-overrides.json','scroll-clip-comparison.json','legacy-reading-comparison.json']:
    if not(R/'qa'/name).exists():continue
    shutil.copy2(R/'qa'/name,dest/name)
for item in final['films']:
    key=item['key'];target=dest/key;target.mkdir(exist_ok=True)
    for name in ['batch-verification.json','batch-source-binding.json','batch-provenance.json','batch-check.json']:
        shutil.copy2(R/'variants'/key/'qa'/name,target/name)
    for name in ['check-budget.json','batch-check-reuse.json']:
        if (R/'variants'/key/'qa'/name).exists():shutil.copy2(R/'variants'/key/'qa'/name,target/name)
    row=next(s for s in mapping['styles']if s['key']==key)
    row.update(fullFilmVerified=True,fullFilmVideoSha256=item['videoSha256'],fullFilmEvidence=f'evidence/full100/{key}/batch-verification.json')
write(lib/'style-map.json',mapping)
manifest.update(version='1.15.0',fullFilmVerified=100,fullFilmEvidence='evidence/full100/all100-final.json',scope='100 native primary designs and100 source-bound complete films;12 original representatives; single fixture only, not100x12 combinations')
# Carry the same geometry-faithful visibility rule into new, unverified cross-combinations.
candidate=lib/'directors'/(manifest['alternateDirectorSha256']+'.js');candidateSource=candidate.read_text()
clipBefore='gsap.set(scrollWorld,{y:-progress*900});scrollViewport.style.opacity='
clipAfter="gsap.set(scrollWorld,{y:-progress*900});const clipBounds=scrollViewport.getBoundingClientRect();for(const panel of scrollWorld.children){const panelBounds=panel.getBoundingClientRect();panel.style.visibility=panelBounds.bottom<=clipBounds.top||panelBounds.top>=clipBounds.bottom?'hidden':'visible';}scrollViewport.style.opacity="
assert candidateSource.count(clipBefore)==1
legacyAnchor=" const css=document.createElement('style');css.textContent=`"
legacyPatch=" // Retire legacy reading text while retaining its terminal/desktop chrome.\n for(const bar of root.querySelectorAll('.terminal-bar')){const label=document.createElement('span');label.textContent=bar.textContent;label.style.setProperty('visibility','hidden','important');bar.replaceChildren(label);}\n for(const label of root.querySelectorAll('.desktop-bar span'))label.style.setProperty('visibility','hidden','important');\n"
assert candidateSource.count(legacyAnchor)==1
candidateSource=candidateSource.replace(clipBefore,clipAfter).replace(legacyAnchor,legacyPatch+legacyAnchor);candidateSha=hashlib.sha256(candidateSource.encode()).hexdigest();(lib/'directors'/(candidateSha+'.js')).write_text(candidateSource);manifest['alternateDirectorSha256']=candidateSha
write(lib/'manifest.json',manifest)
shutil.copy2(R/'variants/minimal/index.motion.json',lib/'index.motion.json')
shutil.copy2(R/'batch-studio/check-with-budget.mjs',APP/'runtime/check-with-budget.mjs')

runtime=APP/'runtime/choreography.mjs'
replace(runtime,"mapping.fullFilmRepresentative?'代表方案已完成固定素材整片实测'","mapping.fullFilmVerified?'主搭配已完成固定素材整片实测':mapping.fullFilmRepresentative?'代表方案已完成固定素材整片实测'")
replace(runtime," fs.copyFileSync(path.join(library,'build-project.mjs'),path.join(project,'scripts/build-project.mjs'));"," fs.copyFileSync(path.join(library,'build-project.mjs'),path.join(project,'scripts/build-project.mjs'));\n fs.copyFileSync(path.join(library,'index.motion.json'),path.join(project,'index.motion.json'));")
replace(runtime,"  const v=versions[row.key];","""  if(row.fullFilmVerified){
   const report=read(path.join(library,row.fullFilmEvidence)),inputs=report.source.inputs;
   const fullCheck=path.join(library,path.dirname(row.fullFilmEvidence),'batch-check.json'),check=read(fullCheck);
   if(!check.ok||!check.motion.enabled||check.motion.samples!==report.motionSamples)throw Error('实际动效检查缺失:'+row.key);
   if(report.checkBudget&&(report.checkBudget.reportSha256!==sha(fullCheck)||report.checkBudget.applications!==1||!report.checkBudget.installedModuleUnchanged||report.checkBudget.rulesChanged||report.checkBudget.samplesReduced))throw Error('检查运行预算证据不符:'+row.key);
   if(report.key!==row.key||report.status!=='verified'||report.video.sha256!==row.fullFilmVideoSha256||report.video.frames!==1100||report.video.width!==1080||report.video.height!==1920||report.video.fps!=='30/1'||report.audio.offsetSamples!==0||report.audio.referenceCorrelation<.98||report.captionCount!==21||report.motionSamples!==300)throw Error('整片证据不完整:'+row.key);
   if(inputs['scripts/director.js']!==versions[row.key].directorSha256||inputs['index.html']!==versions[row.key].htmlSha256||inputs['scripts/build-project.mjs']!==sha(path.join(library,'build-project.mjs'))||inputs['index.motion.json']!==sha(path.join(library,'index.motion.json'))||inputs['assets/master.mp4']!==manifest.masterSha256||inputs['assets/edited-voice.wav']!==manifest.voiceSha256)throw Error('整片证据与当前实现不同:'+row.key);
   for(const name of ['art-direction','layout-plan','motion-plan','edit-plan','choreography'])if(inputs['plans/'+name+'.json']!==sha(path.join(library,'examples',row.key,name+'.json')))throw Error('整片方案与当前实现不同:'+row.key+'/'+name);
  }
  const v=versions[row.key];""")
replace(runtime," return {systems:lib.systems.length,nativeMappings:map.length,fullFilmRepresentatives:",""" const fullFilmVerified=map.filter(s=>s.fullFilmVerified).length;
 if(!Number.isInteger(manifest.fullFilmVerified)||fullFilmVerified!==manifest.fullFilmVerified)throw Error('主搭配完整视频登记数量不符');
 const full=read(path.join(library,manifest.fullFilmEvidence));
 if(full.fullFilms!==fullFilmVerified||full.videoRangeURLs!==fullFilmVerified*2||full.films.length!==fullFilmVerified||new Set(full.films.map(f=>f.key)).size!==fullFilmVerified||full.films.some(f=>!map.some(r=>r.key===f.key&&r.fullFilmVideoSha256===f.videoSha256)))throw Error('整片汇总与逐条记录不符');
 return {systems:lib.systems.length,nativeMappings:map.length,fullFilmVerified,fullFilmRepresentatives:""")
replace(APP/'scripts/studio.mjs',"'composition-selection.json','style-recipe.json','route.json']","'composition-selection.json','style-recipe.json','route.json','index.motion.json']")
replace(APP/'scripts/studio.mjs',"run(process.execPath,[hf,...args,r],{maxBuffer:","run(process.execPath,args[0]==='check'?[path.join(runtime,'check-with-budget.mjs'),hf,r,'--timeout','120000',...args.slice(1)]:[hf,...args,r],{maxBuffer:")
replace(APP/'scripts/studio.mjs',"import {fileURLToPath} from 'node:url';","import {fileURLToPath} from 'node:url';\nimport * as loaderHooks from 'node:module';")
replace(APP/'scripts/studio.mjs',"if(Number(process.versions.node.split('.')[0])<22)throw Error('需要Node22及以上')","if(typeof loaderHooks.registerHooks!=='function')throw Error('需要支持module.registerHooks的Node22.15+/23.5+')")
for name in ['package.json','package-lock.json']:
    p=APP/'runtime'/name;data=read(p);target=data if name=='package.json'else data['packages'][''];target['engines']={'node':'^22.15.0 || >=23.5.0'};write(p,data)

p=read(APP/'.codex-plugin/plugin.json');p['version']='1.15.0';p['interface']['longDescription']='100种画风按12套编排完成100个主搭配整片实测，含同页播放和A/B比较。四个完整专家skill支持整片与局部修改，保留原色人物、角落圆窗和上移字幕。';write(APP/'.codex-plugin/plugin.json',p)
m=read(APP/'module-manifest.json');m['scope']='正式1.15.0：100画风/12编排；100主搭配完整视频核验；四份专家正文保持原哈希';write(APP/'module-manifest.json',m)

replace(APP/'README.md','# 网感口播 1.14.0','# 网感口播 1.15.0')
replace(APP/'README.md','## 1.14.0 编排接入','## 编排接入与完整视频验证')
replace(APP/'README.md','新版100项完成原生主搭配验证，12代表完成新整片；其余旧版100条整片证据仍单独保留，不能混作新版100条已渲染。','新版100个主搭配均完成完整视频与原声核验：88条新渲染，12条同源码新版代表片复用并重新核验；不是100×12任意组合验收。原有整片与原生证据分别保留。详见[1.15.0完整视频验收](docs/1.15.0验收.md)。')
replace(APP/'skills/talking-head-video/SKILL.md','新版100主搭配完成原生样帧，12代表完成整片；未测试的组合标为候选。','新版100主搭配均完成固定素材完整视频实测，证据见[1.15.0验收](../../docs/1.15.0验收.md)；未测试的自由组合标为候选。')
replace(APP/'docs/共同制作规范.md','新版100主搭配原生验证与12代表整片的证据分别记录，不借用旧100条整片验收；未实测自由组合仍为候选。','新版100主搭配均有源绑定的完整视频证据，其中12条为同源码代表片复用后重新核验；不借用旧布局100条整片验收。未实测自由组合仍为候选，实际范围见[1.15.0验收](1.15.0验收.md)。')
replace(APP/'skills/talking-head-video/references/plugin-workflow.md','100条新主搭配完成原生验证，12代表完成新版整片，其他自由组合在本片检查前仍为候选。','100条新主搭配已完成固定素材整片核验，其他自由组合在本片检查前仍为候选。')
replace(APP/'docs/使用说明.md','新版100主搭配与12代表整片的证据分开，旧版100整片不充当新版验收。','新版100主搭配均完成整片核验，12个同源码新版代表片经重新核验复用，旧布局100整片不充当新版验收。详见[1.15.0验收](1.15.0验收.md)。')
replace(APP/'docs/组合与范围.md','100条主搭配已有真实方案与原生验证，12代表有新版完整MP4。','100条主搭配已有真实方案、原生验证及新版完整MP4；这次新增88条渲染并重新核验12条同源码新版代表片。')
replace(APP/'docs/编排库与协作.md','12个代表有新版1080×1920、30fps、1100帧完整视频。','初期12个代表完成新版整片，现100个主搭配全部完成1080×1920、30fps、1100帧完整视频核验，详见[1.15.0验收](1.15.0验收.md)。')
contract=APP/'skills/talking-head-video/references/runtime-contract.md'
contract.write_text(contract.read_text()+'\n1.15.0在检查入口使用运行预算适配器：固定HF0.8.174模块哈希核对后，仅在内存里把整体审计时限从120秒延长到600秒；安装依赖文件、检查规则与动效采样不变。普通timeout只控制首次加载，不能延长内置总时限。每次保存qa/check-budget.json；实际check.ok与motion.samples仍须读取，不把增加时限写成检查通过。Node需支持module.registerHooks（22.15+/23.5+），doctor会实际检查能力；本轮使用23.10.0。\n')

text=f'''# 1.15.0：100主搭配完整视频验收

同一条原始口播，100种画风按各自已登记的新编排制作完整视频。同页单片播放、搜索与家族/编排筛选，支持A/B同步播放、暂停同点、进度、单路人声切换和全屏。

实际完成100条1080×1920、30fps、1100帧、36.6667秒MP4，共{final['totalEncodedFrames']}编码帧；88条新渲染，12条同源码新版代表片复用并重新核验。每条保留21条相同字幕、一条原声，人物无滤镜与混色、角落全程正圆、字幕top1600/60px/至多两行。

实际逐条核对MP4及源文件哈希、尺寸帧率、完整解码和音轨：全部声音偏移0采样，最小整轨相关性{final['audioCorrelationMin']:.8f}。实际解码{final['selectedDecodedFrames']}个指定关键帧与{final['denseDecodedFrames']}张5fps密集帧；动效检查{final['motionSamples']}样本，DOM审计4000状态/0项发现；200个真实视频Range请求均206。网页搜索、筛选、单片与A/B播放、关闭释放声音通过实际浏览器检查。

固定检查器内置两分钟整体时限；本轮在资源繁忙时出现期限超时，失败记录保留。运行预算适配器只在内存中延长该时限至600秒，安装依赖文件与全部检查规则不变，每条仍实际完成300个动效采样；逐条check-budget证据与通过报告绑定。已通过且源码哈希完全未变的检查可复用，成片仍逐条解码核验。

刺绣与绳结的长卷实现新增了裁切外面板的显式隐藏：原版全部保留，96个同原片帧的前后整画面对比均逐像素一致，未添加遮挡豁免属性；重新完成完整检查与新视频渲染。终端字符与早期桌面同时退役被新画面覆盖的旧文字层，保留原边框与材质；各48状态的变化只在旧栏内，最多分别4与86像素的残留文字边缘，字幕区域逐像素不变。这些修复进入尚待逐片验证的自由组合实现，不更改其候选状态。

逐条报告与源绑定在[choreography-library/evidence/full100](../choreography-library/evidence/full100/all100-final.json)。可重建制作脚本与画廊在[本轮研究归档](../research/new-choreography-full100-20261020/README.md)；成片位于插件外独立总览工程，大视频不放Git。固定素材初始化现在携带3条动效断言，局部修改副本继承；新素材仍由四个完整模块根据真实语义设计。

这是同素材100个主搭配的实测；不是100×12全部组合，也不是任意新素材的一键验收。没有新增音乐、音效、源片重排或J/L剪辑。20种用户认可、80种制作验证的画风状态保持。14项原生严格复合像素寻址差异继续见[既有记录](../choreography-library/evidence/native-final.json)，导出成片未将它们抹去。

作者实际审看范围见[作者记录](../choreography-library/evidence/full100/batch-author-review.json)：100条各7个完整编码状态；关键帧拼版与技术测量不能代替全帧人工口型和听感审看，没有独立盲评。时间年鉴等少数图解较简疏，按既有认可方向保留，后续可据真实使用进一步优化。
'''
(APP/'docs/1.15.0验收.md').write_text(text)
print(json.dumps({'promoted':'1.15.0','verifiedFullFilms':100,'expertBodies':'unchanged','next':'seal, validate, doctor, installed-entry check, private sync'},ensure_ascii=False))
