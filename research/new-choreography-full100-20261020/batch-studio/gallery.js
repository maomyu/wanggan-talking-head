const $=s=>document.querySelector(s),single=$('#single'),comparison=$('#comparison'),player=$('#player'),av=$('#player-a'),bv=$('#player-b'),voice=$('#grid-voice');
const D=1100/30;
let catalogue,state,previews={styles:{}},selectedA='minimal',selectedB='magazine',pairFrame=0,signature='';
let gridRunning=false,gridOffset=0,gridEpoch=0,gridGeneration=0,gridBusy=false,voiceKey=null,seekTimer=0;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const row=k=>catalogue.styles.find(s=>s.key===k),ready=k=>state?.jobs[k]?.status==='verified';
const media=k=>row(k).video+'?v='+state.jobs[k].videoSha256.slice(0,12);
const previewReady=k=>previews.styles[k]?.verified&&previews.styles[k].sourceSha256===state?.jobs[k]?.videoSha256;
const proxy=k=>previewReady(k)?previews.styles[k].url+'?v='+previews.styles[k].sha256.slice(0,12):media(k);
const inlineVideos=()=>[...document.querySelectorAll('.inline-video')];
const clock=()=>gridRunning?(gridOffset+(performance.now()-gridEpoch)/1000)%D:gridOffset;
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('读取失败：'+url);return r.json()}
function release(v){v.pause();v.removeAttribute('src');v.load()}
function closeSingle(){if(single.open)single.close();release(player)}
function stopPair(){cancelAnimationFrame(pairFrame);av.pause();bv.pause();$('#pair-play').textContent='播放'}
function releasePair(){stopPair();release(av);release(bv)}
function picks(){
 for(const [id,key]of[['selected-a',selectedA],['selected-b',selectedB]])$('#'+id).textContent=row(key).id+' '+row(key).name;
 document.querySelectorAll('[data-pick]').forEach(b=>b.classList.toggle('active',b.dataset.key===(b.dataset.pick==='a'?selectedA:selectedB)));
}
function silence(){voice.pause();voiceKey=null;document.querySelectorAll('[data-listen]').forEach(b=>{b.textContent='听这条';b.classList.remove('active')});$('#grid-sound').textContent='全部静音'}
function pauseGrid(releaseMedia=false){
 gridOffset=clock();gridRunning=false;gridBusy=false;gridGeneration++;
 for(const v of inlineVideos()){v.pause();if(releaseMedia)release(v)}
 silence();updateGrid();
}
function draw(){
 pauseGrid(true);
 const q=$('#search').value.trim().toLowerCase(),family=$('#family').value,system=$('#system').value,status=$('#readiness').value;
 const rows=catalogue.styles.filter(s=>(!q||(s.id+' '+s.key+' '+s.name+' '+s.composition.name).toLowerCase().includes(q))&&(!family||s.familyKey===family)&&(!system||s.composition.id===system)&&(!status||(status==='verified')===ready(s.key)));
 $('#result-count').textContent=rows.length+' / 100种';$('#empty').hidden=rows.length>0;
 $('#cards').innerHTML=rows.map(s=>{
  const ok=ready(s.key),job=state.jobs[s.key],poster='variants/'+s.key+'/outputs/compare-poster.jpg?v='+(job?.videoSha256||'').slice(0,12);
  const stage={checking:'整片检查中',rendering:'完整视频渲染中',verifying:'编码核验中',failed:'待修复重试'}[job?.status]||'排队制作中';
  return '<article class="card" data-key="'+s.key+'"><div class="poster">'+(ok?'<video class="inline-video" data-key="'+s.key+'" aria-label="'+escape(s.id+' '+s.name+' 内嵌视频')+'" controls muted playsinline loop preload="none" poster="'+poster+'"></video><button class="inline-start" data-inline="'+s.key+'" aria-label="在线播放 '+escape(s.id+' '+s.name)+'">▶ 在线播放</button>':'<span class="pending-cover">'+s.id+'<br>'+stage+'</span>')+'</div><h3>'+s.id+' '+escape(s.name)+'</h3><p>'+s.composition.id+' '+escape(s.composition.name)+'</p><div class="card-actions"><button data-listen="'+s.key+'" '+(ok?'':'disabled')+'>听这条</button><button data-play="'+s.key+'" '+(ok?'':'disabled')+'>高清 / 大屏</button></div><div class="pick"><button data-pick="a" data-key="'+s.key+'">选为 A</button><button data-pick="b" data-key="'+s.key+'">选为 B</button></div></article>';
 }).join('');
 for(const v of inlineVideos()){
  v.addEventListener('play',()=>{v.closest('.card').classList.add('is-playing');if(voiceKey===v.dataset.key)voice.play().catch(()=>{});updateGrid()});
  v.addEventListener('pause',()=>{v.closest('.card').classList.remove('is-playing');if(voiceKey===v.dataset.key)voice.pause();updateGrid()});
  v.addEventListener('seeked',()=>{if(voiceKey===v.dataset.key&&Math.abs(voice.currentTime-v.currentTime)>.15)voice.currentTime=v.currentTime});
  v.addEventListener('error',updateGrid);
 }
 picks();updateGrid();
}
function updateGrid(){
 const videos=inlineVideos(),playing=videos.filter(v=>v.getAttribute('src')&&!v.paused&&!v.ended).length,errors=videos.filter(v=>v.error).length;
 $('#grid-play-all').textContent='全部播放（'+videos.length+'）';
 $('#grid-play-all').disabled=gridBusy||!videos.length||videos.some(v=>!previewReady(v.dataset.key));$('#grid-restart').disabled=$('#grid-play-all').disabled;
 if(!gridBusy)$('#grid-status').textContent=playing?'正在同播 '+playing+' / '+videos.length+' 条'+(errors?' · '+errors+' 条加载失败':''):'已暂停 · '+videos.length+' 条可在卡片内播放';
 $('#grid-clock').textContent=clock().toFixed(2)+' / 36.67秒';
 if(document.activeElement!==$('#grid-seek'))$('#grid-seek').value=clock();
}
function ensureInline(v){
 if(!v.getAttribute('src')){v.muted=true;v.src=proxy(v.dataset.key);v.preload='auto';v.load()}
 if(v.readyState>=2)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const done=()=>{cleanup();resolve()},fail=()=>{cleanup();reject(Error(v.dataset.key+' 视频加载失败'))};
  const timer=setTimeout(fail,45000),cleanup=()=>{clearTimeout(timer);v.removeEventListener('loadeddata',done);v.removeEventListener('error',fail)};
  v.addEventListener('loadeddata',done,{once:true});v.addEventListener('error',fail,{once:true});
 });
}
async function startCard(key){
 const v=inlineVideos().find(v=>v.dataset.key===key);if(!v)return;
 try{await ensureInline(v);await v.play()}catch(e){$('#grid-status').textContent=e.message}
}
async function startAll(fromStart=false){
 const videos=inlineVideos();if(!videos.length||gridBusy)return;if(videos.some(v=>!previewReady(v.dataset.key))){$('#grid-status').textContent='列表预览正在准备，请稍后全部播放；可先单独点播。';return}
 const target=fromStart?0:clock();pauseGrid();closeSingle();releasePair();if(comparison.open)comparison.close();
 gridOffset=target;gridBusy=true;const generation=++gridGeneration;let completed=0,cursor=0;const failures=[];
 $('#grid-status').textContent='正在准备 0 / '+videos.length+' 条…';updateGrid();
 async function prepare(){
  while(cursor<videos.length&&generation===gridGeneration){
   const v=videos[cursor++];try{await ensureInline(v);v.currentTime=target}catch(e){failures.push(e.message)}
   completed++;if(generation===gridGeneration)$('#grid-status').textContent='正在准备 '+completed+' / '+videos.length+' 条…';
  }
 }
 await Promise.all(Array.from({length:Math.min(4,videos.length)},prepare));
 if(generation!==gridGeneration)return;
 gridBusy=false;gridOffset=target;gridEpoch=performance.now();gridRunning=true;
 const results=await Promise.allSettled(videos.filter(v=>!v.error).map(v=>v.play()));
 if(generation!==gridGeneration){videos.forEach(v=>v.pause());return}
 const t=clock();for(const v of videos)if(!v.paused&&Math.abs(v.currentTime-t)>.25)v.currentTime=t;
 const rejected=results.filter(r=>r.status==='rejected').length;updateGrid();
 if(failures.length||rejected)$('#grid-status').textContent+=' · 部分未启动，可再次点击全部播放';
}
function seekGrid(value){
 gridOffset=Math.max(0,Math.min(1099/30,Math.round(value*30)/30));gridEpoch=performance.now();
 for(const v of inlineVideos())if(v.getAttribute('src')&&v.readyState>=1)v.currentTime=gridOffset;
 if(voiceKey)voice.currentTime=gridOffset;updateGrid();
}
async function listen(key){
 if(voiceKey===key){silence();return}
 silence();await startCard(key);const v=inlineVideos().find(v=>v.dataset.key===key);if(!v||v.paused)return;
 voiceKey=key;if(!voice.getAttribute('src'))voice.src=previews.voice||'variants/minimal/assets/edited-voice.wav';
 voice.currentTime=v.currentTime;
 try{await voice.play();const b=document.querySelector('[data-listen="'+key+'"]');b.textContent='关闭原声';b.classList.add('active');$('#grid-sound').textContent='正在听 '+row(key).id+' '+row(key).name}catch{silence();$('#grid-status').textContent='请再次点击听这条启用原声'}
}
async function refresh(){
 state=await json('qa/batch-state.json');$('#verified-count').textContent=state.verified;
 const jobs=Object.values(state.jobs),failed=jobs.filter(j=>j.status==='failed').length,working=jobs.filter(j=>['checking','rendering','verifying'].includes(j.status)).length;
 $('#progress').textContent=state.verified===100?'100条完整视频均已完成编码与核验，可在下方直接在线播放。':'已核验 '+state.verified+' / 100 · 正在处理 '+working+' 条'+(failed?' · 待修复 '+failed+' 条':'')+'。';
 try{previews=await json('qa/grid-preview-index.json')}catch{}
 const next=JSON.stringify(jobs.map(j=>[j.status,j.videoSha256]));if(next!==signature){signature=next;draw();fillChoices()}
 updateGrid();
}
function showFilm(k){
 if(!ready(k))return;pauseGrid();releasePair();if(comparison.open)comparison.close();const s=row(k);
 $('#single-title').textContent=s.id+' '+s.name;$('#single-recipe').textContent=s.composition.id+' '+s.composition.name+' · 1080P 原片';
 player.src=media(k);player.poster='variants/'+k+'/outputs/compare-poster.jpg';$('#download').href=media(k);$('#verification').href='variants/'+k+'/qa/batch-verification.json';single.showModal();player.play().catch(()=>{});
}
function fillChoices(){const options=catalogue.styles.filter(s=>ready(s.key)).map(s=>'<option value="'+s.key+'">'+s.id+' '+escape(s.name)+' / '+escape(s.composition.name)+'</option>').join('');$('#choose-a').innerHTML=options;$('#choose-b').innerHTML=options;$('#choose-a').value=selectedA;$('#choose-b').value=selectedB}
function sound(){av.muted=$('#sound-source').value!=='a';bv.muted=$('#sound-source').value!=='b'}
function loadPair(){stopPair();for(const [key,v,title]of[[selectedA,av,'pair-a-title'],[selectedB,bv,'pair-b-title']]){const s=row(key);$('#'+title).textContent=s.id+' '+s.name+' · '+s.composition.name;v.src=media(key);v.poster='variants/'+key+'/outputs/compare-poster.jpg'}sound();$('#pair-seek').value=0;$('#pair-clock').textContent='0.00 / 36.67秒';$('#pair-status').textContent='两条视频共用进度，只播放一条人声。'}
function openCompare(){if(!ready(selectedA)||!ready(selectedB))return;pauseGrid();closeSingle();fillChoices();loadPair();comparison.showModal()}
function tick(){
 if(!comparison.open)return;$('#pair-seek').value=av.currentTime;$('#pair-clock').textContent=av.currentTime.toFixed(2)+' / 36.67秒';
 if(Math.abs(av.currentTime-bv.currentTime)>.12&&!bv.seeking)bv.currentTime=av.currentTime;
 if(!av.paused&&!av.ended)pairFrame=requestAnimationFrame(tick);else stopPair();
}
async function playPair(){
 if(!av.paused)return stopPair();if(av.ended){av.currentTime=0;bv.currentTime=0}
 sound();try{await Promise.all([av.play(),bv.play()]);bv.currentTime=av.currentTime;$('#pair-play').textContent='暂停';pairFrame=requestAnimationFrame(tick)}catch{stopPair();$('#pair-status').textContent='请稍等视频缓冲后再播放。'}
}
document.addEventListener('click',e=>{
 const play=e.target.closest('[data-play]'),pick=e.target.closest('[data-pick]'),inline=e.target.closest('[data-inline]'),listenButton=e.target.closest('[data-listen]');
 if(play)showFilm(play.dataset.play);
 if(inline)startCard(inline.dataset.inline);
 if(listenButton)listen(listenButton.dataset.listen);
 if(pick){if(pick.dataset.pick==='a')selectedA=pick.dataset.key;else selectedB=pick.dataset.key;picks()}
});
for(const id of ['search','family','system','readiness'])$('#'+id).addEventListener(id==='search'?'input':'change',draw);
$('#grid-play-all').onclick=()=>startAll();$('#grid-pause-all').onclick=()=>pauseGrid();$('#grid-restart').onclick=()=>startAll(true);
$('#grid-seek').oninput=e=>{clearTimeout(seekTimer);const value=Number(e.target.value);$('#grid-clock').textContent=value.toFixed(2)+' / 36.67秒';seekTimer=setTimeout(()=>seekGrid(value),120)};
$('#single-close').onclick=()=>single.close();single.onclose=()=>release(player);$('#open-compare').onclick=openCompare;$('#compare-selected').onclick=openCompare;$('#compare-close').onclick=()=>comparison.close();comparison.onclose=releasePair;
$('#pair-play').onclick=playPair;$('#pair-seek').oninput=e=>{const t=Math.min(1099/30,Math.round(Number(e.target.value)*30)/30);av.currentTime=t;bv.currentTime=t;$('#pair-clock').textContent=t.toFixed(2)+' / 36.67秒'};
$('#sound-source').onchange=sound;$('#pair-full').onclick=()=>$('#compare-stage').requestFullscreen().catch(()=>{});
for(const [id,side]of[['choose-a','a'],['choose-b','b']])$('#'+id).onchange=e=>{if(side==='a')selectedA=e.target.value;else selectedB=e.target.value;loadPair();picks()};
av.onended=stopPair;player.onplay=stopPair;
window.addEventListener('pagehide',()=>{pauseGrid(true);release(player);releasePair();release(voice)});
setInterval(()=>{
 if(gridRunning){
  const t=clock();for(const v of inlineVideos())if(!v.paused&&!v.seeking&&v.readyState>=2){const diff=Math.abs(v.currentTime-t);if(Math.min(diff,D-diff)>.5)v.currentTime=t}
 }
 if(voiceKey){const v=inlineVideos().find(v=>v.dataset.key===voiceKey);if(v&&!voice.paused&&Math.abs(voice.currentTime-v.currentTime)>.2)voice.currentTime=v.currentTime}
 updateGrid();
},500);
try{
 catalogue=await json('catalogue-full.json');const seenFamily=new Set(),seenSystem=new Set();
 for(const s of catalogue.styles){if(!seenFamily.has(s.familyKey)){$('#family').add(new Option(s.family,s.familyKey));seenFamily.add(s.familyKey)}if(!seenSystem.has(s.composition.id)){$('#system').add(new Option(s.composition.name,s.composition.id));seenSystem.add(s.composition.id)}}
 await refresh();setInterval(()=>refresh().catch(()=>{}),10000);
}catch(e){$('#progress').textContent=e.message}
