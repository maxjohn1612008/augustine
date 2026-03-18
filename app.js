// Augustine App - Main Router

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const page = document.getElementById(`page-${name}`);
  if (page) page.classList.remove('hidden');

  // Stop pollers when leaving pages
  if (name !== 'leader' && leaderPoller) { leaderPoller.stop(); leaderPoller = null; }
  if (name !== 'participant' && participantPoller) { participantPoller.stop(); participantPoller = null; }
}

function doLogout() {
  auth.clear();
  if (leaderPoller) { leaderPoller.stop(); leaderPoller = null; }
  if (participantPoller) { participantPoller.stop(); participantPoller = null; }
  showPage('login');
  renderLogin();
}

// App initialization
async function init() {
  const loaded = auth.load();
  
  if (!loaded) {
    showPage('login');
    renderLogin();
    return;
  }

  // Verify token is still valid
  try {
    await api.verifyToken();
    
    if (auth.isLeader()) {
      showPage('leader');
      renderLeaderDashboard();
    } else if (auth.isParticipant()) {
      showPage('participant');
      renderParticipantPage(auth.user.id);
    } else {
      auth.clear();
      showPage('login');
      renderLogin();
    }
  } catch {
    auth.clear();
    showPage('login');
    renderLogin();
  }
}

// Boot
init();
