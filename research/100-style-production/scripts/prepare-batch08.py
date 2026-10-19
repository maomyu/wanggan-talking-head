from pathlib import Path
import json,subprocess,sys

R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
serif='#title{font-family:Serif;font-weight:700;font-size:100px}#subtitle{font-size:46px}'
rows=[
 ('lacquer-gold',['#1d1115','#f4e6c9','#d1bb96','#d6af6b','#2b1b20'],serif+'#captions{border:1px solid #997242}#heading{border-bottom:1px solid #614936;padding-bottom:12px}#person-mask{outline:5px solid #997242}#architecture{inset:514px 42px 674px;border:1px solid #614936}', '深黑红漆片上的细金线、金粉密度和受控高光形成两联/三联比较；配重圆盘作负担意象，不把材料显现称作撒金制作过程','L03','M01','E04'),
 ('watercolor',['#f5f0e4','#354c48','#62706a','#9c5b3e','#fff9ed'],serif+'#captions{border-left:4px solid #9c5b3e;border-top:0}#person-mask{outline:7px solid #fff9ed}', '松散纸边、纸白和透明洗色承载四个可读物件；无硬框，图注与湿边分离，完整画作逐层显露而非物理扩散模拟','L02','M01','E02'),
 ('impasto',['#e7dfd0','#40372f','#6c5c4c','#9e4f31','#fff5e5'], '#title{font-size:100px}#subtitle{font-size:46px}#captions{border:2px solid #9e4f31}#person-mask{outline:8px solid #cdb99c}', '可辨厚刀脊、覆盖关系与统一侧光让原始画布片成为展陈单元；整幅落位后读标签，人物不进入油彩媒介','L12','M01','E04'),
 ('enamel-badge',['#1d2931','#f0e7d2','#c4bdab','#d7ae68','#26343d'], '#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:3px solid #b28b53;border-bottom:1px solid #b28b53}#person-mask{outline:6px solid #b28b53}', '不透明釉色、金属围边和薄侧壁形成独立小物件，深色底板和轻微倾角区分并列，标签始终在物件外','L12','M01','E04'),
 ('foil-deboss',['#f0eadf','#4b4438','#716656','#8a6840','#fbf8ef'],serif+'#captions{border-top:1px solid #a08a68;border-bottom:1px solid #a08a68}#person-mask{outline:6px solid #e2d6c0}#heading{border-bottom:1px solid #baa98c;padding-bottom:10px}', '纤维纸内凹槽、压缩边和局部薄箔形成低起伏图记，三项校样纵排，纸片与正文平视；没有伪造可变灯光或实际压印录像','L03','M01','E04'),
 ('mosaic',['#e5dcc6','#393c30','#64674f','#914c35','#fbf3df'], '#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:5px solid #914c35;border-bottom:2px solid #914c35}#person-mask{outline:9px solid #c1aa7b}', '真实可辨的独立嵌片、砂浆缝和随形铺排组成图版；完整图版8px有限落位后完整保留，非逐片嵌装模拟','L03','M01','E04'),
 ('stained-glass',['#18252c','#f1e7ce','#cec3a6','#ddae68','#23373d'],serif+'#captions{border-top:5px solid #10191f;border-bottom:5px solid #10191f}#person-mask{outline:7px solid #10191f;box-shadow:0 0 0 9px #9d7b43}#heading{border-bottom:2px solid #79603d;padding-bottom:10px}', '连通的深铅条、纹理玻块和背光形成固定拼窗，连续窗棂组织双联/三联关系；不透明字幕与真实人物独立在前','L08','M01','E06'),
 ('sandstone-relief',['#ded3bb','#4d4030','#705b43','#947049','#f8edda'],serif+'#captions{border-top:4px solid #947049}#person-mask{outline:7px solid #bba17b}#heading{border-left:6px solid #947049;padding-left:22px}', '同一砂岩材质的浅凸台、下凹场和低角度阴影构成浮雕关系，整块石面有限位移后停稳，不只是石纹背景','L12','M01','E04')
]
catalog=read(APP/'style-library/catalog.json');by={s['key']:s for s in [*catalog['styles'],*catalog['extensions']]};profiles=read(APP/'style-library/profiles.json')
assert catalog['implementedCount']==74
for key,colors,css,mechanism,layout,motion,editing in rows:
 assert not(R/'variants'/key).exists(),'Preserve existing case: '+key
 look=dict(key=key,name=by[key]['name'],palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(x=225,y=580,w=630),css=css);look['palette']['portrait']=colors[0]
 (R/'shared'/f'{key}.js').write_text("import{makeCraftPaint}from'./craft-paint-stage.js';import geometry from'./atlas-geometry.js';\nexport const LOOK="+json.dumps(look,ensure_ascii=False)+";\nexport async function buildArt(ctx){return makeCraftPaint(ctx,{mode:"+json.dumps(key)+",geometry})}\n")
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[s[0]for s in rows]],check=True)
research=read(R/'catalog.json')
for key,colors,css,mechanism,layout,motion,editing in rows:
 p=R/'variants'/key
 a=read(p/'plans/art-direction.json');a.update(materialBehavior=mechanism,experience=mechanism,assetDisclosure='原创AI材料概念图；非真实制作/古物',profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'));put(p/'plans/art-direction.json',a)
 l=read(p/'plans/layout-plan.json');l.update(profile=profiles['layout'][layout],readingContract=mechanism+'；人物先停稳，标签与纹理/边框分开，字幕1600、60px、最多两行');put(p/'plans/layout-plan.json',l)
 m=read(p/'plans/motion-plan.json');m.update(profile=profiles['motion'][motion],actualBehavior='完整图版8px有限落位，标签随后显现；不是逐块嵌装'if key=='mosaic'else'物件完整显露并有限落位，语义错峰，短负债段立即交接；非工艺制作录像');put(p/'plans/motion-plan.json',m)
 html=(p/'assets/composition.html').read_text().replace(' · 图解示意',' · AI概念图').replace('图解依据本段口播，属于解释示意','AI原创材料图解，不是实物制作录像')
 if key in ['lacquer-gold','sandstone-relief','stained-glass']:html=html.replace('AI原创材料图解，不是实物制作录像','AI原创材料意象，不是真实古物')
 (p/'assets/composition.html').write_text(html)
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True)
 research.append(by[key])
research.sort(key=lambda s:int(s['id'][1:]));assert len(research)==62;put(R/'catalog.json',research)
progress=read(R/'progress.json')
for s in progress['styles']:
 if s['key']in [r[0]for r in rows]:s['stage']='design-preview'
progress.update(inProduction=8,queued=18);put(R/'progress.json',progress)
print('Eight craft/paint cases prepared; formal remains74; source/voice/caption fixture preserved')
