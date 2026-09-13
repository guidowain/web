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
const feedbackDialog=document.getElementById('feedback-dialog'),feedbackForm=document.getElementById('feedback-form'),feedbackStatus=document.getElementById('feedback-status'),feedbackSave=document.getElementById('feedback-save');
let feedbackTarget=null,feedbackId=null,savingFeedback=false;
document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',()=>{
 feedbackTarget=button;feedbackId=crypto.randomUUID();feedbackForm.reset();feedbackStatus.textContent='';
 document.getElementById('feedback-news').textContent=button.closest('article').querySelector('h2').textContent;
 feedbackDialog.showModal();
}));
document.getElementById('feedback-close').addEventListener('click',()=>{if(!savingFeedback)feedbackDialog.close();});
feedbackDialog.addEventListener('cancel',event=>{if(savingFeedback)event.preventDefault();});
feedbackDialog.addEventListener('click',event=>{if(event.target===feedbackDialog&&!savingFeedback){const b=feedbackDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)feedbackDialog.close();}});
feedbackForm.addEventListener('submit',async event=>{
 event.preventDefault();if(savingFeedback)return;savingFeedback=true;feedbackSave.disabled=true;feedbackStatus.textContent='Guardando…';
 const payload={id:feedbackId,edicion_id:editionId,noticia_id:feedbackTarget.dataset.feedback,valor:new FormData(feedbackForm).get('valor'),comentario:document.getElementById('feedback-comment').value};
 try{const r=await fetch('/api/brief/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(r.status===401){feedbackStatus.textContent='Volvé a entrar para guardar el feedback.';return;}if(!r.ok)throw Error();const result=await r.json();feedbackTarget.setAttribute('aria-label','Feedback guardado. Volver a dar feedback');feedbackTarget.classList.add('feedback-saved');feedbackTarget.closest('.article-actions').querySelector('[role=status]').textContent=result.sincronizado===false?'Guardado · pendiente de sincronizar':'Guardado';feedbackDialog.close();}
 catch{feedbackStatus.textContent='No se pudo guardar. Reintentá.';}
 finally{savingFeedback=false;feedbackSave.disabled=false;}
});
