"""Read public reference HTML and repository text; never execute remote code."""
import concurrent.futures, hashlib, json, pathlib, time, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCES={
 'modulify':'https://modulify.ai/templates',
 'backgrounds':'https://www.backgrounds.supply/',
 'reelfolio':'https://reelfolio.io/',
 'inspora':'https://inspora.design/',
 '60fps':'https://60fps.design/',
 'oneprompt':'https://onepromptdesign.com/',
 'feralui':'https://feralui.dev/gradients',
 'theatre':'https://www.theatrejs.com/',
 'prompt-motion':'https://prompt-motion.com/',
 'opus-readme':'https://raw.githubusercontent.com/yihui-dev/awesome-opus5-5-videos/main/README.md',
 'opus-data':'https://raw.githubusercontent.com/yihui-dev/awesome-opus5-5-videos/main/data/videos.json',
 'opus-tree':'https://api.github.com/repos/yihui-dev/awesome-opus5-5-videos/git/trees/main?recursive=1',
}
def fetch(item):
 key,url=item
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (Research; public reference reading)'})
  with urllib.request.urlopen(req,timeout=35) as r:
   data=r.read(); final=r.url; status=r.status
  suffix='.json' if key in ('opus-data','opus-tree') else '.md' if key=='opus-readme' else '.html'
  path=ROOT/'references'/'pages'/(key+suffix);path.write_bytes(data)
  return {'id':key,'url':url,'finalUrl':final,'status':status,'path':str(path.relative_to(ROOT)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 except Exception as e:return {'id':key,'url':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(fetch,SOURCES.items()))
(ROOT/'references'/'fetch-log.json').write_text(json.dumps({'accessed':time.strftime('%Y-%m-%d'),'sources':results},ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
