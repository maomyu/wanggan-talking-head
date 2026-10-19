from pathlib import Path
import json,hashlib,shutil
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
keys=['chased-metal','miniature-puppet','building-blocks','optical-glass','ceramic-objects','liquid-chrome','isometric-maquette','inflatable-sculpture','viscous-gel','holographic-volume']
review=read(R/'qa/author-review.json')
assert read(R/'qa/batch09-author-review.json')['ok']and read(R/'qa/batch09-clearance-encoded.json')['ok']
for key in keys:
 q=read(R/'qa'/f'{key}-verification.json')
 assert q['ok']and key in review['passed']and key not in review['needsRevision']
 assert q['sha256']==review['videoSha256'][key]==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
refs=read(APP/'style-library/research-sources.json');ids={s['id']for s in refs}
refs.extend(s for s in read(R/'qa/batch09-references.json')if s['id']not in ids);put(APP/'style-library/research-sources.json',refs)
shutil.copy2(R/'shared/three-LICENSE.txt',APP/'style-library/runtime/vendor/LICENSE-three.txt')
C=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for row in [*C['styles'],*C['extensions']]:
 key=row['key']
 if key not in keys:continue
 art=read(R/'variants'/key/'plans/art-direction.json')
 references=['R36']if key in ['optical-glass','liquid-chrome','isometric-maquette','viscous-gel','holographic-volume']else['R02']if key in ['miniature-puppet','building-blocks']else[]
 row.update(visualMechanism=art['materialBehavior'],references=references,profiles=art['profiles'],assetDisclosure=art['assetDisclosure'])
 case=next(s for s in research if s['key']==key)
 for f in ['visualMechanism','references','profiles','assetDisclosure']:case[f]=row[f]
put(APP/'style-library/catalog.json',C);put(R/'catalog.json',research)
print('Ten verified mechanisms/recipes and pinned source notice staged for formal promotion')
