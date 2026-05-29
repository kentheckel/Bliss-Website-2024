"use strict";

// ===========================================
// VIDEOS & ANALYTICS FUNCTIONALITY
// Handles YouTube channel selection and
// opening analytics/textbox modal pairs
// ===========================================

function openChannelModals(channelName) {
    const textBox = document.getElementById(`ModalTextBox${channelName}`);
    const analytics = document.getElementById(`ModalAnalytics${channelName}`);
    if (analytics) openModal(analytics);
    if (textBox) openModal(textBox);
}

function switchAnalyticsTab(tabName) {
    const tabPanels = document.querySelectorAll('.tab-panel');
    const analyticsTabs = document.querySelectorAll('.analytics-tab');

    tabPanels.forEach(panel => { panel.style.display = 'none'; });
    analyticsTabs.forEach(tab => { tab.classList.remove('active'); });

    const activePanel = document.getElementById(tabName);
    if (activePanel) activePanel.style.display = 'block';

    const activeTab = document.querySelector(`.analytics-tab[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
}

// Wire up account items in the Videos modal
document.addEventListener('DOMContentLoaded', () => {
    const accountItems = document.querySelectorAll('#ModalVideos .account-item');
    accountItems.forEach(item => {
        const channelName = item.dataset.channel;
        item.addEventListener('click', (e) => {
            if (e.target.closest('.arrow-btn')) return;
            openChannelModals(channelName);
        });
    });
});
