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
});

// ---- Resume Download ----
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'images/KentHeckelResume2025.pdf';
    link.download = 'KentHeckelResume2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---- Gmail / Contact ----
document.addEventListener('DOMContentLoaded', () => {
    // Send button in contact form
    const sendBtn = document.getElementById('sendButton');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const emailBody = document.getElementById('emailTextBody')?.value || '';
            const subject = document.getElementById('subjectField')?.value || '';

            if (!emailBody.trim()) {
                alert("Please write something in the email body.");
                return;
            }

            console.log("Email sent to:", "kent@kentheckel.com");
            console.log("Subject:", subject);
            console.log("Body:", emailBody);

            alert("Your message has been sent!");
            const emailBodyEl = document.getElementById('emailTextBody');
            const subjectEl = document.getElementById('subjectField');
            if (emailBodyEl) emailBodyEl.value = '';
            if (subjectEl) subjectEl.value = '';
        });
    }

    // Subject field updates header text
    const subjectField = document.getElementById('subjectField');
    const headerText = document.querySelector('#modalHeaderContact span');
    if (subjectField && headerText) {
        subjectField.addEventListener('input', function() {
            headerText.textContent = this.value || 'New Message';
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
