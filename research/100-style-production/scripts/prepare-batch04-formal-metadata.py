from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
keys=['photo-book','timeline-almanac','memphis','brutalist-type','optical-graphic','negative-space','pop-up-book','corrugated-model']
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');review=read(R/'qa/author-review.json')
for key in keys:
 proof=read(R/'qa'/f'{key}-verification.json');assert proof['ok']and key in review['passed']and key not in review['needsRevision']and review['videoSha256'][key]==proof['sha256']==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
refs=read(APP/'style-library/research-sources.json');ids={x['id']for x in refs}
refs.extend(x for x in read(R/'qa/batch04-references.json')if x['id']not in ids);put(APP/'style-library/research-sources.json',refs)
catalog=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for s in [*catalog['styles'],*catalog['extensions']]:
 if s['key']not in keys:continue
 if s['key']=='timeline-almanac':s['visualMechanism']='以可核对的日期或时间点、事件组成时间带；本例明确采用口播视频分秒，未来节点不冒充已经发生的历史'
 if s['key']=='pop-up-book':s['visualMechanism']='书脊、两页、铰链与相连V形支撑使纸形立起；不透明翻页只覆盖需要换图的模型条带';s['references']=['R13']
 if s['key']=='corrugated-model':s['visualMechanism']='两层薄面纸、真正空心波纹芯与厚边构成微型物件，孔洞和接触阴影体现瓦楞结构';s['profiles']['motion']='M13';s['references']=['R14']
 if s['key']=='memphis':s['references']=['R11']
 if s['key']=='optical-graphic':s['references']=['R12']
 if s['key']=='photo-book':s['assetDisclosure']='AI-generated still-life concept imagery; not documentary evidence; presenter source unchanged'
 row=next(x for x in research if x['key']==s['key']);row.update(visualMechanism=s['visualMechanism'],profiles=s['profiles'],references=s['references'])
put(APP/'style-library/catalog.json',catalog);put(R/'catalog.json',research)
print('Eight final metadata records match actual mechanisms and source scope')
