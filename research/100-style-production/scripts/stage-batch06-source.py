from pathlib import Path
import json, shutil

R=Path(__file__).resolve().parents[1]
APP=Path.home()/'plugins/wanggan-talking-head'
A=R.parent/'百种画风图谱研究_20261019'
D=R.parents[1]/'输出/网感口播/正式画风总览'
T=APP/'research/100-style-production'
read=lambda p:json.loads(p.read_text())
keys=['picture-book','natural-history','isometric-city','faceted-vector','editorial-metaphor','silhouette-fable','illustrated-map','torn-paper']
C=read(APP/'style-library/catalog.json');version=C['version']
assert version=='1.9.0' and C['implementedCount']==66 and C['productionVerifiedCount']==46 and C['plannedCount']==34
assert read(R/'qa/batch06-author-review.json')['ok']
assert read(R/'qa/batch06-observation-region-encoded.json')['ok']
assert read(R/'qa/batch06-shadow-clearance-encoded.json')['ok']
assert len(read(R/'qa/batch06-current-sources.json')['results'])==46
probes=read(R/f'qa/formal-probes-{version}.json');assert probes['ok'] and {s['key']for s in probes['results']}==set(keys)
native=read(R/f'qa/formal-native-{version}.json');assert native['ok']and {s['key']for s in native['records']}==set(keys)
assert read(R/f'qa/formal-full-reproduction-{version}.json')['ok']
for tag in ['book-1.9.0','city-1.9.0']:assert read(R/f'qa/motion-revision-{tag}.json')['ok']
gallery=read(D/'qa/formal-gallery-qa.json');assert gallery['ok']and gallery['implemented']==66 and len(gallery['playback'])==66
atlas=read(A/'qa/atlas-qa.json');assert atlas['ok']and atlas['implemented']==66 and len(atlas['playback'])==52
production=read(R/'qa/production-review.json');assert production['ok']and len(production['playback'])==46

for p in (R/'scripts').iterdir():
 if p.suffix in ['.py','.mjs']:shutil.copy2(p,T/'scripts'/p.name)
for name in ['catalog.json','edit-plan.json']:shutil.copy2(R/name,T/name)
for name in ['app.js','style.css','review.html','qa-atlas.mjs']:shutil.copy2(A/name,T/'gallery-source'/name)
for p in (R/'qa').glob('batch06-*'):
 if p.suffix in ['.json','.md']:shutil.copy2(p,T/'evidence'/p.name)
for p in (R/'qa').glob('*1.9.0.json'):shutil.copy2(p,T/'evidence'/p.name)
for name in ['production-review.json','design-qa.json']:shutil.copy2(R/'qa'/name,T/'evidence'/name)
shutil.copy2(D/'qa/formal-gallery-qa.json',T/'evidence/formal-gallery-1.9.0.json')
shutil.copy2(A/'qa/atlas-qa.json',T/'evidence/atlas-1.9.0.json')
for name in ['batch06-decisions.md','next-fiber-east-plan.md']:shutil.copy2(R/'qa'/name,T/'batches'/name)
for folder in ['smoke-batch06','smoke-batch06-risk','smoke-batch06-observation']:
 for case in (R/folder).iterdir():
  p=case/'qa/smoke.json'
  if p.is_file():shutil.copy2(p,T/'evidence'/f'{case.name}-{folder}.json')

(T/'README.md').write_text('''# 100种画风生产进度

当前正式源1.9.0，66种实现：20种用户认可、46种制作验证；另34种尚未完成。100种实际视频与正式整合目标持续进行，候选与配方不计作完成。

本批新增A51儿童绘本、A52科学博物插画、A53等距城市插画、A54低多边形平涂、A55讽刺社论插画、A56剪影寓言、A57地图旅行插画与A61撕纸肌理。全部1080×1920/30fps/1100帧完整编码，保留人物原色、全程正圆窗、1600位置字幕和单一原声。四幅原创AI素材在画面明确声明，原像素与生成出处实体保存；另四版用原创确定性SVG关系实现，不冒充真实地图、科学测量或真实金融事件。

八版实际4秒短测及整片12帧拼版、记录中的代表原尺寸已由作者抽看。城市补齐前侧立面与窗，剪影钱币孔洞与词字贴幕问题已修；编码大字离亮幕34px。社论按同幅比喻聚焦，另做20.1—24.1秒补测。博物图版的主圈、引线与局部窗由同一源区域计算，放大约1.978倍；旧版单独留档，修正版重做短片与完整编码，并对两处实际编码的主图/局部像素作共同源区域比对。

批处理曾在预检改写build-state后误把旧片当新源通过；已用实际待修工程复现并修复，要求项目真实run完成后的verified状态才允许复用，built/check-only状态拒绝。新博物版已完整重编码，不沿用旧SHA。当前46研究工程的全部输入、运行状态和实际MP4证据匹配。

程序检查183密集帧、18剪点邻帧、首末及左右角落人色、原声相关性、圆窗/字幕几何与反向像素；本批八条完整解码原声相同。检查覆盖与作者抽看范围随证据保存，不宣称逐帧人工听看或独立盲评，也不把制作验证称为用户逐条视觉认可。

八模板从正式入口独立init/build，各在三种语义状态与研究工程的解释区PNG、同帧标题/字幕一致，无资源或脚本错误；社论版另做完整独立重建，逐秒像素与全长解码人声比较通过。绘本与城市的人物运动由.55改1秒，实际途中位置改变，停稳图像、原声WAV及字幕时间保持。四个专家skill完整正文与原20视频精确SHA保持。

独立总览有66个实体相对MP4/封面/证据，全部播放、Range206、18.9秒拖动、筛选/配方/对比及390手机宽度通过。研究进度页46流、图谱66张真实图与52流也通过。候选34项无伪造的视频入口。

shared/为材料与场景实现，scripts/为研究工具，batches/为设计判断，evidence/记录实际验证范围；正式可复用模板在../../style-library/。馆方图片只作本机观察，不进生产素材；引用保留实际访问与观看范围。大批成片、中间帧与依赖环境不放Git；正式fixture和原始生成素材可重建。新内容仍须由四个完整模块重新设计，不宣称固定财经fixture能自动适配任意新素材。

HyperFrames固定0.8.174；研究浏览依赖本包runtime固定Playwright1.59.1，字体以assets/fonts/catalog.json实体清单为准。每批验证后推送GitHub私有仓库并核对远端HEAD，再封包安装。下一批纤维/东方材料文档只是草案，100种实际完成前不标complete。
''')
print('Batch06 verified source/evidence staged; bulk MP4 and museum reference pictures excluded')
