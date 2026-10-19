from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,shutil,hashlib,argparse
p=argparse.ArgumentParser();p.add_argument('--plugin',type=Path,required=True);p.add_argument('--atlas',type=Path,required=True);p.add_argument('--production',type=Path,required=True);p.add_argument('--legacy',type=Path,required=True);p.add_argument('--legacy-approved',type=Path,required=True);p.add_argument('--output',type=Path,required=True);o=p.parse_args();D=o.output.resolve();D.mkdir(parents=True,exist_ok=True)
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
C=read(o.plugin/'style-library/catalog.json');legacyMedia=read(o.atlas/'media.json');rows=sorted([*C['styles'],*C['extensions']],key=lambda s:int(s['id'][1:]));media={};records=[]
for row in rows:
 row.setdefault('references',[])
 row.setdefault('validation','已有用户认可完整视频'if row['status']=='approved-video'else'候选，尚未完成')
for folder in ['videos','assets','references','qa','evidence']: (D/folder).mkdir(exist_ok=True)
for s in C['styles']:
 if s['status']=='verified-video':src=o.production/'variants'/s['key']/'outputs/final.mp4'
 else:
  legacyPath=unquote(urlsplit(legacyMedia[s['key']]['video']).path).lstrip('/')
  src=(o.legacy_approved/legacyPath[len('approved/'):]if legacyPath.startswith('approved/')else o.legacy/legacyPath)
 assert src.is_file()and sha(src)==s['videoSha256'],('Source is not the exact formal encode',s['key'],str(src))
 target=D/'videos'/f"{s['key']}.mp4"
 if not target.exists()or sha(target)!=s['videoSha256']:shutil.copy2(src,target)
 assert sha(target)==s['videoSha256']and not target.is_symlink()
 poster=D/'assets'/f"{s['key']}.jpg";shutil.copy2(o.plugin/'style-library'/s['preview'],poster)
 proof=o.plugin/'style-library'/s['evidence'];shutil.copy2(proof,D/'evidence'/proof.name)
 media[s['key']]={'video':f"videos/{s['key']}.mp4",'poster':f"assets/{s['key']}.jpg"}
 records.append(dict(id=s['id'],key=s['key'],status=s['status'],video=f"videos/{s['key']}.mp4",sha256=s['videoSha256'],poster=f"assets/{s['key']}.jpg",evidence='evidence/'+proof.name))
for f in ['app.js','style.css']:shutil.copy2(o.atlas/f,D/f)
html=(o.atlas/'review.html').read_text().replace('http://127.0.0.1:52617/review.html','#catalog').replace('20种视频对照 ↗','全部成片与配方 ↓').replace('ART DIRECTION ATLAS · 研究目录','ART DIRECTION ATLAS · 正式画风总览').replace('100种画风 · 网感口播创意图谱','网感口播 · 画风总览')
(D/'review.html').write_text(html);shutil.copy2(o.plugin/'docs/100种画风与协作配方.md',D/'100种画风与协作配方.md')
for f in ['组合与范围.md','声音协作.md']:shutil.copy2(o.plugin/'docs'/f,D/'references'/f)
put(D/'catalog.json',dict(version=C['version'],approvedCount=C['approvedCount'],implementedCount=len(C['styles']),productionVerifiedCount=C['productionVerifiedCount'],plannedCount=C['plannedCount'],totalCount=C['totalCount'],families=C['families'],styles=rows,sources=read(o.plugin/'style-library/research-sources.json')))
shutil.copy2(o.plugin/'style-library/profiles.json',D/'profiles.json');put(D/'media.json',media);put(D/'project.json',dict(id='wanggan-formal-gallery',version=C['version']))
shutil.copy2(o.plugin/'runtime/scripts/serve.py',D/'serve.py')
(D/'启动预览.command').write_text('''#!/bin/zsh
set -e
WG_GALLERY_ROOT="$(cd "$(dirname "$0")" && pwd)"
if /usr/bin/curl -fsS http://127.0.0.1:52701/health 2>/dev/null | /usr/bin/grep -q wanggan-formal-gallery; then
  open http://127.0.0.1:52701/
  exit 0
fi
for wg_gallery_python in python3.14 python3.13 python3.12 python3.11 python3; do
  if [[ "$("$wg_gallery_python" -c 'print("gallery-ready")' 2>/dev/null)" == gallery-ready ]]; then
    "$wg_gallery_python" "$WG_GALLERY_ROOT/serve.py" --project "$WG_GALLERY_ROOT" --port 52701 &
    WG_GALLERY_PID=$!
    trap 'kill "$WG_GALLERY_PID" 2>/dev/null || true' EXIT INT TERM
    for wg_gallery_attempt in {1..50}; do
      if /usr/bin/curl -fsS http://127.0.0.1:52701/health 2>/dev/null | /usr/bin/grep -q wanggan-formal-gallery; then
        open http://127.0.0.1:52701/
        wait "$WG_GALLERY_PID"
        exit 0
      fi
      sleep 0.1
    done
    wait "$WG_GALLERY_PID"
    exit 1
  fi
done
printf '需要可用的Python3.11+。\n'
read
''')
(D/'启动预览.command').chmod(0o755)
put(D/'manifest.json',dict(version=C['version'],implemented=len(records),userApproved=C['approvedCount'],productionVerified=C['productionVerifiedCount'],pending=C['plannedCount'],videos=records,scope='所有完成视频为实体相对文件，精确SHA对应正式目录；不依赖研究服务器。未完成方向仍显示候选。'))
progressText=('100种均已完成完整实测与正式模板。'if C['plannedCount']==0 else f"当前{len(records)}种完成，{C['plannedCount']}种尚未完成，100目标持续推进。")
(D/'使用说明.md').write_text(f'# 网感口播画风总览 {C["version"]}\n\n{progressText}点击画风卡后可播放完整实测视频、对比和调整协作配方；人物原色、角落圆窗、字幕上移及原声保留。\n\n视频、封面、目录和样例证据均为本目录中的实体文件，相对链接，不依赖test或旧端口。用已验证的Python3.14启动（其他3.11+也可）：\n\n```sh\npython3.14 serve.py --project . --port 52701\n```\n\n打开 http://127.0.0.1:52701/ 。直接双击HTML会受浏览器本地fetch限制，请通过上述本地服务打开。模板与四个完整skill在正式插件，音画文件按manifest的SHA验证。\n')
print(json.dumps(dict(output=str(D),implemented=len(records),pending=C['plannedCount'],relativeMedia=True,videoHashesVerified=True),ensure_ascii=False))
