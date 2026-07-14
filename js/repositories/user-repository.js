import { usingFirebase } from './mode.js';
import { mockUsers, mockCurrentUser } from '../data/mock-users.js';
import * as service from '../firebase/user-service.js';
import { getSession } from './session-repository.js';

let users = mockUsers.map(user => ({ ...user }));
export async function getUserProfile(uid) { return usingFirebase ? service.getUserProfile(uid) : users.find(user => user.uid === uid) || null; }
export async function getCurrentUserProfile() { if (usingFirebase) return service.getCurrentUserProfile(); return (await getSession()).profile; }
export async function updateCurrentUserProfile(data) { if (usingFirebase) return service.updateCurrentUserProfile(data); const index = users.findIndex(user => user.uid === mockCurrentUser.uid); users[index] = { ...users[index], ...data, updatedAt: new Date() }; return users[index]; }
export async function listUsers(filters = {}) { if (usingFirebase) return service.listUsers(filters); const search=String(filters.search||'').toLowerCase(); return users.filter(user=>(!filters.role||user.role===filters.role)&&(!filters.status||user.status===filters.status)&&(!filters.campus||user.campus===filters.campus)&&(!search||`${user.displayName} ${user.email}`.toLowerCase().includes(search))); }
export async function updateUserStatus(uid,status) { if(usingFirebase)return service.updateUserStatus(uid,status); const user=users.find(item=>item.uid===uid); if(user)user.status=status; }
export async function updateUserRole(uid,role) { if(usingFirebase)return service.updateUserRole(uid,role); const user=users.find(item=>item.uid===uid); if(user)user.role=role; }

