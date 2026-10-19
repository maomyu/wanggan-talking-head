from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text())
put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
volume_css='#art canvas{position:absolute;left:0;top:0;width:952px;height:535px;z-index:0}#art svg{position:absolute;inset:0;z-index:2;pointer-events:none}'
serif='#title{font-family:Serif;font-size:100px;font-weight:700}#subtitle{font-size:46px}'
rows=[
 ('chased-metal',['#272c2b','#f0e9d7','#c1c5ba','#d0ae75','#333a36'],serif+'#captions{border-top:2px solid #d0ae75}#person-mask{outline:6px solid #9e8d68}', '成形金属薄板的锤痕、刮痕、暗包浆和固定高光构成器物，纵排目录与双物比较交替；原始图像有限落位，不伪造动态錾刻过程','L02','M01','E02',False),
 ('miniature-puppet',['#e2ddcc','#343c33','#5e6a58','#8c4d32','#f8f3e6'], '#title{font-size:98px}#subtitle{font-size:46px}#architecture{inset:515px 40px 675px;border-top:10px solid #655640;border-bottom:10px solid #655640;background:#e9e1ce}#captions{border-left:5px solid #8c4d32}#person-mask{outline:6px solid #cbb896}', '同一木质关节/布衣小演员在袋、币、盾、负重四姿态间切换，整姿态轻摆与场外控制线建立微缩舞台；不是关节绑定或嘴型表演，真人保持原色独立','L09','M01','E07',False),
 ('building-blocks',['#edf1e5','#263e3e','#556c62','#ac3e2d','#fff9e9'], '#title{font-size:98px}#captions{border-top:6px solid #ac3e2d}#person-mask{outline:7px solid #d7d9bf}#heading{border-left:8px solid #d5b34e;padding-left:20px}', '硬质拼块、清晰接缝和圆凸点组成物件，平直基线与短距离就位体现硬结构；配重环仅作负担意象，不冒用品牌或声称可照图搭建','L14','M02','E04',False),
 ('optical-glass',['#e6efec','#233f3f','#5a7270','#2a7272','#f6faf4'],serif+volume_css+'#captions{border-top:3px solid #2a7272}#person-mask{outline:7px solid #c2d8d0}', '代码实体具有非零厚度、透射与折射背景条纹，控制环境反射形成透明边界；文字和真人在独立平面，不作为真实光学实验','L12','M13','E02',True),
 ('ceramic-objects',['#e4e2d4','#39463b','#616b5b','#77623f','#faf6e9'],serif+'#captions{border-top:3px solid #77623f}#person-mask{outline:7px solid #bdc3aa}', '完整硬釉器物具有厚壁、足部、烧成斑点与灰蓝釉色差，小型展台与独立图注组织阅读；整件停稳而不软糖回弹，非真实窑烧录像','L12','M01','E07',False),
 ('liquid-chrome',['#1c252e','#f1efe5','#b9c6cb','#a7c2d0','#2c3943'],volume_css+'#title{font-size:98px}#captions{border-top:3px solid #a7c2d0}#person-mask{outline:7px solid #687f8b}', '无接缝的连续圆曲面与本地灯板环境反射构成液态铬意象，几何在入场后回归稳定形体，镜面明暗跟随曲面；不是流体求解或机械剖面换色','L12','M13','E04',True),
 ('isometric-maquette',['#e5e6df','#343e38','#606a60','#7d7861','#fafaf2'],serif+volume_css+'#captions{border-top:3px solid #7d7861}#person-mask{outline:7px solid #ced0c1}', '正交机位下的白色体块、底座、台阶和接触阴影把物件做成建筑小模型；相同斜投影贯穿比较，不使用彩色城市或仅给图标加投影','L14','M13','E10',True),
 ('inflatable-sculpture',['#f0e6d8','#423d35','#726858','#a05135','#fff9ed'], '#title{font-size:98px}#captions{border-radius:18px;border-top:3px solid #a05135}#person-mask{outline:9px solid #d9c6a8}', 'PVC鼓胀体积、焊缝、张力皱纹与气阀形成软壳物件；小幅图像形变后停稳，文字不变形，黄色负重物仅为意象而非真实质量演示','L12','M13','E04',False),
 ('viscous-gel',['#eee1e1','#473a45','#76616c','#8c4e67','#fff6f2'],serif+volume_css+'#captions{border-top:3px solid #8c4e67}#person-mask{outline:8px solid #d2b3bc}', '有色半透明体积慢慢回流并包裹稳定内芯，轮廓几何按绝对帧回归；图注与人物保持清晰稳定，不将解析形变称为真实流体模拟','L12','M13','E07',True),
 ('holographic-volume',['#122b35','#e3f3e8','#adccc5','#80dadd','#1c3e49'],volume_css+'#title{font-size:98px}#captions{border-top:3px solid #80dadd}#person-mask{outline:7px solid #507f81}', '局部发光轮廓、前后分离的透光切片与发射底座形成投影层次，没有随机点云；原色人物和不透明正文在投影之外，图解不是实际全息设备展示','L12','M13','E08',True)
]
C=read(APP/'style-library/catalog.json');assert C['implementedCount']==82
by={s['key']:s for s in [*C['styles'],*C['extensions']]};profiles=read(APP/'style-library/profiles.json')
for key,colors,css,mechanism,layout,motion,editing,volume in rows:
 assert not(R/'variants'/key).exists(),'Preserve existing case '+key
 look=dict(key=key,name=by[key]['name'],palette=dict(zip(['bg','fg','muted','accent','caption'],colors)),base=dict(x=225,y=580,w=630),css=css);look['palette']['portrait']=colors[0]
 imports="import{makeVolumeStage}from'./volume-lab-stage.js';\n"if volume else"import{makeObjectTheatre}from'./object-theatre-stage.js';import geometry from'./atlas-geometry.js';\n"
 expression="makeVolumeStage(ctx,{mode:"+json.dumps(key)+"})"if volume else"makeObjectTheatre(ctx,{mode:"+json.dumps(key)+",geometry})"
 (R/'shared'/f'{key}.js').write_text(imports+"export const LOOK="+json.dumps(look,ensure_ascii=False)+";\nexport async function buildArt(ctx){return "+expression+"}\n")
subprocess.run([sys.executable,str(R/'scripts/setup-project.py'),*[s[0]for s in rows]],check=True)
research=read(R/'catalog.json')
for key,colors,css,mechanism,layout,motion,editing,volume in rows:
 p=R/'variants'/key
 a=read(p/'plans/art-direction.json');a.update(materialBehavior=mechanism,experience=mechanism,assetDisclosure='代码原创立体意象，非真实物理实验'if volume else'原创AI器物/木偶概念图，非实物制作录像',profiles=dict(layout=layout,motion=motion,editing=editing,sound='S01'));put(p/'plans/art-direction.json',a)
 l=read(p/'plans/layout-plan.json');l.update(profile=profiles['layout'][layout],readingContract=mechanism+'；人物先停稳，正文/图注在材质之外，字幕1600、60px、最多两行');put(p/'plans/layout-plan.json',l)
 m=read(p/'plans/motion-plan.json');m.update(profile=profiles['motion'][motion],actualBehavior='按绝对帧形体/位移与有限停稳，标签始终稳定，非物理模拟');put(p/'plans/motion-plan.json',m)
 html=(p/'assets/composition.html').read_text().replace(' · 图解示意',' · 代码概念图'if volume else' · AI概念图').replace('图解依据本段口播，属于解释示意','代码立体意象，不是真实物理实验'if volume else'AI原创器物意象，不是实物制作录像')
 (p/'assets/composition.html').write_text(html)
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True)
 research.append(by[key])
research.sort(key=lambda s:int(s['id'][1:]));assert len(research)==72;put(R/'catalog.json',research)
progress=read(R/'progress.json')
for s in progress['styles']:
 if s['key']in[s[0]for s in rows]:s['stage']='design-preview'
progress.update(inProduction=10,queued=8);put(R/'progress.json',progress)
print('Ten real object/volume study cases prepared; formal remains82; no candidate counted as full video')
