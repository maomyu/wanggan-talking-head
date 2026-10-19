from pathlib import Path
import argparse,json,subprocess

R=Path(__file__).resolve().parents[1]
APP=Path.home()/'plugins/wanggan-talking-head'
p=argparse.ArgumentParser()
p.add_argument('key');p.add_argument('version');p.add_argument('tag')
o=p.parse_args()
base=R/'portability'/('formal-'+o.version)/o.key
dest=R/'portability'/('motion-'+o.tag)
assert base.is_dir() and not dest.exists(), 'Preserve existing probes; a built formal base is required'
studio=['node',str(APP/'scripts/studio.mjs')]
with (R/'qa'/('motion-probe-'+o.tag+'.log')).open('w') as log:
    subprocess.run([*studio,'revise','--from',str(base),'--out',str(dest),'--module','motion','--request','人物让位时间由0.55秒改1秒，其他模块与声音、字幕保持'],stdout=log,stderr=subprocess.STDOUT,check=True)
    f=dest/'plans/motion-plan.json';d=json.loads(f.read_text());assert d['travelSeconds']==.55
    d['travelSeconds']=1;f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    subprocess.run([*studio,'run','--project',str(dest),'--until','build'],stdout=log,stderr=subprocess.STDOUT,check=True)
scope=json.loads((dest/'qa/scope-check.json').read_text())
assert scope['revision'] and scope['module']=='motion' and scope['timingAndVoicePreserved']
print(str(dest.relative_to(R))+' motion revision built; protected inputs and timing passed',flush=True)
