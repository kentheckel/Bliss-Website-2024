"use strict";

// ===========================================
// DRAGGABLE DESKTOP ICONS
// Handles icon drag-and-drop with localStorage
// persistence for positions across page reloads
// ===========================================

function initDraggableIcons() {
    const icons = document.querySelectorAll('#desktop-icons .icon-btn');
    icons.forEach(icon => {
        loadIconPosition(icon);
        makeIconDraggable(icon);
    });
    console.log('Draggable icons initialized');
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
        }
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        icon.classList.remove('dragging');
        if (hasMoved) {
            saveIconPosition(icon);
            setTimeout(() => { icon.dataset.wasDragged = 'false'; }, 100);
        }
        hasMoved = false;
    });
}

function saveIconPosition(icon) {
    const iconId = icon.id || icon.querySelector('span')?.textContent || 'unknown';
    const positions = JSON.parse(localStorage.getItem('desktopIconPositions') || '{}');
    positions[iconId] = { left: icon.style.left, top: icon.style.top };
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
