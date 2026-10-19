from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';version=json.loads((APP/'.codex-plugin/plugin.json').read_text())['version'];base=R/'portability'/('legacy-motion-'+version);src=base/'default';rev=base/'revision';studio=['node',str(APP/'scripts/studio.mjs')]
assert not base.exists(),'Keep existing evidence'
records=[]
for name,args in [('init',['init','--project',str(src),'--example','approved','--style','minimal']),('default',['run','--project',str(src),'--until','build']),('revise',['revise','--from',str(src),'--out',str(rev),'--module','motion','--request','仅将人物让位改为1秒'])]:
 result=subprocess.run([*studio,*args],capture_output=True,text=True);(R/'qa'/f'legacy-{name}-{version}.log').write_text(result.stdout+result.stderr);assert result.returncode==0,(name,result.stderr);records.append(name)
p=rev/'plans/motion-plan.json';d=json.loads(p.read_text());d['travelSeconds']=1;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');result=subprocess.run([*studio,'run','--project',str(rev),'--until','build'],capture_output=True,text=True);(R/'qa'/f'legacy-rejected-{version}.log').write_text(result.stdout+result.stderr);assert result.returncode!=0 and'未声明独立的人物速度参数'in(result.stdout+result.stderr)
(R/'qa'/f'legacy-motion-guard-{version}.json').write_text(json.dumps(dict(ok=True,version=version,defaultBuilt=True,unsafeNumericReplacementRejected=True,scope='历史默认模板保留；未声明速度参数时需要单模块custom实现，不会静默改其他曲线'),ensure_ascii=False,indent=2)+'\n');print('Legacy default builds; undeclared travel override rejected clearly')
