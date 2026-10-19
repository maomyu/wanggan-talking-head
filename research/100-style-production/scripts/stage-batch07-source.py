from pathlib import Path
import json, shutil

R=Path(__file__).resolve().parents[1]
APP=Path.home()/'plugins/wanggan-talking-head'
A=R.parent/'百种画风图谱研究_20261019'
D=R.parents[1]/'输出/网感口播/正式画风总览'
T=APP/'research/100-style-production'
read=lambda p:json.loads(p.read_text())
keys=['patchwork','knotted-cord','silk-layers','blue-green-landscape','mural','folk-woodblock','porcelain-painting','seal-carving']
C=read(APP/'style-library/catalog.json');version=C['version']
assert version=='1.10.0' and C['implementedCount']==74 and C['productionVerifiedCount']==54 and C['plannedCount']==26
for name in ['batch07-author-review.json','batch07-clearance-encoded.json','batch07-native-final.json']:
    assert read(R/'qa'/name)['ok'],name
current=read(R/'qa/batch07-current-sources.json')
assert current['ok'] and len(current['results'])==54
probes=read(R/f'qa/formal-probes-{version}.json')
assert probes['ok'] and {s['key']for s in probes['results']}==set(keys)
native=read(R/f'qa/formal-native-{version}.json')
assert native['ok'] and {s['key']for s in native['records']}==set(keys)
assert read(R/f'qa/formal-full-reproduction-{version}.json')['ok']
for tag in ['silk-1.10.0','cord-1.10.0']:
    assert read(R/f'qa/motion-revision-{tag}.json')['ok']
gallery=read(D/'qa/formal-gallery-qa.json')
assert gallery['ok'] and gallery['implemented']==74 and len(gallery['playback'])==74
atlas=read(A/'qa/atlas-qa.json')
assert atlas['ok'] and atlas['implemented']==74 and len(atlas['playback'])==60
production=read(R/'qa/production-review.json')
assert production['ok'] and len(production['playback'])==54

for p in (R/'scripts').iterdir():
    if p.suffix in ['.py','.mjs']:shutil.copy2(p,T/'scripts'/p.name)
for name in ['catalog.json','edit-plan.json']:shutil.copy2(R/name,T/name)
for name in ['app.js','style.css','review.html','qa-atlas.mjs']:shutil.copy2(A/name,T/'gallery-source'/name)
for p in (R/'qa').glob('batch07-*'):
    if p.suffix in ['.json','.md']:shutil.copy2(p,T/'evidence'/p.name)
for p in (R/'qa').glob('*1.10.0.json'):shutil.copy2(p,T/'evidence'/p.name)
for name in ['production-review.json','design-qa.json']:shutil.copy2(R/'qa'/name,T/'evidence'/name)
shutil.copy2(D/'qa/formal-gallery-qa.json',T/'evidence/formal-gallery-1.10.0.json')
shutil.copy2(A/'qa/atlas-qa.json',T/'evidence/atlas-1.10.0.json')
for name in ['batch07-decisions.md','next-craft-paint-plan.md']:
    shutil.copy2(R/'qa'/name,T/'batches'/name)
# Eight next-batch raw assets are research candidates only, not formal templates.
for p in (R/'qa').glob('batch08-*.json'):
    shutil.copy2(p,T/'evidence'/p.name)
shutil.copy2(R/'qa/next-craft-paint-references.json',T/'evidence/next-craft-paint-references.json')
for folder in ['smoke-batch07','smoke-batch07-mural-v2']:
    for case in (R/folder).iterdir():
        p=case/'qa/smoke.json'
        if p.is_file():shutil.copy2(p,T/'evidence'/f'{case.name}-{folder}.json')

(T/'README.md').write_text('''# 100种画风生产进度

当前正式源1.10.0，74种实现：20种用户认可、54种制作验证；另26种尚未完成。100种实际视频与正式整合目标持续进行，候选与配方不计作完成。

本批新增A64织物拼布、A65线绳编结、A66绢纱叠层、A68青绿山水、A69敦煌壁画、A70版刻年画、A71蓝白瓷绘、A72篆印朱文。全部1080×1920/30fps/1100帧完整编码，保留人物原色、正圆窗、1600位置字幕与单一原声。六幅原创AI材料保留原像素/几何/完整提示词/来源SHA且在画面声明；另两种为确定性SVG绳结与现代可读印面，不冒称打结教程、真实古物、篆书或真实印章。

八版实际4秒短测、整片12帧拼版及记录中的代表原尺寸已由作者抽看。丝纱阅读标签移出织片，木版画屏与词字的原生墨迹留白18.5/19.5px、实际编码19.5/20.5px；瓷绘删无作用贴字横线，完整盘图下界至字原生18px、编码19px。绳结风险段保留本金图记，债务挂具体重物；印面采用现代竖排与朱白正负、边款、细印泥孔隙。壁画真实短测发现盾被裁，调整取景后重新短测并完整编码，停稳对照两对象完整。

程序核对183密集帧、18剪点邻帧、首末及左右角落人色、单一原声、圆窗/字幕几何、反向寻址和实际字形空白；八版完整解码原声相同。作者抽看范围随精确成片SHA保存，没有独立盲评或逐帧人工听看声明，不把制作验证称为用户逐条视觉认可。

八模板从正式入口独立init/build，三种语义状态解释区PNG与研究工程精确匹配，标题、字幕同帧且无资源/脚本错误。青绿另做完整独立重建并比较逐秒像素与全长人声。丝纱与绳结人物运动由.55改1秒，实际途中几何改变，停稳图像、原声WAV与字幕时序保持。四个完整专家skill正文与原20种视频证据保留；先前已修复check/build更新后误复用旧MP4的问题，缓存复用必须源输入匹配且项目verified。

独立总览提供74条物理相对MP4/封面/证据，全部播放、Range206、18.9秒拖动、筛选/配方/对比及390手机宽度通过；研究进度页54流、图谱74张实际图与60流通过。26候选无伪造视频入口。下一批八幅原始AI工艺素材仅作研究储备，尚无模板和视频，不计完成。

shared/为材料与场景实现，scripts/为研究工具，batches/为设计判断，evidence/记录实际验证范围，正式模板在../../style-library/。馆方参考图片只在本机观察，不进生产/Git素材。大批MP4、中间帧、运行环境不放Git；正式fixture、原始生成资产、可重建实现与来源在私有库。新内容仍由四完整模块重新设计，固定财经fixture不代表任意素材自动适配。

HyperFrames固定0.8.174，研究浏览依赖本包runtime的Playwright1.59.1，字体以assets/fonts/catalog.json当前8个实体为准。每批验证后推送私有仓库并核对远端HEAD，再封包安装。余26种尚未完成，目标继续active。
''')
print('Batch07 verified source/evidence staged; bulk MP4 and museum reference images excluded')
