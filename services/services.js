'use strict';
// The same services page runs inside the desktop window and phone app.
document.addEventListener('click', event => {
  const link = event.target.closest('[data-contact]');
  if (!link || window.parent === window) return;
  event.preventDefault();
  window.parent.postMessage({type: 'asfc:services', action: 'contact'}, location.origin);
});
