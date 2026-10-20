from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';out=APP/'research/new-choreography-full100-20261020';out.mkdir(parents=True,exist_ok=True);(out/'evidence').mkdir(exist_ok=True)
shutil.copytree(R/'batch-studio',out/'batch-studio',dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__'))
for n in ['review.html','catalogue-full.json']:shutil.copy2(R/n,out/n)
for n in ['batch-state.json','batch-dom-audit.json','batch-author-review.json','scheduler-resource-change.json','cache-prewarm.json','director-overrides.json','scroll-clip-probe.json','scroll-clip-comparison.json','terminal-bar-probe.json','desktop-label-probe.json','legacy-reading-comparison.json','all100-final.json','all100-page-check.json','all100-cua-check.json','grid-preview-index.json','grid-inline-page-check.json','grid-inline-cua-check.json','grid-preview-asset-check.json']:
 if (R/'qa'/n).exists():shutil.copy2(R/'qa'/n,out/'evidence'/n)
state=json.loads((R/'qa/batch-state.json').read_text());done=[]
if(R/'qa/director-overrides.json').exists():
 changes=json.loads((R/'qa/director-overrides.json').read_text());target=out/'implementation-overrides';target.mkdir(exist_ok=True)
 for key,change in changes['styles'].items():shutil.copy2(R/'variants'/key/'scripts/director.js',target/(change['newDirectorSha256']+'.js'))
for key,job in state['jobs'].items():
 if job['status']!='verified':continue
 dest=out/'evidence'/key;dest.mkdir(exist_ok=True)
 for n in ['batch-source-binding.json','batch-verification.json','batch-provenance.json','batch-check.json']:shutil.copy2(R/'variants'/key/'qa'/n,dest/n)
 for n in ['check-budget.json','batch-check-reuse.json']:
  if (R/'variants'/key/'qa'/n).exists():shutil.copy2(R/'variants'/key/'qa'/n,dest/n)
 report=json.loads((dest/'batch-verification.json').read_text());done.append({'key':key,'videoSha256':report['video']['sha256'],'frames':report['video']['frames'],'audioCorrelation':report['audio']['referenceCorrelation'],'motionSamples':report['motionSamples']})
(out/'README.md').write_text('# 100画风新版编排整片制作\n\n本批使用正式插件固定素材与100个新版主搭配，继续保留原色人物、角落圆窗、上移字幕。\n\n已完成实际编码核验：'+str(state['verified'])+'/100；状态与源绑定见evidence。12个代表旧有的是新版编排视频，源绑定相同才允许复用并重新核验；其余88条重新渲染。不能用旧布局100视频冒充本批。\n\n源码包含统一单片播放与A/B同步对比页。大MP4、密集帧、字体与运行依赖不入本研究归档。插件包含固定素材和完整四模块。重建到插件外独立目录：运行batch-studio/bootstrap.py --out 新目录，随后在新目录执行batch-studio/run.py，完整MP4完成后运行batch-studio/build-grid-previews.py，再用正式preview入口启动该目录；列表支持卡片内播放、全部静音同播、单路原声与高清大屏。仅固定样例可如此复现，新素材必须按完整四模块设计。\n\n作者审看片段范围以evidence/batch-author-review.json为准，无独立盲评；原生严格像素寻址的14项既有差异未因成片导出而宣布消除。\n')
(out/'progress.json').write_text(json.dumps({'verified':state['verified'],'total':100,'videos':done},ensure_ascii=False,indent=2));print(json.dumps({'archivedVerified':state['verified'],'path':str(out)},ensure_ascii=False))
