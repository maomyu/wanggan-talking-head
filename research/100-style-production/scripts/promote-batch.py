from pathlib import Path
import json,hashlib,shutil,datetime,argparse,re
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';arg=argparse.ArgumentParser();arg.add_argument('--version',required=True);arg.add_argument('keys',nargs='+');opt=arg.parse_args();review=json.loads((R/'qa/author-review.json').read_text());C=json.loads((APP/'style-library/catalog.json').read_text());profiles=json.loads((APP/'style-library/profiles.json').read_text());geometry=json.loads((R/'qa/design-qa.json').read_text());proofs=[];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for key in opt.keys:
 assert key in review['passed']and key not in review['needsRevision'],'Author review pending: '+key
 P=R/'variants'/key;proof=json.loads((R/'qa'/f'{key}-verification.json').read_text());assert proof['ok']and proof['frames']==1100 and sha(P/'outputs/final.mp4')==proof['sha256'];assert next(s for s in geometry['results']if s['look']==key)['reverseSeekStable']
 assert review.get('videoSha256',{}).get(key)==proof['sha256'],'Author review must name this exact encode: '+key
 proofs.append(proof)
evidence_name='production-'+datetime.datetime.now().strftime('%Y%m%d')+'-'+'-'.join(next(s['id'].lower()for s in [*C['styles'],*C['extensions']]if s['key']==key)for key in opt.keys)+'.json'
put(APP/'style-library/evidence'/evidence_name,dict(kind='production-verified-under-authorized-goal',date=datetime.datetime.now().astimezone().isoformat(),authorization='设定目标帮我完成这100种画风并正式并入插件',userVisualApproval=False,authorReview=review,programProofs=proofs,scope='同一中文口播素材、1080×1920、30fps、1100帧；作者实际查看拼版和代表状态，程序核对原声、人物颜色、圆窗、字幕、反向寻址、5fps密集帧与切点邻帧。没有独立盲评。'))
for key in opt.keys:
 row=next(s for s in [*C['styles'],*C['extensions']]if s['key']==key);P=R/'variants'/key;dest=APP/'style-library/templates'/key;dest.mkdir(parents=True,exist_ok=True);assets=dest/'assets';assets.mkdir(exist_ok=True)
 for f in(P/'assets').iterdir():
  if f.name in ['fonts','vendor','master.mp4','edited-voice.wav','voice.wav','gsap.min.js','timing.js']:continue
  if f.is_file():shutil.copy2(f,assets/f.name)
 html=(P/'index.html').read_text();html=re.sub(r' data-hf-id="[^"]+"','',html);(dest/'index.html').write_text(html)
 shutil.copy2(R/'outputs'/f'{key}-poster.jpg',APP/'style-library/previews'/f'{key}.jpg')
 proof=next(q for q in proofs if q['look']==key);row.pop('productionStage',None);row.update(sourceKind='original-production-adaptation',status='verified-video',validation='已完成真实整片编码、程序检查与作者审看；制作验证，尚未逐条获得用户视觉认可',preview=f'previews/{key}.jpg',implementation=f'templates/{key}/index.html',evidence='evidence/'+evidence_name,videoSha256=proof['sha256'],compatibleModules=['art-direction','layout','motion','editing'],personTreatment='source-color; true-circle-in-corners',fontRoles=['NotoSansSC-700.woff','NotoSansSC-900.woff','NotoSerifSC-700.woff'],approvalBasis='user-authorized-100-style-goal; production-verified')
 if 'data-person-travel='in html:row.update(motionParameter='data-person-travel',personTravelSeconds=json.loads((P/'plans/motion-plan.json').read_text())['travelSeconds'],portraitBase=json.loads((P/'plans/layout-plan.json').read_text())['portrait']['baseBox'])
 if row in C['extensions']:C['styles'].append(row);C['extensions'].remove(row)
progress=json.loads((R/'progress.json').read_text())
for row in C['extensions']:
 stage=next(s['stage']for s in progress['styles']if s['key']==row['key'])
 if stage!='queued':row['productionStage']=stage;row['validation']='已进入实际制作，仍在修正或验证；尚无正式完整模板'
C['styles'].sort(key=lambda s:int(s['id'][1:]));N=len(C['styles']);A=sum(s['status']=='approved-video'for s in C['styles']);V=N-A;Q=len(C['extensions']);C.update(version=opt.version,implementedCount=N,approvedCount=A,userApprovedCount=A,productionVerifiedCount=V,plannedCount=Q,totalCount=N+Q,researchBoundary=f'100项为可组合视觉方向，含材料、传统风格与原创配方；{A}种用户认可，{V}种制作验证，{Q}种尚未完成。不是100个互斥行业标准。');put(APP/'style-library/catalog.json',C)
metadata=json.loads((APP/'.codex-plugin/plugin.json').read_text());metadata['version']=opt.version;metadata['description']=f'网感口播：{N}种已实现画风（{A}用户认可、{V}制作验证）、100种创意方向；四个完整专业skill协作。';metadata['interface']['shortDescription']=f'{N}种已实现画风与100种方向协作';metadata['interface']['longDescription']=f'保留四个完整专家skill与统筹入口，{N}种可复用画风含{A}用户认可与{V}制作验证，另{Q}种待完成；人物原色、角落圆窗、字幕上移。';put(APP/'.codex-plugin/plugin.json',metadata)
# Refresh only the formal handoff; preserve each complete expert body.
manifest=json.loads((APP/'module-manifest.json').read_text());manifest['scope']=f'正式{opt.version}：{N}实现/{A}用户认可/{V}制作验证；四份专家正文保留'
for m in manifest['modules']:
 f=APP/m['frozenCopy']/'SKILL.md';before,body=f.read_text().split('</formal_plugin_contract>\n',1);assert hashlib.sha256(body.encode()).hexdigest()==m['preservedExpertBodySha256'];before=before.replace('画风可选20个已认可方向','正式库区分用户认可与制作验证，两类已实现方向均可选').replace('扩展目录含80个待实测候选','扩展目录按实际进度保留尚未完成方向');t=before+'</formal_plugin_contract>\n'+body;f.write_text(t);m['sha256']=hashlib.sha256(t.encode()).hexdigest();m['characters']=len(t)
put(APP/'module-manifest.json',manifest)
for rel in ['README.md','docs/共同制作规范.md','docs/组合与范围.md','docs/使用说明.md']:
 f=APP/rel;s=f.read_text();s=re.sub(r'^# 网感口播 \d+\.\d+\.\d+', '# 网感口播 '+opt.version,s,flags=re.M);s=s.replace('20种已认可视频画风',f'{N}种已实现画风（{A}用户认可、{V}制作验证）').replace('另80种只有文字配方，尚无样帧或视频',f'另{Q}种尚未完成，分别标记候选或制作中').replace('另外80种只有文字配方，尚无样帧或视频',f'另外{Q}种尚未完成，分别标记候选或制作中').replace('另80个创意方向单列为候选',f'另{Q}个尚未完成方向单列为候选或制作中').replace('A21—A100是待样片验证的80个创意方向',f'未完成的{Q}个方向仍位于extensions，制作中与排队状态分开记录');s=re.sub(r'\d+种已实现画风（\d+用户认可、\d+制作验证）',f'{N}种已实现画风（{A}用户认可、{V}制作验证）',s);s=re.sub(r'(另外|另)\d+种尚未完成',lambda m:m[1]+str(Q)+'种尚未完成',s);s=re.sub(r'未完成的\d+个方向',f'未完成的{Q}个方向',s);s=re.sub(r'^当前库：.*\n?', '', s, flags=re.M);s+='\n当前库：'+str(N)+'种已实现（'+str(A)+'用户认可，'+str(V)+'制作验证），'+str(Q)+'种未完成。`styles --status implemented`查询可用实现，`--status approved`仅查询用户认可，`--status production`仅查询制作验证。`--example approved`为兼容沿用的固定素材复现命令，两类已实现模板均可使用，不表示都获用户逐条视觉认可。\n';f.write_text(s)
allstyles=sorted([*C['styles'],*C['extensions']],key=lambda s:int(s['id'][1:]));lines=['# 100种画风与协作配方','',C['researchBoundary'],'','人物保持原色，角落正圆窗，字幕上移；声音默认保留原声。下面的搭配是设计起点，四个完整专家skill负责按真实素材实施。','']
for family in C['families']:
 lines+=['## '+family['name'],'',family['principle'],'','|编号|画风|辨识机制|状态|','|---|---|---|---|']
 for s in allstyles:
  if s['familyKey']==family['key']:lines.append('|'+s['id']+'|'+s['name']+'|'+s['visualMechanism']+'|'+('用户认可完整视频'if s['status']=='approved-video'else'制作验证完整视频'if s['status']=='verified-video'else'制作中'if s.get('productionStage')else'候选，待制作')+'|')
 lines.append('')
lines+=['## 每种的协作配方','']
for s in allstyles:
 lines+=['### '+s['id']+' '+s['name'],'',s['visualMechanism']+'。','']
 for module,label in [('layout','排版'),('motion','动效'),('editing','剪辑转场'),('sound','声音')]:
  p=profiles[module][s['profiles'][module]];lines.append('- '+label+'：'+p['name']+'。'+p['guidance'])
 lines+=['- 验证状态：'+s.get('validation','已获用户认可完整视频')+'。','']
lines+=['## 研究参考','']
for ref in json.loads((APP/'style-library/research-sources.json').read_text()):lines.append('- ['+ref['title']+']('+ref['url']+')：'+ref['scope']+'。')
(APP/'docs/100种画风与协作配方.md').write_text('\n'.join(lines).rstrip()+'\n')
for s in progress['styles']:
 if s['key']in opt.keys:s.update(formal=True,userApproved=False,stage='formal-production-verified')
progress.update(productionVerified=V,inProduction=sum(not s['formal']and s['stage']!='queued'for s in progress['styles']),queued=sum(s['stage']=='queued'for s in progress['styles']));put(R/'progress.json',progress)
print(json.dumps(dict(version=opt.version,implemented=N,userApproved=A,productionVerified=V,pending=Q,promoted=opt.keys),ensure_ascii=False))
