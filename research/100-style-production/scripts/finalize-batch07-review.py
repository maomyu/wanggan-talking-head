from pathlib import Path
import json,hashlib,datetime

R=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
keys=['patchwork','knotted-cord','silk-layers','blue-green-landscape','mural','folk-woodblock','porcelain-painting','seal-carving']
working=read(R/'qa/batch07-author-working.json')
assert not working['needsRevision'] and read(R/'qa/batch07-clearance-encoded.json')['ok']
records=[];voices=set();review=read(R/'qa/author-review.json')
for key in keys:
    seen=next(s for s in working['records']if s['key']==key)
    q=read(R/'qa'/f'{key}-verification.json')
    actual=hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
    assert q['ok'] and q['frames']==1100 and seen.get('actualFullContactViewed')
    assert actual==q['sha256']==seen.get('fullVideoSha256'),key
    assert seen['actualEncodedContactViewed']
    if key=='mural':assert seen['revisionResolved'] and seen['revisedActualContactViewed']
    views=['4秒实际编码拼版','完整1100帧成片12帧拼版','修后原生8状态拼版及所列代表状态']
    views.extend(f'{t}秒实际编码原尺寸'for t in seen.get('fullOriginalSizeViewed',[]))
    records.append(dict(key=key,sha256=actual,viewed=views,judgment=seen['fullJudgment'],scope='作者实际抽看，非逐帧人工听看或独立盲评；程序另核对183密集帧、18切点邻帧、人色/原声/正圆/字幕与真实字形留白'))
    voices.add(q['decodedAudioHash'])
    if key not in review['passed']:review['passed'].append(key)
    review['needsRevision']=[s for s in review['needsRevision']if s!=key]
    review['videoSha256'][key]=actual
assert len(voices)==1
review.update(sourceVersion='batch07-final-1.10.0',reviewedAt=datetime.datetime.now().astimezone().isoformat())
put(R/'qa/author-review.json',review)
put(R/'qa/batch07-author-review.json',dict(ok=True,records=records,needsRevision=[],sameDecodedAudioHash=next(iter(voices)),userVisualApproval=False))
f=R/'qa/ledger.md'
f.write_text(f.read_text()+'''\n## 第七批：纤维与东方材料八种\n\n六幅原始AI材料保留源像素与来源，两种确定性SVG。实际短测/原生发现并修复：纱片压标签→缩小并上移、字移出布区；木版屏底贴字→分场高度，实际墨迹留白18.5/19.5px；瓷盘risk横线至字14px→删除无作用横线，完整盘图下界留白18px，未降低16px门槛；绳结重复抽象→本金图记和具体带孔重物；印面通用图标→现代竖排字与正负印、边款、细印泥孔隙；壁画短测切盾→有限位新取景，重新真实短测与整片，停稳后完整双对象。\n\n作者实际看完八个当前完整成片12帧拼版及记录中的代表原尺寸，程序检查每片1100帧、183密集帧、18邻帧、首末与左右角落人物色、原声零延迟相关及全长解码同声、反向寻址/正圆/上移字幕；木版/瓷绘实际PNG墨迹留白在原生和编码中均通过。作者记录绑定当前成片SHA，无独立盲评或逐帧人工听看声明。整片/模板/声音联动与播放检查分别保存，不互相代替。\n''')
print('Eight actual viewed encodes recorded with exact SHA; same full decoded voice; 54 production cases author-reviewed')
