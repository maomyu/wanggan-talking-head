"""Publish research evidence only after checking the actual current sources."""
from pathlib import Path
import json,hashlib,urllib.request,concurrent.futures
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
cat=read(R/'catalogue.json');samples=read(R/'qa/native-samples.json');audit=read(R/'qa/actual-dom-audit.json');videos=read(R/'qa/short-video-verification.json');by={s['key']:s for s in samples};ab={s['key']:s for s in audit}
assert len(cat['styles'])==len(samples)==len(audit)==100
assert len(videos)==6
assert len({s['id']for s in cat['styles']})==100
binding=[]
for s in cat['styles']:
 p=R/'variants'/s['key'];a=by[s['key']];b=ab[s['key']];current=read(p/'qa/research-build.json')
 assert not a['errors']and not a['failed'],s['key']
 assert len(a['samples'])==4 and [x['frame']for x in a['samples']]==[0,567,732,879]
 assert a['layoutGeometrySeekDeterministic'],s['key']
 assert not b['issues'] and len(b['samples'])==4,s['key']
 for record in [a['sourceBinding'],b['sourceBinding'],current]:
  assert record['htmlSha256']==sha(p/'index.html'),s['key']+' html'
  assert record['directorSha256']==sha(p/'assets/director.js'),s['key']+' adapter'
 assert sha(p/'assets/director.js')==sha(R/'scripts/director.js')
 assert all(sha(p/k)==v for k,v in current['preserved'].items())
 assert(p/'qa/stills/before.jpg').exists()
 s['status']='research-native-sampled';s['evidence']={'native':'qa/native-samples.json','measuredDOM':'qa/actual-dom-audit.json','samples':[x['file']for x in a['samples']],'baseline':'variants/'+s['key']+'/qa/stills/before.jpg','scope':'four native states, full timeline available; not full MP4 acceptance'}
 binding.append({'id':s['id'],'key':s['key'],'htmlSha256':current['htmlSha256'],'directorSha256':current['directorSha256'],'stills':{x['file']:sha(R/x['file'])for x in a['samples']}})
checks=[]
for v in videos:
 p=R/Path(v['path']).parents[1];assert sha(R/v['path'])==v['videoSha256'];assert sha(p/'assets/director.js')==v['directorSha256'];assert sha(p/'index.html')==v['htmlSha256']
 assert read(p/'qa/check-result.json')['exitCode']==0
 raw=(p/'qa/check.log').read_text();result=json.JSONDecoder().raw_decode(raw[raw.index('{\n  "ok"'):])[0];assert result['ok']
 assert v['audio']['normalizedCorrelation']>.98 and v['audio']['lagSamples']==0
 assert v['probe']['frames']==240 and v['probe']['audioTracks']==1
 checks.append({'key':v['key'],'runtime':result['runtime']['ok'],'layout':result['layout']['ok'],'contrastChecked':result['contrast']['checked'],'contrastPassed':result['contrast']['passed'],'motionAutomaticEnabled':result['motion']['enabled']})
 for s in cat['styles']:
  if s['key']==v['key']:s['shortVideo']=v['path']
server=read(R/'qa/preview-server.json')['url']
urls=[x['file']for a in samples for x in a['samples']]
def head(rel):
 with urllib.request.urlopen(urllib.request.Request(server+rel,method='HEAD'),timeout=20)as res:assert res.status==200 and int(res.headers['Content-Length'])>2000,rel
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:list(pool.map(head,urls))
ranges=[]
for v in videos:
 with urllib.request.urlopen(urllib.request.Request(server+v['path'],headers={'Range':'bytes=0-1023'}),timeout=20)as res:
  assert res.status==206 and len(res.read())==1024;ranges.append({'key':v['key'],'status':res.status,'contentRange':res.headers['Content-Range']})
frozen=[]
for m in read(APP/'module-manifest.json')['modules']:
 if m['name']not in ['talking-head-art-direction','talking-head-layout','talking-head-motion','talking-head-editing']:continue
 actual=sha(APP/m['frozenCopy']/'SKILL.md');assert actual==m['sha256'],m['name'];frozen.append({'name':m['name'],'sha256':actual})
assert len(frozen)==4
pixel=[a['key']for a in samples if not a['compositePixelExact']]
summary={'scope':'research only; formal plugin 1.13.0 unchanged','nativeStyles':100,'sampledStates':400,'measuredDOMStates':400,'actualMP4s':6,'secondsEach':8,'sharedFinalDirectorSha256':sha(R/'scripts/director.js'),'layoutGeometryDeterministicStyles':100,'compositePixelExactStyles':100-len(pixel),'compositePixelNotExactStyles':pixel,'compositeLimit':'New layout geometry is deterministic. The composite includes legacy materials/video; byte-exact pixels are not claimed for the listed cases.','audioCorrelationMin':min(v['audio']['normalizedCorrelation']for v in videos),'audioOneSecondCorrelationMin':min(min(v['audio']['oneSecondCorrelations'])for v in videos),'allAudioLagSamplesZero':True,'httpStillCount':len(urls),'actualMP4RangeChecks':ranges,'hyperframesChecks':checks,'preservedExpertSkills':frozen,'sourceBindings':binding}
(R/'qa/final-research-verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));cat['renderScope'].update(nativeSampled=100,nativeStates=400,actualDOMStates=400);(R/'catalogue.json').write_text(json.dumps(cat,ensure_ascii=False,indent=2))
(R/'研究检查记录.md').write_text(f'''# 研究检查记录

研究范围：正式1.13.0外的独立项目，不发布正式版本，不改变四个完整专家skill。当前交付100套重新编排的完整时间轴、400张实际样帧、100张原版对照、6条8秒MP4。不是100条新版整片MP4通过。

## 当前文件的实测

- 100个唯一画风ID，12种主编排；全部100项完成4状态捕获：0、18.9、24.4、29.3秒，1080×1920。样帧文件HTTP读取400/400通过。
- 在实际DOM测量400个状态：人物窗口宽高相等且border-radius为50%，人物和祖先无滤镜/混色；字幕top1600、60px、最多两行、字框底部不越1800。上述边界检查无发现。抽样不等于所有运动帧无碰撞。
- 100个新布局层反向seek几何相同。复合像素完全相同{100-len(pixel)}/100；其余{len(pixel)}项名单与原始真假结果保留在qa/final-research-verification.json。复合层包含原材料与视频，不能把布局几何相同写成全画面逐像素确定性。拼贴单例诊断平均RGB误差约0.067/255，差异集中在材料区；其他非精确项没有借此单例一并判为通过。
- 6条实际MP4各1080×1920/30fps/240帧/8秒/一条音轨；源461—701帧映射输出0—240帧。每条先做固定HF0.8.174 check，再编码、解码核查。HTTP Range206为6/6。
- 解码人声与原WAV对应区间的相关度最低{summary['audioCorrelationMin']:.8f}，逐秒窗口最低{summary['audioOneSecondCorrelationMin']:.8f}，6条采样偏移都为0。AAC不宣称字节无损；本轮没有新增音乐或拟音。
- 实际编码第106帧与原生源第567帧对照，全画面平均RGB误差约2.49—3.60/255。解码抽看首、106、154、165、239帧；柔质立体修复后另看原尺寸0/154/165帧。此值是导出路径差异诊断，不是通用色准认证。
- 六条HF运行/布局/所采文字对比均通过；自动motion检测未启用，零发现不算全片动效证明。大中文字体超过内联上限，项目采用本地相对文件，不能把HTML单文件脱离assets运行。
- HTML、实际导入的导演代码、原视频、原声、原剪辑记录与本轮证据绑定。统一最终导演SHA：{summary['sharedFinalDirectorSha256']}。6条短测分别绑定其真正编码时的源码，早期版本不混成当前短测。
- 四个专家SKILL.md完整文件哈希与正式module-manifest一致。正式画风库、运行依赖和已安装缓存未替换。

## 作者实际看过的范围

逐站26张研究截图；100项18.9秒分组拼版；12个代表方向的开场/消费/风险/负债状态；6条MP4的上述解码拼版与修复帧。网页实际操作检查同画风换编排、原/新版切换、原声播放、进度跳转和MP4在线播放。没有声称全部100条逐帧人工听看，也没有独立盲评。

## 已修问题

1. 80份共用旧scene.js造成的同质调度：新导演层接管阅读、人物与视觉交接，材料保持。
2. 早期纸本DOM和后来模板不一致：增加兼容，原纸面保留，重复阅读层退场。
3. 独立3D画布未跟新图解移动：将three-mount纳入材料组。
4. 旧hf-seek监听器覆盖导出人物位置：在旧监听器后重算新状态，并与实际MP4对照。
5. 卡片副文字溢出：卡高184→204，展开步距210→226，再过check和实测。
6. 侧转边缘的长条残影：改为中心轴并随侧面角度减弱可见度；柔质立体重新编码到v7，v5不作为最终链接。
7. 旧版摄影对照搬入子目录后路径失效：使用文档base，重新实测对照加载。多根composition入口已移到独立comparison子目录。
8. 预览弹层截断字幕：按视口高度缩放完整9:16画面，进入全屏时重新居中。

## 留待正式升级的判断

- 当前是12套主语法适配100种材料，未宣称100套互斥排版或100×12组合全验证。完整轨道图库、任意面板形变、全场真实相机等只在设计意图中，实际实现范围在三份模块附录逐项注明。
- 样帧仍有可精修处：部分开场留白偏多，窄栏长标题的断行需要更讲究，少数旧材料自带文字与新标签重复；放射结构的叠层关系值得继续减法。它们不因程序通过而自动成为审美验收通过。
- 新增源片删改、J/L声画桥、配乐与音效没有在本轮固定对照中验证。任意新文案需按四个完整模块重新设计，不是固定财经样例自动理解所有输入。
- 正式升级前还要完成所选方案的整片编码、完整听看与相应状态登记。本轮不拿旧视频通过记录替代新版验收。
''')
print(json.dumps({k:v for k,v in summary.items()if k not in ['sourceBindings','preservedExpertSkills','actualMP4RangeChecks','hyperframesChecks']},ensure_ascii=False,indent=2))
