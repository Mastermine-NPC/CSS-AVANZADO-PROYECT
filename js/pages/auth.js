import { validateForm } from '../utils/validators.js';
import { showAlert } from '../components/alert.js';
import { sendPasswordReset, signIn, signUp } from '../repositories/session-repository.js';
import { getErrorMessage } from '../utils/errors.js';
import { requireGuest } from '../utils/guards.js';

await requireGuest();
const form=document.querySelector('[data-auth-form]');
const next=new URLSearchParams(location.search).get('next');
const safeNext=next&&next.startsWith('/')&&!next.startsWith('//')?next:null;

form?.addEventListener('submit',async event=>{
  event.preventDefault();if(!validateForm(form))return;
  const submit=form.querySelector('[type="submit"]');submit.disabled=true;
  try{
    const data=Object.fromEntries(new FormData(form));
    if(form.dataset.authForm==='reset'){
      await sendPasswordReset(data.email);
      showAlert('Si el correo está registrado, recibirás instrucciones.','success');
      return;
    }
    let session;
    if(form.dataset.authForm==='login') session=await signIn(data.email,data.password,Boolean(form.elements.remember?.checked));
    else session=await signUp({firstName:data.firstName.trim(),lastName:data.lastName.trim(),displayName:`${data.firstName} ${data.lastName}`.trim(),email:data.email.trim(),studentCode:data.studentCode?.trim()||'',career:data.career,campus:data.campus,phone:'',bio:'',photoURL:''},data.password);
    showAlert('Acceso correcto. Redirigiendo…','success');
    const destination=safeNext||`${session.profile.role==='admin'?'admin':'estudiante'}/dashboard.html`;
    setTimeout(()=>{location.href=destination;},350);
  }catch(error){console.error('Error de autenticación.',error);showAlert(getErrorMessage(error),'danger');}
  finally{submit.disabled=false;}
});

