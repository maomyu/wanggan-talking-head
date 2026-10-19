from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
keys=['pencil-sketch','colored-pencil','charcoal','pen-hatching','wax-crayon','soft-pastel','marker-sketch','brush-lettering']
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');review=read(R/'qa/author-review.json')
for key in keys:
 proof=read(R/'qa'/f'{key}-verification.json');assert proof['ok']and key in review['passed']and key not in review['needsRevision']and review['videoSha256'][key]==proof['sha256']==hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
assert read(R/'qa/batch05-encoded-clearance.json')['ok']and read(R/'qa/charcoal-encoded-cover.json')['ok']
refs=read(APP/'style-library/research-sources.json');ids={x['id']for x in refs};refs.extend(x for x in read(R/'qa/batch05-references.json')if x['id']not in ids);put(APP/'style-library/research-sources.json',refs)
catalog=read(APP/'style-library/catalog.json');research=read(R/'catalog.json')
mechanisms={
 'pencil-sketch':('石墨灰阶、细排线与结构辅助线建立体积，原始透明概念图按局部区域建立后停稳；不伪称真实笔顺',['R15']),
 'colored-pencil':('细彩色线交叠、纸白间隙、笔记页与文楷图注；图像区域和注释错开显现',['R15']),
 'charcoal':('宽幅松散炭迹、失边与擦出的白面构成形体；不透明灰纸仅在解释区擦除换图',['R16']),
 'pen-hatching':('清楚而稀疏的黑色平行与交叉排线、细轮廓和大块纸白，与密集版画刻线区分；分区域建立',['R18']),
 'wax-crayon':('明快蜡色、粗断线和纸白孔隙组成图形；并列比较用双底块，三项概览用整体底面，有限步显现',[]),
 'soft-pastel':('粉状不透明色面、纸齿和柔边描绘物件，以柔和区域显现保持材质；人物与文字清晰',['R17']),
 'marker-sketch':('有方向的宽笔叠色带、留白高光和粗细轮廓体现速写；色面分组显现而非统一滤镜',['R18']),
 'brush-lettering':('真实毛笔字体的短词、压力形态笔势与大片留白；整词显现，辅助字随后进入，字幕用清晰正字',['R18','R19'])}
for s in [*catalog['styles'],*catalog['extensions']]:
 if s['key']not in keys:continue
 key=s['key'];s['visualMechanism'],s['references']=mechanisms[key]
 s['assetDisclosure']='Actual unmodified OFL brush font; geometric ink marks and whole-word reveal; not authentic handwriting stroke order'if key=='brush-lettering'else'Original AI-generated drawing concept atlas; unmodified source pixels, region clipping/reveal; not documentary artwork or real drawing process; presenter unchanged'
 row=next(x for x in research if x['key']==key);row.update(visualMechanism=s['visualMechanism'],profiles=s['profiles'],references=s['references'],assetDisclosure=s['assetDisclosure'])
put(APP/'style-library/catalog.json',catalog);put(R/'catalog.json',research)
print('Eight verified hand-drawn mechanisms and references aligned')
