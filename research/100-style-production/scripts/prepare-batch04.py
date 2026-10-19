from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
rows=[
 ('photo-book','摄影画册',['#f0f0e7','#28352f','#576157','#735142','#fffdf7'],[220,585,640],'#title{font-family:Serif;font-weight:700;font-size:98px}#subtitle{font-family:Serif;font-size:46px}#person-mask{outline:9px solid #fffdf7}#captions{border-top:1px solid #777f72}'),
 ('timeline-almanac','时间轴年鉴',['#eae7d8','#2d443b','#56665b','#7b4a30','#f8f4e7'],[225,585,630],'#title{font-size:100px}#kicker{border-left:8px solid var(--accent);padding-left:17px}#captions{border-left:5px solid var(--accent);border-top:0}'),
 ('memphis','孟菲斯几何',['#f4eade','#1f2e35','#4d5060','#914025','#fff8ed'],[220,585,640],'#title{font-size:103px;letter-spacing:-3px}#subtitle{font-size:47px}#captions{border:4px solid #1f2e35;border-right-width:10px}#person-mask{outline:9px solid #fff8ed;box-shadow:0 0 0 4px #1f2e35}'),
 ('brutalist-type','粗野排印',['#edece1','#171d17','#465042','#50652d','#e9ef73'],[200,580,680],'#title{font-size:110px;letter-spacing:-5px}#subtitle{font-size:45px}#heading{border-top:7px solid #171d17;padding-top:13px}#captions{border:7px solid #171d17}#person-mask{outline:8px solid #e9ef73;box-shadow:0 0 0 4px #171d17}'),
 ('optical-graphic','动势错视',['#f8f7f0','#171b1b','#515954','#222222','#f8f7f0'],[230,585,620],'#title{font-size:104px;letter-spacing:-4px}#subtitle{font-size:47px}#captions{border-top:7px solid #171b1b}#person-mask{outline:10px solid #f8f7f0;box-shadow:0 0 0 3px #171b1b}'),
 ('negative-space','负空间图形',['#f3eee0','#1a3340','#4d5e5c','#8d4a32','#f3eee0'],[220,585,640],'#title{font-family:Serif;font-weight:700;font-size:98px}#kicker{letter-spacing:4px}#captions{background:#1a3340;border-top:0}#caption-text{color:#f3eee0}#recap span{background:#f3eee0}'),
 ('pop-up-book','立体书机关',['#e2e6d7','#2c4036','#536653','#8c4f32','#f8f1df'],[222,585,636],'#title{font-family:Serif;font-weight:700;font-size:98px}#architecture{inset:505px 36px 675px;border-top:2px solid #b8bdab;border-bottom:2px solid #b8bdab;background:#eff0e5}#art canvas{position:absolute;left:0;top:0;width:952px;height:400px;z-index:0}#art svg{position:absolute;inset:0;z-index:2}#captions{border-top:3px solid #8c4f32}'),
 ('corrugated-model','瓦楞纸模型',['#eee4d0','#473b27','#67583d','#765033','#faf2df'],[225,585,630],'#title{font-size:100px}#architecture{inset:505px 36px 675px;border:3px dashed #9d8a62;background:#e3d7bd}#art canvas{position:absolute;left:0;top:0;width:952px;height:400px;z-index:0}#art svg{position:absolute;inset:0;z-index:2}#person-mask{outline:7px solid #faf2df;box-shadow:0 0 0 3px #9d8a62}#captions{border-top:4px solid #765033}')
]
for key,name,colors,base,css in rows:
 look=dict(key=key,name=name,palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(zip(['x','y','w'],base)),css=css);look['palette']['portrait']=colors[0]
 if key=='photo-book':imports="import{makePhotoBook}from'./editorial-extra.js';import geometry from'./atlas-geometry.js';";call='makePhotoBook(ctx,geometry)'
 elif key=='timeline-almanac':imports="import{makeTimeline}from'./editorial-extra.js';";call='makeTimeline(ctx)'
 elif key in ['pop-up-book','corrugated-model']:imports="import{makePaperConstruction}from'./paper-construction-stage.js';";call="makePaperConstruction(ctx,'"+('book'if key=='pop-up-book'else'corrugated')+"')"
 else:imports="import{makeGraphic}from'./graphic-stage.js';";call='makeGraphic(ctx,'+json.dumps(key)+')'
 (R/'shared'/f'{key}.js').write_text(imports+'\nexport const LOOK='+json.dumps(look,ensure_ascii=False)+';\nexport async function buildArt(ctx){return '+call+'}\n')
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[row[0]for row in rows]],check=True)
C=json.loads((APP/'style-library/catalog.json').read_text());by={s['key']:s for s in [*C['styles'],*C['extensions']]};catalog=json.loads((R/'catalog.json').read_text());known={s['key']for s in catalog}
for row in rows:
 if row[0]not in known:catalog.append(by[row[0]])
catalog.sort(key=lambda s:int(s['id'][1:]));(R/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n');p=json.loads((R/'progress.json').read_text())
for s in p['styles']:
 if s['key']in[row[0]for row in rows]:s['stage']='design-preview'
(R/'progress.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
for key,*_ in rows:subprocess.run(['node',str(R/'variants'/key/'scripts/build-project.mjs'),'--project',str(R/'variants'/key)],check=True)
