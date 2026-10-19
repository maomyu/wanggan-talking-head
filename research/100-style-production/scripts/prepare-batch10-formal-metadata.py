from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
keys=['documentary','tabletop-stilllife','macro-material','overhead-workbench','architectural-light','everyday-story','spotlight-stage','darkroom-prints'];review=read(R/'qa/author-review.json')
assert read(R/'qa/batch10-author-review.json')['ok']and read(R/'qa/batch10-clearance-encoded.json')['ok']
for key in keys:
 q=read(R/'qa'/f'{key}-verification.json');assert q['ok']and key in review['passed']and key not in review['needsRevision'];assert q['sha256']==review['videoSha256'][key]==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
refs=read(APP/'style-library/research-sources.json');ids={s['id']for s in refs};photos=read(R/'shared/photos/index.json')['assets'];mapping={}
for i,p in enumerate(photos):
 ref='R'+str(37+i);mapping[p['key']]=ref
 if ref not in ids:refs.append(dict(id=ref,title=p['title'],url=p['descriptionPage'],scope='本批真实摄影原始资料；'+p['artist']+' / '+p['license']+'。仅数字裁切/注释/合成，黑白方向照片灰度；不代表本段人物、事件、交易或观点背书',license=p['license'],licenseUrl=p['licenseUrl'],sha256=p['sha256']))
put(APP/'style-library/research-sources.json',refs)
C=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
for row in [*C['styles'],*C['extensions']]:
 if row['key']not in keys:continue
 art=read(R/'variants'/row['key']/'plans/art-direction.json');row.update(visualMechanism=art['materialBehavior'].replace('图外引线与稳定词','独立侧注与细分隔线'),references=[mapping[p['key']]for p in art['sourcePhotos']],profiles=art['profiles'],assetDisclosure=art['assetDisclosure'])
 old=next(s for s in research if s['key']==row['key'])
 for f in ['visualMechanism','references','profiles','assetDisclosure']:old[f]=row[f]
put(APP/'style-library/catalog.json',C);put(R/'catalog.json',research)
f=APP/'runtime/approved-renderer.mjs';s=f.read_text();needle="graphics:'已认可财经原稿的解释示意；不作新素材自动内容模板'";assert needle in s;s=s.replace(needle,needle+",...(fs.existsSync(path.join(root,'assets/photo-sources.json'))?{photographicSources:read(path.join(root,'assets/photo-sources.json'))}:{})");f.write_text(s)
f=APP/'docs/第三方来源.md';s=f.read_text();s+='\n\n## 八种真实摄影画风\n\n源照片原像素、精确SHA和每幅许可在对应模板assets/photo-sources.json与photography-NOTICE.md；数字裁切/图注/合成与照片黑白转换均有说明。舞台只使用无人地板局部，不采用原发言者或投影内容。\n\n'
for p in photos:s+=f"- [{p['title']}]({p['descriptionPage']}) / {p['artist']} / [{p['license']}]({p['licenseUrl']})；本片数字改编，非摄影者背书。\n"
f.write_text(s)
index=read(R/'shared/photos/index.json');index['status']='seven unmodified real photographic sources used in eight verified full video directions; production status lives in formal catalog'
for item in index['assets']:item['status']='original-photograph-source-verified';item['usedBy']=[k for k in keys if any(p['key']==item['key']for p in read(R/'variants'/k/'plans/art-direction.json')['sourcePhotos'])]
put(R/'shared/photos/index.json',index)
f=R/'qa/next-photo-plan.md';f.write_text('# 摄影方向前期候选计划（历史）\n\n此文件保存素材采集与最初假设，当前8种已完成实际整片及作者抽看；最终构图、修正和验证以batch10-decisions.md及正式目录为准。早期资产快照中的候选文字仅是采集时状态。\n\n'+f.read_text())
print('Eight actual photographic mechanisms, source credits and conditional attribution staged')
