// School-OS Online configuration
window.SCHOOL_OS_API_URL = 'https://script.google.com/macros/s/AKfycbwhoN26oP8WhAs982w1PUsn-9uzw1BxRlaNY517mTwZRQeKU-ioxD1MPP3lRiPhiadY/exec';
window.SCHOOL_OS_LOGO_URL = 'assets/school-logo.svg';

(function(){
  var ticks = 0;
  var lastApplied = false;
  var timer = setInterval(function(){
    ticks++;
    try{
      if(window.DB && DB.school){
        if(!DB.school.logoDataUrl){
          DB.school.logoDataUrl = window.SCHOOL_OS_LOGO_URL;
          lastApplied = true;
          if(typeof renderAllUI === 'function') renderAllUI();
          else {
            if(typeof updateTopbar === 'function') updateTopbar();
            if(typeof renderDashboard === 'function') renderDashboard();
          }
        }
      }
    }catch(e){}
    if(ticks >= 80) clearInterval(timer);
  },250);
})();
