from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
pen="@font-face{font-family:Pen;src:url('assets/fonts/LXGWWenKai-500.woff');font-weight:500;ascent-override:90%;descent-override:20%;line-gap-override:0%}"
brush="@font-face{font-family:Brush;src:url('assets/fonts/MaShanZheng-Regular.ttf');font-weight:400;ascent-override:90%;descent-override:20%;line-gap-override:0%}"
rows=[
 ('pencil-sketch','铅笔素描',['#f1eee6','#30383b','#586062','#83533d','#faf8f0'],[220,585,640],'#title{font-family:Serif;font-size:100px;font-weight:700}#subtitle{font-size:46px}#captions{border-top:1px solid #7f8177}#architecture{inset:505px 36px 675px;border-top:1px solid #a3a598;border-bottom:1px solid #a3a598}',[]),
 ('colored-pencil','彩铅笔记',['#f1eddd','#2f403b','#52605b','#864e32','#fffaf0'],[225,585,630],pen+'#title{font-family:Pen;font-weight:500;font-size:109px}#subtitle{font-size:46px}#architecture{inset:505px 36px 675px;background:#fcf9ed;border:1px solid #c3bda5;box-shadow:4px 4px 0 #ded5ba}#captions{border-left:4px solid #9b6150;border-top:0}',['LXGWWenKai-500.woff']),
 ('charcoal','炭笔擦绘',['#d4d4ca','#242927','#4b5450','#484f49','#f8f7ed'],[220,585,640],'#title{font-family:Serif;font-size:106px;font-weight:700}#subtitle{font-size:46px}#art{background:var(--bg)}#captions{border-top:5px solid #4b5450}#person-mask{outline:9px solid #f8f7ed}',[]),
 ('pen-hatching','钢笔排线',['#f7f5eb','#172d32','#52656a','#8b4a31','#fffdf4'],[225,585,630],'#title{font-family:Serif;font-size:102px;font-weight:700}#subtitle{font-size:46px}#heading{border-bottom:1px solid #172d32;padding-bottom:18px}#captions{border-top:1px solid #172d32;border-bottom:1px solid #172d32}',[]),
 ('wax-crayon','蜡笔涂绘',['#f7eedb','#293a41','#56635f','#99402e','#fff9eb'],[225,580,630],pen+'#title{font-family:Pen;font-weight:500;font-size:112px}#subtitle{font-size:48px}#captions{border:0;border-bottom:4px solid #99402e}#person-mask{outline:10px solid #fff9eb}',['LXGWWenKai-500.woff']),
 ('soft-pastel','粉彩晕染',['#e9e4dc','#354046','#606667','#795647','#f6f3ed'],[220,585,640],'#title{font-family:Serif;font-size:103px;font-weight:700}#subtitle{font-size:46px}#captions{border-top:1px solid #857b70}#person-mask{outline:10px solid #faf7f0;box-shadow:0 8px 22px #3b3b2420}',[]),
 ('marker-sketch','记号笔速写',['#ece8df','#253b45','#52616a','#8b442e','#fffaf0'],[225,585,630],'#title{font-size:100px;letter-spacing:-2px}#subtitle{font-size:48px}#kicker{border-left:6px solid #8b442e;padding-left:16px}#captions{border-top:5px solid #253b45}',[]),
 ('brush-lettering','刷笔字形',['#eee8da','#242e2a','#57655b','#87513b','#f8f3e9'],[220,585,640],brush+'#title{font-family:Brush;font-weight:400;font-size:118px;line-height:1.2}#subtitle{font-size:46px}#captions{border-top:2px solid #87513b}',['MaShanZheng-Regular.ttf'])
]
for key,name,colors,base,css,fonts in rows:
 look=dict(key=key,name=name,palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(zip(['x','y','w'],base)),css=css);look['palette']['portrait']=colors[0]
 if key=='brush-lettering':imports="import{makeBrush}from'./brush-stage.js';";call='makeBrush(ctx)'
 else:imports="import{makeDrawing}from'./drawing-stage.js';import geometry from'./atlas-geometry.js';";call='makeDrawing(ctx,{mode:'+json.dumps(key)+',geometry})'
 (R/'shared'/f'{key}.js').write_text(imports+'\nexport const LOOK='+json.dumps(look,ensure_ascii=False)+';\nexport async function buildArt(ctx){return '+call+'}\n')
pending=[s[0]for s in rows if not(R/'variants'/s[0]).exists()]
if pending:subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*pending],check=True)
C=json.loads((APP/'style-library/catalog.json').read_text());by={s['key']:s for s in [*C['styles'],*C['extensions']]};catalog=json.loads((R/'catalog.json').read_text());known={s['key']for s in catalog}
for key,name,colors,base,css,fonts in rows:
 if key not in known:catalog.append(by[key])
 P=R/'variants'/key;assert not(P/'outputs/final.mp4').exists(),'Do not rewrite an already rendered case'
 if key!='brush-lettering':
  import shutil;shutil.copy2(R/'shared/drawing-stage.js',P/'assets/drawing-stage.js')
 p=P/'plans/art-direction.json';d=json.loads(p.read_text());d['extraFontRoles']=fonts;d['materialBehavior']='整词或笔迹区域分阶段显现；不是实拍手绘过程，也不声称逐笔真实笔顺';p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 if key!='brush-lettering':
  p=P/'assets/composition.html';s=p.read_text().replace(name+' · 图解示意',name+' · AI手绘概念图').replace('图解依据本段口播，属于解释示意','手绘为AI概念图，依据原声作解释示意');p.write_text(s)
 subprocess.run(['node',str(P/'scripts/build-project.mjs'),'--project',str(P)],check=True)
catalog.sort(key=lambda s:int(s['id'][1:]));(R/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n');p=R/'progress.json';d=json.loads(p.read_text())
for s in d['styles']:
 if s['key']in[s[0]for s in rows]:s['stage']='design-preview'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
