'use strict';
(() => {
  function check() {
    if (window.ASFCArcade?.isUnlocked()) {
      document.documentElement.style.removeProperty('visibility');
      return;
    }
    document.documentElement.style.visibility = 'hidden';
    location.replace('/?app=games&game=' + encodeURIComponent(location.pathname));
  }
  check();
  window.addEventListener('pageshow', check);
})();
