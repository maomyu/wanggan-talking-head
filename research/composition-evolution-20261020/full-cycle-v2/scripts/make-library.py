from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];cat=json.loads((R/'catalogue.json').read_text());dest=R/'library';dest.mkdir(exist_ok=True)
details={
'speaker':(['statement','judgment','closing'],['主体近景 → 连续缩放让位 → 图解 → 回到人物'],'人物观点是主线，图解只在解释段接管。','长过程、大量证据或多项同时比较时换其他编排。',['圆窗匀比移动','图解延后显现','结论近景停留']),
'editorial':(['statement','comparison','evidence'],['宽幅开场 → 左判断右解释 → 并列词列 → 跨栏收束'],'依靠稳定栏线和不同文字角色建立阅读顺序。','长中文先语义断行；窄栏不能靠缩小字号塞入。',['基线换词','图注错峰','栏线锚点遮挡交接']),
'type':(['statement','comparison','closing'],['大词组提问 → 多行接力 → 两词对峙 → 巨字判断'],'少量关键词在尺度和落点上形成明确差别。','超过一句解释、图表或证据细节不能强塞巨字；不逐字乱跳。',['词组掩膜与短横移','主次尺度对照','完整词组停稳']),
'route':(['process','cause','list'],['完整路径 → 节点依次显现 → 结果落点'],'读过的路径保留，方向指示阅读先后。','并列建议只能标阅读顺序，不擅自连成因果。',['节点错峰','单轴视线推进','路径保留']),
'stack':(['comparison','list','closing'],['重叠概览 → 边缘分离 → 卡片展列 → 归纳'],'同一组卡片展开，展示被遮住的内容关系。','短句窗口缩短入场；卡片展开后要给正文真实阅读时间。',['旋转回正','卡片展列','落稳后显字','共同卡片遮挡交接']),
'derive':(['cause','comparison','list'],['对象 → 建立对应 → 双项或三项标签 → 判断'],'节点和连线有语义，先出现对象后出现关联。','没有事实支持不连因果；并列三项不能遗漏一项。',['节点后连线生长','关系停稳','中心对齐交接']),
'gallery':(['evidence','process','statement'],['完整主图 → 主图换位 → 图注 → 回到人物'],'图片获得主要面积，字幕和人像保持独立。','本轮是主图取景与换位，尚未实现多张独立图片的连续图库轨道。',['取景框内换位','图注与图片同步','停稳看细节']),
'stage':(['spatial','process','statement'],['总览对象 → 侧转换态 → 正面阅读 → 收束'],'物体有深度、文字留在稳定平面，人物不跟场景转。','本轮是素材组侧转与原有物件渲染；不是通用真实相机或任意模型引擎。',['中心轴侧转','边缘按角度淡出','正面标签停稳']),
'archive':(['evidence','list','statement'],['稳定索引 → 右侧材料 → 摘录判断'],'观众通过固定索引知道自己看到哪一项。','索引为位置导航，不伪造档案编号、来源、日期或凭证。',['同入口抽页','索引保持','页签遮挡交接']),
'interface':(['comparison','list','process'],['概览面板 → 活动页签 → 两项对比 → 风险提示'],'同一解释面板在不同状态呈现真实语义结果。','本轮面板与指示条切换已实现；不宣称任意形变或真实产品交互。',['指示条伸缩交接','内容分组显现','面板内状态替换']),
'scroll':(['process','list','evidence'],['卷首 → 同一长卷中段 → 卷末回望'],'所有语义面板常驻同一纵向世界，镜头只移动到本句位置。','视口裁切有意为之；未进入视口的字不算已展示，禁止卷外文字遮人。',['单向长卷位移','窗口停稳','独立标题与字幕']),
'radial':(['list','comparison','spatial'],['中心 → 周围分支 → 局部强调 → 完整关系'],'只有一个中心主张，维度放在周围并用距离建立层级。','多层嵌套、长句或长因果链应换推导画布；不让支线穿字。',['分支错峰','局部到整体','中心持续锚定'])}
systems=[]
for s in cat['styles']:
 if not s.get('fullFilmRepresentative'):continue
 c=s['choreography'];k=c['key'];d=details[k]
 systems.append({**c,'contentKinds':d[0],'implementedStates':d[1],'decision':d[2],'boundary':d[3],'motionVocabulary':d[4],'readingRule':'以本句真实窗口计算进场、完整显现、阅读、离场；短窗口删动作，不加速原声。','personRule':'源片原色，角落正圆，连续匀比缩放；人像层与材料镜头分离。','captionRule':'1080×1920：x64/top1600/w952/font60，最多两行，底部不越1800。','soundRule':'本轮只保留一条原声；音乐、拟音和J/L剪辑未在本轮验证。','representative':{'styleId':s['id'],'key':s['key'],'name':s['name'],'project':'variants/'+s['key']},'verification':'qa/film-verification.json；文件实际存在且源码绑定才算已验证。'})
systems.sort(key=lambda s:int(s['id'][1:]));(dest/'systems.json').write_text(json.dumps({'schemaVersion':1,'status':'test-research','systems':systems,'countMeaning':'12种信息组织与注意力交接系统；不是新增12个互斥排版、动效、剪辑技法，也不是100×12全验证。'},ensure_ascii=False,indent=2))
(dest/'style-map.json').write_text(json.dumps({'schemaVersion':1,'styles':[{'id':s['id'],'key':s['key'],'name':s['name'],'primarySystem':s['choreography']['id'],'systemKey':s['choreography']['key'],'status':'native-v2-remapped','fullFilmRepresentative':s['fullFilmRepresentative'],'evidence':'qa/prototypes.json'}for s in cat['styles']]},ensure_ascii=False,indent=2))
print('12 systems and 100 explicit primary mappings saved')
