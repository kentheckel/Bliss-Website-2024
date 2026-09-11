"use strict";

// ===========================================
// DRAGGABLE DESKTOP ICONS
// Handles icon drag-and-drop with localStorage
// persistence for positions across page reloads
// ===========================================

// Highest z-index handed out to a positioned icon so far. Freshly grabbed or
// dropped icons get ++topIconZ so the icon you touched last always sits on top
// and stays clickable — otherwise an icon parked over the trash paints *under*
// it (DOM order) and the trash steals every click in that corner.
let topIconZ = 100;

function initDraggableIcons() {
    const icons = document.querySelectorAll('#desktop-icons .icon-btn');
    icons.forEach(icon => {
        loadIconPosition(icon);
        makeIconDraggable(icon);
    });
    console.log('Draggable icons initialized');
}

// Bring a positioned icon to the front of the icon stack.
function bringIconToFront(icon) {
    icon.style.zIndex = String(++topIconZ);
}

function makeIconDraggable(icon) {
    let isDragging = false;
    let hasMoved = false;
    let startX, startY;
    let iconStartX, iconStartY;

    icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasMoved = false;
        const rect = icon.getBoundingClientRect();
        iconStartX = rect.left;
        iconStartY = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            if (!hasMoved) bringIconToFront(icon); // grabbed icon sits above the rest
            hasMoved = true;
            icon.classList.add('dragging');
            icon.dataset.wasDragged = 'true';

            let newX = Math.max(10, iconStartX + deltaX);
            let newY = Math.max(10, iconStartY + deltaY);
            const maxX = window.innerWidth - icon.offsetWidth - 10;
            const maxY = window.innerHeight - 80 - icon.offsetHeight;
            newX = Math.min(maxX, newX);
            newY = Math.min(maxY, newY);

            icon.style.position = 'fixed';
            icon.style.left = newX + 'px';
            icon.style.top = newY + 'px';
            icon.style.margin = '0';

            // Highlight the trash when an icon is hovering over it.
            const trash = document.getElementById('trashBtn');
            if (trash && icon.id !== 'trashBtn') {
                trash.classList.toggle('trash-hover', overlapsTrash(icon, trash));
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        icon.classList.remove('dragging');
        const trash = document.getElementById('trashBtn');
        if (trash) trash.classList.remove('trash-hover');

        if (hasMoved) {
            // Dropped on the trash? Hand off to the "delete Kent" easter egg.
            if (trash && icon.id !== 'trashBtn' && overlapsTrash(icon, trash) &&
                typeof window.onIconTrashed === 'function') {
                const homeX = iconStartX, homeY = iconStartY;
                const restore = () => {
                    icon.style.position = 'fixed';
                    icon.style.left = homeX + 'px';
                    icon.style.top = homeY + 'px';
                    icon.style.margin = '0';
                };
                window.onIconTrashed(icon, restore);
            } else {
                saveIconPosition(icon);
            }
            setTimeout(() => { icon.dataset.wasDragged = 'false'; }, 100);
        }
        hasMoved = false;
    });
}

// Do the icon and the trash can overlap right now?
function overlapsTrash(icon, trash) {
    const a = icon.getBoundingClientRect();
    const b = trash.getBoundingClientRect();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function saveIconPosition(icon) {
    const iconId = icon.id || icon.querySelector('span')?.textContent || 'unknown';
    const positions = JSON.parse(localStorage.getItem('desktopIconPositions') || '{}');
    positions[iconId] = { left: icon.style.left, top: icon.style.top, z: icon.style.zIndex };
    localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
}

function loadIconPosition(icon) {
    const iconId = icon.id || icon.querySelector('span')?.textContent || 'unknown';
    const positions = JSON.parse(localStorage.getItem('desktopIconPositions') || '{}');
    if (positions[iconId]) {
        icon.style.position = 'fixed';
        icon.style.left = positions[iconId].left;
        icon.style.top = positions[iconId].top;
        icon.style.margin = '0';
        // Restore stacking so a previously-moved icon still sits above the trash
        // (and keep topIconZ ahead of anything we load).
        const savedZ = parseInt(positions[iconId].z, 10);
        const z = Number.isFinite(savedZ) ? savedZ : ++topIconZ;
        icon.style.zIndex = String(z);
        if (z > topIconZ) topIconZ = z;
    }
}

function resetIconPositions() {
    localStorage.removeItem('desktopIconPositions');
    location.reload();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDraggableIcons);
} else {
    initDraggableIcons();
}
