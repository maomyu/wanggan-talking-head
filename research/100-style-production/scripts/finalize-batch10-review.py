from pathlib import Path
import json,hashlib,datetime,re
R=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
keys=['documentary','tabletop-stilllife','macro-material','overhead-workbench','architectural-light','everyday-story','spotlight-stage','darkroom-prints']
working=read(R/'qa/batch10-author-working.json');assert not working['needsRevision']
assert read(R/'qa/batch10-clearance-encoded.json')['ok']and read(R/'qa/batch10-native-final.json')['ok']
review=read(R/'qa/author-review.json');records=[];voices=set()
for key in keys:
 seen=next(s for s in working['records']if s['key']==key);p=R/'variants'/key;short=R/'smoke-batch10'/key
 q=read(R/'qa'/f'{key}-verification.json');actual=sha(p/'outputs/final.mp4')
 assert q['ok']and q['frames']==1100 and actual==q['sha256']==seen.get('fullVideoSha256')
 assert seen['currentNativeContactViewed']and seen['actualEncodedContactViewed']and seen['actualFullContactViewed']
 assert sha(R/'qa'/f'{key}-preview-sheet.jpg')==seen['nativeContactSha256']
 assert sha(short/'outputs/smoke.mp4')==seen['shortVideoSha256']and sha(short/'outputs/contact.jpg')==seen['shortContactSha256']
 protected=['timing.json']+[str(f.relative_to(p))for f in(p/'assets').iterdir()if f.is_file()]
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
review.update(sourceVersion='batch10-final-1.13.0',reviewedAt=datetime.datetime.now().astimezone().isoformat())
put(R/'qa/author-review.json',review)
put(R/'qa/batch10-author-review.json',dict(ok=True,records=records,needsRevision=[],sameDecodedAudioHash=next(iter(voices)),userVisualApproval=False))
f=R/'qa/ledger.md';f.write_text(f.read_text()+"\n\n## 第十批：八种真实摄影画风\n\n当前8种的原生/真实4秒/完整1100帧编码抽帧均由作者实际看过，绑定精确SHA及相同渲染输入；源摄影与数字注释区分，人物仍原色正圆。程序检查范围与实际修改见batch10证据，不冒称独立盲评或全部逐帧人工听看；原有20用户认可与新增80制作验证分开。\n")
print('Eight viewed full photo encodes registered with exact SHA, protected short inputs and same voice')
