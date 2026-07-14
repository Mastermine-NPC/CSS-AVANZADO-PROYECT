import { createElement } from '../utils/dom.js';
export function createEmptyState(title, message, icon = 'bi-inbox') {
  const box = createElement('div', { className: 'empty-state' });
  const glyph = createElement('i', { className: `bi ${icon}`, attrs: { 'aria-hidden': 'true' } });
  box.append(glyph, createElement('h2', { text: title }), createElement('p', { text: message })); return box;
}

