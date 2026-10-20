from pathlib import Path
import argparse,shutil,subprocess
a=argparse.ArgumentParser();a.add_argument('--out',type=Path,required=True);a.add_argument('--app',type=Path,default=Path.home()/'plugins/wanggan-talking-head');args=a.parse_args();out=args.out.resolve();assert not out.exists(),'Use a new independent output folder'
source=Path(__file__).resolve().parents[1];out.mkdir(parents=True);shutil.copytree(source/'batch-studio',out/'batch-studio')
for name in ['review.html']:shutil.copy2(source/name,out/name)
import json
catalogue=json.loads((args.app/'style-library/catalog.json').read_text());py=args.app/'runtime/.venv/bin/python'
for style in catalogue['styles']:
 p=out/'variants'/style['key'];subprocess.run(['node',str(args.app/'scripts/studio.mjs'),'init','--project',str(p),'--example','approved','--style',style['key'],'--composition','auto'],check=True,stdout=subprocess.DEVNULL);subprocess.run(['node',str(args.app/'scripts/studio.mjs'),'run','--project',str(p),'--until','build'],check=True,stdout=subprocess.DEVNULL)
subprocess.run([str(py),str(out/'batch-studio/prepare.py')],check=True)
print(str(out))
