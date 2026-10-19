from pathlib import Path
import json,subprocess,sys

R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
serif='#title{font-family:Serif;font-weight:700;font-size:100px}#subtitle{font-size:46px}'
rows=[
 ('patchwork',['#e9e0ce','#473b2d','#72624d','#97563e','#fcf3df'],[225,580,630],serif+'#captions{border:3px dashed #a18b67;background:#fcf3df}#person-mask{outline:9px solid #d4bea0}#architecture{inset:510px 36px 672px;border:2px dashed #a18b67}', '织片和接缝形成面积与分组；整件图记有限姿态落定，不宣称逐针制作过程','L10','M08','E04'),
 ('knotted-cord',['#ece3cf','#51432e','#6d5f47','#94633d','#fff7e5'],[220,585,640],'#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:3px solid #94633d;border-bottom:3px solid #94633d}#person-mask{outline:7px solid #c7a571}', '原创绳结投影按深度组织真实交叉关系，独立结点表达并列建议；不声称打结教学或物理绳解算','L07','M01','E04'),
 ('silk-layers',['#e9eee4','#33483b','#5c6e60','#806642','#fbf9ed'],[225,580,630],serif+'#captions{border-left:6px solid #806642;border-top:0}#person-mask{outline:6px solid #f5f1db}', '原始纱布褶皱和细织纹随整层半透明叠合，关键图记和文字在独立前层；无人物滤镜','L10','M01','E02'),
 ('blue-green-landscape',['#e7dec8','#344b3d','#637054','#8c5d37','#faf1df'],[225,580,630],serif+'#heading{border-left:5px solid #8c5d37;padding-left:22px}#captions{border-top:2px solid #8c5d37;border-bottom:2px solid #8c5d37}', '原创青绿长卷的分组山势、留水与路径维持空间；按语义有限位聚焦，不作真实地理或收益图','L09','M13','E07'),
 ('mural',['#e6d8c1','#4d3d30','#75604c','#985b3d','#fff1dc'],[220,580,640],serif+'#captions{border-top:5px solid #985b3d}#heading{border-top:2px solid #985b3d;padding-top:8px}#person-mask{outline:6px solid #b89a72}', '原创矿物土色双画带壁面，有限位聚焦同一画面中的消费、保护与负担；不是古代文物或宗教原作','L09','M13','E07'),
 ('folk-woodblock',['#f0e2bb','#343025','#6c5c3f','#a03f2e','#fff5dc'],[225,580,630],serif+'#captions{border:3px solid #a03f2e}#heading{border-left:7px solid #a03f2e;padding-left:22px}#person-mask{outline:8px solid #ecd38b}', '多色木版图记进入双联/三联弧顶画屏，粗细墨线、套色和刻白构成印面；现代原创题材不冒称传统吉祥寓意','L07','M01','E04'),
 ('porcelain-painting',['#e8eef0','#2a4264','#5c6d7d','#355c8d','#fbfbf5'],[225,580,630],serif+'#captions{border-top:3px solid #355c8d}#person-mask{outline:9px solid #fafbf6;box-shadow:0 0 0 12px #7794b0}#heading{border-bottom:1px solid #7794b0;padding-bottom:12px}', '完整浅盘的器口、釉面、凹曲面与器上蓝绘组成解释单元，器物按层架比较与聚焦；文字位于平视器外','L14','M01','E04'),
 ('seal-carving',['#eee3cf','#4f3c2e','#75624f','#a23b2c','#fff5e1'],[225,585,630],serif+'#captions{border-left:7px solid #a23b2c;border-top:0}#person-mask{outline:5px solid #a23b2c;outline-offset:7px}#kicker{border:2px solid #a23b2c;padding:6px;width:112px}', '原创图记的朱白正负形、缺口边框与印泥颗粒共同构成印面；使用可读现代字，不伪造篆书、名家或机构印章','L07','M01','E04')
]
catalog=read(APP/'style-library/catalog.json');by={s['key']:s for s in [*catalog['styles'],*catalog['extensions']]}
profiles=read(APP/'style-library/profiles.json')
for key,colors,base,css,mechanism,layout,motion,editing in rows:
 assert not(R/'variants'/key).exists(),'Keep existing research source: '+key
 look=dict(key=key,name=by[key]['name'],palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(zip(['x','y','w'],base)),css=css);look['palette']['portrait']=colors[0]
 raster=key not in ['knotted-cord','seal-carving']
 imports="import{makeFiberEast}from'./fiber-east-stage.js';"+("import geometry from'./atlas-geometry.js';"if raster else'')
 (R/'shared'/f'{key}.js').write_text(imports+'\nexport const LOOK='+json.dumps(look,ensure_ascii=False)+';\nexport async function buildArt(ctx){return makeFiberEast(ctx,{mode:'+json.dumps(key)+(',geometry'if raster else'')+'})}\n')
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[s[0]for s in rows]],check=True)
research=read(R/'catalog.json')
for key,colors,base,css,mechanism,layout,motion,editing in rows:
 p=R/'variants'/key
 art=read(p/'plans/art-direction.json');art.update(materialBehavior=mechanism,experience=mechanism,assetDisclosure='AI概念图'if key not in ['knotted-cord','seal-carving']else'原创SVG图记示意',profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'));put(p/'plans/art-direction.json',art)
 l=read(p/'plans/layout-plan.json');l.update(profile=profiles['layout'][layout],readingContract=mechanism+'；人物先让出解释区，主信息完整显现后读标签；普通字幕保持1600且不和图解争主次');put(p/'plans/layout-plan.json',l)
 m=read(p/'plans/motion-plan.json');m.update(profile=profiles['motion'][motion],actualBehavior='有限位语义聚焦，人物停稳后再读图；短负债段无大幅人物移动时提前展开'if motion=='M13'else'解释图记错峰显现并停稳；材料整体落定，非真实工艺操作录像');put(p/'plans/motion-plan.json',m)
 html=(p/'assets/composition.html').read_text()
 if key not in ['knotted-cord','seal-carving']:html=html.replace(' · 图解示意',' · AI概念图').replace('图解依据本段口播，属于解释示意','AI材料图解依据原声，用作解释示意')
 if key=='blue-green-landscape':html=html.replace('AI材料图解依据原声，用作解释示意','AI山水只作意象，不代表真实地理')
 if key=='mural':html=html.replace('AI材料图解依据原声，用作解释示意','AI原创壁画示意，不是古代文物')
 if key=='seal-carving':html=html.replace('图解依据本段口播，属于解释示意','原创印面图记，文字为现代可读字')
 (p/'assets/composition.html').write_text(html)
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True)
 research.append(by[key])
research.sort(key=lambda s:int(s['id'][1:]));put(R/'catalog.json',research)
progress=read(R/'progress.json')
for s in progress['styles']:
 if s['key']in [r[0]for r in rows]:s['stage']='design-preview'
progress.update(inProduction=8,queued=26);put(R/'progress.json',progress)
print('Eight fiber/east research projects prepared; formal remains 66')
