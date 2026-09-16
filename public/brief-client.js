document.querySelectorAll('.article-image img').forEach(image=>{const hide=()=>image.closest('figure').hidden=true;image.addEventListener('error',hide);if(image.complete&&!image.naturalWidth)hide();});
if(location.protocol==='file:') location.replace('http://127.0.0.1:8765/');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('article').forEach(a=>a.hidden=button.dataset.filter!=='all'&&a.dataset.category!==button.dataset.filter);
}));
const readButton=document.getElementById('marcar-leida'),readStatus=document.getElementById('lectura-estado'),editionId=document.querySelector('main').dataset.edition;
let readKnown=false,readLoading=false,alreadyRead=false;
function showRead(pending=false){alreadyRead=true;readButton.hidden=true;readStatus.textContent=pending?'Leída · pendiente de sincronizar':'Leída';}
async function refreshRead(){
 if(readLoading) return;readLoading=true;
 try{
  const r=await fetch('/api/brief/lecturas',{cache:'no-store'});
  if(r.status===401){readButton.hidden=true;readStatus.innerHTML='<a href="/brief/login">Entrar para guardar lectura</a>';return;}
  if(!r.ok)throw Error();const data=await r.json();
  if(data.ids.includes(editionId)){readKnown=true;showRead(data.sincronizado===false);}
  else if(!alreadyRead){readKnown=data.sincronizado!==false;readButton.hidden=false;readButton.textContent=readKnown?'Ya leí esta edición':'Comprobar lectura';readStatus.textContent=readKnown?'':'Sin conexión para sincronizar.';}
 }catch{if(!alreadyRead){readKnown=false;readButton.hidden=false;readButton.textContent='Comprobar lectura';readStatus.textContent='No se pudo comprobar la lectura.';}}
 finally{readLoading=false;}
}
readButton.addEventListener('click',async()=>{
 if(!readKnown){await refreshRead();return;}
 readButton.disabled=true;
 try{const r=await fetch('/api/brief/lecturas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:[editionId]})});if(r.status===401){location.href='/brief/login';return;}if(!r.ok)throw Error();const data=await r.json();showRead(data.sincronizado===false);}
 catch{readStatus.textContent='Lectura no guardada. Reintentá.';}finally{readButton.disabled=false;}
});
window.addEventListener('pageshow',refreshRead);window.addEventListener('focus',refreshRead);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRead();});
setInterval(()=>{if(!document.hidden)refreshRead();},20000);refreshRead();
const feedbackDialog=document.getElementById('feedback-dialog'),feedbackForm=document.getElementById('feedback-form'),feedbackStatus=document.getElementById('feedback-status'),feedbackSave=document.getElementById('feedback-save'),feedbackComment=document.getElementById('feedback-comment');
let feedbackTarget=null,feedbackId=null,savingFeedback=false;
function showVote(button,value,pending=false){
 const article=button.closest('article');
 article.querySelectorAll('[data-feedback]').forEach(vote=>{const selected=vote.dataset.value===value;vote.setAttribute('aria-pressed',String(selected));vote.classList.toggle('feedback-saved',selected);});
 article.querySelector('.article-actions>[role=status]').textContent=pending?'Guardado · pendiente de sincronizar':'Guardado';
}
async function saveFeedback(button,value,comment,id=crypto.randomUUID(),fromDialog=false){
 if(savingFeedback||button.getAttribute('aria-pressed')==='true')return;
 savingFeedback=true;const article=button.closest('article'),votes=article.querySelectorAll('[data-feedback]'),articleStatus=article.querySelector('.article-actions>[role=status]');
 votes.forEach(vote=>vote.disabled=true);if(fromDialog){feedbackSave.disabled=true;feedbackStatus.textContent='Guardando…';}else articleStatus.textContent='Guardando…';
 const payload={id,edicion_id:editionId,noticia_id:button.dataset.feedback,valor:value,comentario:comment};
 try{
  const r=await fetch('/api/brief/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.status===401){(fromDialog?feedbackStatus:articleStatus).textContent='Volvé a entrar para guardar el feedback.';return;}
  if(!r.ok)throw Error();const result=await r.json();showVote(button,value,result.sincronizado===false);if(fromDialog)feedbackDialog.close();
 }catch{(fromDialog?feedbackStatus:articleStatus).textContent='No se pudo guardar. Reintentá.';}
 finally{savingFeedback=false;feedbackSave.disabled=false;votes.forEach(vote=>vote.disabled=false);}
}
document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.value==='util'){saveFeedback(button,'util','');return;}
 feedbackTarget=button;feedbackId=crypto.randomUUID();feedbackForm.reset();feedbackStatus.textContent='';
 document.getElementById('feedback-news').textContent=button.closest('article').querySelector('h2').textContent;
 feedbackDialog.showModal();feedbackComment.focus();
}));
document.getElementById('feedback-close').addEventListener('click',()=>{if(!savingFeedback)feedbackDialog.close();});
feedbackDialog.addEventListener('cancel',event=>{if(savingFeedback)event.preventDefault();});
feedbackDialog.addEventListener('click',event=>{if(event.target===feedbackDialog&&!savingFeedback){const b=feedbackDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)feedbackDialog.close();}});
feedbackForm.addEventListener('submit',event=>{event.preventDefault();if(!feedbackTarget)return;saveFeedback(feedbackTarget,'no_util',feedbackComment.value.trim(),feedbackId,true);});
