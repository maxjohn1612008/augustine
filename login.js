// Login Page
function renderLogin() {
  const el = document.getElementById('page-login');
  el.innerHTML = `
    <div class="login-container">
      <div class="login-logo">
        <div class="logo-icon">✝️</div>
        <h1>أوغسطين</h1>
        <p>نظام الحضور والنقاط</p>
      </div>

      <div class="login-tabs">
        <button class="login-tab active" id="tab-leader" onclick="switchLoginTab('leader')">
          👑 الخادم
        </button>
        <button class="login-tab" id="tab-participant" onclick="switchLoginTab('participant')">
          👤 المخدوم
        </button>
        <button class="login-tab" id="tab-scan" onclick="switchLoginTab('scan')">
          📷 مسح QR
        </button>
      </div>

      <div class="login-card">
        <div id="login-form-area"></div>
      </div>
    </div>
  `;
  renderLeaderLoginForm();
}

function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  
  if (tab === 'leader') renderLeaderLoginForm();
  else if (tab === 'participant') renderParticipantLoginForm();
  else if (tab === 'scan') goToScanPage();
}

function goToScanPage() {
  showPage('scan');
  renderScanPage();
}

function renderLeaderLoginForm() {
  document.getElementById('login-form-area').innerHTML = `
    <h3 style="margin-bottom:1.25rem;text-align:center;">تسجيل دخول الخادم</h3>
    <div class="form-group">
      <label>اسم المستخدم</label>
      <input type="text" id="leader-username" placeholder="أدخل اسم المستخدم" autocomplete="username" />
    </div>
    <div class="form-group">
      <label>كلمة المرور</label>
      <input type="password" id="leader-password" placeholder="أدخل كلمة المرور" autocomplete="current-password" />
    </div>
    <button class="btn btn-primary" onclick="doLeaderLogin()">دخول 👑</button>
    <p id="login-error" style="color:var(--red);text-align:center;margin-top:1rem;font-size:0.9rem;min-height:1.2em"></p>
  `;
  document.getElementById('leader-password').addEventListener('keydown', e => { if(e.key==='Enter') doLeaderLogin(); });
}

function renderParticipantLoginForm() {
  document.getElementById('login-form-area').innerHTML = `
    <h3 style="margin-bottom:1.25rem;text-align:center;">دخول المخدوم</h3>
    <div class="form-group">
      <label>الكود الخاص بك</label>
      <input type="text" id="participant-code" placeholder="أدخل الكود الخاص بك" />
    </div>
    <button class="btn btn-primary" onclick="doParticipantLogin()">دخول 👤</button>
    <p id="login-error" style="color:var(--red);text-align:center;margin-top:1rem;font-size:0.9rem;min-height:1.2em"></p>
  `;
}

async function doLeaderLogin() {
  const username = document.getElementById('leader-username').value.trim();
  const password = document.getElementById('leader-password').value;
  const errEl = document.getElementById('login-error');
  
  if (!username || !password) { errEl.textContent = 'يرجى إدخال جميع البيانات'; return; }
  
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'جارٍ الدخول...';
  errEl.textContent = '';
  
  try {
    const data = await api.loginLeader({ username, password });
    auth.save(data.token, { name: data.name, role: 'leader' });
    showPage('leader');
    renderLeaderDashboard();
  } catch (e) {
    errEl.textContent = e.message;
    btn.disabled = false;
    btn.textContent = 'دخول 👑';
  }
}

async function doParticipantLogin() {
  const code = document.getElementById('participant-code').value.trim();
  const errEl = document.getElementById('login-error');
  
  if (!code) { errEl.textContent = 'يرجى إدخال الكود'; return; }
  
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'جارٍ الدخول...';
  errEl.textContent = '';
  
  try {
    const data = await api.loginParticipant({ code });
    auth.save(data.token, { name: data.name, role: 'participant', id: data.id });
    showPage('participant');
    renderParticipantPage(data.id);
  } catch (e) {
    errEl.textContent = e.message;
    btn.disabled = false;
    btn.textContent = 'دخول 👤';
  }
}
