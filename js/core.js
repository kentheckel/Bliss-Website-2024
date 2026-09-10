"use strict";

// ===========================================
// CORE WINDOW MANAGEMENT SYSTEM
// Handles: modal open/close/minimize, z-index
// stacking, cascade positioning, dragging,
// taskbar, and auto-registration of modals
// ===========================================

// Global z-index counter — every window that comes to front gets the next value
let topZIndex = 100;

// Cascade offset tracking — each new window opens slightly offset
let cascadeX = 0;
let cascadeY = 0;
const CASCADE_STEP = 30;
const CASCADE_MAX = 210; // reset after 7 windows worth of offset

// ---- Bring to Front ----
// Clicking anywhere on a modal brings it to the top of the stack
function bringToFront(modal) {
    topZIndex++;
    modal.style.zIndex = topZIndex;
}

// ---- Open Modal ----
// Opens a modal with cascade positioning and brings it to front
function openModal(modal) {
    if (!modal) return;

    modal.style.display = 'block';
    bringToFront(modal);

    // Apply cascade offset (only if the modal doesn't have a custom fixed position via CSS)
    // Skip cascade for modals that have specific positioning (Videos, error modals, etc.)
    const skipCascade = modal.id === 'ModalWelcome' ||
                        modal.id === 'ModalServices' ||
                        modal.id === 'ModalError' ||
                        modal.id === 'ModalLogin' ||
                        modal.id === 'mobileWarningModal';

    if (!skipCascade && !modal.dataset.hasBeenOpened) {
        // First time opening — apply cascade
        cascadeX = (cascadeX + CASCADE_STEP) % CASCADE_MAX;
        cascadeY = (cascadeY + CASCADE_STEP) % CASCADE_MAX;
        modal.style.left = `calc(15% + ${cascadeX}px)`;
        modal.style.top = `calc(10% + ${cascadeY}px)`;
        modal.dataset.hasBeenOpened = 'true';
    }

    // Add to taskbar if not already there
    addToTaskbar(modal);
}

// ---- Close Modal ----
function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    removeFromTaskbar(modal);
}

// ---- Minimize Modal ----
function minimizeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    // Taskbar button stays — clicking it restores
    updateTaskbarButton(modal, true);
}

// ---- Taskbar Management ----
// Stable labels (so a renamed header like "New Message" -> typed subject
// doesn't make the taskbar button change identity)
const TASKBAR_LABEL_OVERRIDES = {
    ModalContact: 'Contact',
    ModalWelcome: 'ASFC Home',
    ModalOurWork: 'Channels',
};

function getTaskbarLabel(modal) {
    if (TASKBAR_LABEL_OVERRIDES[modal.id]) return TASKBAR_LABEL_OVERRIDES[modal.id];
    const header = modal.querySelector('.window-controls span, .window-controls .title');
    if (header) return header.textContent.trim();
    return modal.id.replace('Modal', '');
}

function addToTaskbar(modal) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    if (!taskbarWindows) return;

    const taskbarId = `taskbar-${modal.id}`;
    if (document.getElementById(taskbarId)) {
        // Already in taskbar — just update state
        updateTaskbarButton(modal, false);
        return;
    }

    const btn = document.createElement('button');
    btn.id = taskbarId;
    btn.className = 'taskbar-window-button';
    btn.textContent = getTaskbarLabel(modal);
    btn.style.backgroundColor = '#0063e0';
    btn.style.width = '150px';
    btn.style.height = '54px';

    btn.addEventListener('click', () => {
        if (modal.style.display === 'none') {
            // Restore from minimized
            modal.style.display = 'block';
            bringToFront(modal);
            updateTaskbarButton(modal, false);
        } else {
            // Already visible — bring to front
            bringToFront(modal);
        }
    });

    taskbarWindows.appendChild(btn);
}

function removeFromTaskbar(modal) {
    const taskbarId = `taskbar-${modal.id}`;
    const btn = document.getElementById(taskbarId);
    if (btn) btn.remove();
}

function updateTaskbarButton(modal, isMinimized) {
    const taskbarId = `taskbar-${modal.id}`;
    const btn = document.getElementById(taskbarId);
    if (!btn) return;
    // Visual distinction for minimized windows
    btn.style.opacity = isMinimized ? '0.6' : '1';
}

// ---- Draggable Windows ----
function makeDraggable(element, handle) {
    let drag = null;
    handle.style.cursor = 'grab';
    handle.style.touchAction = 'none';

    handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button, a, input') || element.classList.contains('is-maximized')) return;
        const bounds = element.getBoundingClientRect();
        drag = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        handle.setPointerCapture(event.pointerId);
        handle.style.cursor = 'grabbing';
        bringToFront(element);
        event.preventDefault();
    });
    handle.addEventListener('pointermove', event => {
        if (!drag) return;
        // Keep the title bar reachable, even when a large window is moved aside.
        const left = Math.max(80 - element.offsetWidth, Math.min(innerWidth - 80, event.clientX - drag.x));
        const top = Math.max(0, Math.min(innerHeight - 110, event.clientY - drag.y));
        element.style.setProperty('left', left + 'px', 'important');
        element.style.setProperty('top', top + 'px', 'important');
        element.style.transform = 'none';
    });
    function finishDrag() {
        drag = null;
        handle.style.cursor = 'grab';
    }
    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
    handle.addEventListener('lostpointercapture', finishDrag);
}

// ---- Auto-Registration ----
// Scans the DOM for all modals and automatically wires up:
//   - Close buttons (text "X")
//   - Minimize buttons (text "-")
//   - Drag handles (window-controls)
//   - Click-to-front behavior
function autoRegisterModals() {
    const modals = document.querySelectorAll('.modal, [id^="Modal"]');

    modals.forEach(modal => {
        // Click anywhere on modal to bring to front
        modal.addEventListener('mousedown', () => {
            bringToFront(modal);
        });

        // Find the header for dragging
        const handle = modal.querySelector('.window-controls');
        if (handle) {
            makeDraggable(modal, handle);
        }

        // Auto-wire close and minimize buttons
        const buttons = modal.querySelectorAll('.window-btn, .window-btn-youtube, .channeltrack-btn');
        buttons.forEach(btn => {
            const text = btn.textContent.trim();
            if (text === 'X') {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeModal(modal);
                });
            } else if (text === '-') {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    minimizeModal(modal);
                });
            }
        });
    });

    console.log(`Auto-registered ${modals.length} modals`);
}

// ---- Desktop Icon -> Modal Mapping ----
// Icons open modals based on ID convention: buttonId "aboutBtn" -> "ModalAbout"
function autoRegisterIcons() {
    document.querySelectorAll('#desktop-icons .icon-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Skip if the icon was just dragged
            if (button.dataset.wasDragged === 'true') return;

            const btnId = button.id;
            if (!btnId) return;

            // Contact icon: open the compose window. Open Gmail behind it only
            // the first time (so re-clicking the icon to restore a minimized
            // compose doesn't shove Gmail back in front of everything).
            if (btnId === 'contactBtn') {
                const contact = document.getElementById('ModalContact');
                const gmail = document.getElementById('ModalGmail');
                const contactAlreadyOpened = contact && contact.dataset.hasBeenOpened === 'true';
                if (gmail && !contactAlreadyOpened) {
                    openModal(gmail);
                    if (contact) setTimeout(() => openModal(contact), 100);
                } else if (contact) {
                    openModal(contact);
                }
                return;
            }

            // Derive modal ID from button ID
            // "aboutBtn" -> "About" -> "ModalAbout"
            // "channelTrackBtn" -> "ChannelTrack" -> "ModalChannelTrack"
            // "ourWorkBtn" -> "OurWork" -> "ModalOurWork"
            // "resumeTxtBtn" -> "ResumeTxt" -> "ModalResumeTxt"
            const baseName = btnId.replace('Btn', '');
            const modalId = 'Modal' + baseName.charAt(0).toUpperCase() + baseName.slice(1);
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });
}

// ---- Listen for messages from iframes (e.g. Gmail compose button) ----
window.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'openCompose') {
        const contact = document.getElementById('ModalContact');
        if (contact) openModal(contact);
    }
});

// ---- Welcome window: auto-open on every load + wire its CTAs ----
function initWelcomeWindow() {
    const welcome = document.getElementById('ModalWelcome');
    if (!welcome) return;

    // Helper: open the contact/inquiry flow (same as the Contact icon)
    const openContact = () => {
        const contactBtn = document.getElementById('contactBtn');
        if (contactBtn) contactBtn.click();
    };
    const openById = (id) => {
        const m = document.getElementById(id);
        if (m) openModal(m);
    };

    // "Work With Us" -> contact flow (from both the About and Services windows)
    ['welcomeBookBtn', 'servicesBookBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', openContact);
    });

    // "Meet the Team" -> Team window
    const teamBtn = document.getElementById('welcomeTeamBtn');
    if (teamBtn) teamBtn.addEventListener('click', () => openById('ModalAbout'));

    // "View Services" -> Services window
    const servicesBtn = document.getElementById('welcomeServicesBtn');
    if (servicesBtn) servicesBtn.addEventListener('click', () => openById('ModalServices'));

    // Auto-open on load (desktop only; hidden on mobile via CSS / phone OS).
    // Opens even while the BIOS boot overlay is up — it's revealed when boot fades.
    if (window.innerWidth > 768) {
        openModal(welcome);
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    autoRegisterModals();
    autoRegisterIcons();
    initWelcomeWindow();
    console.log('Core window management initialized');
});
