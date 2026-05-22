"use strict";

// ===========================================
// MISCELLANEOUS FUNCTIONALITY
// Time/date, login, gmail/contact, resume,
// trash/passwords, mobile warning, buddy list
// ===========================================

// ---- Time and Date ----
function updateTimeDate() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();

    const timeDateElement = document.getElementById('time-date');
    if (timeDateElement) {
        timeDateElement.innerHTML = `${hours}:${minutes}<br>${month}.${day}.${year}`;
    }
}
setInterval(updateTimeDate, 1000);
updateTimeDate();

// ---- Login ----
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const password = document.getElementById('password').value;
            if (password === 'passw0rd') {
                const loginModal = document.getElementById('ModalLogin');
                if (loginModal) closeModal(loginModal);
                const socialModal = document.getElementById('ModalSocial');
                if (socialModal) openModal(socialModal);
            } else {
                const errorSound = document.getElementById('errorSound');
                if (errorSound) errorSound.play();
                const errorModal = document.getElementById('ModalError');
                if (errorModal) openModal(errorModal);
            }
        });
    }

    // Error OK button closes error modal
    const errorOk = document.getElementById('errorOkButton');
    if (errorOk) {
        errorOk.addEventListener('click', () => {
            const errorModal = document.getElementById('ModalError');
            if (errorModal) closeModal(errorModal);
        });
    }
});

// ---- Trash -> Passwords chain ----
document.addEventListener('DOMContentLoaded', () => {
    const passwordsFolderBtn = document.getElementById('passwordsFolderBtn');
    if (passwordsFolderBtn) {
        passwordsFolderBtn.addEventListener('click', () => {
            const modal = document.getElementById('ModalPasswords');
            if (modal) openModal(modal);
        });
    }

    const passwordsTxtBtn = document.getElementById('passwordsTxtBtn');
    if (passwordsTxtBtn) {
        passwordsTxtBtn.addEventListener('click', () => {
            const modal = document.getElementById('ModalPasswordsTxt');
            if (modal) openModal(modal);
        });
    }

    // do-not-share.txt easter egg — holds the ASFC pitch deck pricing password
    const doNotShareTxtBtn = document.getElementById('doNotShareTxtBtn');
    if (doNotShareTxtBtn) {
        doNotShareTxtBtn.addEventListener('click', () => {
            const modal = document.getElementById('ModalDoNotShareTxt');
            if (modal) openModal(modal);
        });
    }
});

// ---- Gmail / Contact ----
document.addEventListener('DOMContentLoaded', () => {
    // Subject field updates header text
    const subjectField = document.getElementById('subjectField');
    const headerText = document.querySelector('#modalHeaderContact span');
    if (subjectField && headerText) {
        subjectField.addEventListener('input', function() {
            headerText.textContent = this.value || 'New Message';
        });
    }

    // Sync From email into _replyto so Reply works in Gmail
    const fromField = document.getElementById('fromField');
    const replyTo = document.getElementById('hiddenReplyTo');
    if (fromField && replyTo) {
        fromField.addEventListener('input', function() {
            replyTo.value = this.value;
        });
    }

    // AJAX submit so the form stays in the win95 UI (no new tab popup)
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    const statusTitle = document.getElementById('contactStatusTitle');
    const statusBody = document.getElementById('contactStatusBody');
    const statusIcon = status ? status.querySelector('.contact-status-icon') : null;
    const sendAnother = document.getElementById('contactStatusNew');
    const sendBtn = document.getElementById('sendButton');

    function showStatus({ ok, title, body }) {
        if (!status) return;
        form.style.display = 'none';
        status.style.display = 'flex';
        statusTitle.textContent = title;
        statusBody.textContent = body;
        statusIcon.textContent = ok ? '✓' : '!';
        statusIcon.classList.toggle('error', !ok);
    }

    function resetForm() {
        if (!status) return;
        status.style.display = 'none';
        form.style.display = '';
        form.reset();
        if (headerText) headerText.textContent = 'New Message';
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }

    if (sendAnother) sendAnother.addEventListener('click', resetForm);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.textContent = 'Sending...';
            }
            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(form),
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok && (data.success === 'true' || data.success === true)) {
                    showStatus({
                        ok: true,
                        title: 'Message sent!',
                        body: "Kent will get back to you soon.",
                    });
                } else {
                    showStatus({
                        ok: false,
                        title: "Couldn't send",
                        body: (data && data.message) || 'Something went wrong. Try again or email kent@kentheckel.com directly.',
                    });
                }
            } catch (err) {
                showStatus({
                    ok: false,
                    title: "Couldn't send",
                    body: 'Network error. Try again or email kent@kentheckel.com directly.',
                });
            } finally {
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send';
                }
            }
        });
    }
});

// ---- Mobile Warning ----
function checkIfMobile() {
    if (window.innerWidth <= 768) {
        const modal = document.getElementById('mobileWarningModal');
        if (modal) modal.style.display = 'block';
    }
}

window.addEventListener('load', checkIfMobile);

document.addEventListener('DOMContentLoaded', () => {
    const mobileClose = document.getElementById('mobileWarningClose');
    if (mobileClose) {
        mobileClose.addEventListener('click', () => {
            document.getElementById('mobileWarningModal').style.display = 'none';
        });
    }

    const mobileOk = document.getElementById('mobileWarningOkButton');
    if (mobileOk) {
        mobileOk.addEventListener('click', () => {
            document.getElementById('mobileWarningModal').style.display = 'none';
        });
    }
});

// ---- AIM Buddy List Toggle ----
function toggleBuddyList(button) {
    const list = button.nextElementSibling;
    const arrow = button.querySelector('.arrow');
    if (list) {
        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'block' : 'none';
        if (arrow) arrow.textContent = isHidden ? '▼' : '▶';
    }
}
