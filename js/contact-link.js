'use strict';
// Works in desktop/mobile iframes and on a directly shared page.
document.addEventListener('click', event => {
    const link = event.target.closest('[data-contact]');
    if (!link) return;
    event.preventDefault();
    const href = new URL(link.href, location.href);
    const subject = href.searchParams.get('subject') || '';
    const message = link.dataset.message || '';
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'asfc:contact', subject, message }, location.origin);
    } else {
        location.assign('/?' + new URLSearchParams({ app: 'contact', subject, message }));
    }
});
