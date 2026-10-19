from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
rows=[
 ('newspaper','新闻报纸',['#f0edde','#242c27','#51594e','#843c2c','#f8f5e9'],[220,585,640], '#title{font-family:Serif;font-weight:700;font-size:100px}#captions{border-top:6px double var(--fg)}#subtitle{border-bottom:2px solid var(--fg);padding-bottom:18px}'),
 ('archive-dossier','档案卷宗',['#d7c6a1','#352f24','#5e513b','#79512d','#faf2dc'],[220,585,640], '#heading{border-left:10px solid #79512d;padding-left:28px;width:952px}#title{font-size:93px}#captions{border:2px solid var(--fg);border-left-width:10px}#person-mask{outline:8px solid #faf2dc;box-shadow:0 0 0 3px #79512d}'),
 ('dictionary-entry','字典辞条',['#f4f0e3','#232c24','#535a4e','#7d4536','#f8f5eb'],[230,590,620], '#title{font-family:Serif;font-weight:700}#heading{border-bottom:2px solid var(--fg);padding-bottom:20px}#subtitle{font-family:Serif;font-size:47px}#captions{background:transparent;border-top:2px solid var(--fg);border-bottom:2px solid var(--fg)}'),
 ('lab-notebook','实验记录',['#e6eadd','#244b65','#455c5b','#844f42','#f9f6e7'],[228,590,624], '#heading{left:92px;width:896px}#title{font-size:91px}#kicker{padding-left:22px;border-left:6px solid var(--accent)}#captions{border-top:0;border-left:5px solid #bf8a80;padding-left:32px}#scene-labels{font-size:40px}'),
 ('swiss-grid','瑞士网格',['#f3f1e9','#171b19','#47524a','#b03229','#f3f1e9'],[130,580,660], '#heading{left:64px;width:952px}#title{font-size:105px;letter-spacing:-4px}#subtitle{font-size:46px}#captions{border:0;border-left:12px solid var(--accent);padding-left:24px}#scene-labels{font-size:40px}'),
 ('constructivist','构成主义',['#ece4ce','#202722','#4d5447','#bd3928','#f6edd7'],[200,585,680], '#title{font-size:99px;letter-spacing:-3px}#subtitle{display:inline-block;background:#f6edd7;padding:4px 16px;font-size:45px}#captions{border-top:0;border-left:14px solid #202722}#person-mask{outline:9px solid #f6edd7;box-shadow:0 0 0 3px #202722}#scene-labels{background:#ece4ce;padding:8px 12px}'),
 ('art-deco','装饰艺术',['#13282b','#f1e6c9','#cbbd99','#cfb171','#172c2e'],[230,585,620], '#heading{text-align:center;left:88px;width:904px}#title{font-family:Serif;font-size:94px;font-weight:700;letter-spacing:6px}#subtitle{font-family:Serif;font-size:46px}#kicker{letter-spacing:7px}#captions{border:2px solid var(--accent);border-left-width:7px;border-right-width:7px}#person-mask{outline:7px solid #13282b;box-shadow:0 0 0 3px #cfb171}'),
 ('art-nouveau','新艺术曲线',['#eee5c6','#344832','#526548','#7d5c38','#f6efd9'],[225,590,630], '#heading{text-align:center;left:84px;width:912px}#title{font-family:Serif;font-weight:700;font-size:94px;letter-spacing:3px}#subtitle{font-family:Serif;font-size:46px}#captions{border:2px solid #65734e;border-radius:36px 5px 36px 5px}#person-mask{outline:8px solid #eee5c6;box-shadow:0 0 0 3px #65734e}')
]
for key,name,colors,base,css in rows:
 look=dict(key=key,name=name,palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(zip(['x','y','w'],base)),css=css);look['palette']['portrait']=colors[0]
 (R/'shared'/f'{key}.js').write_text("import{makeEditorial}from'./editorial-stage.js';\nexport const LOOK="+json.dumps(look,ensure_ascii=False)+";\nexport async function buildArt(ctx){return makeEditorial(ctx,"+json.dumps(key)+")}\n")
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[r[0]for r in rows]],check=True)
# Extend the local in-production list without resetting any prior implementation.
C=json.loads((APP/'style-library/catalog.json').read_text());by={s['key']:s for s in [*C['styles'],*C['extensions']]};catalog=json.loads((R/'catalog.json').read_text());known={s['key']for s in catalog}
for row in rows:
 if row[0]not in known:catalog.append(by[row[0]])
catalog.sort(key=lambda s:int(s['id'][1:]));(R/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
p=json.loads((R/'progress.json').read_text())
for s in p['styles']:
 if s['key']in[r[0]for r in rows]:s['stage']='design-preview'
(R/'progress.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
for key,*_ in rows:subprocess.run(['node',str(R/'variants'/key/'scripts/build-project.mjs'),'--project',str(R/'variants'/key)],check=True)
