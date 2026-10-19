from pathlib import Path
import json,shutil,sys,hashlib,subprocess
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';C=json.loads((APP/'style-library/catalog.json').read_text());PROFILE=json.loads((APP/'style-library/profiles.json').read_text())
def put(p,d):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for key in sys.argv[1:]:
 row=next(s for s in [*C['styles'],*C['extensions']]if key in [s['key'],s['id']]);key=row['key'];P=R/'variants'/key
 if P.exists():raise SystemExit('Already exists: '+str(P))
 shutil.copytree(APP/'templates/approved-reference',P)
 for folder in ['outputs','qa','scripts']:(P/folder).mkdir(exist_ok=True)
 put(P/'source-info.json',json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(P/'assets/master.mp4')])));put(P/'hyperframes.json',dict(paths=dict(blocks='compositions',components='compositions/components',assets='assets'),media=dict(autoProxy=True),authoringSkill='general-video'))
 for rel in ['base.css','scene.js','material-stage.js'] :shutil.copy2(R/'shared'/rel,P/'assets'/rel)
 shutil.copy2(R/'shared'/f'{key}.js',P/'assets/look.js')
 if key in ['memphis','brutalist-type','optical-graphic','negative-space']:shutil.copy2(R/'shared/graphic-stage.js',P/'assets/graphic-stage.js')
 if key in ['photo-book','timeline-almanac']:shutil.copy2(R/'shared/editorial-extra.js',P/'assets/editorial-extra.js')
 if key in ['pop-up-book','corrugated-model']:
  for f in ['paper-models.js','paper-construction-stage.js']:shutil.copy2(R/'shared'/f,P/'assets'/f)
  shutil.copytree(APP/'style-library/runtime/vendor',P/'assets/vendor',dirs_exist_ok=True)
 if key=='photo-book':
  shutil.copy2(R/'shared/rasters/photo-atlas.png',P/'assets/atlas.png');shutil.copy2(R/'shared/rasters/photo-provenance.json',P/'assets/provenance.json');(P/'assets/atlas-geometry.js').write_text('export default '+(R/'shared/rasters/photo-geometry.json').read_text()+';\n')
 if key in ['newspaper','archive-dossier','dictionary-entry','lab-notebook','swiss-grid','constructivist','art-deco','art-nouveau']:shutil.copy2(R/'shared/editorial-stage.js',P/'assets/editorial-stage.js')
 if key in ['woodcut','risograph','cyanotype']:shutil.copy2(R/'shared/print-stage.js',P/'assets/print-stage.js')
 if key in ['terminal-ascii','vector-oscilloscope','led-dot-matrix','early-desktop']:
  shutil.copy2(R/'shared/screen-stage.js',P/'assets/screen-stage.js');shutil.copy2(R/'shared/ascii-glyphs.js',P/'assets/ascii-glyphs.js')
 if key in ['mechanical-cutaway','spatial-pointcloud']:
  shutil.copy2(R/'shared/volume-models.js',P/'assets/volume-models.js');shutil.copytree(APP/'style-library/runtime/vendor',P/'assets/vendor',dirs_exist_ok=True)
 if key in ['gongbi','felt-applique']:
  raster='felt'if key=='felt-applique'else key
  suffix='-v2'if raster=='gongbi'else''
  rasters=R/'shared/rasters'
  shutil.copy2(R/'shared/raster-stage.js',P/'assets/raster-stage.js')
  shutil.copy2(rasters/f'{raster}-atlas{suffix}.png',P/'assets/atlas.png')
  (P/'assets/atlas-geometry.js').write_text('export default '+(rasters/f'{raster}-geometry{suffix}.json').read_text()+';\n')
  shutil.copy2(rasters/f'{raster}-provenance{suffix}.json',P/'assets/provenance.json')
 shutil.copytree(APP/'assets/fonts',P/'assets/fonts',dirs_exist_ok=True);shutil.copy2(APP/'assets/gsap.min.js',P/'assets/gsap.min.js')
 (P/'assets/composition.html').write_text((R/'shared/composition.html').read_text().replace('__LOOK_NAME__',row['name']))
 edit=json.loads((P/'plans/edit-plan.json').read_text());edit['comparison']['looks']=[key];put(P/'plans/edit-plan.json',edit)
 art=dict(module='talking-head-art-direction',styleId=key,experience=row['visualMechanism'],profiles=row['profiles'],personTreatment='source-color; circular-corners',scope='this approved finance fixture only',referenceBoundary='原创口播适配；材质参考见本批研究记录，图解不是事实照片')
 put(P/'plans/art-direction.json',art);put(P/'plans/audio-plan.json',dict(default='original-voice',suggestedProfile=row['profiles']['sound'],decision='本段人声信息密集，先保留原声；暂不添加没有明确事件用途的音乐或音效'))
 look_base=json.loads(subprocess.check_output(['node','--input-type=module','-e','import{pathToFileURL}from"node:url";const m=await import(pathToFileURL(process.argv[1]));console.log(JSON.stringify(m.LOOK.base));',str(P/'assets/look.js')],text=True))
 for module,file in [('layout','layout-plan.json'),('motion','motion-plan.json')]:
  data=json.loads((P/'plans'/file).read_text());data['profile']=PROFILE[module][row['profiles'][module]];data['styleKey']=key
  if module=='motion':data['travelSeconds']=.55
  else:data['portrait']['baseBox']=[look_base['x'],look_base['y'],look_base['w'],look_base['w']]
  put(P/'plans'/file,data)
 put(P/'project.json',dict(schemaVersion=1,id='hundred-'+key,name=row['id']+' '+row['name'],scope='full',modules=['art-direction','layout','motion','editing'],renderer='custom',status='planned-reference',referenceFixture=True,requestedStyle=dict(id=row['id'],key=key,status='in-production'),sourceSha256=hashlib.sha256((P/'assets/master.mp4').read_bytes()).hexdigest()))
 (P/'DESIGN.md').write_text('# '+row['id']+' '+row['name']+'\n\n'+row['visualMechanism']+'。\n\n人物原色、角落圆窗、字幕1600基线。素材、语义、原声和时序继承已认可1100帧案例；本片布局、图解与材料行为由assets/look.js实现，适配不是自动理解任意视频。\n\n'+'\n'.join('- '+module+'：'+PROFILE[module][code]['name']+'。'+PROFILE[module][code]['guidance']for module,code in row['profiles'].items())+'\n')
 (P/'scripts/build-project.mjs').write_text('''import fs from'node:fs';import path from'node:path';const R=path.resolve(process.argv[process.argv.indexOf('--project')+1]),read=p=>JSON.parse(fs.readFileSync(path.join(R,p),'utf8')),put=(p,v)=>fs.writeFileSync(path.join(R,p),JSON.stringify(v,null,2));const P=read('plans/edit-plan.json');P.duration=P.frameCount/P.fps;put('timing.json',P);put('edit-plan.json',P);fs.writeFileSync(path.join(R,'assets/timing.js'),'window.STUDY_TIMING='+JSON.stringify(P)+';');let html=fs.readFileSync(path.join(R,'assets/composition.html'),'utf8');const caption=read('plans/layout-plan.json').caption||{};html=html.replace('</head>',`<style>#captions{left:${caption.x??64}px;top:${caption.y??1600}px;width:${caption.width??952}px}#caption-text{font-size:${caption.size??60}px}</style></head>`);fs.writeFileSync(path.join(R,'index.html'),html);let strings=html+JSON.stringify(P);for(const f of ['assets/look.js','assets/scene.js','assets/material-stage.js'])strings+=fs.readFileSync(path.join(R,f),'utf8');const chars=[...new Set(Array.from(strings).filter(c=>/[\\u4e00-\\u9fff\\u3000-\\u303f\\uff00-\\uffef\\u0020-\\u007e]/u.test(c)))].join('');put('font-usage.json',{scope:'declared-material-reference-font-roles',fonts:{'NotoSansSC-700.woff':chars,'NotoSansSC-900.woff':chars,'NotoSerifSC-700.woff':chars}});put('facts.json',{source:'user-approved-finance-source',claims:P.captions.map(c=>({text:c.text,sourceStart:c.sourceStart,sourceEnd:c.sourceEnd})),graphics:'解释示意，不添加收益数字或新金融结论'});console.log(JSON.stringify({key:read('plans/art-direction.json').styleId,frames:P.frameCount,voiceTracks:1}));''')
 shutil.copy2(R/'shared/build-project.mjs',P/'scripts/build-project.mjs')
 print(str(P),flush=True)
