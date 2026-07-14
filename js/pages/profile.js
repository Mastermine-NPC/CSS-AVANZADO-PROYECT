import { getCurrentUserProfile, updateCurrentUserProfile } from '../repositories/user-repository.js';
import { uploadProfileImage } from '../firebase/storage-service.js';
import { usingFirebase } from '../repositories/mode.js';
import { validateForm } from '../utils/validators.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { renderHeader } from '../components/header.js';

const form=document.querySelector('#profileForm');const preview=document.querySelector('#avatarPreview');
async function loadProfile(){try{const profile=await getCurrentUserProfile();if(!profile)throw Object.assign(new Error('Perfil no encontrado.'),{code:'not-found'});for(const[key,value]of Object.entries(profile)){if(form.elements[key])form.elements[key].value=value??'';}preview.src=profile.photoURL||'../../assets/img/placeholders/product.svg';preview.alt=`Foto de ${profile.displayName||'usuario'}`;}catch(error){showAlert(getErrorMessage(error),'danger');}}
await loadProfile();
form?.elements.photo?.addEventListener('change',event=>{const file=event.target.files[0];if(file)preview.src=URL.createObjectURL(file);});
form?.addEventListener('submit',async event=>{event.preventDefault();if(!validateForm(form))return;const submit=form.querySelector('[type="submit"]');submit.disabled=true;try{const data=Object.fromEntries(new FormData(form));let photoURL;const file=form.elements.photo.files[0];if(file&&usingFirebase)photoURL=(await uploadProfileImage(file)).url;const profile=await updateCurrentUserProfile({firstName:data.firstName.trim(),lastName:data.lastName.trim(),displayName:`${data.firstName} ${data.lastName}`.trim(),career:data.career.trim(),campus:data.campus.trim(),phone:data.phone?.trim()||'',bio:data.bio?.trim()||'',...(photoURL?{photoURL}:{})});showAlert('Perfil actualizado correctamente.','success');renderHeader();preview.src=profile.photoURL||preview.src;}catch(error){console.error('No se pudo actualizar el perfil.',error);showAlert(getErrorMessage(error),'danger');}finally{submit.disabled=false;}});

