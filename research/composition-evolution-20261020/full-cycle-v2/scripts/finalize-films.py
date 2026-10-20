from pathlib import Path
import json,hashlib,urllib.request
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';cat=json.loads((R/'catalogue.json').read_text());rows=[s for s in cat['styles']if s['fullFilmRepresentative']];assert len(rows)==12
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
result=[]
for s in rows:
 p=R/'variants'/s['key'];v=json.loads((p/'qa/film-verification.json').read_text());b=json.loads((p/'qa/source-binding.json').read_text());c=json.loads((p/'qa/full-check.json').read_text());a=json.loads((p/'qa/render-progress.json').read_text())
 assert a['status']=='verified' and c['result']['ok']and c['exitCode']==0
 assert v['source']==b;assert v['videoSha256']==a['videoSha256']==sha(p/'outputs/final.mp4')
 for k,f in [('htmlSha256','index.html'),('directorSha256','assets/director.js')]:assert b[k]==c[k]==a['binding'][k]==sha(p/f),s['key']+' stale '+k
 assert v['probe']['frames']==1100 and v['probe']['audioTracks']==1 and v['audio']['lagSamples']==0 and v['audio']['normalizedCorrelation']>.98
 assert all(sha(p/f)==h for f,h in b['protected'].items())
 with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:54556/full-cycle-v2/variants/'+s['key']+'/outputs/final.mp4',headers={'Range':'bytes=0-1023'}),timeout=20)as response:
  assert response.status==206 and len(response.read())==1024;contentRange=response.headers['Content-Range']
 result.append({'id':s['choreography']['id'],'name':s['choreography']['name'],'key':s['key'],'video':'variants/'+s['key']+'/outputs/final.mp4','videoSha256':v['videoSha256'],'sourceBinding':b,'audioCorrelation':v['audio']['normalizedCorrelation'],'minimumOneSecondCorrelation':min(v['audio']['oneSecondCorrelations']),'lagSamples':v['audio']['lagSamples'],'denseFrameCount':v['denseFrameCount'],'selectedFrameCount':len(v['decodedSelectedFrames']),'rangeStatus':206,'contentRange':contentRange})
experts=[]
for m in json.loads((APP/'module-manifest.json').read_text())['modules']:
 actual=sha(APP/m['frozenCopy']/'SKILL.md');assert actual==m['sha256'];experts.append({'name':m['name'],'sha256':actual})
assert len({x['sourceBinding']['protected']['assets/master.mp4']for x in result})==1;assert len({x['sourceBinding']['protected']['assets/edited-voice.wav']for x in result})==1
canonicalCaptions=None
for s in rows:
 t=json.loads((R/'variants'/s['key']/'timing.json').read_text());captions=[{k:c[k]for k in ['text','startFrame','endFrame']}for c in t['captions']];assert len(captions)==21
 if canonicalCaptions is None:canonicalCaptions=captions
 else:assert captions==canonicalCaptions,s['key']+' caption/time drift'
native=json.loads((R/'qa/native-final.json').read_text());data={'status':'test-delivery-verified','fullFilms':12,'durationEach':1100/30,'fps':30,'framesEach':1100,'size':[1080,1920],'nativeStyles':100,'nativeStillCount':native['capturedStillCount'],'measuredDOMStates':native['measuredDOMStates'],'denseDecodedFrames':sum(s['denseFrameCount']for s in result),'selectedDecodedFrames':sum(s['selectedFrameCount']for s in result),'audioCorrelationMin':min(s['audioCorrelation']for s in result),'allAudioLagsZero':True,'films':result,'preservedExperts':experts,'scope':'12 representative full MP4s plus100 native mappings, not100 new MP4s or100x12 all combinations; formal1.13.0/cache preserved','review':'Author visual review with declared coverage; no independent blind review'}
(R/'qa/final-verification.json').write_text(json.dumps(data,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in data.items()if k not in ['films','preservedExperts']},ensure_ascii=False,indent=2))
(R/'验证记录.md').write_text(f'''# 编排整片验证结果

本轮在test交付12条真实整片MP4，每条36.67秒、1080×1920、30fps、1100帧、一条原声。100种画风有{data["nativeStillCount"]}张本轮真实样帧与完整原生时间轴；不是100条新版MP4，也不是100×12组合全部验收。

## 当前实测

- 12条先过固定HyperFrames0.8.174的运行、布局、动效与文字对比检查；每条300个动效采样。origami/blueprint/clay首轮在同时渲染时触及120秒检查期限，改为逐项复测后通过；原失败记录保留，未通过项目不曾准许编码。
- 100项{data["measuredDOMStates"]}个实际DOM状态：人物窗口等宽高、50%圆角，人物及祖先无滤镜与混色；字幕top1600、60px、最多两行、底部不越1800。已测边界无发现，抽样不等于每个图文叠层都被程序证明无冲突。
- 12条实际MP4全部解码核查规格；整体原声相关度最低{data['audioCorrelationMin']:.8f}，逐秒窗口核查通过，采样偏移均为0。AAC并非字节无损。本轮没有新增音乐、拟音或源片跳跃。
- 实际编码共抽取360张首末与转场邻帧；每0.2秒抽一张缩略图，共2208张。具体文件、输入HTML/导演代码/原视频/原声/剪辑方案与MP4哈希逐项绑定。
- {data["nativeStillCount"]}张样帧HTTP读取通过，12条实际MP4 Range206通过；封面点击播放、暂停、跳转与全屏由页面真实控件提供，原生预览与MP4分开标识。
- 原生反向寻址复合像素精确数和非精确名单保留在qa/native-final.json。新布局边界检查不能替代底层旧材料的逐像素确定性；没有借一次补测删除原始false结果。
- 四个完整专家SKILL.md哈希未变。研究入口可查12套规则、按内容关系建议搭配、另存切编排，并委托正式固定运行入口；真实另存构建与从正式fixture复建探针通过，原工程不变。新素材哈希保护阻止套用财经文案。

## 已修问题

完整开场；双栏中文语义断行；巨字旧黑框；旧3D标签重复；短负债句的入场阅读窗口；UI正文尺度；持续长卷；放射双项对比去重；浅色面板与字幕改深字；纸舞台标题移入阅读区；木偶装饰线避开标题；纵向叙事overview撤掉与长标签相撞的重复小图。原有效片段和修改前视频保留，C04修正后重新编码与核验。

## 判断边界

作者自查，没有独立盲评。作者实际审看范围另记qa/author-review.json。程序相关性证明声轨保存，不代替听感判断；每0.2秒拼版不等于逐帧人工审看。

12是信息组织与交接的基础系统数量，不按画风数量机械补齐100套模板。各系统覆盖本片7种语义状态，声音和新增源剪辑仍需按具体任务设计。正式1.13.0与安装缓存未替换，本轮已准备研究入口与完整证据，后续正式升级应登记真实通过范围。
''')
