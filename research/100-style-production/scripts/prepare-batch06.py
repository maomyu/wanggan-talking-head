from pathlib import Path
import json,shutil,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
pen="@font-face{font-family:Pen;src:url('assets/fonts/LXGWWenKai-500.woff');font-weight:500;ascent-override:90%;descent-override:20%;line-gap-override:0%}"
rows=[
 ('picture-book','儿童绘本',['#eee8d8','#314336','#586754','#8d5238','#fff9ed'],[225,580,630],pen+'#title{font-family:Pen;font-size:112px;font-weight:500}#subtitle{font-size:46px}#captions{border-left:5px solid #8d5238;border-top:0}#architecture{inset:508px 38px 674px;background:#f9f2e3;border:1px solid #b5a88b;box-shadow:6px 7px 0 #d2c5a8}', ['LXGWWenKai-500.woff']),
 ('natural-history','科学博物插画',['#f1eedf','#2f3e34','#596759','#835b39','#fffdf2'],[220,585,640],'#title{font-family:Serif;font-size:101px;font-weight:700}#subtitle{font-size:46px}#heading{border-bottom:1px solid #65705d;padding-bottom:18px}#captions{border-top:1px solid #65705d;border-bottom:1px solid #65705d}#architecture{inset:510px 36px 674px;background:#fcf9ee;border:1px solid #c1bcaa}',[]),
 ('isometric-city','等距城市插画',['#e9efdf','#2c493f','#526a59','#9b4e39','#faf9e9'],[225,580,630],'#title{font-size:99px}#subtitle{font-size:46px}#heading{border-left:10px solid #9b4e39;padding-left:22px}#captions{border-top:4px solid #2c493f}',[]),
 ('faceted-vector','低多边形平涂',['#ede8d8','#293e46','#58666b','#8e4c37','#fbf7eb'],[225,585,630],'#title{font-size:100px;letter-spacing:-2px}#subtitle{font-size:46px}#captions{border:0;border-left:8px solid #8e4c37}#architecture{inset:515px 36px 672px;background:#dce3df;clip-path:polygon(0 0,100% 0,100% 84%,75% 100%,0 100%)}',[]),
 ('editorial-metaphor','讽刺社论插画',['#f0ebdf','#223744','#59656b','#a33824','#fbf7ec'],[220,580,640],'#title{font-size:101px;letter-spacing:-3px}#subtitle{font-size:46px}#kicker{border-top:6px solid #a33824;padding-top:12px;width:90px}#captions{border-top:5px solid #a33824}',[]),
 ('silhouette-fable','剪影寓言',['#172235','#f4e7c8','#cfbea0','#dcc399','#233348'],[225,580,630],'#title{font-family:Serif;font-size:103px;font-weight:700}#subtitle{font-size:46px}#caption-text{color:#f4e7c8}#captions{border-top:2px solid #dcc399}#person-mask{outline:9px solid #f4e7c8}',[]),
 ('illustrated-map','地图旅行插画',['#eaf0df','#2d4937','#566b52','#8b5b35','#fcf7e8'],[225,580,630],'#title{font-family:Serif;font-size:102px;font-weight:700}#subtitle{font-size:46px}#captions{border-left:5px solid #8b5b35;border-top:0}#architecture{inset:510px 36px 672px;border:1px solid #b2bfa3;background:#f2f4e8}',[]),
 ('torn-paper','撕纸肌理',['#eee7d5','#2f453c','#566a5c','#a44b35','#fff8e8'],[225,580,630],'#title{font-size:101px}#subtitle{font-size:46px}#captions{border-top:0;border-bottom:5px solid #a44b35}#person-mask{outline:9px solid #fff8e8}',[])
]
rasters={'picture-book','natural-history','editorial-metaphor','torn-paper'}
for key,name,colors,base,css,fonts in rows:
 look=dict(key=key,name=name,palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(zip(['x','y','w'],base)),css=css);look['palette']['portrait']=colors[0]
 if key in rasters:imports="import{makeRasterIllustration}from'./illustration-raster-stage.js';import geometry from'./atlas-geometry.js';";call='makeRasterIllustration(ctx,{mode:'+json.dumps(key)+',geometry})'
 else:imports="import{makeVectorIllustration}from'./illustration-vector-stage.js';";call='makeVectorIllustration(ctx,{mode:'+json.dumps(key)+'})'
 (R/'shared'/f'{key}.js').write_text(imports+'\nexport const LOOK='+json.dumps(look,ensure_ascii=False)+';\nexport async function buildArt(ctx){return '+call+'}\n')
pending=[r[0]for r in rows if not(R/'variants'/r[0]).exists()]
if pending:subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*pending],check=True)
C=json.loads((APP/'style-library/catalog.json').read_text());by={s['key']:s for s in [*C['styles'],*C['extensions']]};catalog=json.loads((R/'catalog.json').read_text());known={s['key']for s in catalog}
for key,name,colors,base,css,fonts in rows:
 P=R/'variants'/key;assert not(P/'outputs/final.mp4').exists(),'Do not rewrite rendered case'
 if key not in known:catalog.append(by[key])
 helper='illustration-raster-stage.js'if key in rasters else'illustration-vector-stage.js';shutil.copy2(R/'shared'/helper,P/'assets'/helper)
 p=P/'plans/art-direction.json';d=json.loads(p.read_text());d.update(extraFontRoles=fonts,materialBehavior='本片原创插画与语义聚焦；生成素材有明确声明；不是实拍、真实地图或真实测量');p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 p=P/'assets/composition.html';s=p.read_text()
 if key in rasters:s=s.replace(name+' · 图解示意',name+' · AI概念图').replace('图解依据本段口播，属于解释示意','AI插画依据原声，用作解释示意')
 if key=='illustrated-map':s=s.replace('图解依据本段口播，属于解释示意','地图为选择示意，不代表真实地理')
 p.write_text(s);subprocess.run(['node',str(P/'scripts/build-project.mjs'),'--project',str(P)],check=True)
catalog.sort(key=lambda s:int(s['id'][1:]));(R/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n');p=R/'progress.json';d=json.loads(p.read_text())
for s in d['styles']:
 if s['key']in[r[0]for r in rows]:s['stage']='design-preview'
d.update(inProduction=sum(not s['formal']and s['stage']!='queued'for s in d['styles']),queued=sum(s['stage']=='queued'for s in d['styles']));p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
