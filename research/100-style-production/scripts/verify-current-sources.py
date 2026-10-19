from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();rows=[]
for s in json.loads((R/'catalog.json').read_text()):
 key=s['key'];p=R/'variants'/key;state=json.loads((p/'qa/build-state.json').read_text());changed=[f for f,h in state['inputs'].items()if not(p/f).exists()or sha(p/f)!=h];assert not changed,(key,changed)
 q=json.loads((R/'qa'/f'{key}-verification.json').read_text());assert q['ok']and q['lastFramePresenter']['ok']and q['sha256']==sha(p/'outputs/final.mp4')
 rows.append(dict(key=key,inputFiles=len(state['inputs']),sha256=q['sha256'],allCurrent=True))
(R/'qa'/(sys.argv[1]if len(sys.argv)>1 else'current-sources.json')).write_text(json.dumps(dict(ok=True,results=rows,scope=f'当前项目所有已编码{len(rows)}种的构建输入和实际MP4精确哈希匹配，不沿用旧源通过记录'),ensure_ascii=False,indent=2)+'\n');print(str(len(rows))+' current sources and exact encoded proofs match')
