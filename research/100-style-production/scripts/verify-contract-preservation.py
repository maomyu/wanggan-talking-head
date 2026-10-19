from pathlib import Path
import subprocess,json,hashlib,numpy as np
R=Path(__file__).resolve().parents[1];rows=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def frames(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-i',str(p),'-vf','fps=1,scale=270:480','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),np.uint8).astype(float)
for key in ['origami','felt-applique','embroidery','gongbi','etching','mechanical-cutaway','spatial-pointcloud']:
 p=R/'variants'/key;old=p/'qa/revisions/person-contract-before/outputs/final.mp4';new=p/'outputs/final.mp4';a,b=frames(old),frames(new);assert a.shape==b.shape
 mae=float(np.abs(a-b).mean());p99=float(np.percentile(np.abs(a-b),99));assert mae<4,(key,mae)
 oldproof=json.loads((p/'qa/revisions/person-contract-before/verification.json').read_text());newproof=json.loads((R/'qa'/f'{key}-verification.json').read_text());assert newproof['ok']and newproof['sha256']==sha(new)
 assert oldproof['decodedAudioHash']==newproof['decodedAudioHash'],key+' original voice changed'
 rows.append(dict(key=key,oldSha256=sha(old),currentSha256=sha(new),sampledPixelsMAE=mae,p99=p99,decodedVoiceIdentical=True,scope='每秒一帧的实际编码缩小图像比较，36.7秒完整语音解码哈希相同；保护默认视觉，不声称逐像素全帧等同'))
(R/'qa/person-contract-preservation.json').write_text(json.dumps(dict(ok=True,results=rows),ensure_ascii=False,indent=2)+'\n');print('Seven default encodes and decoded voices preserved')
