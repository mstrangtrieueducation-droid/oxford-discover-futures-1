'use strict';
const chapters=[
 [1,4,'What is the value of time?'],[2,14,'What do we remember?'],[3,26,'How do we know what’s the best?'],[4,36,'How do groups work together?'],[5,48,'What do we need to survive?'],[6,58,'How can we live with less?'],[7,70,'What is intelligence?'],[8,80,'How can we stay healthy?'],[9,92,'Why do we tell stories?'],[10,102,'What makes a good place to live?']
];
const $=id=>document.getElementById(id), TOTAL=154;
let page=5,zoom=1,lastFocus=null;
const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const read=key=>{try{return localStorage.getItem(key)}catch{return null}};
const pageLabel=n=>n===1?'Bìa':n===154?'Trang cuối':String(n-1);
const pageTitle=n=>n===1?'Bìa sách':n===154?'Trang cuối':'Trang sách '+(n-1);
for(let n=1;n<=TOTAL;n++){const option=document.createElement('option');option.value=n;option.textContent=pageLabel(n);$('page').append(option)}
chapters.forEach(([unit,p,title])=>{const b=document.createElement('button');b.className='chapter';b.dataset.unit=unit;b.innerHTML='<span class="number">'+String(unit).padStart(2,'0')+'</span><span>'+title+'</span>';b.onclick=()=>{go(p+1);closePanels()};$('chapters').append(b)});
[[112,'Vocabulary & grammar'],[132,'Writing workshop']].forEach(([p,title])=>{const b=document.createElement('button');b.className='chapter extra';b.textContent=title;b.onclick=()=>{go(p+1);closePanels()};$('chapters').append(b)});
function currentChapter(){const p=page-1;return [...chapters].reverse().find(c=>p>=c[1])||chapters[0]}
function renderVideos(unit){$('video-unit').textContent='Unit '+unit;$('video-list').replaceChildren();EBOOK_MEDIA.video.filter(v=>v.unit===unit).sort((a,b)=>a.label.localeCompare(b.label)).forEach(v=>{const b=document.createElement('button');b.className='media-button';b.innerHTML='<span class="play-symbol">▶</span><span>'+v.label+'<small>Unit '+unit+' · Google Drive</small></span>';b.onclick=()=>openMedia(v.id,v.label+' · Unit '+unit,'video');$('video-list').append(b)})}
function renderAudio(){const query=$('audio-search').value.trim().toLowerCase();const tracks=EBOOK_MEDIA.audio.filter(a=>a.code.toLowerCase().includes(query));$('audio-list').replaceChildren();tracks.forEach(a=>{const b=document.createElement('button');b.className='audio-button';b.innerHTML='<span aria-hidden="true">▶</span> '+(a.code==='copyright'?'Copyright':a.code);b.setAttribute('aria-label','Nghe audio '+a.code);b.onclick=()=>openMedia(a.id,'Audio '+a.code,'audio');$('audio-list').append(b)});$('audio-empty').hidden=tracks.length>0}
function go(n,updateHash=true){n=Number(n);if(!Number.isInteger(n)||n<1||n>TOTAL)return;page=n;const c=currentChapter();$('section-label').textContent=page<5?'STUDENT BOOK':page-1>=112?'REFERENCE':'UNIT '+c[0];$('section-title').textContent=page===1?'Oxford Discover Futures 1':page<5?'Contents':page-1>=132?'Writing workshop':page-1>=112?'Discover vocabulary and grammar':c[2];$('page').value=page;$('page-image').src='pages/'+String(page).padStart(3,'0')+'.webp';$('page-image').alt='Oxford Discover Futures Level 1 · '+pageTitle(page);$('image-error').hidden=true;$('page-status').textContent=pageTitle(page)+' · '+page+' / '+TOTAL+' trang PDF';$('prev').disabled=page===1;$('next').disabled=page===TOTAL;document.querySelectorAll('.chapter[data-unit]').forEach(b=>{if(Number(b.dataset.unit)===c[0]&&page>=5&&page-1<112)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('page-stage').scrollTo(0,0);save('odf1-page',page);if(updateHash)history.replaceState(null,'','#page='+page);renderVideos(c[0]);if(page<TOTAL){const im=new Image();im.src='pages/'+String(page+1).padStart(3,'0')+'.webp'}}
function applyZoom(){
 const stage=$('page-stage'),im=$('page-image');
 const width=Math.max(1,stage.clientWidth-8),height=Math.max(1,stage.clientHeight-8);
 const ratio=im.naturalWidth&&im.naturalHeight?im.naturalWidth/im.naturalHeight:1500/2122;
 const base=$('fit-mode').value==='page'?Math.min(width,height*ratio):width;
 $('page-wrap').style.width=Math.floor(base*zoom)+'px';
 document.documentElement.style.setProperty('--toolbar-height',document.querySelector('.toolbar').getBoundingClientRect().height+'px');
}
function setZoom(n){zoom=Math.min(3,Math.max(.5,n));applyZoom();$('zoom-reset').textContent=Math.round(zoom*100)+'%';$('zoom-out').disabled=zoom===.5;$('zoom-in').disabled=zoom===3}
function openMedia(id,title,kind){closePanels();lastFocus=$('media-open');const modal=$('player');modal.className=kind;$('player-title').textContent=title;$('player-kind').textContent=kind.toUpperCase()+' · GOOGLE DRIVE';$('drive-link').href='https://drive.google.com/file/d/'+id+'/view';const iframe=document.createElement('iframe');iframe.src='https://drive.google.com/file/d/'+id+'/preview';iframe.title=title;iframe.allow='autoplay; fullscreen';iframe.allowFullscreen=true;$('player-host').replaceChildren(iframe);modal.showModal();$('player-close').focus()}
function stopMedia(){// Removing the browsing context stops both audio and video playback.
 $('player-host').replaceChildren();if(lastFocus?.isConnected)lastFocus.focus();}
$('player-close').onclick=()=>$('player').close();$('player').addEventListener('close',stopMedia);$('player').addEventListener('cancel',stopMedia);$('player').addEventListener('click',e=>{if(e.target===$('player')){const r=$('player').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('player').close()}});
function closePanels(){for(const [id,opener] of [['sidebar','menu'],['resources','media-open']]){if($(id).contains(document.activeElement))$(opener).focus();$(id).classList.remove('open');$(id).inert=true;$(opener).setAttribute('aria-expanded','false')}$('scrim').hidden=true}
function openPanel(id){const wasOpen=$(id).classList.contains('open');closePanels();if(!wasOpen){$(id).inert=false;$(id).classList.add('open');$('scrim').hidden=false;$(id==='sidebar'?'menu':'media-open').setAttribute('aria-expanded','true');$(id==='sidebar'?'sidebar-close':'resources-close').focus()}}
$('menu').onclick=()=>openPanel('sidebar');$('media-open').onclick=()=>openPanel('resources');$('sidebar-close').onclick=closePanels;$('resources-close').onclick=closePanels;$('scrim').onclick=closePanels;
$('prev').onclick=()=>go(page-1);$('next').onclick=()=>go(page+1);$('page').onchange=e=>go(e.target.value);$('contents').onclick=()=>{go(3);closePanels()};$('audio-search').oninput=renderAudio;$('zoom-in').onclick=()=>setZoom(zoom+.25);$('zoom-out').onclick=()=>setZoom(zoom-.25);$('zoom-reset').onclick=()=>setZoom(1);$('page-image').onerror=()=>$('image-error').hidden=false;$('page-image').onload=()=>$('image-error').hidden=true;$('retry').onclick=()=>{$('page-image').src='pages/'+String(page).padStart(3,'0')+'.webp?retry='+Date.now()};
$('page-image').onload=()=>{$('image-error').hidden=true;applyZoom()};
$('fit-mode').onchange=()=>{setZoom(1);$('page-stage').scrollTo(0,0)};
function setControlsHidden(hidden){closePanels();document.body.classList.toggle('controls-hidden',hidden);$('show-controls').hidden=!hidden;applyZoom();if(hidden)$('page-stage').focus();else $('hide-controls').focus()}
$('hide-controls').onclick=()=>setControlsHidden(true);$('show-controls').onclick=()=>setControlsHidden(false);
let noticeTimer;
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw new Error('unavailable')}catch{$('notice').textContent='Trình duyệt này chưa bật được toàn màn hình. Cô có thể bấm Ẩn để dành thêm chỗ cho sách.';$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,7000)}}
$('fullscreen').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-label',active?'Thoát toàn màn hình':'Toàn màn hình');$('fullscreen').title=active?'Thoát toàn màn hình (F hoặc Esc)':'Toàn màn hình (F)';$('fullscreen').querySelector('span').textContent=active?'Thoát toàn màn hình':'Toàn màn hình';setControlsHidden(active)});
document.addEventListener('keydown',e=>{if($('player').open)return;if(e.key==='Escape'){closePanels();if(document.body.classList.contains('controls-hidden'))setControlsHidden(false);return}if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key.toLowerCase()==='h'){e.preventDefault();setControlsHidden(!document.body.classList.contains('controls-hidden'))}if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFullscreen()}if(!$('scrim').hidden)return;if(e.key==='ArrowRight'){e.preventDefault();go(page+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1)}});
window.addEventListener('hashchange',()=>{const match=location.hash.match(/^#page=(\d+)$/);if(match)go(Number(match[1]),false)});
new ResizeObserver(applyZoom).observe($('page-stage'));
renderAudio();setZoom(1);const initial=Number(location.hash.match(/^#page=(\d+)$/)?.[1]||read('odf1-page')||5);go(Number.isInteger(initial)&&initial>=1&&initial<=TOTAL?initial:5);
