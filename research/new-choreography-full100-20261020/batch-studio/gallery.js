const $=s=>document.querySelector(s),single=$('#single'),comparison=$('#comparison'),player=$('#player'),av=$('#player-a'),bv=$('#player-b');
let catalogue,state,selectedA='minimal',selectedB='magazine',pairFrame=0,signature='';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const row=k=>catalogue.styles.find(s=>s.key===k),ready=k=>state?.jobs[k]?.status==='verified';
const media=k=>row(k).video+'?v='+state.jobs[k].videoSha256.slice(0,12);
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('读取失败：'+url);return r.json()}
function release(v){v.pause();v.removeAttribute('src');v.load()}
function closeSingle(){if(single.open)single.close();release(player)}
function stopPair(){cancelAnimationFrame(pairFrame);av.pause();bv.pause();$('#pair-play').textContent='播放'}
function releasePair(){stopPair();release(av);release(bv)}
function picks(){for(const [id,key]of[['selected-a',selectedA],['selected-b',selectedB]])$('#'+id).textContent=row(key).id+' '+row(key).name}
function draw(){
 const q=$('#search').value.trim().toLowerCase(),family=$('#family').value,system=$('#system').value,status=$('#readiness').value;
 const rows=catalogue.styles.filter(s=>(!q||`${s.id} ${s.key} ${s.name} ${s.composition.name}`.toLowerCase().includes(q))&&(!family||s.familyKey===family)&&(!system||s.composition.id===system)&&(!status||(status==='verified')===ready(s.key)));
 $('#result-count').textContent=rows.length+' / 100种';$('#empty').hidden=rows.length>0;
 $('#cards').innerHTML=rows.map(s=>{const ok=ready(s.key),job=state.jobs[s.key],stage={checking:'整片检查中',rendering:'完整视频渲染中',verifying:'编码核验中',failed:'待修复重试'}[job?.status]||'排队制作中';return`<article class="card"><button class="poster" data-play="${s.key}" aria-label="播放 ${s.id} ${escape(s.name)}" ${ok?'':'disabled'}>${ok?`<img loading="lazy" src="variants/${s.key}/outputs/compare-poster.jpg?v=${job.videoSha256.slice(0,12)}" alt="${escape(s.name)}实际成片18.90秒画面">`:`<span class="pending-cover">${s.id}<br>${stage}</span>`}<span class="badge">${ok?'▶ 完整视频 36.67秒':stage}</span></button><h3>${s.id} ${escape(s.name)}</h3><p>${s.composition.id} ${escape(s.composition.name)}</p><div class="pick"><button data-pick="a" data-key="${s.key}" class="${selectedA===s.key?'active':''}">选为 A</button><button data-pick="b" data-key="${s.key}" class="${selectedB===s.key?'active':''}">选为 B</button></div></article>`}).join('');picks();
}
async function refresh(){
 state=await json('qa/batch-state.json');$('#verified-count').textContent=state.verified;
 const jobs=Object.values(state.jobs),failed=jobs.filter(j=>j.status==='failed').length,working=jobs.filter(j=>['checking','rendering','verifying'].includes(j.status)).length;
 $('#progress').textContent=state.verified===100?'100条完整视频均已完成编码与核验，可直接在线播放。':`已核验 ${state.verified} / 100 · 正在处理 ${working} 条${failed?' · 待修复 '+failed+' 条':''}。核验完成后自动开放播放。`;
 const next=JSON.stringify(jobs.map(j=>[j.status,j.videoSha256]));if(next!==signature){signature=next;draw();fillChoices()}
}
function showFilm(k){if(!ready(k))return;releasePair();if(comparison.open)comparison.close();const s=row(k);$('#single-title').textContent=s.id+' '+s.name;$('#single-recipe').textContent=s.composition.id+' '+s.composition.name+' · '+s.composition.motionVocabulary.slice(0,2).join(' / ');player.src=media(k);player.poster='variants/'+k+'/outputs/compare-poster.jpg';$('#download').href=media(k);$('#verification').href='variants/'+k+'/qa/batch-verification.json';single.showModal();player.play().catch(()=>{})}
function fillChoices(){const options=catalogue.styles.filter(s=>ready(s.key)).map(s=>`<option value="${s.key}">${s.id} ${escape(s.name)} / ${escape(s.composition.name)}</option>`).join('');$('#choose-a').innerHTML=options;$('#choose-b').innerHTML=options;$('#choose-a').value=selectedA;$('#choose-b').value=selectedB}
function sound(){av.muted=$('#sound-source').value!=='a';bv.muted=$('#sound-source').value!=='b'}
function loadPair(){stopPair();for(const [key,v,title]of[[selectedA,av,'pair-a-title'],[selectedB,bv,'pair-b-title']]){const s=row(key);$('#'+title).textContent=s.id+' '+s.name+' · '+s.composition.name;v.src=media(key);v.poster='variants/'+key+'/outputs/compare-poster.jpg'}sound();$('#pair-seek').value=0;$('#pair-clock').textContent='0.00 / 36.67秒';$('#pair-status').textContent='两条视频共用进度，只播放一条人声。'}
function openCompare(){
 if(!ready(selectedA)||!ready(selectedB)){$('#progress').textContent='所选视频正在制作；请先选择两条已核验的视频。';return}
 closeSingle();fillChoices();loadPair();comparison.showModal();
}
function tick(){
 if(!comparison.open)return;$('#pair-seek').value=av.currentTime;$('#pair-clock').textContent=av.currentTime.toFixed(2)+' / 36.67秒';
 if(Math.abs(av.currentTime-bv.currentTime)>.12&&!bv.seeking)bv.currentTime=av.currentTime;
 if(!av.paused&&!av.ended)pairFrame=requestAnimationFrame(tick);else stopPair();
}
async function playPair(){
 if(!av.paused)return stopPair();if(av.ended){av.currentTime=0;bv.currentTime=0}
 sound();try{await Promise.all([av.play(),bv.play()]);bv.currentTime=av.currentTime;$('#pair-play').textContent='暂停';pairFrame=requestAnimationFrame(tick)}catch{stopPair();$('#pair-status').textContent='请稍等视频缓冲后再播放。'}
}
document.addEventListener('click',e=>{const play=e.target.closest('[data-play]'),pick=e.target.closest('[data-pick]');if(play)showFilm(play.dataset.play);if(pick){if(pick.dataset.pick==='a')selectedA=pick.dataset.key;else selectedB=pick.dataset.key;draw()}});
for(const id of ['search','family','system','readiness'])$('#'+id).addEventListener(id==='search'?'input':'change',draw);
$('#single-close').onclick=()=>single.close();single.onclose=()=>release(player);$('#open-compare').onclick=openCompare;$('#compare-selected').onclick=openCompare;$('#compare-close').onclick=()=>comparison.close();comparison.onclose=releasePair;
$('#pair-play').onclick=playPair;$('#pair-seek').oninput=e=>{const t=Math.min(1099/30,Math.round(Number(e.target.value)*30)/30);av.currentTime=t;bv.currentTime=t;$('#pair-clock').textContent=t.toFixed(2)+' / 36.67秒'};
$('#sound-source').onchange=sound;$('#pair-full').onclick=()=>$('#compare-stage').requestFullscreen().catch(()=>{});
for(const [id,side]of[['choose-a','a'],['choose-b','b']])$('#'+id).onchange=e=>{if(side==='a')selectedA=e.target.value;else selectedB=e.target.value;loadPair();draw()};
av.onended=stopPair;player.onplay=stopPair;window.addEventListener('pagehide',()=>{release(player);releasePair()});
try{catalogue=await json('catalogue-full.json');const seenFamily=new Set(),seenSystem=new Set();for(const s of catalogue.styles){if(!seenFamily.has(s.familyKey)){$('#family').add(new Option(s.family,s.familyKey));seenFamily.add(s.familyKey)}if(!seenSystem.has(s.composition.id)){$('#system').add(new Option(s.composition.name,s.composition.id));seenSystem.add(s.composition.id)}}await refresh();setInterval(()=>refresh().catch(()=>{}),10000)}catch(e){$('#progress').textContent=e.message}
