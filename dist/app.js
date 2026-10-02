'use strict';
const $=id=>document.getElementById(id);
const chapters=[[1,4,'What is the value of time?'],[2,14,'What do we remember?'],[3,26,'How do we know what’s the best?'],[4,36,'How do groups work together?'],[5,48,'What do we need to survive?'],[6,58,'How can we live with less?'],[7,70,'What is intelligence?'],[8,80,'How can we stay healthy?'],[9,92,'Why do we tell stories?'],[10,102,'What makes a good place to live?']];
const L=window.EBOOK_LIBRARY,C=window.EBOOK_COURSE;
let book='sb',page=5,testUnit=1,zoom=1,lastFocus=null,noticeTimer;
const save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const read=k=>{try{return localStorage.getItem(k)}catch{return null}};
const total=()=>book==='sb'?154:book==='wb'?L.workbookPages:L.tests[testUnit].pages;
const label=n=>n===1&&book!=='test'?'Bìa':book==='sb'?(n===154?'Trang cuối':String(n-1)):String(n);
const bookName=()=>book==='sb'?'Student Book':book==='wb'?'Workbook':'Unit Test '+testUnit;
const pagePath=n=>(book==='sb'?'pages/':book==='wb'?'workbook/':'tests/'+testUnit+'/')+String(n).padStart(3,'0')+'.webp';
const unit=()=>book==='test'?testUnit:book==='wb'?Math.min(10,Math.max(1,Math.floor((page-4)/10)+1)):([...chapters].reverse().find(c=>page-1>=c[1])||chapters[0])[0];
const button=(text,fn,cls='')=>{const b=document.createElement('button');b.textContent=text;b.onclick=fn;b.className=cls;return b};
const option=(value,text)=>{const o=document.createElement('option');o.value=value;o.textContent=text;return o};
function configurePages(){
 $('page').replaceChildren();for(let n=1;n<=total();n++)$('page').append(option(n,label(n)));
 $('book').value=book;$('test-unit').hidden=book!=='test';$('test-unit').value=testUnit;
 $('unit-test').hidden=book==='test';$('answers-open').hidden=book==='sb';
 $('audio-search').value='';renderNavigation();
}
function switchBook(next,n,u=unit()){
 if(!['sb','wb','test'].includes(next))return;
 if($('player').open)$('player').close();if($('answers').open)$('answers').close();closePanels();
 const currentUnit=unit();book=next;testUnit=Math.min(10,Math.max(1,Number(u)||1));
 configurePages();
 go(n??(book==='sb'?chapters[currentUnit-1][1]+1:book==='wb'?4+(currentUnit-1)*10:1));
}
function go(n,updateHash=true){
 n=Number(n);if(!Number.isInteger(n)||n<1||n>total())return;page=n;
 const u=unit();$('page').value=page;$('section-label').textContent=bookName();$('section-title').textContent=chapters[u-1][2];
 $('page-image').src=pagePath(page);$('page-image').alt=bookName()+' · Trang '+label(page);$('image-error').hidden=true;
 $('page-status').textContent=bookName()+' · Trang '+label(page)+' · '+page+'/'+total();
 $('prev').disabled=page===1;$('next').disabled=page===total();$('unit-test').textContent='Test U'+u;
 $('answers-open').disabled=book==='wb'&&(page<4||page>=114);
 document.querySelectorAll('.chapter[data-unit]').forEach(b=>{if(Number(b.dataset.unit)===u)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('page-stage').scrollTo(0,0);save('odf1-'+book+'-page',page);if(book==='sb')save('odf1-page',page);
 if(updateHash)history.replaceState(null,'','#'+(book==='sb'?'':'book='+book+'&')+(book==='test'?'unit='+testUnit+'&':'')+'page='+page);
 renderMedia();if(page<total()){const im=new Image();im.src=pagePath(page+1)}
}
function renderNavigation(){
 $('chapters').replaceChildren();
 chapters.forEach(([u,p,title])=>{const b=button(String(u).padStart(2,'0')+'  '+title,()=>{switchBook(book,book==='sb'?p+1:book==='wb'?4+(u-1)*10:1,u)},'chapter');b.dataset.unit=u;$('chapters').append(b)});
 const extras=book==='sb'?[[113,'Vocabulary & grammar'],[133,'Writing workshop']]:book==='wb'?[[104,'Exam preparation'],[114,'Key phrases bank'],[117,'Wordlist'],[126,'Irregular verbs']]:[];
 extras.forEach(([p,title])=>$('chapters').append(button(title,()=>{go(p);closePanels()},'chapter extra')));
}
function renderMedia(){
 const u=unit();$('video-unit').textContent='Unit '+u;$('video-list').replaceChildren();$('video-list').closest('section').hidden=book!=='sb';
 if(book==='sb')EBOOK_MEDIA.video.filter(v=>v.unit===u).sort((a,b)=>a.label.localeCompare(b.label)).forEach(v=>$('video-list').append(button('▶ '+v.label,()=>openMedia(v.id,v.label+' · Unit '+u,'video'),'media-button')));
 $('resources').querySelector('h2').textContent=book==='test'?'Nghe Unit Test '+u:bookName()+' · Nghe & xem';renderAudio();
}
function renderAudio(){
 const q=$('audio-search').value.trim().toLowerCase();
 let list=book==='sb'?EBOOK_MEDIA.audio:book==='wb'?L.workbookAudio:[{id:L.tests[testUnit].audio,code:'3.'+String(testUnit).padStart(2,'0')}];
 if(book==='wb')list=[...list].sort((a,b)=>Number(b.code.startsWith(unit()+'.'))-Number(a.code.startsWith(unit()+'.'))||a.code.localeCompare(b.code,undefined,{numeric:true}));
 list=list.filter(a=>a.code.toLowerCase().includes(q));$('audio-list').replaceChildren();
 list.forEach(a=>{const b=button('▶ '+a.code,()=>openMedia(a.id,bookName()+' · Audio '+a.code,'audio'),'audio-button');b.setAttribute('aria-label','Nghe audio '+a.code);$('audio-list').append(b)});$('audio-empty').hidden=list.length>0;
}
function openMedia(id,title,kind){
 closePanels();lastFocus=$('media-open');$('player').className=kind;$('player-title').textContent=title;$('player-kind').textContent=kind.toUpperCase()+' · GOOGLE DRIVE';$('drive-link').href='https://drive.google.com/file/d/'+id+'/view';
 const frame=document.createElement('iframe');frame.src='https://drive.google.com/file/d/'+id+'/preview';frame.title=title;frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;$('player-host').replaceChildren(frame);$('player').showModal();$('player-close').focus();
}
function stopMedia(){$('player-host').replaceChildren();if(lastFocus?.isConnected)lastFocus.focus()}
function closePanels(){
 for(const [id,opener] of [['sidebar','menu'],['resources','media-open']]){if($(id).contains(document.activeElement))$(opener).focus();$(id).classList.remove('open');$(id).inert=true;$(opener).setAttribute('aria-expanded','false')}$('scrim').hidden=true;
}
function openPanel(id){const opened=$(id).classList.contains('open');closePanels();if(!opened){$(id).inert=false;$(id).classList.add('open');$('scrim').hidden=false;$(id==='sidebar'?'menu':'media-open').setAttribute('aria-expanded','true');$(id==='sidebar'?'sidebar-close':'resources-close').focus()}}
function applyZoom(){
 const stage=$('page-stage'),im=$('page-image'),w=Math.max(1,stage.clientWidth-8),h=Math.max(1,stage.clientHeight-8);
 const ratio=im.naturalWidth&&im.naturalHeight?im.naturalWidth/im.naturalHeight:1500/2122;
 $('page-wrap').style.width=Math.floor(($('fit-mode').value==='page'?Math.min(w,h*ratio):w)*zoom)+'px';
 document.documentElement.style.setProperty('--toolbar-height',document.querySelector('.toolbar').getBoundingClientRect().height+'px');
}
function setZoom(n){zoom=Math.min(3,Math.max(.5,n));applyZoom();$('zoom-reset').textContent=Math.round(zoom*100)+'%';$('zoom-out').disabled=zoom===.5;$('zoom-in').disabled=zoom===3}
function setControlsHidden(h){closePanels();document.body.classList.toggle('controls-hidden',h);$('show-controls').hidden=!h;applyZoom();$(h?'page-stage':'hide-controls').focus()}
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error()}catch{notice('Trình duyệt chưa bật được toàn màn hình. Cô có thể bấm Ẩn để dành thêm chỗ cho sách.')}}
function notice(text){$('notice').textContent=text;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,7000)}
function openAnswers(){
 if(book==='sb')return;closePanels();$('answer-section').replaceChildren();
 if(book==='wb'){
  L.workbookAnswers.forEach((s,i)=>{const end=(L.workbookAnswers[i+1]?.page||114)-1;$('answer-section').append(option(i,'Trang '+s.page+(end>s.page?'–'+end:'')+' · '+s.title))});
  const idx=L.workbookAnswers.findLastIndex(s=>s.page<=page);$('answer-section').value=Math.max(0,idx);
 }else{for(let u=1;u<=10;u++)$('answer-section').append(option(u,'Unit Test '+u+' · Đáp án & lời thoại'));$('answer-section').value=testUnit}
 renderAnswers();$('answers').showModal();$('answers-close').focus();
}
function renderAnswers(){
 const s=book==='wb'?L.workbookAnswers[Number($('answer-section').value)]:null;
 const paths=s?s.images:C.testAnswers[$('answer-section').value];
 $('answers-title').textContent=s?'Workbook · '+s.title+' · Trang '+s.page:'Unit Test '+$('answer-section').value+' · Đáp án';
 $('answer-images').replaceChildren();paths.forEach((path,i)=>{const im=document.createElement('img');im.src=path;im.alt=$('answers-title').textContent+' · phần '+(i+1);im.loading='lazy';$('answer-images').append(im)});$('answers').scrollTop=0;
}
function showNav(lessons){$('chapters').hidden=lessons;$('lessons').hidden=!lessons;$('nav-units').setAttribute('aria-pressed',String(!lessons));$('nav-lessons').setAttribute('aria-pressed',String(lessons))}
function renderLessons(){
 $('lesson-list').replaceChildren();const filter=$('lesson-unit').value;
 C.lessons.filter(l=>filter==='all'||String(l.unit||'extra')===filter).forEach(l=>{
  const card=document.createElement('article');card.className='lesson-card';
  const h=document.createElement('h3');h.textContent='Buổi '+l.number+(l.unit?' · Unit '+l.unit:'');card.append(h);
  const p=document.createElement('p');p.textContent=l.title;card.append(p);
  const links=document.createElement('div');links.className='lesson-links';
  l.studentPdf.forEach(n=>links.append(button('SB '+(n-1),()=>switchBook('sb',n))));
  if(l.unit&&l.stage===0&&!l.studentPdf.length)links.append(button('Student Book',()=>switchBook('sb',chapters[l.unit-1][1]+1)));
  if(l.unit&&l.stage>=4)links.append(button(l.stage===4?'Mở Unit Test':'Chữa Unit Test',()=>switchBook('test',1,l.unit)));
  if(l.unit&&l.stage===5&&l.number!==56){const lit={6:138,18:142,30:146,44:150}[l.number];if(lit)links.append(button('Literature',()=>switchBook('sb',lit+1)))}
  card.append(links);
  if(l.homework){const hw=document.createElement('p');hw.className='hint';hw.textContent='BTVN: '+l.homework;card.append(hw);const ws=document.createElement('div');ws.className='lesson-links';l.workbook.forEach(n=>ws.append(button('WB '+n,()=>switchBook('wb',n))));card.append(ws)}
  const previous=C.lessons.find(x=>x.number===l.number-1);if(previous?.workbook.length){const check=button('Chữa bài đầu giờ · WB '+previous.workbook.join(', '),()=>switchBook('wb',previous.workbook[0]),'homework-check');card.append(check)}
  const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Ghi chú Program gốc';detail.append(summary);const note=document.createElement('p');note.textContent=l.number===56?'UNIT 9 TEST RETURN':l.original;detail.append(note);card.append(detail);$('lesson-list').append(card);
 });
}
$('book').onchange=e=>switchBook(e.target.value);$('test-unit').onchange=e=>switchBook('test',1,e.target.value);$('unit-test').onclick=()=>switchBook('test',1,unit());
for(let u=1;u<=10;u++){$('test-unit').append(option(u,'Unit '+u));$('lesson-unit').append(option(u,'Unit '+u))}$('lesson-unit').append(option('extra','Ôn tập & phỏng vấn'));
$('nav-units').onclick=()=>showNav(false);$('nav-lessons').onclick=()=>showNav(true);$('lesson-unit').onchange=renderLessons;
$('answers-open').onclick=openAnswers;$('answer-section').onchange=renderAnswers;$('answers-close').onclick=()=>$('answers').close();$('answers').addEventListener('close',()=>{$('answer-images').replaceChildren();$('answers-open').focus()});
$('player-close').onclick=()=>$('player').close();$('player').addEventListener('close',stopMedia);$('player').addEventListener('cancel',stopMedia);
for(const id of ['player','answers'])$(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close()});
$('menu').onclick=()=>openPanel('sidebar');$('media-open').onclick=()=>openPanel('resources');$('sidebar-close').onclick=closePanels;$('resources-close').onclick=closePanels;$('scrim').onclick=closePanels;
$('prev').onclick=()=>go(page-1);$('next').onclick=()=>go(page+1);$('page').onchange=e=>go(e.target.value);$('contents').onclick=()=>{go(book==='test'?1:3);closePanels()};$('audio-search').oninput=renderAudio;
$('zoom-in').onclick=()=>setZoom(zoom+.25);$('zoom-out').onclick=()=>setZoom(zoom-.25);$('zoom-reset').onclick=()=>setZoom(1);$('fit-mode').onchange=()=>{setZoom(1);$('page-stage').scrollTo(0,0)};
$('page-image').onerror=()=>$('image-error').hidden=false;$('page-image').onload=()=>{$('image-error').hidden=true;applyZoom()};$('retry').onclick=()=>{$('page-image').src=pagePath(page)+'?retry='+Date.now()};
$('hide-controls').onclick=()=>setControlsHidden(true);$('show-controls').onclick=()=>setControlsHidden(false);$('fullscreen').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-label',active?'Thoát toàn màn hình':'Toàn màn hình');$('fullscreen').title=active?'Thoát toàn màn hình (F hoặc Esc)':'Toàn màn hình (F)';setControlsHidden(active)});
document.addEventListener('keydown',e=>{if($('player').open||$('answers').open)return;if(e.key==='Escape'){closePanels();if(document.body.classList.contains('controls-hidden'))setControlsHidden(false);return}if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key.toLowerCase()==='h'){e.preventDefault();setControlsHidden(!document.body.classList.contains('controls-hidden'))}if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFullscreen()}if(!$('scrim').hidden)return;if(e.key==='ArrowRight'){e.preventDefault();go(page+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1)}});
function loadHash(){const h=new URLSearchParams(location.hash.slice(1));const b=h.get('book')||'sb';const u=Number(h.get('unit'))||1;let n=Number(h.get('page'))||Number(read('odf1-'+b+'-page'))||Number(b==='sb'?read('odf1-page'):b==='wb'?4:1)||5;if(!['sb','wb','test'].includes(b))return;book=b;testUnit=Math.min(10,Math.max(1,Math.floor(u)));configurePages();go(Math.min(total(),Math.max(1,Math.floor(n))))}
window.addEventListener('hashchange',loadHash);new ResizeObserver(applyZoom).observe($('page-stage'));
renderLessons();loadHash();setZoom(1);

