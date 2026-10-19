from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';A=R.parent/'百种画风图谱研究_20261019';D=R.parents[1]/'输出/网感口播/正式画风总览';T=APP/'research/100-style-production'
read=lambda p:json.loads(p.read_text());keys=['documentary','tabletop-stilllife','macro-material','overhead-workbench','architectural-light','everyday-story','spotlight-stage','darkroom-prints'];version='1.13.0'
C=read(APP/'style-library/catalog.json');assert C['version']==version and C['implementedCount']==100 and C['productionVerifiedCount']==80 and C['plannedCount']==0
for n in ['batch10-author-review.json','batch10-clearance-encoded.json','batch10-native-final.json','batch10-preflight-final.json']:assert read(R/'qa'/n)['ok'],n
q=read(R/'qa/batch10-current-sources.json');assert q['ok']and len(q['results'])==80
q=read(R/f'qa/formal-probes-{version}.json');assert q['ok']and {s['key']for s in q['results']}==set(keys)
q=read(R/f'qa/formal-native-{version}.json');assert q['ok']and {s['key']for s in q['records']}==set(keys)
assert read(R/f'qa/formal-full-reproduction-{version}.json')['ok']
for tag in ['photo-1.13.0','print-1.13.0']:assert read(R/f'qa/motion-revision-{tag}.json')['ok']
q=read(D/'qa/formal-gallery-qa.json');assert q['ok']and q['implemented']==100 and len(q['playback'])==100
q=read(A/'qa/atlas-qa.json');assert q['ok']and q['implemented']==100 and len(q['playback'])==86
q=read(R/'qa/production-review.json');assert q['ok']and len(q['playback'])==80
for p in(R/'scripts').iterdir():
 if p.suffix in ['.py','.mjs']:shutil.copy2(p,T/'scripts'/p.name)
for n in ['catalog.json','edit-plan.json']:shutil.copy2(R/n,T/n)
for n in ['app.js','style.css','review.html','qa-atlas.mjs']:shutil.copy2(A/n,T/'gallery-source'/n)
for pattern in ['batch10-*','*1.13.0.json']:
 for p in(R/'qa').glob(pattern):
  if p.suffix in ['.json','.md']and not p.name.startswith('batch10-hf-usage'):shutil.copy2(p,T/'evidence'/p.name)
for n in ['production-review.json','design-qa.json']:shutil.copy2(R/'qa'/n,T/'evidence'/n)
shutil.copy2(D/'qa/formal-gallery-qa.json',T/'evidence/formal-gallery-1.13.0.json');shutil.copy2(A/'qa/atlas-qa.json',T/'evidence/atlas-1.13.0.json')
shutil.copy2(R/'qa/batch10-decisions.md',T/'batches/batch10-decisions.md')
shutil.copy2(R/'qa/next-photo-plan.md',T/'batches/next-photo-plan.md')
for key in keys:shutil.copy2(R/'smoke-batch10'/key/'qa/smoke.json',T/'evidence'/f'{key}-smoke-batch10.json')
gaps=lambda q:', '.join(s['key']+' '+str(s['visibleGapPixels'])+'px'for s in q['records'])
(T/'README.md').write_text('''# 100种画风实际落地

正式源1.13.0，100种均有完整视频和可复用模板：20种用户认可、80种制作验证，0候选。100项是材料、摄影、传统媒介与原创配方的视觉方向，不是互斥行业标准或所有世界画风清单。每种配合四个完整专家模块与适当原声，统一中文财经fixture，1080×1920/30fps/1100帧，人物原色、全程正圆窗、字幕top1600与60px/两行，单一人声。

最后八种A21纪实现场、A22桌面静物、A23微距材质、A24俯拍操作台、A25建筑光影、A26生活场景叙事、A27舞台聚光、A28黑白暗房使用七个真实摄影来源。原始摄影、精确SHA、作者/源页/许可及数字改编说明保存在每模板photo-sources.json/photography-NOTICE.md和shared/photos/index.json；stage只取无人地板，俯拍避广告图册，照片不指认本段人物、事件、经历、交易或背书。舞台daveynin/CCBY2.0有片上署名和完整附带来源/许可/裁切合成说明；其余为Commons记录CC0。黑白仅用于照片，原色人物不受灰度影响。历史币不是当代投资/价格/鉴定依据。

当前8原生8状态拼版、真实4秒/120帧编码拼版和整片12抽帧拼版由作者实际看过，具体原尺寸与修正见batch10记录。程序183密集帧、18切点邻帧、首末/左右源人色、圆窗/字幕、逆向像素、实际图字空行与原声均检查；短测/整片HTML窗变换与真实渲染素材/图形代码/字体/时间轴逐一绑定，不借旧源通过。实际风险空行原生：'''+gaps(read(R/'qa/batch10-clearance-native.json'))+'''；编码：'''+gaps(read(R/'qa/batch10-clearance-encoded.json'))+'''。16px门槛保持，抽样不冒称全帧碰撞证明。8条解码原声一致；80研究工程均verified、全部当前输入与实际MP4精确SHA匹配。没有逐帧人工听看或独立盲评声明，不把制作验证等同用户逐条审美认可。

新8正式入口独立init/build三语义状态图像/标题/字幕精确相同，另独立完整摄影重建比对全长原声和逐秒像素；摄影/黑白两种motion-only .55→1秒探针验证途中改变与停稳图文/原声/字幕保护。正式总览100实体相对MP4/封面/证据全部播放/Range206/拖动/筛选/配方/对比/390手机通过；研究进度80流，图谱100真实图/86流。所有历史批次证据保留，四个完整专家正文保持。

shared/为场景和原始素材，scripts/为研究工具，batches/记录判断，evidence/绑定实际验证；正式模板在../../style-library/。大批MP4、中间帧、依赖缓存不进Git；固定原声fixture、原创源与可重建模板进私有库。用户授权的100方向已制作整合，后续新内容由四个完整模块重新设计，固定案例不等于自动适配任意新素材。声音按内容选择，本轮保留原声，无强制配乐或拟音。

固定HF0.8.174、Playwright1.59.1、Three r181与8本地字体；不升级依赖。stage/seal/validate/privatepush核对远端HEAD后封包安装；缓存复用要求verified状态、当前输入和精确MP4一致，build/check不能认证旧片。
''')
print('Final100 source/evidence staged with all actual gates; release/install/cache still required')
