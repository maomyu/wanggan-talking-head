from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
APP=Path.home()/'plugins/wanggan-talking-head'
G=[
 ('speaker','人物留白','人物承担判断，重点贴近目光，解释只在需要时接管画面。','人物在场 → 侧边论点 → 回到人物','近景与圆窗间连续让位，重点用短掩膜揭示','观点处直切，解释收完再回人，不按句子机械换场','modulify,reelfolio'),
 ('editorial','编辑双栏','窄栏放判断，宽栏放图像；文字与图片共享跨段落的对齐轴。','页边判断 → 大图与批注 → 跨栏结论','标题沿基线换词，图注滞后出现，版心保持稳定','按完整论点翻到下一版，保留栏线作共同锚点','modulify,inspora'),
 ('type','巨字接力','关键词占据主画面，字与字的尺度和位置承担讲述，人物让出阅读中心。','完整词组 → 两词对峙 → 一句结论','按词组掩膜接力，落下后停稳，放大不影响字幕','在语义重音处切表现文字；人声不另切、不开倍速','prompt-motion,opus'),
 ('route','纵向叙事','问题、行为和后果沿纵轴展开，读过的部分留下位置记忆。','上方问题 → 路径中段 → 下方结论','路径先建立，再按人声显现节点，视线沿纵向下移','在同一叙事空间里推进；转折保留一个停稳窗口','60fps,opus'),
 ('stack','卡片展列','同一组信息由重叠变为并列，让观众看见原本被藏住的关系。','叠放概览 → 两张展开 → 归纳列表','卡片边缘分离后错峰展列，文字在落稳后揭示','用同一卡片换层级，不能用三张无关图假装同一物体','60fps,reelfolio'),
 ('derive','推导画布','主张、依据和结果在同一张画布内建立对应，保留已读上下文。','先给对象 → 建立联系 → 标出判断','连线在节点之后生长，重点框贴着真实字形','按推导完成程度推进；并列建议不连成因果','60fps,opus'),
 ('gallery','画廊取景','图片获得足够面积；主图与备选画面共享一条连续展示轨道。','完整主图 → 横向接续 → 局部与图注','轨道先移动再停稳，活动框与图注共同切换','全貌到细节再回人物；解释图不冒充真实凭证','reelfolio,modulify'),
 ('stage','空间舞台','材料物件有前后层次，正文在稳定平面，人物独立于场景镜头。','总览陈列 → 侧转展示 → 正面结论','物件绕自身轴转动，读字时相机与标签停稳','边缘侧转处换图解，下一镜保持空间轴线','theatre,reelfolio'),
 ('archive','档案索引','左侧索引保持，右侧材料展开；编号只是位置索引，不伪造档案事实。','索引 → 材料页 → 摘录判断','材料页从同一入口抽出，摘录与对应句子对齐','按照材料与观点组织段落，共同页签接续','modulify,inspora'),
 ('interface','界面状态','同一解释面板在总览、对照、风险提示之间变换，状态有可见结果。','概览 → 分清选择 → 风险提示','活动指示条伸缩交接，面板先变形再换内容','状态变化承担转场；不虚构按钮操作与真实理财数据','60fps,opus'),
 ('scroll','长卷巡览','三条建议属于同一条展开的长卷，镜头只移向本句需要的位置。','卷首 → 中段说明 → 卷末回望','卷面沿一个方向走，标题与字幕固定在独立层','用连续空间取代整页清空；句尾留停稳再巡览','theatre,inspora'),
 ('radial','放射结构','中心只有一个主张，周围是并列的选择或维度，层级靠距离建立。','中心判断 → 两侧维度 → 收回中心','分支按序展开，局部强调后回到完整关系','共同中心保持，分支轮换而非每条重建全图','theatre,opus'),
]
GRAMMARS=[dict(id=f'C{i+1:02d}',key=k,name=n,intent=d,states=s,motion=m,editing=e,references=r.split(','))for i,(k,n,d,s,m,e,r)in enumerate(G)]
ASSIGN={
 'speaker':'minimal documentary architectural-light everyday-story spotlight-stage negative-space silhouette-fable',
 'editorial':'paper magazine newspaper photo-book swiss-grid art-deco art-nouveau enamel-badge foil-deboss porcelain-painting',
 'type':'geometry type-poster constructivist memphis brutalist-type optical-graphic brush-lettering seal-carving risograph folk-woodblock',
 'route':'comic cel picture-book editorial-metaphor natural-history illustrated-map cyanotype mosaic stained-glass',
 'stack':'collage origami pop-up-book torn-paper corrugated-model patchwork building-blocks inflatable-sculpture',
 'derive':'line blueprint chalk pencil-sketch colored-pencil charcoal pen-hatching marker-sketch wax-crayon soft-pastel',
 'gallery':'halftone film tabletop-stilllife macro-material darkroom-prints watercolor impasto woodcut etching',
 'stage':'illustration clay paper-stage isometric-city isometric-maquette miniature-puppet optical-glass ceramic-objects liquid-chrome viscous-gel',
 'archive':'archive-dossier dictionary-entry lab-notebook timeline-almanac overhead-workbench gongbi lacquer-gold sandstone-relief chased-metal',
 'interface':'precision pixel terminal-ascii led-dot-matrix early-desktop',
 'scroll':'ink blue-green-landscape mural silk-layers embroidery felt-applique knotted-cord',
 'radial':'sci-fi-wireframe faceted-vector mechanical-cutaway vector-oscilloscope spatial-pointcloud holographic-volume',
}
def main():
 base=json.loads((APP/'style-library/catalog.json').read_text());mapping={k:g for g,keys in ASSIGN.items()for k in keys.split()};assert len(mapping)==100
 rows=[]
 for s in base['styles']:
  g=next(x for x in GRAMMARS if x['key']==mapping[s['key']]);row={**s,'v1Status':s['status'],'status':'research-design','choreography':g,'variant':int(s['id'][1:])%3,'newImplementation':f'variants/{s["key"]}/index.html','evidence':None}
  row['adaptationReason']=f'{s["visualMechanism"]}；用“{g["name"]}”改变人物、解释区和主阅读线的关系。'
  row['preserved']=['人物原色','角落正圆窗','字幕top1600、60px','原声与21条字幕原文和时间','原画风材料与字体']
  rows.append(row)
 (ROOT/'catalogue.json').write_text(json.dumps(dict(schemaVersion=1,sourcePluginVersion=base['version'],scope='100种画风的编排研究改版；不等于100条新版MP4已验收',grammars=GRAMMARS,styles=rows),ensure_ascii=False,indent=2))
 print('100 distinct style IDs mapped to',len(GRAMMARS),'concrete choreography systems')
if __name__=='__main__':main()
