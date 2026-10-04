// School-OS Online configuration
window.SCHOOL_OS_API_URL = 'https://script.google.com/macros/s/AKfycbwhoN26oP8WhAs982w1PUsn-9uzw1BxRlaNY517mTwZRQeKU-ioxD1MPP3lRiPhiadY/exec';

// Guest dashboard/UI patch: keep only room, teacher, and substitute cards.
// Announcement UI is disabled for now.
(function () {
  function patchSchoolOSUI() {
    // Remove announcement entry points and page from the visible UI.
    var annNav = document.getElementById('nav-announcements');
    if (annNav) annNav.style.display = 'none';

    var annPage = document.getElementById('page-announcements');
    if (annPage) annPage.style.display = 'none';

    document.querySelectorAll('[data-page="announcements"]').forEach(function (el) {
      el.style.display = 'none';
    });

    var grid = document.querySelector('.guest-shortcut-grid');
    if (!grid) return;

    // Remove announcement card.
    Array.from(grid.querySelectorAll('.guest-shortcut-card')).forEach(function (card) {
      var text = (card.textContent || '').trim();
      if (text.indexOf('ประกาศ') !== -1) card.remove();
    });

    // Rename room card.
    var roomCard = Array.from(grid.querySelectorAll('.guest-shortcut-card')).find(function (card) {
      return (card.textContent || '').indexOf('ตารางสอนแต่ละห้อง') !== -1 ||
             (card.textContent || '').indexOf('ตารางสอนรายห้อง') !== -1;
    });
    if (roomCard) {
      var strong = roomCard.querySelector('strong');
      if (strong) strong.textContent = 'ตารางสอนรายห้อง';
    }

    // Ensure teacher card exists.
    var teacherCard = Array.from(grid.querySelectorAll('.guest-shortcut-card')).find(function (card) {
      return (card.textContent || '').indexOf('ตารางสอนรายครู') !== -1;
    });
    if (!teacherCard) {
      teacherCard = document.createElement('button');
      teacherCard.className = 'guest-shortcut-card purple';
      teacherCard.setAttribute('onclick', "nav('teacher-view')");
      teacherCard.innerHTML =
        '<span class="guest-shortcut-icon">👨‍🏫</span>' +
        '<span><strong>ตารางสอนรายครู</strong><small>ค้นหาครูและดูตารางสอนรายบุคคล</small></span>' +
        '<span class="guest-shortcut-arrow">→</span>';
      var cards = grid.querySelectorAll('.guest-shortcut-card');
      if (cards.length > 0) cards[0].after(teacherCard);
      else grid.appendChild(teacherCard);
    }

    // Normalize substitute title.
    var subCard = Array.from(grid.querySelectorAll('.guest-shortcut-card')).find(function (card) {
      return (card.textContent || '').indexOf('ตารางสอนแทน') !== -1;
    });
    if (subCard) {
      var subStrong = subCard.querySelector('strong');
      if (subStrong) subStrong.textContent = 'ตารางสอนแทน';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchSchoolOSUI);
  } else {
    patchSchoolOSUI();
  }

  var observer = new MutationObserver(function () { patchSchoolOSUI(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
