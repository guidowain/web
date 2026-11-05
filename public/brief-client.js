(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement,app=$('.app'),flow=$('#flow'),editionId=app.dataset.edition,total=Number(app.dataset.total)||0;
const stories=$$('.story'),endEl=$('#fin'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const toastEl=$('#toast');let toastTimer;
function toast(text,ms=2800){toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),ms);}
function savePrefs(){document.cookie=`brief-prefs=${root.dataset.theme}.${root.dataset.size}.${root.dataset.mode};path=/;max-age=31536000;samesite=lax${location.protocol==='https:'?';secure':''}`;}
function syncThemeColor(){const dark=root.dataset.theme==='oscuro'||(root.dataset.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);$$('meta[name=theme-color]').forEach(m=>m.content=dark?'#111216':'#fbfaf7');}
syncThemeColor();matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',syncThemeColor);

// Imágenes: un fallo no deja recuadros vacíos.
$$('.article-image img').forEach(img=>{const hide=()=>img.closest('figure').hidden=true;img.addEventListener('error',hide);if(img.complete&&!img.naturalWidth)hide();});
$$('time.ago').forEach(t=>{const d=new Date(t.dateTime),m=(Date.now()-d)/60000;if(!isFinite(m))return;
 t.textContent=m<60?`hace ${Math.max(1,Math.round(m))} min`:m<1440?`hace ${Math.round(m/60)} h`:m<2880?'ayer':d.toLocaleDateString('es-AR',{day:'numeric',month:'short'});});

// ---- Navegación: lista o una por vez ----
const slides=()=>stories.concat(endEl);
let current=stories[0]||endEl;
const una=()=>root.dataset.mode==='una';
// Mientras dura un desplazamiento programado, el destino manda: los toques rápidos no se pierden.
let navTarget=null,settleTimer,jumpUntil=0;
function settle(delay){clearTimeout(settleTimer);settleTimer=setTimeout(()=>{navTarget=null;onScroll();},delay);}
function goTo(el,smooth=true){if(!el)return;const behavior=smooth&&!reduce?'smooth':'auto';
 if(una()){const i=slides().indexOf(el);if(i>=0){navTarget=el;settle(behavior==='smooth'?700:80);flow.scrollTo({left:i*flow.clientWidth,behavior});}}
 else{if(behavior==='smooth')jumpUntil=Date.now()+1000;el.scrollIntoView({behavior,block:'start'});}
 setCurrent(el);}
function go(delta){const list=slides();goTo(list[Math.max(0,Math.min(list.length-1,list.indexOf(current)+delta))]);}
function setMode(mode,target){const keep=target||current;root.dataset.mode=mode;savePrefs();
 const b=$('#modo');b.setAttribute('aria-pressed',String(mode==='una'));b.setAttribute('aria-label',mode==='una'?'Ver como lista':'Leer una por vez');
 requestAnimationFrame(()=>goTo(keep,false));updateDock();}
$('#modo').addEventListener('click',()=>setMode(una()?'lista':'una'));
let seenTimer;
function setCurrent(el){if(!el||el===current)return;current=el;updateDock();
 if(el.classList.contains('story')){clearTimeout(seenTimer);if(una())seenTimer=setTimeout(()=>{if(current===el)markSeen(el.dataset.id)},1500);}
 if(una())store.set('brief-pos:'+editionId,el.id);}
let ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;
 if(una()){if(navTarget){settle(150);return;}setCurrent(slides()[Math.round(flow.scrollLeft/Math.max(1,flow.clientWidth))]);return;}
 const line=innerHeight*.35;let found=stories[0]||endEl;for(const el of slides()){if(el.getBoundingClientRect().top<=line)found=el;else break;}setCurrent(found);});}
flow.addEventListener('scroll',onScroll,{passive:true});addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',()=>{if(una())goTo(current,false);});
$('#dock-prev').addEventListener('click',()=>go(-1));
$('#dock-next').addEventListener('click',()=>go(1));
function updateDock(){const isStory=current.classList.contains('story'),list=slides(),i=list.indexOf(current);
 $('#dock-pos').textContent=isStory?`${Number(current.dataset.index)+1} de ${total}`:'Fin';
 $('#dock-title').textContent=isStory?$('h2',current).textContent:'Fin de la edición';
 $('#dock-prev').disabled=i<=0;$('#dock-next').disabled=i>=list.length-1;}

// ---- Progreso de lectura (en el dispositivo) ----
const seenKey='brief-seen:'+editionId;let seen=new Set();try{seen=new Set(JSON.parse(store.get(seenKey)||'[]'))}catch{}
function markSeen(id){if(!id||seen.has(id))return;seen.add(id);store.set(seenKey,JSON.stringify(Array.from(seen)));updateProgress();}
function updateProgress(){const n=stories.filter(s=>seen.has(s.dataset.id)).length;$('.progress span').style.width=(total?n/total*100:0)+'%';}
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!una()&&Date.now()>jumpUntil)markSeen(e.target.closest('.story').dataset.id)}),{rootMargin:'0px 0px -10% 0px'});
 stories.forEach(s=>io.observe($('.article-actions',s)));}
const firstUnseen=()=>stories.find(s=>!seen.has(s.dataset.id))||stories[0];
updateProgress();

// ---- Teclado ----
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]')||$('dialog[open]'))return;
 const k=e.key.toLowerCase();
 if(k==='arrowright'||k==='j'){e.preventDefault();go(1);}
 else if(k==='arrowleft'||k==='k'){e.preventDefault();go(-1);}
 else if(k==='u')setMode(una()?'lista':'una');
 else if(k==='o'&&current.classList.contains('story'))window.open($('.original',current).href,'_blank','noopener');
 else if(k==='escape'&&una())setMode('lista');});

// ---- Lectura sincronizada y edición nueva ----
const readButton=$('#marcar-leida'),readStatus=$('#lectura-estado');let readKnown=false,loading=false,alreadyRead=false,hiddenAt=0;
function showRead(){alreadyRead=true;readButton.hidden=true;readStatus.textContent='✓ Edición leída';}
async function refreshState(){if(loading)return;loading=true;
 try{const r=await fetch('/api/brief/estado',{cache:'no-store'});
  if(r.status===401){readButton.hidden=true;readStatus.innerHTML='<a href="/brief/login">Entrar para guardar lectura</a>';return;}
  if(!r.ok)throw Error();const data=await r.json();readKnown=true;
  if(data.leidas.includes(editionId))showRead();else if(!alreadyRead){readButton.hidden=false;readButton.textContent='Ya leí esta edición';readStatus.textContent='';}
  if(data.ultima&&data.ultima.id!==editionId)$('#nueva').hidden=false;}
 catch{if(!alreadyRead){readKnown=false;readButton.hidden=false;readButton.textContent='Comprobar lectura';readStatus.textContent=navigator.onLine?'No se pudo comprobar la lectura.':'Sin conexión.';}}
 finally{loading=false;}}
readButton.addEventListener('click',async()=>{if(!readKnown){await refreshState();return;}readButton.disabled=true;
 try{const r=await fetch('/api/brief/lecturas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[editionId]})});
  if(r.status===401){location.href='/brief/login';return;}if(!r.ok)throw Error();showRead();}
 catch{readStatus.textContent='Lectura no guardada. Reintentá.';}finally{readButton.disabled=false;}});
// Al volver a la app tras un rato largo, pasar directo a la edición nueva (iOS no tiene botón de recarga en modo app).
document.addEventListener('visibilitychange',async()=>{if(document.hidden){hiddenAt=Date.now();return;}
 if(!hiddenAt||Date.now()-hiddenAt<20*60000)return;hiddenAt=0;
 try{const r=await fetch('/api/brief/estado',{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d.ultima&&d.ultima.id!==editionId)location.replace('/brief');}catch{}});
addEventListener('pageshow',refreshState);addEventListener('focus',refreshState);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshState();});
setInterval(()=>{if(!document.hidden)refreshState();},60000);refreshState();
addEventListener('offline',()=>toast('Sin conexión. Podés seguir leyendo.'));addEventListener('online',()=>refreshState());

// ---- Feedback ----
const feedbackDialog=$('#feedback-dialog'),feedbackForm=$('#feedback-form'),feedbackStatus=$('#feedback-status'),feedbackSave=$('#feedback-save'),feedbackComment=$('#feedback-comment');
let feedbackTarget=null,feedbackId=null,savingFeedback=false;
function showVote(button,value){const a=button.closest('article');
 $$('[data-feedback]',a).forEach(v=>{const on=v.dataset.value===value;v.setAttribute('aria-pressed',String(on));v.classList.toggle('feedback-saved',on);});
 $('.article-actions>[role=status]',a).textContent='Gracias';}
async function saveFeedback(button,value,comment,id=crypto.randomUUID(),fromDialog=false){
 if(savingFeedback||button.getAttribute('aria-pressed')==='true')return;savingFeedback=true;
 const a=button.closest('article'),votes=$$('[data-feedback]',a),status=$('.article-actions>[role=status]',a);
 votes.forEach(v=>v.disabled=true);if(fromDialog){feedbackSave.disabled=true;feedbackStatus.textContent='Guardando…';}
 try{const r=await fetch('/api/brief/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,edicion_id:editionId,noticia_id:button.dataset.feedback,valor:value,comentario:comment})});
  if(r.status===401){(fromDialog?feedbackStatus:status).textContent='Volvé a entrar para guardar.';return;}
  if(!r.ok)throw Error();showVote(button,value);if(fromDialog)feedbackDialog.close();}
 catch{(fromDialog?feedbackStatus:status).textContent='No se pudo guardar. Reintentá.';}
 finally{savingFeedback=false;feedbackSave.disabled=false;votes.forEach(v=>v.disabled=false);}}
$$('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.value==='util'){saveFeedback(button,'util','');return;}
 feedbackTarget=button;feedbackId=crypto.randomUUID();feedbackForm.reset();feedbackStatus.textContent='';$$('[data-reason]').forEach(r=>r.setAttribute('aria-pressed','false'));
 $('#feedback-news').textContent=$('h2',button.closest('article')).textContent;feedbackDialog.showModal();}));
$$('[data-reason]').forEach(r=>{r.setAttribute('aria-pressed','false');r.addEventListener('click',()=>{r.setAttribute('aria-pressed',String(r.getAttribute('aria-pressed')!=='true'));
 const reasons=$$('[data-reason]'),chosen=reasons.filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>x.dataset.reason),own=feedbackComment.value.split('\n').filter(l=>!reasons.some(x=>x.dataset.reason===l.trim())).join('\n').trim();
 feedbackComment.value=[...chosen,own].filter(Boolean).join('\n');});});
$('#feedback-close').addEventListener('click',()=>{if(!savingFeedback)feedbackDialog.close();});
feedbackDialog.addEventListener('cancel',e=>{if(savingFeedback)e.preventDefault();});
feedbackForm.addEventListener('submit',e=>{e.preventDefault();if(feedbackTarget)saveFeedback(feedbackTarget,'no_util',feedbackComment.value.trim(),feedbackId,true);});

// ---- Ajustes ----
const settings=$('#ajustes-dialog');
$('#ajustes').addEventListener('click',()=>{$$('input[name=tema]').forEach(i=>i.checked=i.value===root.dataset.theme);$$('input[name=tamano]').forEach(i=>i.checked=i.value===root.dataset.size);settings.showModal();});
$('#ajustes-close').addEventListener('click',()=>settings.close());
[feedbackDialog,settings].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d||savingFeedback)return;const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}));
$('#ajustes-form').addEventListener('submit',e=>e.preventDefault());
$$('input[name=tema]').forEach(i=>i.addEventListener('change',()=>{root.dataset.theme=i.value;savePrefs();syncThemeColor();}));
$$('input[name=tamano]').forEach(i=>i.addEventListener('change',()=>{root.dataset.size=i.value;savePrefs();}));
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;let installEvent=null;
if(!standalone&&/iphone|ipad|ipod/i.test(navigator.userAgent))$('#instalar').hidden=false;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('#instalar').hidden=false;$('#instalar-texto').textContent='Abrí el brief como app.';$('#instalar-boton').hidden=false;});
$('#instalar-boton').addEventListener('click',async()=>{if(!installEvent)return;installEvent.prompt();await installEvent.userChoice.catch(()=>{});installEvent=null;$('#instalar').hidden=true;});

// ---- Inicio ----
if(una()){const saved=store.get('brief-pos:'+editionId),el=saved&&document.getElementById(saved);requestAnimationFrame(()=>goTo(el||firstUnseen()||endEl,false));}
updateDock();
if(!navigator.onLine)toast('Sin conexión. Mostrando la edición guardada.');
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/brief-sw.js',{scope:'/brief'}).catch(()=>{});
})();
