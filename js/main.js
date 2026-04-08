// js/main.js

let appData = null;
let ui = null;

function initTheme() {
  let initialTheme = localStorage.getItem('mitre-theme') || 'dark';
  document.documentElement.className = initialTheme;

  document.getElementById('btnTheme').addEventListener('click', () => {
    let current = document.documentElement.className;
    let next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.className = next;
    localStorage.setItem('mitre-theme', next);
  });
}

function initDrawerClose() {
  document.getElementById('drawerClose').addEventListener('click', () => {
    if(ui) ui.closeDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui) ui.closeDrawer();
  });
}

async function boot() {
  initTheme();
  initDrawerClose();
  
  const statusLine = document.getElementById('loadStatus');
  const overlay = document.getElementById('loadingOverlay');

  try {
    appData = await window.fetchAttackData((msg) => {
      if (statusLine) statusLine.textContent = msg;
    });

    ui = new window.UIManager(appData);
    
    ui.initMatrix();
    
    statusLine.textContent = "Ready.";
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 400);
      
      // Note: we no longer auto-select because all 14 columns are shown simultaneously.
    }, 300);

  } catch (e) {
    statusLine.textContent = "Failed to load: " + e.message;
    overlay.style.color = '#f85149';
  }
}

// Start app
window.onload = boot;
