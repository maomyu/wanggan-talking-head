from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
keys=['picture-book','natural-history','isometric-city','faceted-vector','editorial-metaphor','silhouette-fable','illustrated-map','torn-paper']
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');review=read(R/'qa/author-review.json')
for key in keys:
 q=read(R/'qa'/f'{key}-verification.json');assert q['ok']and key in review['passed']and key not in review['needsRevision']and review['videoSha256'][key]==q['sha256']==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
assert read(R/'qa/batch06-shadow-clearance-encoded.json')['ok']
refs=read(APP/'style-library/research-sources.json');ids={r['id']for r in refs};refs.extend(r for r in read(R/'qa/batch06-references.json')if r['id']not in ids);put(APP/'style-library/research-sources.json',refs)
mechanisms={
 'picture-book':('连续水粉故事场景横跨书页，同一条路径与物件维持空间；按讲述作有限位的画面聚焦，页外留短句',['R20'],'L09','M13','E07'),
 'natural-history':('借用博物观察图版的主物件、同源像素局部圆窗与细引线；本片AI日常物件类比，不宣称物种或真实科学测量',['R21'],'L14','M01','E02'),
 'isometric-city':('原创彩色等距街区以完整屋顶、两侧立面、窗与道路组织三节点；当前节点加重，其他位置退为背景',[],'L11','M01','E07'),
 'faceted-vector':('有限硬边多边形色面塑造物件，面组逐层显现；无纸厚、纤维或光滑曲面，以二维切面区别折纸',[],'L07','M01','E04'),
 'editorial-metaphor':('巨大消费袋、小本金与沉重砝码形成一个夸张的视觉比喻；完整关系与局部聚焦交替，明确AI示意身份',[],'L09','M13','E07'),
 'silhouette-fable':('拱形背光舞台、少色明度层、轮廓与孔洞讲述；大字独立于亮幕，原色人物在外层伴随',['R23'],'L09','M01','E07'),
 'illustrated-map':('非真实地理的选择示意地图，以有机地形、河流、路线与三站保持空间记忆；按口播显现并聚焦节点',[],'L11','M01','E04'),
 'torn-paper':('不规则纸纤维撕口与暴露内层塑造物件，宽色片按比较和并列关系组织，完整片层以有限姿态落定',['R22'],'L10','M08','E04')}
c=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for s in [*c['styles'],*c['extensions']]:
 if s['key']not in keys:continue
 key=s['key'];mechanism,refs,layout,motion,editing=mechanisms[key];s.update(visualMechanism=mechanism,references=refs,profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'),assetDisclosure='Original AI concept pixels preserved; illustrative only; not real geography/scientific measurements/events; presenter unchanged'if key in ['picture-book','natural-history','editorial-metaphor','torn-paper']else'Original deterministic SVG explanatory geometry; presenter unchanged; no real financial or geographic data')
 row=next(r for r in research if r['key']==key);row.update(visualMechanism=s['visualMechanism'],references=s['references'],profiles=s['profiles'],assetDisclosure=s['assetDisclosure'])
put(APP/'style-library/catalog.json',c);put(R/'catalog.json',research)
print('Eight final illustration mechanisms and suggested recipes match actual implementation')
