from pathlib import Path
import hashlib,json,shutil,sys
R=Path(__file__).resolve().parents[1];keys=set(sys.argv[1:]);cat=json.loads((R/'catalogue.json').read_text());out=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for s in cat['styles']:
 if keys and s['key']not in keys:continue
 p=R/'variants'/s['key'];record=json.loads((p/'qa/research-build.json').read_text());assert(p/'comparison/baseline.html').exists()
 assert all(sha(p/k)==v for k,v in record['preserved'].items())
 for dest in [p/'scripts/director.js',p/'assets/director.js']:
  if dest.read_bytes()!=(R/'scripts/director.js').read_bytes():shutil.copyfile(R/'scripts/director.js',dest)
 shutil.copyfile(R/'scripts/build-project.mjs',p/'scripts/build-project.mjs')
 record.update(directorSha256=sha(p/'assets/director.js'),htmlSha256=sha(p/'index.html'),buildScriptSha256=sha(p/'scripts/build-project.mjs'),note='Final adapter copied to both reproducible creative input and actual imported module; HTML/media unchanged.')
 (p/'qa/research-build.json').write_text(json.dumps(record,indent=2));out.append(s['key'])
print('Final adapter bound to',len(out),'styles')
