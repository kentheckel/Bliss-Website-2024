// Give each submission its own email conversation, including repeat inquiries.
// Capture runs before the desktop AJAX handler and the mobile native POST.
document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form.matches('#contactForm, .phone-form')) return;

    const data = new FormData(form);
    const clean = (value, limit) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
    const topic = clean(data.get('Subject'), 100) || 'New inquiry';
    const sender = clean(data.get('From Email') || data.get('name') || data.get('email'), 80);
    const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, '0');
    const reference = `${Date.now().toString(36)}-${random}`;

    form.elements.namedItem('_subject').value = `ASFC | ${topic} | ${sender || 'Website visitor'} | ${reference}`;
}, true);
