(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement,app=$('.app'),flow=$('#flow'),editionId=app.dataset.edition,total=Number(app.dataset.total)||0;
const stories=$$('.story'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const toastEl=$('#toast');let toastTimer;
function toast(text){toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2600);}
function savePrefs(){document.cookie=`brief-prefs=${root.dataset.theme}.${root.dataset.size}.${root.dataset.mode};path=/;max-age=31536000;samesite=lax${location.protocol==='https:'?';secure':''}`;}
function syncThemeColor(){const dark=root.dataset.theme==='oscuro'||(root.dataset.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);$$('meta[name=theme-color]').forEach(m=>m.content=dark?'#111216':'#fbfaf7');}
syncThemeColor();matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',syncThemeColor);

// Imágenes: un fallo no deja recuadros vacíos.
$$('.article-image img').forEach(img=>{const hide=()=>img.closest('figure').hidden=true;img.addEventListener('error',hide);if(img.complete&&!img.naturalWidth)hide();});
// Antigüedad de cada nota.
$$('time.ago').forEach(t=>{const d=new Date(t.dateTime),m=(Date.now()-d)/60000;if(!isFinite(m))return;
 t.textContent=m<60?`hace ${Math.max(1,Math.round(m))} min`:m<1440?`hace ${Math.round(m/60)} h`:m<2880?'ayer':d.toLocaleDateString('es-AR',{day:'numeric',month:'short'});});

// ---- Navegación: lista o una por vez ----
const slides=()=>Array.from(flow.children).filter(el=>!el.hidden&&el.matches('.cover,.story,.end'));
let current=$('.cover');
const una=()=>root.dataset.mode==='una';
// Mientras dura un desplazamiento programado, el destino manda: los toques rápidos no se pierden.
let navTarget=null,settleTimer,jumpUntil=0;
function settle(delay){clearTimeout(settleTimer);settleTimer=setTimeout(()=>{navTarget=null;onScroll();},delay);}
function goTo(el,smooth=true){if(!el)return;const behavior=smooth&&!reduce?'smooth':'auto';
 if(una()){const i=slides().indexOf(el);if(i>=0){navTarget=el;settle(behavior==='smooth'?700:80);flow.scrollTo({left:i*flow.clientWidth,behavior});}}
 else{if(behavior==='smooth')jumpUntil=Date.now()+1000;el.scrollIntoView({behavior,block:'start'});}
 setCurrent(el);}
function go(delta){
 if(una()){const list=slides();goTo(list[Math.max(0,Math.min(list.length-1,list.indexOf(current)+delta))]);return;}
 const list=stories.filter(s=>!s.hidden),i=current.classList.contains('story')?list.indexOf(current):current.classList.contains('end')?list.length:-1;
 const target=list[i+delta];if(target)goTo(target);else if(delta>0)goTo($('.end'));else goTo($('.cover'));}
function setMode(mode,target){
 const keep=target||current;root.dataset.mode=mode;savePrefs();
 const b=$('#modo');b.setAttribute('aria-pressed',String(mode==='una'));b.setAttribute('aria-label',mode==='una'?'Ver como lista':'Leer una por vez');
 requestAnimationFrame(()=>goTo(keep,false));updateDock();}
$('#modo').addEventListener('click',()=>setMode(una()?'lista':'una'));
let seenTimer;
function setCurrent(el){if(!el||el===current)return;current=el;updateDock();
 if(el.classList.contains('story')){clearTimeout(seenTimer);if(una())seenTimer=setTimeout(()=>{if(current===el)markSeen(el.dataset.id)},1500);}
 if(una())store.set('brief-pos:'+editionId,el.id);}
let ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;
 if(una()){if(navTarget){settle(150);return;}const list=slides();setCurrent(list[Math.round(flow.scrollLeft/Math.max(1,flow.clientWidth))]);return;}
 const line=innerHeight*.35;let found=$('.cover');for(const el of slides()){if(el.getBoundingClientRect().top<=line)found=el;else break;}setCurrent(found);});}
flow.addEventListener('scroll',onScroll,{passive:true});addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',()=>{if(una())goTo(current,false);});

// ---- Progreso de lectura (local, por edición) ----
const seenKey='brief-seen:'+editionId;let seen=new Set();try{seen=new Set(JSON.parse(store.get(seenKey)||'[]'))}catch{}
function markSeen(id){if(!id||seen.has(id))return;seen.add(id);store.set(seenKey,JSON.stringify(Array.from(seen)));updateProgress();}
function updateProgress(){const n=stories.filter(s=>seen.has(s.dataset.id)).length;
 $('.progress span').style.width=(total?n/total*100:0)+'%';
 $$('.index li').forEach((li,i)=>li.classList.toggle('seen',seen.has(stories[i]?.dataset.id)));
 stories.forEach(s=>s.classList.toggle('seen',seen.has(s.dataset.id)));
 $('#avance').textContent=n===0?'':n===total?'Leíste todas las noticias.':`Leíste ${n} de ${total}.`;
 $('#empezar span').textContent=n===0?'Empezar a leer':n===total?'Volver a empezar':'Seguir leyendo';
 $('#fin-texto').textContent=n===total?`Leíste las ${total} noticias.`:`Leíste ${n} de ${total} noticias.`;}
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!una()&&Date.now()>jumpUntil)markSeen(e.target.closest('.story').dataset.id)}),{rootMargin:'0px 0px -10% 0px'});
 stories.forEach(s=>io.observe($('.article-actions',s)));}
const firstUnseen=()=>stories.find(s=>!s.hidden&&!seen.has(s.dataset.id))||stories.find(s=>!s.hidden);
$('#empezar').addEventListener('click',()=>setMode('una',firstUnseen()));
updateProgress();

// ---- Filtros e índice ----
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const f=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 stories.forEach(a=>a.hidden=f!=='all'&&a.dataset.category!==f);$$('.index li').forEach(li=>li.hidden=f!=='all'&&li.dataset.category!==f);
 if(una()&&current.hidden)goTo($('.cover'),false);}));
$$('[data-jump]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const t=document.getElementById('n-'+a.dataset.jump);if(t&&!t.hidden)goTo(t);}));

// ---- Teclado ----
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]')||$('dialog[open]'))return;
 const k=e.key.toLowerCase();
 if(k==='arrowright'||k==='j'){e.preventDefault();listening?skip(1):go(1);}
 else if(k==='arrowleft'||k==='k'){e.preventDefault();listening?skip(-1):go(-1);}
 else if(k==='u')setMode(una()?'lista':'una');
 else if(k==='l')toggleListen();
 else if(k==='o'&&current.classList.contains('story'))window.open($('.original',current).href,'_blank','noopener');
 else if(k==='escape'&&una())setMode('lista');});

// ---- Escuchar ----
const synth=window.speechSynthesis;let failures=0,listening=false,playing=false,queue=[],qi=0,reading=null,gen=0,wake=null;
let rate=Number(store.get('brief-rate'))||1;
const spanish=()=>synth?synth.getVoices().filter(v=>/^es([-_]|$)/i.test(v.lang)):[];
function voice(){const name=store.get('brief-voice'),list=spanish();return list.find(v=>v.name===name)||list.find(v=>/es[-_]AR/i.test(v.lang))||list.find(v=>/es[-_](419|US|MX)/i.test(v.lang))||list.find(v=>/es[-_]ES/i.test(v.lang))||list[0]||null;}
function sentences(text){const out=[];(text.match(/[^.!?…]+[.!?…]+["»”)]*\s*|[^.!?…]+$/g)||[text]).forEach(s=>{s=s.trim();if(!s)return;
 if(out.length&&(out[out.length-1].length+s.length)<180)out[out.length-1]+=' '+s;else out.push(s);});return out;}
function chunksFor(el,intro){const t=s=>($(s,el)?.textContent||'').trim(),parts=[];
 if(intro)parts.push(intro);
 parts.push(`${Number(el.dataset.index)+1} de ${total}. ${t('.chip')}.`,t('h2')+'.');
 if(t('.dek'))parts.push(...sentences(t('.dek')));
 $$('.body p',el).forEach(p=>parts.push(...sentences(p.textContent)));
 const keys=$$('.claves li',el).map(li=>li.textContent.trim());if(keys.length)parts.push('Claves.',...keys);
 if(t('.why p'))parts.push('Por qué importa.',...sentences(t('.why p')));
 return parts;}
function speakChunk(){const g=gen;
 if(qi>=queue.length){markSeen(reading.dataset.id);const list=stories.filter(s=>!s.hidden),next=list[list.indexOf(reading)+1];
  if(next)startStory(next);else{stopListening();goTo($('.end'));toast('Fin de la edición');}return;}
 const u=new SpeechSynthesisUtterance(queue[qi]),v=voice();if(v)u.voice=v;u.lang=v?v.lang:'es-AR';u.rate=rate;
 u.onstart=()=>{failures=0;};u.onend=()=>{if(g!==gen)return;qi++;speakChunk();};
 u.onerror=e=>{if(g!==gen||e.error==='interrupted'||e.error==='canceled')return;
  if(++failures>=3){stopListening();toast('No se pudo leer en voz alta en este dispositivo.');return;}qi++;speakChunk();};
 synth.speak(u);}
function hush(){gen++;if(synth.speaking||synth.pending)synth.cancel();}
// iOS exige que el primer speak() ocurra dentro del toque: sin demoras.
function startStory(el,intro){hush();reading=el;queue=chunksFor(el,intro);qi=0;
 $$('.story.speaking').forEach(s=>s.classList.remove('speaking'));el.classList.add('speaking');goTo(el);
 listening=playing=true;app.classList.add('listening','playing');updateDock();lockScreen();speakChunk();}
function pause(){hush();playing=false;app.classList.remove('playing');updateDock();}
function resume(){if(!reading)return;playing=true;app.classList.add('playing');updateDock();lockScreen();speakChunk();}
function stopListening(){gen++;if(synth&&(synth.speaking||synth.pending))synth.cancel();listening=playing=false;reading=null;app.classList.remove('listening','playing');$$('.story.speaking').forEach(s=>s.classList.remove('speaking'));updateDock();wake?.release?.().catch(()=>{});wake=null;}
function skip(d){const list=stories.filter(s=>!s.hidden),i=list.indexOf(reading)+d;if(list[i])startStory(list[i]);else if(d>0){stopListening();goTo($('.end'));}}
function startListening(fromCover){const el=current.classList.contains('story')&&!fromCover?current:firstUnseen();if(!el)return;
 const intro=fromCover||!current.classList.contains('story')?`Brief. ${$('.kicker').textContent}, ${$('#titulo-edicion').textContent}.`:'';startStory(el,intro);}
function toggleListen(){if(!synth){toast('Este navegador no puede leer en voz alta.');return;}if(!listening)startListening(false);else if(playing)pause();else resume();}
async function lockScreen(){try{if(!wake&&navigator.wakeLock)wake=await navigator.wakeLock.request('screen');}catch{}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&playing){wake=null;lockScreen();}});
if(!synth){$$('#escuchar,#escuchar-todo,#dock-play').forEach(b=>b.hidden=true);}
else{synth.addEventListener?.('voiceschanged',fillVoices);
 $('#escuchar').addEventListener('click',toggleListen);$('#escuchar-todo').addEventListener('click',()=>listening?toggleListen():startListening(true));
 addEventListener('pagehide',()=>synth.cancel());}
const speeds=[1,1.15,1.3,1.5,0.9],fmt=r=>String(r).replace('.',',')+'×';
function setRate(r){rate=r;store.set('brief-rate',String(r));$('#dock-speed').textContent=fmt(r);$('#velocidad').value=String(r);if(playing){hush();speakChunk();}}
$('#dock-speed').textContent=fmt(rate);
$('#dock-speed').addEventListener('click',()=>setRate(speeds[(speeds.indexOf(rate)+1)%speeds.length]));
$('#dock-play').addEventListener('click',toggleListen);
$('#dock-prev').addEventListener('click',()=>listening?skip(-1):go(-1));
$('#dock-next').addEventListener('click',()=>listening?skip(1):go(1));
$('#dock-close').addEventListener('click',stopListening);
function updateDock(){const el=listening&&reading?reading:current,list=slides();
 $('#dock-pos').textContent=el.classList.contains('story')?`${Number(el.dataset.index)+1}/${total}`:el.classList.contains('end')?'Fin':'Portada';
 $('#dock-title').textContent=el.classList.contains('story')?$('h2',el).textContent:el.classList.contains('end')?'Terminaste el brief':$('#titulo-edicion').textContent;
 $('#dock-play').setAttribute('aria-label',playing?'Pausar':listening?'Seguir escuchando':'Escuchar');
 $('#dock-prev').disabled=!listening&&list.indexOf(current)<=0;$('#dock-next').disabled=!listening&&list.indexOf(current)>=list.length-1&&una();}

// ---- Compartir ----
$$('[data-share]').forEach(b=>b.addEventListener('click',async()=>{const url=b.dataset.share,title=$('h2',b.closest('.story')).textContent;
 try{if(navigator.share){await navigator.share({title,url});return;}await navigator.clipboard.writeText(url);toast('Enlace copiado');}
 catch(e){if(e&&e.name!=='AbortError')toast('No se pudo compartir');}}));

// ---- Lectura sincronizada y edición nueva ----
const readButton=$('#marcar-leida'),readStatus=$('#lectura-estado');let readKnown=false,loading=false,alreadyRead=false,hiddenAt=0;
// Al volver a la app tras un rato largo, pasar directo a la edición nueva (iOS no tiene botón de recarga en modo app).
document.addEventListener('visibilitychange',async()=>{if(document.hidden){hiddenAt=Date.now();return;}
 if(!hiddenAt||Date.now()-hiddenAt<20*60000||app.dataset.latest!=='1'||listening)return;hiddenAt=0;
 try{const r=await fetch('/api/brief/estado',{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d.ultima&&d.ultima.id!==editionId)location.replace('/brief');}catch{}});
function showRead(){alreadyRead=true;readButton.hidden=true;readStatus.innerHTML='';readStatus.append(document.createTextNode('Edición leída'));app.classList.add('edition-read');}
async function refreshState(){if(loading)return;loading=true;
 try{const r=await fetch('/api/brief/estado',{cache:'no-store'});
  if(r.status===401){readButton.hidden=true;readStatus.innerHTML='<a href="/brief/login">Entrar para guardar lectura</a>';return;}
  if(!r.ok)throw Error();const data=await r.json();readKnown=true;
  if(data.leidas.includes(editionId))showRead();else if(!alreadyRead){readButton.hidden=false;readButton.textContent='Ya leí esta edición';readStatus.textContent='';}
  if(app.dataset.latest==='1'&&data.ultima&&data.ultima.id!==editionId)$('#nueva').hidden=false;}
 catch{if(!alreadyRead){readKnown=false;readButton.hidden=false;readButton.textContent='Comprobar lectura';readStatus.textContent=navigator.onLine?'No se pudo comprobar la lectura.':'Sin conexión.';}}
 finally{loading=false;}}
readButton.addEventListener('click',async()=>{if(!readKnown){await refreshState();return;}readButton.disabled=true;
 try{const r=await fetch('/api/brief/lecturas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[editionId]})});
  if(r.status===401){location.href='/brief/login';return;}if(!r.ok)throw Error();showRead();toast('Edición marcada como leída');}
 catch{readStatus.textContent='Lectura no guardada. Reintentá.';}finally{readButton.disabled=false;}});
addEventListener('pageshow',refreshState);addEventListener('focus',refreshState);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshState();});
setInterval(()=>{if(!document.hidden)refreshState();},60000);refreshState();
addEventListener('offline',()=>toast('Sin conexión. Podés seguir leyendo.'));addEventListener('online',()=>{toast('Conexión recuperada');refreshState();});

// ---- Feedback ----
const feedbackDialog=$('#feedback-dialog'),feedbackForm=$('#feedback-form'),feedbackStatus=$('#feedback-status'),feedbackSave=$('#feedback-save'),feedbackComment=$('#feedback-comment');
let feedbackTarget=null,feedbackId=null,savingFeedback=false;
function showVote(button,value){const a=button.closest('article');
 $$('[data-feedback]',a).forEach(v=>{const on=v.dataset.value===value;v.setAttribute('aria-pressed',String(on));v.classList.toggle('feedback-saved',on);});
 $('.article-actions>[role=status]',a).textContent=value==='util'?'¡Gracias! Más de esto.':'Guardado. Lo tengo en cuenta.';}
async function saveFeedback(button,value,comment,id=crypto.randomUUID(),fromDialog=false){
 if(savingFeedback||button.getAttribute('aria-pressed')==='true')return;savingFeedback=true;
 const a=button.closest('article'),votes=$$('[data-feedback]',a),status=$('.article-actions>[role=status]',a);
 votes.forEach(v=>v.disabled=true);if(fromDialog){feedbackSave.disabled=true;feedbackStatus.textContent='Guardando…';}else status.textContent='Guardando…';
 try{const r=await fetch('/api/brief/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,edicion_id:editionId,noticia_id:button.dataset.feedback,valor:value,comentario:comment})});
  if(r.status===401){(fromDialog?feedbackStatus:status).textContent='Volvé a entrar para guardar el feedback.';return;}
  if(!r.ok)throw Error();showVote(button,value);if(fromDialog)feedbackDialog.close();}
 catch{(fromDialog?feedbackStatus:status).textContent='No se pudo guardar. Reintentá.';}
 finally{savingFeedback=false;feedbackSave.disabled=false;votes.forEach(v=>v.disabled=false);}}
$$('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.value==='util'){saveFeedback(button,'util','');return;}
 feedbackTarget=button;feedbackId=crypto.randomUUID();feedbackForm.reset();feedbackStatus.textContent='';$$('[data-reason]').forEach(r=>r.setAttribute('aria-pressed','false'));
 $('#feedback-news').textContent=$('h2',button.closest('article')).textContent;feedbackDialog.showModal();}));
$$('[data-reason]').forEach(r=>{r.setAttribute('aria-pressed','false');r.addEventListener('click',()=>{const on=r.getAttribute('aria-pressed')!=='true';r.setAttribute('aria-pressed',String(on));
 const chosen=$$('[data-reason]').filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>x.dataset.reason),own=feedbackComment.value.split('\n').filter(l=>!$$('[data-reason]').some(x=>x.dataset.reason===l.trim())).join('\n').trim();
 feedbackComment.value=[...chosen,own].filter(Boolean).join('\n');});});
$('#feedback-close').addEventListener('click',()=>{if(!savingFeedback)feedbackDialog.close();});
feedbackDialog.addEventListener('cancel',e=>{if(savingFeedback)e.preventDefault();});
feedbackForm.addEventListener('submit',e=>{e.preventDefault();if(feedbackTarget)saveFeedback(feedbackTarget,'no_util',feedbackComment.value.trim(),feedbackId,true);});

// ---- Ajustes ----
const settings=$('#ajustes-dialog');
function fillVoices(){const select=$('#voz'),chosen=store.get('brief-voice')||'';select.length=1;
 spanish().forEach(v=>{const o=new Option(`${v.name} (${v.lang})`,v.name);o.selected=v.name===chosen;select.add(o);});}
$('#ajustes').addEventListener('click',()=>{$$('input[name=tema]').forEach(i=>i.checked=i.value===root.dataset.theme);$$('input[name=tamano]').forEach(i=>i.checked=i.value===root.dataset.size);
 fillVoices();$('#velocidad').value=String(rate);settings.showModal();});
$('#ajustes-close').addEventListener('click',()=>settings.close());
[feedbackDialog,settings].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d||savingFeedback)return;const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}));
$('#ajustes-form').addEventListener('submit',e=>e.preventDefault());
$$('input[name=tema]').forEach(i=>i.addEventListener('change',()=>{root.dataset.theme=i.value;savePrefs();syncThemeColor();}));
$$('input[name=tamano]').forEach(i=>i.addEventListener('change',()=>{root.dataset.size=i.value;savePrefs();}));
$('#voz').addEventListener('change',e=>{store.set('brief-voice',e.target.value);if(playing){hush();speakChunk();}});
$('#velocidad').addEventListener('change',e=>setRate(Number(e.target.value)));
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;let installEvent=null;
if(!standalone&&/iphone|ipad|ipod/i.test(navigator.userAgent))$('#instalar').hidden=false;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('#instalar').hidden=false;$('#instalar-texto').textContent='Abrí el brief como una app, con su ícono y sin barras del navegador.';$('#instalar-boton').hidden=false;});
$('#instalar-boton').addEventListener('click',async()=>{if(!installEvent)return;installEvent.prompt();await installEvent.userChoice.catch(()=>{});installEvent=null;$('#instalar').hidden=true;});

// ---- Inicio ----
if(una()){const saved=store.get('brief-pos:'+editionId),el=saved&&document.getElementById(saved);requestAnimationFrame(()=>goTo(el||$('.cover'),false));}
updateDock();
if(!navigator.onLine)toast('Sin conexión. Mostrando la edición guardada.');
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/brief-sw.js',{scope:'/brief'}).catch(()=>{});
})();
