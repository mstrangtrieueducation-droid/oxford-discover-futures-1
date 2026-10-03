'use strict';
const $=id=>document.getElementById(id);
const chapters=[[1,4,'What is the value of time?'],[2,14,'What do we remember?'],[3,26,'How do we know what’s the best?'],[4,36,'How do groups work together?'],[5,48,'What do we need to survive?'],[6,58,'How can we live with less?'],[7,70,'What is intelligence?'],[8,80,'How can we stay healthy?'],[9,92,'Why do we tell stories?'],[10,102,'What makes a good place to live?']];
const L=window.EBOOK_LIBRARY,C=window.EBOOK_COURSE;
let book='sb',page=5,testUnit=1,zoom=1,lastFocus=null,noticeTimer;
const save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const read=k=>{try{return localStorage.getItem(k)}catch{return null}};
const total=()=>book==='sb'?154:book==='wb'?L.workbookPages:L.tests[testUnit].pages;
const label=n=>n===1&&book!=='test'?'Cover':book==='sb'?(n===154?'Last page':String(n-1)):String(n);
const bookName=()=>book==='sb'?'Student Book':book==='wb'?'Workbook':'Unit Test '+testUnit;
const pagePath=n=>(book==='sb'?'pages-original/':book==='wb'?'workbook-original/':'tests/'+testUnit+'/')+String(n).padStart(3,'0')+(book==='test'?'.webp':'.jpg');
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
 $('page-wrap').classList.add('loading');$('page-image').dataset.fallback='false';$('page-image').src=pagePath(page);$('page-image').alt=bookName()+' · Page '+label(page);$('image-error').hidden=true;
 $('page-status').textContent=bookName()+' · Page '+label(page)+' · '+page+'/'+total();
 $('prev').disabled=page===1;$('next').disabled=page===total();$('unit-test').textContent='Test U'+u;
 $('answers-open').disabled=book==='wb'&&(page<4||page>=114);
 document.querySelectorAll('.chapter[data-unit]').forEach(b=>{if(Number(b.dataset.unit)===u)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $('page-stage').scrollTo(0,0);save('odf1-'+book+'-page',page);if(book==='sb')save('odf1-page',page);
 if(updateHash)history.replaceState(null,'','#'+(book==='sb'?'':'book='+book+'&')+(book==='test'?'unit='+testUnit+'&':'')+'page='+page);
 renderMedia();prepareInlineAudio();renderHotspots();renderLessonBar();if(page<total()){const im=new Image();im.src=pagePath(page+1)}
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
 $('resources').querySelector('h2').textContent=book==='test'?'Unit Test audio '+u:bookName()+' · Audio & video';renderAudio();
}
function renderAudio(){
 const q=$('audio-search').value.trim().toLowerCase();
 let list=book==='sb'?EBOOK_MEDIA.audio:book==='wb'?L.workbookAudio:[{id:L.tests[testUnit].audio,code:'3.'+String(testUnit).padStart(2,'0')}];
 if(book==='wb')list=[...list].sort((a,b)=>Number(b.code.startsWith(unit()+'.'))-Number(a.code.startsWith(unit()+'.'))||a.code.localeCompare(b.code,undefined,{numeric:true}));
 list=list.filter(a=>a.code.toLowerCase().includes(q));$('audio-list').replaceChildren();
 list.forEach(a=>{const b=button('▶ '+a.code,()=>openMedia(a.id,bookName()+' · Audio '+a.code,'audio'),'audio-button');b.setAttribute('aria-label','Play audio '+a.code);$('audio-list').append(b)});$('audio-empty').hidden=list.length>0;
}
function openMedia(id,title,kind){
 if(kind==='audio'){selectInlineAudio(id);closePanels();return}
 closeInlineAudio();
 closePanels();lastFocus=$('media-open');$('player').className=kind;$('player-title').textContent=title;$('player-kind').textContent=kind.toUpperCase()+' · GOOGLE DRIVE';$('drive-link').href='https://drive.google.com/file/d/'+id+'/view';
 const frame=document.createElement('iframe');frame.src='https://drive.google.com/file/d/'+id+'/preview?hl=en';frame.title=title;frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;$('player-host').replaceChildren(frame);$('player').showModal();$('player-close').focus();
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
 document.documentElement.style.setProperty('--toolbar-height',($('page-stage').getBoundingClientRect().top)+'px');
 updatePanControls();
}
function setZoom(n,point){
 const stage=$('page-stage'),sr=stage.getBoundingClientRect(),old=$('page-image').getBoundingClientRect();
 const x=point?.x??sr.left+stage.clientWidth/2,y=point?.y??sr.top+stage.clientHeight/2;
 const nx=(x-old.left)/old.width,ny=(y-old.top)/old.height;
 zoom=Math.min(3,Math.max(.5,n));applyZoom();
 const next=$('page-image').getBoundingClientRect();stage.scrollBy(next.left+nx*next.width-x,next.top+ny*next.height-y);
 $('zoom-reset').textContent=Math.round(zoom*100)+'%';$('zoom-out').disabled=zoom===.5;$('zoom-in').disabled=zoom===3;
}
function setControlsHidden(h){closePanels();document.body.classList.toggle('controls-hidden',h);$('show-controls').hidden=!h;applyZoom();$(h?'page-stage':'hide-controls').focus()}
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error()}catch{notice('Fullscreen is unavailable in this browser. Use Hide to give the book more space.')}}
function notice(text){$('notice').textContent=text;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,7000)}
function openAnswers(){
 if(book==='sb')return;closePanels();$('answer-section').replaceChildren();
 if(book==='wb'){
  L.workbookAnswers.forEach((s,i)=>{const end=(L.workbookAnswers[i+1]?.page||114)-1;$('answer-section').append(option(i,'Page '+s.page+(end>s.page?'–'+end:'')+' · '+s.title))});
  const idx=L.workbookAnswers.findLastIndex(s=>s.page<=page);$('answer-section').value=Math.max(0,idx);
 }else{for(let u=1;u<=10;u++)$('answer-section').append(option(u,'Unit Test '+u+' · Answer key & scripts'));$('answer-section').value=testUnit}
 renderAnswers();$('answers').showModal();$('answers-close').focus();
}
function renderAnswers(){
 const s=book==='wb'?L.workbookAnswers[Number($('answer-section').value)]:null;
 const paths=s?s.images:C.testAnswers[$('answer-section').value];
 $('answers-title').textContent=s?'Workbook · '+s.title+' · Page '+s.page:'Unit Test '+$('answer-section').value+' · Answer key';
 $('answer-images').replaceChildren();paths.forEach((path,i)=>{const im=document.createElement('img');im.src=path;im.alt=$('answers-title').textContent+' · part '+(i+1);im.loading='lazy';$('answer-images').append(im)});$('answers').scrollTop=0;
}
function showNav(lessons){$('chapters').hidden=lessons;$('lessons').hidden=!lessons;$('nav-units').setAttribute('aria-pressed',String(!lessons));$('nav-lessons').setAttribute('aria-pressed',String(lessons))}
function renderLessons(){
 $('lesson-list').replaceChildren();const filter=$('lesson-unit').value;
 C.lessons.filter(l=>filter==='all'||String(l.unit||'extra')===filter).forEach(l=>{
  const card=document.createElement('article');card.className='lesson-card';
  const h=document.createElement('h3');h.textContent='Lesson '+l.number+(l.unit?' · Unit '+l.unit:'');card.append(h);
  card.append(button('Start lesson '+l.number,()=>startLesson(l.number),'lesson-start'));
  const review=document.createElement('div');review.className='lesson-review-block';const rh=document.createElement('h4');rh.textContent='1. Warm-up · Review previous Workbook homework';review.append(rh);
  const previous=C.lessons.find(x=>x.number===l.number-1);const reviewLinks=document.createElement('div');reviewLinks.className='lesson-links';
  if(previous?.workbook.length)previous.workbook.forEach(n=>reviewLinks.append(button('WB '+n,()=>{activeLesson=l.number;lessonPhase='review';switchBook('wb',n);saveLesson()})));
  else{const empty=document.createElement('p');empty.textContent=l.number===1?'First lesson: no previous homework to review.':'No previous Workbook assignment is specified in the program.';review.append(empty)}
  review.append(reviewLinks);card.append(review);
  const p=document.createElement('p');p.textContent='2. Lesson · '+l.title;card.append(p);
  const links=document.createElement('div');links.className='lesson-links';
  l.studentPdf.forEach(n=>links.append(button('SB '+(n-1),()=>switchBook('sb',n))));
  if(l.unit&&l.stage===0&&!l.studentPdf.length)links.append(button('Student Book',()=>switchBook('sb',chapters[l.unit-1][1]+1)));
  if(l.unit&&l.stage>=4)links.append(button(l.stage===4?'Open Unit Test':'Review Unit Test',()=>switchBook('test',1,l.unit)));
  if(l.unit&&l.stage===5&&l.number!==56){const lit={6:138,18:142,30:146,44:150}[l.number];if(lit)links.append(button('Literature',()=>switchBook('sb',lit+1)))}
  card.append(links);
  if(l.homework){const hw=document.createElement('p');hw.className='hint';hw.textContent='3. Homework: '+l.homework+' · review at the start of lesson '+(l.number+1);card.append(hw);const ws=document.createElement('div');ws.className='lesson-links';l.workbook.forEach(n=>ws.append(button('WB '+n,()=>switchBook('wb',n))));card.append(ws)}
  const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Original program notes';detail.append(summary);const note=document.createElement('p');note.textContent=l.number===56?'UNIT 9 TEST RETURN':l.original;detail.append(note);card.append(detail);$('lesson-list').append(card);
 });
}
let activeLesson=null,lessonPhase='review',inlineScope='',inlineTrack='',inlineOpen=false,audioOpener=null;
function renderHotspots(){
 const spots=window.EBOOK_HOTSPOTS[book]?.[book==='test'?testUnit+'-'+page:page]||[];
 const host=$('page-hotspots');host.replaceChildren();
 let firstAudio=null;
 spots.forEach(s=>{
  const media=s.kind==='audio'?inlineTracks().find(t=>t.code===s.code):EBOOK_MEDIA.video.find(v=>v.unit===s.unit&&v.label===s.label);
  const title=s.kind==='audio'?'Audio '+s.code:s.label+' · Unit '+s.unit;
  const b=button('',()=>{if(!media){notice('Audio '+s.code+' is not included in the supplied media files.');return}audioOpener=b;openMedia(media.id,title,s.kind)},'page-hotspot '+s.kind+(book!=='sb'||page>=113&&page<=132?' compact':''));
  b.style.left=s.x+'%';b.style.top=s.y+'%';b.title=media?'Play '+title:title+' · File not supplied';b.setAttribute('aria-label',b.title);
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  if(!media){b.classList.add('unavailable');b.textContent='!';b.setAttribute('aria-disabled','true')}
  host.append(b);if(s.kind==='audio'&&media&&!firstAudio)firstAudio=media;
 });
 // Preload only the first matching page track, out of view, without autoplay.
 if(!inlineOpen){if(firstAudio)loadInlineTrack(firstAudio.id);else{$('audio-inline-host').replaceChildren();inlineTrack=''}}
}
function saveLesson(){save('odf1-active-lesson',activeLesson||'');save('odf1-lesson-phase',lessonPhase)}
function lessonData(){return C.lessons.find(l=>l.number===activeLesson)}
function reviewPages(l){return C.lessons.find(p=>p.number===l.number-1)?.workbook||[]}
function lessonTargets(l){
 if(lessonPhase==='review')return reviewPages(l).map(n=>({book:'wb',page:n,label:'WB '+n}));
 if(lessonPhase==='homework')return l.workbook.map(n=>({book:'wb',page:n,label:'WB '+n}));
 const targets=l.studentPdf.map(n=>({book:'sb',page:n,label:'SB '+(n-1)}));
 if(l.unit&&l.stage>=4)targets.unshift({book:'test',page:1,unit:l.unit,label:'Test U'+l.unit});
 const lit={6:139,18:143,30:147,44:151}[l.number];if(lit)targets.push({book:'sb',page:lit,label:'Literature'});
 if(!targets.length&&l.unit)targets.push({book:'sb',page:chapters[l.unit-1][1]+1,label:'Student Book'});
 return targets;
}
function startLesson(n){activeLesson=Number(n);lessonPhase=activeLesson===1?'main':'review';saveLesson();openLessonPhase(lessonPhase)}
function openLessonPhase(phase){
 lessonPhase=phase;const l=lessonData();if(!l)return;saveLesson();const targets=lessonTargets(l);
 if(targets.length){const t=targets[0];switchBook(t.book,t.page,t.unit||l.unit||1)}
 else{closePanels();renderLessonBar();notice(phase==='review'?'The program does not specify the previous Workbook assignment. Select a Workbook page to review.':phase==='homework'?'No homework is specified for this lesson in the program.':l.title)}
}
function renderLessonBar(){
 const l=lessonData();$('lesson-bar').hidden=!l;if(!l)return;$('active-lesson').value=l.number;
 for(const [id,phase] of [['lesson-review','review'],['lesson-main','main'],['lesson-homework','homework']])$(id).setAttribute('aria-pressed',String(lessonPhase===phase));
 const targets=lessonTargets(l);$('lesson-pages').replaceChildren();
 if(!targets.length){const span=document.createElement('span');span.textContent=lessonPhase==='review'?'Previous WB pages not specified':lessonPhase==='homework'?'Homework not specified':l.title;$('lesson-pages').append(span);if(lessonPhase==='review')$('lesson-pages').append(button('Open Workbook',()=>switchBook('wb',Number(read('odf1-wb-page'))||4)))}
 targets.forEach(t=>{const b=button(t.label,()=>switchBook(t.book,t.page,t.unit||l.unit||1));if(book===t.book&&page===t.page&&(t.book!=='test'||testUnit===t.unit))b.setAttribute('aria-current','page');$('lesson-pages').append(b)});
 $('lesson-next').disabled=l.number===64;requestAnimationFrame(applyZoom);
}
function inlineTracks(){return book==='sb'?EBOOK_MEDIA.audio:book==='wb'?L.workbookAudio:[{id:L.tests[testUnit].audio,code:'3.'+String(testUnit).padStart(2,'0')}]}
function prepareInlineAudio(){
 const scope=book+(book==='test'?testUnit:'');if(scope===inlineScope)return;
 inlineScope=scope;const tracks=inlineTracks();$('audio-track').replaceChildren();
 [...tracks].sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true})).forEach(t=>$('audio-track').append(option(t.id,t.code)));
 const remembered=read('odf1-audio-'+scope);const preferred=tracks.find(t=>t.id===remembered)||tracks.find(t=>book==='wb'&&t.code===(page>=104?'11.'+String(Math.min(5,Math.floor((page-104)/2)+1)).padStart(2,'0'):unit()+'.01'))||tracks[0];
 $('audio-track').value=preferred.id;$('audio-book-label').textContent=book==='sb'?'SB · Audio':book==='wb'?'WB · Audio':'Test '+testUnit;
 if(inlineOpen)loadInlineTrack(preferred.id);else inlineTrack='';
}
function loadInlineTrack(id){
 const track=inlineTracks().find(t=>t.id===id);if(!track)return;
 $('audio-track').value=id;$('audio-drive-link').href='https://drive.google.com/file/d/'+id+'/view';save('odf1-audio-'+inlineScope,id);
 if(inlineTrack===id&&$('audio-inline-host').firstChild)return;
 inlineTrack=id;const frame=document.createElement('iframe');frame.src='https://drive.google.com/file/d/'+id+'/preview?hl=en';frame.title=bookName()+' · Audio '+track.code;frame.allow='autoplay';$('audio-inline-host').replaceChildren(frame);
}
function selectInlineAudio(id){inlineOpen=true;$('audio-dock').hidden=false;$('audio-dock').classList.remove('minimized');$('audio-minimize').textContent='−';$('audio-minimize').setAttribute('aria-label','Minimize audio');$('audio-toggle').setAttribute('aria-expanded','true');loadInlineTrack(id)}
function closeInlineAudio(){inlineOpen=false;$('audio-inline-host').replaceChildren();inlineTrack='';$('audio-dock').hidden=true;$('audio-toggle').setAttribute('aria-expanded','false');if($('audio-dock').contains(document.activeElement)&&audioOpener?.isConnected)audioOpener.focus({preventScroll:true})}
function updatePanControls(){const stage=$('page-stage'),overflow=stage.scrollWidth>stage.clientWidth+2;$('pan-controls').hidden=!overflow;$('pan-left').disabled=stage.scrollLeft<=1;$('pan-right').disabled=stage.scrollLeft>=stage.scrollWidth-stage.clientWidth-1}
function initializeClassroom(){
 activeLesson=Number(read('odf1-active-lesson'))||null;lessonPhase=['review','main','homework'].includes(read('odf1-lesson-phase'))?read('odf1-lesson-phase'):'review';
 C.lessons.forEach(l=>$('active-lesson').append(option(l.number,'Lesson '+l.number)));
 $('active-lesson').onchange=e=>startLesson(e.target.value);$('lesson-review').onclick=()=>openLessonPhase('review');$('lesson-main').onclick=()=>openLessonPhase('main');$('lesson-homework').onclick=()=>openLessonPhase('homework');$('lesson-next').onclick=()=>startLesson(activeLesson+1);$('lesson-exit').onclick=()=>{activeLesson=null;saveLesson();renderLessonBar()};
 $('lesson-open').onclick=()=>{openPanel('sidebar');showNav(true);$('nav-lessons').focus()};
 $('audio-track').onchange=e=>selectInlineAudio(e.target.value);$('audio-close').onclick=closeInlineAudio;$('audio-toggle').onclick=()=>inlineOpen?closeInlineAudio():selectInlineAudio($('audio-track').value);
 $('audio-minimize').onclick=()=>{const minimized=$('audio-dock').classList.toggle('minimized');$('audio-minimize').textContent=minimized?'+':'−';$('audio-minimize').setAttribute('aria-label',minimized?'Expand audio':'Minimize audio')};
 const stage=$('page-stage');let drag=null;
 stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0||e.target.closest('button,a,input,select'))return;e.preventDefault();stage.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging')});
 stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;stage.scrollLeft=drag.left+drag.x-e.clientX;stage.scrollTop=drag.top+drag.y-e.clientY});
 const release=()=>{drag=null;stage.classList.remove('dragging')};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 stage.addEventListener('wheel',e=>{if(!$('scrim').hidden||$('answers').open||$('player').open)return;e.preventDefault();if(e.shiftKey){stage.scrollBy(e.deltaY||e.deltaX,0);return}if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&!e.ctrlKey){stage.scrollBy(e.deltaX,e.deltaY);return}const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);setZoom(zoom*Math.exp(-Math.max(-150,Math.min(150,delta))*.002),{x:e.clientX,y:e.clientY})},{passive:false});
 stage.addEventListener('scroll',updatePanControls,{passive:true});$('pan-left').onclick=()=>stage.scrollBy({left:-stage.clientWidth*.6,behavior:'smooth'});$('pan-right').onclick=()=>stage.scrollBy({left:stage.clientWidth*.6,behavior:'smooth'});
}

$('book').onchange=e=>switchBook(e.target.value);$('test-unit').onchange=e=>switchBook('test',1,e.target.value);$('unit-test').onclick=()=>switchBook('test',1,unit());
for(let u=1;u<=10;u++){$('test-unit').append(option(u,'Unit '+u));$('lesson-unit').append(option(u,'Unit '+u))}$('lesson-unit').append(option('extra','Revision & interviews'));
$('nav-units').onclick=()=>showNav(false);$('nav-lessons').onclick=()=>showNav(true);$('lesson-unit').onchange=renderLessons;
$('answers-open').onclick=openAnswers;$('answer-section').onchange=renderAnswers;$('answers-close').onclick=()=>$('answers').close();$('answers').addEventListener('close',()=>{$('answer-images').replaceChildren();$('answers-open').focus()});
$('player-close').onclick=()=>$('player').close();$('player').addEventListener('close',stopMedia);$('player').addEventListener('cancel',stopMedia);
for(const id of ['player','answers'])$(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close()});
$('menu').onclick=()=>openPanel('sidebar');$('media-open').onclick=()=>openPanel('resources');$('sidebar-close').onclick=closePanels;$('resources-close').onclick=closePanels;$('scrim').onclick=closePanels;
$('prev').onclick=()=>go(page-1);$('next').onclick=()=>go(page+1);$('page').onchange=e=>go(e.target.value);$('contents').onclick=()=>{go(book==='test'?1:3);closePanels()};$('audio-search').oninput=renderAudio;
$('zoom-in').onclick=()=>setZoom(zoom+.25);$('zoom-out').onclick=()=>setZoom(zoom-.25);$('zoom-reset').onclick=()=>setZoom(1);$('fit-mode').onchange=()=>{setZoom(1);$('page-stage').scrollTo(0,0)};
$('page-image').onerror=()=>{const im=$('page-image');if(book!=='test'&&im.dataset.fallback!=='true'){im.dataset.fallback='true';im.src=(book==='sb'?'pages/':'workbook/')+String(page).padStart(3,'0')+'.webp'}else $('image-error').hidden=false};$('page-image').onload=()=>{$('page-wrap').classList.remove('loading');$('image-error').hidden=true;applyZoom()};$('retry').onclick=()=>{$('page-image').src=pagePath(page)+'?retry='+Date.now()};
$('hide-controls').onclick=()=>setControlsHidden(true);$('show-controls').onclick=()=>setControlsHidden(false);$('fullscreen').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-label',active?'Exit fullscreen':'Fullscreen');$('fullscreen').title=active?'Exit fullscreen (F or Esc)':'Fullscreen (F)';setControlsHidden(active)});
document.addEventListener('keydown',e=>{
 if($('player').open||$('answers').open)return;
 if(e.key==='Escape'){closePanels();if(inlineOpen)closeInlineAudio();if(document.body.classList.contains('controls-hidden'))setControlsHidden(false);return}
 if(e.ctrlKey||e.metaKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;
 if(e.altKey){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(page+(e.key==='ArrowRight'?1:-1))}return}
 if(e.key.toLowerCase()==='h'){e.preventDefault();setControlsHidden(!document.body.classList.contains('controls-hidden'))}
 if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFullscreen()}
 if(!$('scrim').hidden)return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const dir=e.key==='ArrowRight'?1:-1;const stage=$('page-stage');if(stage.scrollWidth>stage.clientWidth+2)stage.scrollBy({left:dir*stage.clientWidth*.5,behavior:'smooth'});else go(page+dir)}
});
function loadHash(){const h=new URLSearchParams(location.hash.slice(1));const b=h.get('book')||'sb';const u=Number(h.get('unit'))||1;let n=Number(h.get('page'))||Number(read('odf1-'+b+'-page'))||Number(b==='sb'?read('odf1-page'):b==='wb'?4:1)||5;if(!['sb','wb','test'].includes(b))return;book=b;testUnit=Math.min(10,Math.max(1,Math.floor(u)));configurePages();go(Math.min(total(),Math.max(1,Math.floor(n))))}
window.addEventListener('hashchange',loadHash);new ResizeObserver(applyZoom).observe($('page-stage'));
initializeClassroom();renderLessons();loadHash();setZoom(1);

