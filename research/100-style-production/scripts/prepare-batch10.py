from pathlib import Path
import json,subprocess,sys,shutil,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
rows=[
 ('documentary',['#e7e9e4','#263832','#5d7065','#8a4934','#fffbed'],'L01','M01','E01',['street'],'真实城市高位资料以宽幅上下文和记录式图注组织，随口播逐项标记消费与投资；不是本段人物或事件现场'),
 ('tabletop-stilllife',['#edeae1','#263d3c','#5f7066','#866646','#fff9eb'],'L12','M01','E02',['desk'],'真实斜视桌面的计算器、笔记本、电脑与光影保持自然关系，图外引线与稳定词承担解释；不伪造操作结果或原纸面金融数据'),
 ('macro-material',['#eae4d7','#3a3830','#6b6659','#80552f','#fff7e8'],'L12','M01','E03',['coins'],'历史币表面细节被圆形微距窗口放大，并保留原图索引或整体对照；真实纹理承担主视觉，不作为币种鉴定、现代投资或收益证据'),
 ('overhead-workbench',['#eee7d6','#3a4134','#68715b','#7a6040','#fff9e9'],'L09','M02','E07',['workbench'],'真实俯拍网格本和铅笔构成操作载体，数字便笺在独立侧栏排列；裁去广告图册，不把叠加文字当原始手写或真实操作录像'),
 ('architectural-light',['#e3e8e4','#243c3c','#59736d','#40635c','#f6faf0'],'L14','M01','E10',['interior'],'实际混凝土坡道、梁和光窗以不对称空间切片形成纵深，主空间与光影局部分开阅读；不靠一层纹理，也不指认本段人物地点'),
 ('everyday-story',['#f0e9db','#354135','#66705c','#925535','#fff9eb'],'L01','M01','E01',['groceries','desk','coins'],'真实购物篮、书桌与历史币资料在并列、整体和局部中换镜，建立消费与判断的生活语境；不虚构同一交易、个人经历、价格或产品背书'),
 ('spotlight-stage',['#171c23','#f1ead9','#c3baa6','#d9bb83','#28313a'],'L12','M01','E07',['stage','coins'],'真实舞台无人地板局部与单一硬币摄影叠加，局部聚光和暗区控制焦点；明确摄影合成，不冒充实物布景或使用原舞台发言者/投影'),
 ('darkroom-prints',['#24282b','#eeeade','#b7b6ab','#cbbd99','#343a3d'],'L02','M01','E02',['groceries','desk','coins'],'仅真实资料照片做数字黑白，白边接触印样与图像索引组织多图阅读；主次由印样尺度变化，不伪造胶片曝光或真实暗房工艺，真人持续原色')
]
C=read(APP/'style-library/catalog.json');assert C['implementedCount']==92 and C['version']=='1.12.0'
by={s['key']:s for s in C['extensions']};S=read(R/'shared/photos/index.json');profiles=read(APP/'style-library/profiles.json')
for key,colors,layout,motion,edit,photos,mechanism in rows:
 assert key in by and not(R/'variants'/key).exists(),'Preserve existing case '+key
 css='#title{font-family:Serif;font-size:100px;font-weight:700}#subtitle{font-size:46px}#captions{border-top:3px solid var(--accent)}#person-mask{outline:7px solid var(--accent)}'
 if key in ['documentary','overhead-workbench','everyday-story']:css=css.replace('font-family:Serif;','')
 if key=='darkroom-prints':css+='#heading{border-left:4px solid var(--accent);padding-left:22px}#style-label{letter-spacing:2px}'
 selected=[dict(s,caseUse='Digital crops and annotation; '+('photo-only digital grayscale; 'if key=='darkroom-prints'else'')+'stock context; not this speaker/event/transaction')for s in S['assets']if s['key']in photos]
 look=dict(key=key,name=by[key]['name'],palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(x=225,y=580,w=630),css=css);look['palette']['portrait']=colors[0]
 js="import{makePhotographyStage}from'./photography-stage.js';\nexport const LOOK="+json.dumps(look,ensure_ascii=False)+";\nconst sources="+json.dumps(selected,ensure_ascii=False)+";\nexport async function buildArt(ctx){return makePhotographyStage(ctx,{mode:"+json.dumps(key)+",sources})}\n"
 (R/'shared'/f'{key}.js').write_text(js)
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[r[0]for r in rows]],check=True)
research=read(R/'catalog.json')
for key,colors,layout,motion,editing,photos,mechanism in rows:
 p=R/'variants'/key;selected=[s for s in S['assets']if s['key']in photos]
 shutil.copy2(R/'shared/photography-stage.js',p/'assets/photography-stage.js')
 for s in selected:
  src=R/s['file'];assert hashlib.sha256(src.read_bytes()).hexdigest()==s['sha256'];shutil.copy2(src,p/'assets'/('photo-'+s['key']+src.suffix))
 put(p/'assets/photo-sources.json',dict(originals=selected,changes='Code-only crop, annotation, layout and optional photo-only grayscale; original image files unchanged',boundary='Stock imagery, not this speaker or events/transactions in the narration'))
 notice=['# 摄影资料来源与数字改编','',mechanism,'','原始摄影文件保持原像素；本片仅裁切、数字缩放、注释与合成。黑白暗房仅资料照片数字灰度，真人保留原色。资料不代表对本段观点背书，也不指认真实交易或事件。','']
 for s in selected:notice.extend([f"- {s['title']} / {s['artist']} / {s['license']}",s['descriptionPage'],s['licenseUrl'],'原始SHA256: '+s['sha256'],''])
 (p/'assets/photography-NOTICE.md').write_text('\n'.join(notice)+'\n')
 a=read(p/'plans/art-direction.json');a.update(materialBehavior=mechanism,experience=mechanism,assetDisclosure='真实摄影资料与数字注释/合成；非本段事件或交易',profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'),sourcePhotos=selected);put(p/'plans/art-direction.json',a)
 l=read(p/'plans/layout-plan.json');l.update(profile=profiles['layout'][layout],readingContract=mechanism+'；原声/1600字幕/人物全程正圆不变，主字在稳定纯色阅读面，图片原有文字不是本片金融事实');put(p/'plans/layout-plan.json',l)
 m=read(p/'plans/motion-plan.json');m.update(profile=profiles['motion'][motion],actualBehavior='资料数码缓推2.5%→1，1.2秒有限停稳；先让人物移动，再显资料，原图与图注保持空间关系；不是新增拍摄');put(p/'plans/motion-plan.json',m)
 html=(p/'assets/composition.html').read_text().replace(' · 图解示意',' · 摄影资料合成').replace('图解依据本段口播，属于解释示意','摄影资料与叠加示意，非本段事件')
 if key=='spotlight-stage':html=html.replace('摄影资料与叠加示意，非本段事件','摄影：daveynin · CC BY 2.0（裁切与合成）')
 (p/'assets/composition.html').write_text(html)
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True)
 research.append(by[key])
research.sort(key=lambda s:int(s['id'][1:]));assert len(research)==80;put(R/'catalog.json',research)
progress=read(R/'progress.json')
for s in progress['styles']:
 if s['key']in[r[0]for r in rows]:s['stage']='design-preview'
progress.update(inProduction=8,queued=0);put(R/'progress.json',progress)
print('Eight real photographic study cases prepared; formal remains92, no full MP4 claim')
