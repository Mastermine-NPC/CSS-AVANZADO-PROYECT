import { usingFirebase } from './mode.js';
import * as service from '../firebase/admin-service.js';
import { listUsers,updateUserRole,updateUserStatus } from './user-repository.js';
import { listAllProducts,updateModerationStatus } from './product-repository.js';
import { mockRequests } from '../data/mock-requests.js';

let mockReports=[];
export async function setUserStatus(uid,status){return usingFirebase?service.setUserStatus(uid,status):updateUserStatus(uid,status);}
export async function setUserRole(uid,role){return usingFirebase?service.setUserRole(uid,role):updateUserRole(uid,role);}
export async function moderateProduct(id,status){return usingFirebase?service.moderateProduct(id,status):updateModerationStatus(id,status);}
export async function listReports(filters={}){return usingFirebase?service.listReports(filters):mockReports.filter(r=>!filters.status||r.status===filters.status);}
export async function updateReportStatus(id,status){if(usingFirebase)return service.updateReportStatus(id,status);const report=mockReports.find(r=>r.id===id);if(report)report.status=status;}
export async function createReport(productId,reason,description){if(usingFirebase)return service.createReport(productId,reason,description);mockReports.push({id:`report-${Date.now()}`,productId,reason,description,status:'pending',createdAt:new Date()});}
export async function getAdminStatistics(){if(usingFirebase)return service.getAdminStatistics();const [users,products,reports]=await Promise.all([listUsers(),listAllProducts(),listReports()]);return{users:users.length,activeUsers:users.filter(u=>u.status==='active').length,blocked:users.filter(u=>u.status==='blocked').length,products:products.length,activeProducts:products.filter(p=>p.status==='active').length,pending:products.filter(p=>p.moderationStatus==='pending').length,requests:mockRequests.length,pendingReports:reports.filter(r=>r.status==='pending').length};}

