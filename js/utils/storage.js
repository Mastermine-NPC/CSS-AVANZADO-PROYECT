import { STORAGE_KEYS } from './constants.js';

const read = (key, fallback = []) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const cartStore = {
  all: () => read(STORAGE_KEYS.cart),
  add(product, quantity = 1) {
    if (product.transactionType !== 'sale') throw new Error('Sólo los productos en venta pueden agregarse al carrito.');
    const cart = this.all(); const found = cart.find(item => item.id === product.id);
    if (found) found.quantity = Math.min((found.quantity || 1) + quantity, Number(product.quantity) || 1);
    else cart.push({ id:product.id,title:product.title,price:Number(product.price),imageURLs:product.imageURLs||[],transactionType:product.transactionType,ownerId:product.ownerId,available:Number(product.quantity)||1,quantity });
    write(STORAGE_KEYS.cart,cart); return cart;
  },
  replace(items){write(STORAGE_KEYS.cart,items);return items;},
  update(id,quantity){const cart=this.all();const item=cart.find(entry=>entry.id===id);if(item)item.quantity=Math.max(1,Math.min(Number(quantity)||1,item.available||1));write(STORAGE_KEYS.cart,cart);return cart;},
  remove(id){const cart=this.all().filter(item=>item.id!==id);write(STORAGE_KEYS.cart,cart);return cart;},
  clear(){localStorage.removeItem(STORAGE_KEYS.cart);return[];}
};

export const favoriteStore={all:()=>read(STORAGE_KEYS.favorites),has:id=>read(STORAGE_KEYS.favorites).includes(id),toggle(id){const items=this.all();const next=items.includes(id)?items.filter(item=>item!==id):[...items,id];write(STORAGE_KEYS.favorites,next);return next.includes(id);}};

