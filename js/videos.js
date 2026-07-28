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

// Wire up items in the explorer folder windows (Our Work, Our Products)
// data-channel="X"  -> opens the channel's analytics + strategy windows
// data-opens="ModalX" -> opens that modal (used for product pages)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.explorer-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.channel) {
                openChannelModals(item.dataset.channel);
            } else if (item.dataset.opens) {
                const modal = document.getElementById(item.dataset.opens);
                if (modal) openModal(modal);
            }
        });
    });
});
