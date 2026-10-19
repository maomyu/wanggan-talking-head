from pathlib import Path
import json,hashlib,datetime

R=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
keys=['lacquer-gold','watercolor','impasto','enamel-badge','foil-deboss','mosaic','stained-glass','sandstone-relief']
working=read(R/'qa/batch08-author-working.json')
assert not working['needsRevision']and read(R/'qa/batch08-clearance-encoded.json')['ok']
records=[];voices=set();review=read(R/'qa/author-review.json')
for key in keys:
 seen=next(s for s in working['records']if s['key']==key);q=read(R/'qa'/f'{key}-verification.json')
 actual=hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
 assert q['ok']and q['frames']==1100 and seen.get('actualFullContactViewed')and seen['actualEncodedContactViewed']
 assert actual==q['sha256']==seen.get('fullVideoSha256'),key
 if key=='mosaic':assert seen['revisionResolved']and seen['revisedActualContactViewed']
 views=['4秒实际编码拼版','整片1100帧的12帧实际拼版','原生8状态拼版与修后代表状态']
 views.extend(f'{t}秒实际编码原尺寸'for t in seen.get('fullOriginalSizeViewed',[]))
 if key=='mosaic':views.append('修订后4秒实际编码拼版及加密显现阶段')
 records.append(dict(key=key,sha256=actual,viewed=views,judgment=seen['fullJudgment'],scope='作者实际抽看，非逐帧人工听看或独立盲评；程序另查183密集帧、18切点邻帧、首末/左右人色与原声、正圆/字幕、风险重点词可见空白'))
 voices.add(q['decodedAudioHash'])
 if key not in review['passed']:review['passed'].append(key)
 review['needsRevision']=[s for s in review['needsRevision']if s!=key];review['videoSha256'][key]=actual
assert len(voices)==1
review.update(sourceVersion='batch08-final-1.11.0',reviewedAt=datetime.datetime.now().astimezone().isoformat())
put(R/'qa/author-review.json',review);put(R/'qa/batch08-author-review.json',dict(ok=True,records=records,needsRevision=[],sameDecodedAudioHash=next(iter(voices)),userVisualApproval=False))
f=R/'qa/ledger.md';f.write_text(f.read_text()+'''\n## 第八批：工艺与绘画八种\n\n八幅原始AI材料保留完整提示词、源PNG/geometry/provenance/SHA，人物原色与单一原声。实际原生拼版发现漆绘细线穿过词字，删线；油彩/珐琅去掉没有连接作用的挂点；纸箔三项校样改纵排以分化构图。马赛克真实短测加密抽帧发现4帧便接近全图，18帧碎块补测仍像图片缺失，最终撤掉碎块，改为完整图版8px轻落位、标签随后显现；各轮均实际补测。旧源/旧图/旧短测保留；不是逐块嵌装或真实工艺录像。\n\n作者已实际抽看8个完整成片12帧拼版和记录中的代表原尺寸，绑定当前精确SHA。程序核对183密集帧、18邻帧、首末和左右人色、单一原声、正圆/字幕/反向寻址与实际风险图字空白；八条完整解码人声相同。没有独立盲评或逐帧人工听看声明。原生与编码可见空白数值在各自报告，不把计算行盒当实际墨迹。\n''')
print('Eight viewed full encodes registered with exact SHA and same decoded voice; 62 production cases reviewed')
