const depth = () => location.pathname.split('/').filter(Boolean).slice(-3, -1).filter(part => ['pages', 'estudiante', 'admin'].includes(part)).length;
export const rootPath = () => '../'.repeat(depth());
export const route = path => `${rootPath()}${path}`;
export const currentPage = () => document.body.dataset.page || '';

