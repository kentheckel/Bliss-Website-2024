"use strict";

// ===========================================
// EASTER EGGS & WIN95 CHROME
// Startup sound, Start Menu, Clippy, Konami
// code, right-click menu, screensaver, poke
// button, hourglass cursor
// ===========================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- 1. Windows Startup Sound ----
    // Plays on first user interaction (click anywhere)
    let startupPlayed = false;
    function playStartupSound() {
        if (startupPlayed) return;
        startupPlayed = true;
        const audio = document.getElementById('startupSound');
        if (audio) {
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
        document.removeEventListener('click', playStartupSound);
    }
    document.addEventListener('click', playStartupSound);

    // ---- 2. Start Menu ----
    const startBtn = document.getElementById('startButton');
    const startMenu = document.getElementById('startMenu');
    if (startBtn && startMenu) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('visible');
        });

        // Close menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startBtn) {
                startMenu.classList.remove('visible');
            }
        });

        // Shut Down -> BSOD
        const shutdownBtn = document.getElementById('menuShutDown');
        if (shutdownBtn) {
            shutdownBtn.addEventListener('click', () => {
                startMenu.classList.remove('visible');
                showBSOD();
            });
        }

        // Programs -> open various modals
        document.querySelectorAll('[data-menu-modal]').forEach(item => {
            item.addEventListener('click', () => {
                startMenu.classList.remove('visible');
                const modal = document.getElementById(item.dataset.menuModal);
                if (modal) openModal(modal);
            });
        });
    }

    // ---- 3. BSOD Screen ----
    function showBSOD() {
        const bsod = document.createElement('div');
        bsod.id = 'bsod-screen';
        bsod.innerHTML = `
            <div class="bsod-content">
                <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
                00010E36. The current application will be terminated.</p>
                <br>
                <p>*  Press any key to terminate the current application.</p>
                <p>*  Press CTRL+ALT+DEL again to restart your computer. You will</p>
                <p>   lose any unsaved information in all applications.</p>
                <br>
                <p style="text-align:center">Press any key to continue _</p>
            </div>
        `;
        document.body.appendChild(bsod);

        function dismissBSOD() {
            bsod.remove();
            document.removeEventListener('keydown', dismissBSOD);
            document.removeEventListener('click', dismissBSOD);
        }
        // Small delay so the click that triggered it doesn't immediately dismiss
        setTimeout(() => {
            document.addEventListener('keydown', dismissBSOD);
            document.addEventListener('click', dismissBSOD);
        }, 500);
    }

    // ---- 4. Clippy ----
    const clippyTips = [
        "It looks like you're trying to hire Kent. Would you like help?",
        "I see you're browsing. Have you tried clicking on things?",
        "Did you know? Kent once got 1 million views on a video about nothing.",
        "Tip: The password is hidden somewhere on this desktop...",
        "Fun fact: This entire website was hand-coded. No frameworks were harmed.",
        "You've been here a while. Maybe check out the Videos tab?",
        "Pro tip: Try dragging the icons around. They'll stay where you put them!",
        "I'm not saying you should hire Kent, but... you should hire Kent.",
        "Have you tried turning it off and on again?",
        "Kent's YouTube strategy: post good videos. Revolutionary, I know."
    ];

    function showClippy() {
        // Don't show if already visible
        if (document.getElementById('clippy-container')) return;

        const tip = clippyTips[Math.floor(Math.random() * clippyTips.length)];
        const clippy = document.createElement('div');
        clippy.id = 'clippy-container';
        clippy.innerHTML = `
            <div class="clippy-bubble">
                <p>${tip}</p>
                <button class="clippy-dismiss">OK</button>
            </div>
            <div class="clippy-character">📎</div>
        `;
        document.body.appendChild(clippy);

        clippy.querySelector('.clippy-dismiss').addEventListener('click', () => {
            clippy.remove();
        });

        // Auto-dismiss after 12 seconds
        setTimeout(() => { if (clippy.parentNode) clippy.remove(); }, 12000);
    }

    // Show Clippy randomly between 30-90 seconds after load
    setTimeout(showClippy, (30 + Math.random() * 60) * 1000);

    // ---- 5. Konami Code ----
    const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                konamiIndex = 0;
                showKonamiScreen();
            }
        } else {
            konamiIndex = 0;
        }
    });

    function showKonamiScreen() {
        const screen = document.createElement('div');
        screen.id = 'konami-screen';
        screen.innerHTML = `
            <div class="konami-content">
                <h1>🎮 SECRET UNLOCKED 🎮</h1>
                <p>You found the Konami Code!</p>
                <br>
                <p>You're clearly someone who knows their way around a keyboard.</p>
                <p>Kent would probably hire you on the spot.</p>
                <br>
                <p style="font-size: 48px;">⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️</p>
                <br>
                <button class="konami-close">CONTINUE</button>
            </div>
        `;
        document.body.appendChild(screen);
        screen.querySelector('.konami-close').addEventListener('click', () => screen.remove());
    }

    // ---- 6. Right-Click Context Menu ----
    document.addEventListener('contextmenu', (e) => {
        // Only show on the desktop background, not on modals or icons
        if (e.target.closest('.modal, [id^="Modal"], .icon-btn, #taskbar, #startMenu')) return;

        e.preventDefault();

        // Remove existing menu
        const existing = document.getElementById('context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.innerHTML = `
            <div class="context-item" id="ctx-refresh">Refresh</div>
            <div class="context-divider"></div>
            <div class="context-item" id="ctx-new-folder">New Folder</div>
            <div class="context-item" id="ctx-arrange">Arrange Icons</div>
            <div class="context-divider"></div>
            <div class="context-item" id="ctx-properties">Properties</div>
        `;
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        document.body.appendChild(menu);

        // Actions
        menu.querySelector('#ctx-refresh').addEventListener('click', () => {
            menu.remove();
            location.reload();
        });
        menu.querySelector('#ctx-new-folder').addEventListener('click', () => {
            menu.remove();
            alert("Error: Access Denied. You don't have permission to create folders on Kent's desktop.");
        });
        menu.querySelector('#ctx-arrange').addEventListener('click', () => {
            menu.remove();
            resetIconPositions();
        });
        menu.querySelector('#ctx-properties').addEventListener('click', () => {
            menu.remove();
            alert("System Properties\n\nOS: KentOS 95\nProcessor: 100% Pure Hustle\nRAM: Not Enough\nStorage: 1427.89 GB of vintage magazines");
        });

        // Close on click elsewhere
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    });

    // ---- 7. Screensaver (Bouncing ASFC Logo) ----
    let idleTimer;
    const IDLE_TIMEOUT = 60000; // 60 seconds

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        dismissScreensaver();
        idleTimer = setTimeout(showScreensaver, IDLE_TIMEOUT);
    }

    function showScreensaver() {
        if (document.getElementById('screensaver')) return;

        const ss = document.createElement('div');
        ss.id = 'screensaver';
        ss.innerHTML = '<div class="screensaver-logo">ASFC</div>';
        document.body.appendChild(ss);

        const logo = ss.querySelector('.screensaver-logo');
        let x = Math.random() * (window.innerWidth - 200);
        let y = Math.random() * (window.innerHeight - 100);
        let dx = 2;
        let dy = 2;
        const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F'];
        let colorIdx = 0;

        function animate() {
            if (!document.getElementById('screensaver')) return;
            x += dx;
            y += dy;
            if (x <= 0 || x >= window.innerWidth - 200) {
                dx = -dx;
                colorIdx = (colorIdx + 1) % colors.length;
                logo.style.color = colors[colorIdx];
            }
            if (y <= 0 || y >= window.innerHeight - 100) {
                dy = -dy;
                colorIdx = (colorIdx + 1) % colors.length;
                logo.style.color = colors[colorIdx];
            }
            logo.style.left = x + 'px';
            logo.style.top = y + 'px';
            requestAnimationFrame(animate);
        }
        animate();
    }

    function dismissScreensaver() {
        const ss = document.getElementById('screensaver');
        if (ss) ss.remove();
    }

    ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer);
    });
    resetIdleTimer();

    // ---- 8. Hourglass Cursor ----
    // Show hourglass briefly when opening modals
    const origOpenModal = window.openModal;
    if (origOpenModal) {
        window.openModal = function(modal) {
            document.body.style.cursor = 'wait';
            setTimeout(() => { document.body.style.cursor = ''; }, 600);
            origOpenModal(modal);
        };
    }

});
