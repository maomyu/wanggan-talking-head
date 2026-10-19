from pathlib import Path
import json,hashlib,datetime,re
R=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
keys=['chased-metal','miniature-puppet','building-blocks','optical-glass','ceramic-objects','liquid-chrome','isometric-maquette','inflatable-sculpture','viscous-gel','holographic-volume']
working=read(R/'qa/batch09-author-working.json');assert not working['needsRevision']
assert read(R/'qa/batch09-clearance-encoded.json')['ok']and read(R/'qa/batch09-native-final.json')['ok']
review=read(R/'qa/author-review.json');records=[];voices=set()
for key in keys:
 seen=next(s for s in working['records']if s['key']==key);p=R/'variants'/key;short=R/'smoke-batch09'/key
 q=read(R/'qa'/f'{key}-verification.json');actual=sha(p/'outputs/final.mp4')
 assert q['ok']and q['frames']==1100 and actual==q['sha256']==seen.get('fullVideoSha256')
 assert seen['currentNativeContactViewed']and seen['actualEncodedContactViewed']and seen['actualFullContactViewed']
 assert sha(R/'qa'/f'{key}-preview-sheet.jpg')==seen['nativeContactSha256']
 assert sha(short/'outputs/smoke.mp4')==seen['shortVideoSha256']and sha(short/'outputs/contact.jpg')==seen['shortContactSha256']
 protected=['timing.json','assets/timing.js','assets/master.mp4','assets/edited-voice.wav','assets/gsap.min.js','assets/look.js','assets/scene.js','assets/base.css','assets/atlas.png','assets/atlas-geometry.js','assets/object-theatre-stage.js','assets/volume-lab.js','assets/volume-lab-stage.js','assets/round-box.js','assets/vendor/three.core.js','assets/vendor/three.module.js']
 protected.extend(str(f.relative_to(p))for f in(p/'assets/fonts').iterdir()if f.suffix in ['.woff','.woff2','.ttf','.otf'])
 fullhtml=re.sub(r' data-hf-id="[^"]+"','',(p/'index.html').read_text())
 expected=re.sub(r'data-duration="[^"]+"','data-duration="4"',fullhtml)
 start=read(short/'qa/smoke.json')['sourceWindow'][0]
 expected=expected.replace('data-composition-id="main"',f'data-composition-id="main" data-origin-frame="{round(start*30)}"').replace('data-media-start="0"',f'data-media-start="{start:g}"')
 assert expected==re.sub(r' data-hf-id="[^"]+"','',(short/'index.html').read_text()),(key,'Short HTML does not represent the current full scene at its recorded window')
 matched=[]
 for f in protected:
  if not(p/f).exists():continue
  assert(short/f).exists()and sha(p/f)==sha(short/f),(key,'Rendered input changed since the viewed short test',f)
  matched.append(dict(file=f,sha256=sha(p/f)))
 views=['当前8状态原生拼版','4秒/120帧真实编码拼版','1100帧整片的12个实际抽帧拼版']
 views.extend(f'{t}秒实际编码原尺寸'for t in seen.get('fullOriginalSizeViewed',[]))
 records.append(dict(key=key,sha256=actual,viewed=views,judgment=seen['fullJudgment'],shortAndFullProtectedInputs=matched,scope='作者实际抽看，非独立盲评或逐帧人工听看；程序另查183密集帧、18切点邻帧、首末/左右人色与原声、正圆/字幕/逆向像素、实际风险图字空白'))
 voices.add(q['decodedAudioHash'])
 if key not in review['passed']:review['passed'].append(key)
 review['needsRevision']=[s for s in review['needsRevision']if s!=key];review['videoSha256'][key]=actual
assert len(voices)==1
review.update(sourceVersion='batch09-final-1.12.0',reviewedAt=datetime.datetime.now().astimezone().isoformat())
put(R/'qa/author-review.json',review)
put(R/'qa/batch09-author-review.json',dict(ok=True,records=records,needsRevision=[],sameDecodedAudioHash=next(iter(voices)),userVisualApproval=False))
f=R/'qa/ledger.md';f.write_text(f.read_text()+'''
## 第九批：器物、木偶与五种代码体积

10种当前真实短测与完整成片拼版均已由作者实际看过，绑定当前精确SHA；最终整片/当前短测的图形代码、真实媒体与时间轴逐一核对，不能借旧源通过。五幅原始AI器物图像保留完整prompt/provenance/geometry/SHA，五种代码体积固定Three r181、完整MIT许可及本地RoundedBox来源；没有依赖升级。人物原色/全程正圆/字幕1600与单一原声继续保持。

实际样帧删掉陶瓷悬空台面、木偶重复底注；3D chain图注移出背景板，玻璃/凝胶debt文字有干净底。铬勾提到厚倒角前，前灯板改善主体明暗；凝胶改软包裹可读圆芯，去后方条纹。铬/胶的提袋改有底边的圆角袋身以区别负重圆体。全息按物件生成相应切片，收小/调机位以容纳完整发射盘；木偶/充气微摆明确归零。旧源/原生拼版和修订历史保留，没有将解析图像形变称为关节绑定、真实工艺/流体/全息设备。

当前10条完整解码人声相同。程序检查183密集帧、18邻帧、首末/左右人色、真实圆窗/字幕/反向像素和风险图字可见空行；数值见原生/编码报告，16px门槛保持，不把DOM行盒当实际字形。没有逐帧人工听看或独立盲评声明；制作验证不等于用户逐条视觉认可。
''')
print('Ten viewed full encodes registered with exact SHA, protected short inputs and same voice')
