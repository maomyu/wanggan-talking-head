from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
import argparse,json,os,re
p=argparse.ArgumentParser();p.add_argument('--project',required=True);p.add_argument('--port',type=int,default=0);args=p.parse_args();root=Path(args.project).resolve();project=json.loads((root/'project.json').read_text())
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):self.remaining=None;super().__init__(*a,directory=str(root),**kw)
 def send_head(self):
  path=urlsplit(self.path).path
  if path=='/health':
   data=json.dumps({'projectId':project['id']}).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return None
  if path in ['/','/index.html']:
   self.send_response(302);self.send_header('Location','/review.html');self.send_header('Content-Length','0');self.end_headers();return None
  target=Path(self.translate_path(self.path))
  if not target.resolve().is_relative_to(root):self.send_error(403);return None
  if not target.is_file():return super().send_head()
  start,end,status=0,target.stat().st_size-1,200;match=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
  if match:
   start=int(match[1]);end=min(int(match[2]),end) if match[2] else end;status=206
   if start>end:self.send_error(416);return None
  f=target.open('rb');f.seek(start);self.remaining=end-start+1;self.send_response(status);self.send_header('Content-Type',self.guess_type(str(target)));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(self.remaining))
  if status==206:self.send_header('Content-Range',f'bytes {start}-{end}/{target.stat().st_size}')
  self.end_headers();return f
 def copyfile(self,source,output):
  if self.remaining is None:return super().copyfile(source,output)
  try:
   while self.remaining:
    data=source.read(min(262144,self.remaining))
    if not data:break
    output.write(data);self.remaining-=len(data)
  except (BrokenPipeError,ConnectionResetError):
   # Closing or seeking a player can intentionally cancel its current range.
   pass
server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);(root/'qa/preview-server.json').write_text(json.dumps({'pid':os.getpid(),'port':server.server_address[1],'projectId':project['id'],'url':f'http://127.0.0.1:{server.server_address[1]}/'},indent=2));server.serve_forever()
