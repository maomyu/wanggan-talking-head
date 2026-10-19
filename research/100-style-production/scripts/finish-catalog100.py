from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
read=lambda p:json.loads(p.read_text());put=lambda p,d:p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
C=read(APP/'style-library/catalog.json');assert C['version']=='1.13.0'and C['implementedCount']==100 and C['plannedCount']==0
C['researchBoundary']='100项全部完成同一口播的实际视频与正式模板：20种用户认可、80种制作验证。目录包含材料、摄影、传统风格与原创配方，可按内容组合；不是互斥行业标准或所有世界画风的穷尽清单。';put(APP/'style-library/catalog.json',C)
f=APP/'.codex-plugin/plugin.json';m=read(f);m['description']='网感口播：100种已实现画风（20用户认可、80制作验证），四个完整专业skill与统筹入口协作。';m['interface']['shortDescription']='100种已实现画风与完整模块协作';m['interface']['longDescription']='100种均有可重建模板与完整实测视频，四个完整专家skill与统筹入口，支持整片制作和单模块修改；人物原色、角落圆窗、字幕上移。';put(f,m)
for rel in ['README.md','docs/共同制作规范.md','docs/组合与范围.md','docs/使用说明.md']:
 f=APP/rel;s=f.read_text().replace('其中另外0种尚未完成，分别标记候选或制作中。','全部方向均完成同一口播的完整视频与正式模板。').replace('未完成的0个方向仍位于extensions，制作中与排队状态分开记录，不含虚构缩略图、实现文件或成片证据。','A21—A100均有完整视频、模板与制作验证证据，尚未逐条获得用户视觉认可；当前无未完成候选。').replace('，0种未完成。','，本批100种全部完成。');s=re.sub(r'\n{4,}','\n\n',s);f.write_text(s)
f=APP/'docs/100种画风与协作配方.md';s=f.read_text();lines=s.splitlines();lines[2]=C['researchBoundary'];f.write_text('\n'.join(lines)+'\n')
print('Final100 catalog and documentation distinguish implementation, visual approval and content scope')
