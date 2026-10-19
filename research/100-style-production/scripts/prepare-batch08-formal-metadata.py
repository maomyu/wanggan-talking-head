from pathlib import Path
import json,hashlib

R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
profiles={
 'lacquer-gold':(['R30'],'L03','M01','E04'),
 'watercolor':(['R31'],'L02','M01','E02'),
 'impasto':(['R32'],'L12','M01','E04'),
 'enamel-badge':(['R35'],'L12','M01','E04'),
 'foil-deboss':([],'L03','M01','E06'),
 'mosaic':(['R34'],'L03','M01','E04'),
 'stained-glass':(['R33'],'L08','M01','E06'),
 'sandstone-relief':([],'L12','M01','E04')}
review=read(R/'qa/author-review.json')
for key in profiles:
 q=read(R/'qa'/f'{key}-verification.json');assert q['ok']and key in review['passed']and key not in review['needsRevision']
 assert q['sha256']==review['videoSha256'][key]==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
assert read(R/'qa/batch08-author-review.json')['ok'] and read(R/'qa/batch08-clearance-encoded.json')['ok']
refs=read(APP/'style-library/research-sources.json');ids={s.get('id')for s in refs}
refs.extend(s for s in read(R/'qa/batch08-references.json')if s['id']not in ids);put(APP/'style-library/research-sources.json',refs)
C=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for row in [*C['styles'],*C['extensions']]:
 key=row['key']
 if key not in profiles:continue
 refs,layout,motion,editing=profiles[key]
 art=read(R/'variants'/key/'plans/art-direction.json')
 row.update(visualMechanism=art['materialBehavior'],references=refs,profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'),assetDisclosure='Original AI concept material pixels preserved; presenter unchanged; not actual manufacturing footage or a historic object')
 case=next(s for s in research if s['key']==key)
 for field in ['visualMechanism','references','profiles','assetDisclosure']:case[field]=row[field]
put(APP/'style-library/catalog.json',C);put(R/'catalog.json',research)
print('Eight craft/paint mechanisms and suggested module recipes recorded from verified implementation')
