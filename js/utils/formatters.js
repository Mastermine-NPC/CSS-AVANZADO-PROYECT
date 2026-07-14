import { APP_CONFIG } from '../config/app-config.js';
import { TRANSACTION_LABELS, STATUS_LABELS } from './constants.js';
export const formatCurrency=value=>new Intl.NumberFormat(APP_CONFIG.locale,{style:'currency',currency:APP_CONFIG.currency}).format(Number(value)||0);
export function toDate(value){if(value===null||value===undefined||value==='')return null;if(value?.toDate)return value.toDate();if(value instanceof Date)return value;const date=new Date(value);return Number.isNaN(date.getTime())?null:date;}
export const formatDate=value=>{const date=toDate(value);return date?new Intl.DateTimeFormat(APP_CONFIG.locale,{dateStyle:'medium'}).format(date):'Fecha pendiente';};
export const transactionLabel=value=>TRANSACTION_LABELS[value]||value||'—';
export const statusLabel=value=>STATUS_LABELS[value]||value||'—';
