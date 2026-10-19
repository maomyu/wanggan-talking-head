from pathlib import Path
import json,hashlib

R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
keys=['patchwork','knotted-cord','silk-layers','blue-green-landscape','mural','folk-woodblock','porcelain-painting','seal-carving']
review=read(R/'qa/author-review.json')
for key in keys:
 q=read(R/'qa'/f'{key}-verification.json');assert q['ok']and key in review['passed']and key not in review['needsRevision'];assert review['videoSha256'][key]==q['sha256']==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
assert read(R/'qa/batch07-clearance-encoded.json')['ok']
assert read(R/'qa/batch07-author-review.json')['ok']
refs=read(APP/'style-library/research-sources.json');ids={s['id']for s in refs};refs.extend(s for s in read(R/'qa/batch07-references.json')if s['id']not in ids);put(APP/'style-library/research-sources.json',refs)
data={
 'patchwork':('经纬织纹、不同织片和拼缝共同组织双格/三格布面；完整图记有限姿态落定，不声称逐针手作录像',['R24'],'L03','M08','E04'),
 'knotted-cord':('确定性绳股按深度投影交叉，独立结点表示并列建议；上环保留本金图记、下方挂具体重物，不是打结教程',[],'L07','M01','E04'),
 'silk-layers':('半透明纱片的细织纹和软褶皱按整层叠合，清晰图记在前，阅读标签保持在布层外；不模拟折射',[],'L10','M01','E02'),
 'blue-green-landscape':('原创青绿长卷以山体分组、矿物色层、留水和路径维持空间，随语义有限位聚焦；是意象而非真实地理',['R26'],'L11','M13','E07'),
 'mural':('原创双画带壁面以矿物土色和薄色磨损容纳同一组物件；取景保留本段需要的完整对照，不冒称古代文物',['R27'],'L09','M13','E07'),
 'folk-woodblock':('多色木版图记进入双联/三联弧顶画屏，墨线、套色和刻白形成印面；现代原创题材不伪称传统吉祥意义',['R28'],'L08','M01','E06'),
 'porcelain-painting':('完整浅盘的器口、白釉高光与凹曲面承载钴蓝笔绘，器外文字平视；独盘重点保留清晰边界与阅读空白',['R25'],'L12','M01','E04'),
 'seal-carving':('现代可读字组成朱白正负印面，以竖排、图记边款、破口边框和细印泥孔隙成形；不伪造篆书或真实印章',['R26','R29'],'L03','M01','E06')
}
C=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for row in [*C['styles'],*C['extensions']]:
 key=row['key']
 if key not in keys:continue
 mechanism,refs,layout,motion,editing=data[key]
 row.update(visualMechanism=mechanism,references=refs,profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'),assetDisclosure='Original AI concept material pixels preserved; illustrative only; presenter unchanged'if key not in ['knotted-cord','seal-carving']else'Original deterministic SVG illustration; readable modern glyphs, not historical calligraphy or an authentic seal')
 case=next(s for s in research if s['key']==key)
 for field in ['visualMechanism','references','profiles','assetDisclosure']:case[field]=row[field]
put(APP/'style-library/catalog.json',C);put(R/'catalog.json',research)
print('Eight final fiber/east mechanisms and suggested module recipes recorded from verified implementation')
