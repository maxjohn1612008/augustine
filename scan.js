// QR Scan Page (public, no login needed for scanning)
function renderScanPage() {
  const el = document.getElementById('page-scan');
  el.innerHTML = `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="icon">✝️</div>
        <h2>أوغسطين — تسجيل الحضور</h2>
      </div>
      <button class="btn btn-outline btn-sm" onclick="showPage('login');renderLogin();">رجوع</button>
    </nav>

    <div style="max-width:500px;margin:2rem auto;padding:0 1rem;">
      <div class="scan-card">
        <h3 style="margin-bottom:0.5rem;">📷 تسجيل الحضور</h3>
        <p style="color:var(--text2);font-size:0.9rem;margin-bottom:1.25rem;">أدخل الكود الخاص بالمشترك أو امسح الـ QR</p>
        <div class="scan-input-area">
          <input 
            type="text" 
            id="scan-code-input" 
            placeholder="أدخل الكود..." 
            autofocus
            style="flex:1;padding:0.875rem 1rem;background:var(--bg2);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:1.1rem;outline:none;transition:border-color 0.25s;"
          />
          <button class="btn btn-success" onclick="submitScan()">✅ تسجيل</button>
        </div>
        <p style="color:var(--text3);font-size:0.8rem;margin-top:0.75rem;text-align:center;">
          عند استخدام QR Scanner، سيتم إدخال الكود تلقائياً
        </p>
      </div>

      <div id="scan-result-area"></div>

      <!-- Today's attendance list -->
      <div class="scan-card" style="margin-top:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h3>📋 الحضور اليوم</h3>
          <button class="btn btn-outline btn-sm" onclick="loadTodayAttendance()">🔄 تحديث</button>
        </div>
        <div id="today-attendance">${loading()}</div>
      </div>
    </div>
  `;

  const input = document.getElementById('scan-code-input');
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submitScan(); });
  input.focus();

  loadTodayAttendance();
}

async function submitScan() {
  const codeInput = document.getElementById('scan-code-input');
  const code = codeInput.value.trim();
  const resultEl = document.getElementById('scan-result-area');
  if (!code) return;

  resultEl.innerHTML = `<div class="scan-result" style="border:1px solid var(--border);">${loading()}</div>`;

  try {
    // Try parsing as JSON (from QR that has JSON payload)
    let scanCode = code;
    try {
      const parsed = JSON.parse(code);
      if (parsed.code) scanCode = parsed.code;
    } catch {}

    const data = await api.scanQR(scanCode);
    resultEl.innerHTML = `
      <div class="scan-result success">
        <div class="result-icon">✅</div>
        <div class="result-name">${data.participant.name}</div>
        <div class="result-points" style="color:var(--green);">+${data.attendance.points} نقطة</div>
        <p style="color:var(--text2);margin-top:0.5rem;">الوقت: ${data.attendance.time}</p>
        <p style="color:var(--text3);font-size:0.85rem;">مجموع النقاط: ${data.participant.total_points}</p>
      </div>
    `;
    toast(data.message, 'success');
    codeInput.value = '';
    codeInput.focus();
    loadTodayAttendance();

    // Auto-clear result after 5s
    setTimeout(() => { if (resultEl) resultEl.innerHTML = ''; }, 6000);

  } catch (e) {
    const is409 = e.message.includes('مسبقاً');
    resultEl.innerHTML = `
      <div class="scan-result ${is409 ? '' : 'error'}" style="${is409 ? 'background:rgba(246,201,14,0.1);border:1.5px solid rgba(246,201,14,0.4);' : ''}">
        <div class="result-icon">${is409 ? '⚠️' : '❌'}</div>
        <p style="font-size:1.1rem;font-weight:700;">${e.message}</p>
      </div>
    `;
    codeInput.value = '';
    codeInput.focus();
    setTimeout(() => { if (resultEl) resultEl.innerHTML = ''; }, 4000);
  }
}

async function loadTodayAttendance() {
  const el = document.getElementById('today-attendance');
  if (!el) return;
  const today = new Date().toISOString().split('T')[0];
  try {
    // Use public scan — need to try with or without auth
    // We use auth header if available
    const res = await fetch(`/api/attendance?date=${today}`, {
      headers: api.headers()
    });
    if (!res.ok) {
      el.innerHTML = '<p style="color:var(--text3);text-align:center;font-size:0.9rem;">سجّل الدخول كخادم لرؤية قائمة الحضور</p>';
      return;
    }
    const records = await res.json();
    if (!records.length) {
      el.innerHTML = '<p style="color:var(--text3);text-align:center;padding:1rem;">لا يوجد حضور اليوم بعد</p>';
      return;
    }
    el.innerHTML = records.map(r => `
      <div class="attendance-item">
        <div>
          <div class="att-date">${r.participant_name}</div>
          <div class="att-time">⏰ ${r.time}</div>
        </div>
        <span class="points-tag ${pointsClass(r.points)}">+${r.points}</span>
      </div>
    `).join('');
  } catch {
    el.innerHTML = '<p style="color:var(--text3);text-align:center;font-size:0.9rem;">تعذر تحميل قائمة الحضور</p>';
  }
}
