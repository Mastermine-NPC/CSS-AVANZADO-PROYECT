export const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text != null) element.textContent = options.text;
  Object.entries(options.attrs || {}).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};
export const clearElement = element => { while (element?.firstChild) element.removeChild(element.firstChild); };

