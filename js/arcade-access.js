'use strict';
(() => {
  function refresh() {
    const modal = document.getElementById('ModalGames');
    const host = modal.querySelector('.arcade-gate-host');
    const unlocked = ASFCArcade.isUnlocked();
    host.hidden = unlocked;
    if (!unlocked) host.innerHTML = ASFCArcade.gateHTML();
    modal.querySelectorAll(':scope > [data-arcade-content]').forEach(el => { el.hidden = !unlocked; });
    const note = document.getElementById('passwordTextArea');
    if (note) note.value = ASFCArcade.note;
  }
  function openGames() {
    if (innerWidth <= 768) openApp('games');
    else openModal(document.getElementById('ModalGames'));
  }
  document.addEventListener('DOMContentLoaded', refresh);
  document.addEventListener('submit', event => {
    if (!event.target.matches('[data-arcade-unlock]')) return;
    event.preventDefault();
    const form = event.target;
    const error = ASFCArcade.unlock(form.elements['arcade-password'].value);
    if (error) { form.querySelector('.arcade-error').textContent = error; form.elements['arcade-password'].select(); return; }
    const destination = ASFCArcade.destination();
    if (destination) { location.assign(destination); return; }
    refresh();
    openGames();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-arcade-trash]')) {
      if (innerWidth <= 768) openApp('trash');
      else openModal(document.getElementById('ModalTrash'));
    }
    if (event.target.closest('[data-arcade-open]')) openGames();
    if (event.target.closest('[data-arcade-lock]')) {
      ASFCArcade.lock(); refresh(); openGames();
    }
  });
  window.addEventListener('pageshow', refresh);
})();
