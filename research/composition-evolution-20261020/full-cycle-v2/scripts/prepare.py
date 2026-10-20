from pathlib import Path
import json,shutil,re,hashlib
R=Path(__file__).resolve().parents[1];OLD=R.parent
cat=json.loads((OLD/'catalogue.json').read_text())
representatives={'speaker':'minimal','editorial':'magazine','type':'type-poster','route':'comic','stack':'origami','derive':'blueprint','gallery':'film','stage':'clay','archive':'archive-dossier','interface':'precision','scroll':'ink','radial':'sci-fi-wireframe'}
content={
'hook':{'a':'越努力上班','b':'越存不到钱？','context':'先从自己的选择看起','items':[['跟风消费',''],['盲目投资',''],['负债前行','']]},
'chain':{'a':'跟风的代价','b':'最后落在自己身上','context':'后果由自己承担','items':[['跟风消费',''],['盲目投资',''],['本金受损','']]},
'overview':{'a':'三个财经底线','b':'从自己的选择开始','context':'三项并列建议','items':[['减少无效消费',''],['守住本金',''],['减少负债','']]},
'spend':{'a':'分清楚','b':'想要和需要','context':'下单之前\n留一点判断的空间','items':[['想要','一时喜欢'],['需要','实际用途'],['先分清楚','再决定买不买']]},
'risk':{'a':'守住本金','b':'先看风险，再做选择','context':'夸大收益的说法\n暗藏风险','items':[['夸大收益',''],['暗藏风险',''],['守住本金','']]},
'debt':{'a':'减少负债','b':'把压力往回收','context':'第三条底线','items':[['减少负债',''],['',''],['','']]},
'recap':{'a':'不跟风，不浮躁','b':'回到自己的判断','context':'少冲动　守本金　减负债','items':[['少冲动',''],['守本金',''],['减负债','']]}}
rows=[]
for g,key in representatives.items():
 s=next(x for x in cat['styles']if x['key']==key);p=R/'variants'/key
 if not p.exists():shutil.copytree(OLD/'variants'/key,p,ignore=shutil.ignore_patterns('outputs','qa','comparison','.hyperframes'))
 (p/'qa').mkdir(exist_ok=True);(p/'outputs').mkdir(exist_ok=True)
 cfg={**s,'status':'refining-full-film','sceneContent':content,'directorVersion':'2.0-research','canonicalMaterialSeek':True};cfg.pop('evidence',None);cfg.pop('shortVideo',None)
 (p/'plans/choreography.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
 for module in ['layout','motion','edit']:
  fp=p/'plans'/f'{module}-plan.json';d=json.loads(fp.read_text());d['compositionStudy'].update(revision='v2-full-film',scope='full1100-frame visual composition; original source voice unchanged',refinements=['complete hook','semantic line breaks','reading hierarchy','canonical material seek','no duplicated legacy labels','whole-film motion and transition QA']);fp.write_text(json.dumps(d,ensure_ascii=False,indent=2))
 rows.append({k:cfg[k]for k in ['id','key','name','choreography','directorVersion']})
(R/'catalogue.json').write_text(json.dumps({'schemaVersion':2,'scope':'12 full-length composition validation films','fps':30,'frameCount':1100,'duration':1100/30,'sourceFixture':'explicit approved current talking-head clip','styles':rows},ensure_ascii=False,indent=2))
(R/'plans/scene-content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2))
print('12 independent projects prepared, source video/voice and fonts retained')
