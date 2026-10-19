from pathlib import Path
import json,shutil,re
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';A=R.parent/'百种画风图谱研究_20261019';core=json.loads((APP/'style-library/catalog.json').read_text());data=json.loads((A/'catalog.json').read_text());old={s['key']:s for s in data['styles']};rows=[]
for s in [*core['styles'],*core['extensions']]:
 row=old.get(s['key'],{}).copy();row.update(s);row.setdefault('references',[]);row.setdefault('validation','已获用户认可完整视频');rows.append(row)
data['sources']=json.loads((APP/'style-library/research-sources.json').read_text());data.update(version=core['version'],approvedCount=core['approvedCount'],implementedCount=len(core['styles']),productionVerifiedCount=len(core['styles'])-core['approvedCount'],plannedCount=len(core['extensions']),styles=sorted(rows,key=lambda s:int(s['id'][1:])));(A/'catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');media=json.loads((A/'media.json').read_text())
for s in core['styles']:
 shutil.copy2(APP/'style-library'/s['preview'],A/'assets'/f"{s['key']}.jpg")
 if s['status']=='verified-video':media[s['key']]=dict(video=f"http://127.0.0.1:52700/variants/{s['key']}/outputs/final.mp4",poster=f"assets/{s['key']}.jpg")
(A/'media.json').write_text(json.dumps(media,ensure_ascii=False,indent=2)+'\n');shutil.copy2(APP/'docs/100种画风与协作配方.md',A/'100种画风与协作配方.md');N=len(core['styles']);U=core['approvedCount'];V=N-U;Q=len(core['extensions']);f=A/'review.html';t=f.read_text();t=re.sub(r'<div class="statusbar">.*?</div>',f'<div class="statusbar"><span><b>{U}</b>种用户认可</span><span><b>{V}</b>种新增制作验证</span><span><b>{Q}</b>种尚未完成</span><span>人物原色 / 角落圆窗 / 字幕上移</span></div>',t);t=t.replace('下方候选卡是文字方案，尚未制作画面','未完成方向分为排队与制作中，只有完整视频和检查通过才标记制作验证');t=re.sub(r'(data-status="approved"[^>]*>)[^<]+',r'\g<1>已完成'+str(N)+'种',t);t=re.sub(r'(data-status="candidate"[^>]*>)[^<]+',r'\g<1>未完成'+str(Q)+'种',t);f.write_text(t)
f=A/'app.js';t=f.read_text();t=t.replace("const made=s.status==='approved-video'","const made=['approved-video','verified-video'].includes(s.status)").replace("(status==='approved')===(s.status==='approved-video')","(status==='approved')===(['approved-video','verified-video'].includes(s.status))")
t=t.replace("${made?'已认可视频':'文字候选 · 未制作'}","${made?(s.status==='approved-video'?'用户认可视频':'整片完成 · 制作验证'):(s.productionStage?'制作中 · 未完成':'候选 · 待实测')}")
t=t.replace("${made?'20种认可模板之一':'80种待实测候选之一'}","${made?(s.status==='approved-video'?'用户认可的可用模板':'制作验证通过的可用模板'):(s.productionStage?'实际制作中，待完成验证':'候选方向，待样帧与视频实测')}")
t=t.replace('当前只有文字创意配方，尚无本方向样帧和视频。先让材料、构图与动作成立，再评估是否加入正式模板。','本方向仍未完成整片验收。排队与制作中的阶段见当前验证记录；完成材料、构图和动作后再评估是否加入正式模板。')
t=t.replace('播放已认可视频','播放完整实测视频').replace('已有视频保留原声','这些视频保留原声')
f.write_text(t)
# Keep visual-approval labels distinct from production readiness, also after repeated refreshes.
t=f.read_text().replace('${s.name}已认可视频真实截图','${s.name}完整实测视频截图').replace("${['approved-video','verified-video'].includes(s.status)?'已认可':'待实测'}","${s.status==='approved-video'?'用户认可':s.status==='verified-video'?'制作验证':'待实测'}").replace('承接已认可方向，按本次内容完成','承接已完成方向，按本次内容完成');f.write_text(t)
f=A/'review.html';t=f.read_text();t=re.sub(r'视觉方向图谱 / [0-9.]+','视觉方向图谱 / '+core['version'],t);f.write_text(t)
# Keep the regression test's expectations tied to actual registry counts.
f=A/'qa-atlas.mjs';t=f.read_text();t=t.replace("await p.waitForFunction(()=>window.ATLAS?.ready);", "await p.waitForFunction(()=>window.ATLAS?.ready);const catalog=await p.evaluate(()=>ATLAS.catalog),I=catalog.implementedCount||catalog.approvedCount,Q=catalog.plannedCount;")if 'const catalog=await'not in t else t;t=t.replace('images.length!==20','images.length!==I').replace("p.locator('.card').count()!==20","p.locator('.card').count()!==I").replace("p.locator('.card').count()!==80","p.locator('.card').count()!==Q").replace("['A01','A16','A17','A18','A19','A20']","['A01','A16','A17','A18','A19','A20','A58','A63','A77']").replace('approved:20,planned:80','implemented:I,userApproved:catalog.approvedCount,planned:Q').replace('images:20','images:I');f.write_text(t)
print('Atlas updated:',N,'implemented /',U,'user approved /',V,'production verified /',Q,'pending')
