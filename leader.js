// Leader Dashboard Page
let leaderPoller = null;
let currentLeaderTab = 'participants';

async function renderLeaderDashboard() {
  const el = document.getElementById('page-leader');
  el.innerHTML = `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="icon">✝️</div>
        <h2>أوغسطين</h2>
      </div>
      <div class="navbar-user">
        <span>👑 ${auth.user?.name}</span>
        <button class="btn btn-outline btn-sm" onclick="doLogout()">خروج</button>
      </div>
    </nav>
    <div class="dashboard">
      <div class="dashboard-tabs">
        <button class="dash-tab active" id="dtab-participants" onclick="switchDashTab('participants')">👥 المشتركون</button>
        <button class="dash-tab" id="dtab-attendance" onclick="switchDashTab('attendance')">📋 الحضور</button>
        <button class="dash-tab" id="dtab-points" onclick="switchDashTab('points')">⭐ النقاط</button>
        <button class="dash-tab" id="dtab-qr" onclick="switchDashTab('qr')">📷 QR</button>
        <button class="dash-tab" id="dtab-leaders" onclick="switchDashTab('leaders')">👑 الخدام</button>
        <button class="dash-tab" id="dtab-scan" onclick="switchDashTab('scan-inline')">🔍 مسح</button>
      </div>
      <div id="dash-content"></div>
    </div>
  `;

  switchDashTab('participants');

  // Real-time polling
  if (leaderPoller) leaderPoller.stop();
  leaderPoller = new Poller(() => {
    if (currentLeaderTab === 'participants') loadParticipantsTab(false);
  }, 8000);
  leaderPoller.start();
}

function switchDashTab(tab) {
  currentLeaderTab = tab;
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  const tabEl = document.getElementById(`dtab-${tab}`);
  if (tabEl) tabEl.classList.add('active');

  const content = document.getElementById('dash-content');
  content.innerHTML = loading();

  if (tab === 'participants') loadParticipantsTab(true);
  else if (tab === 'attendance') loadAttendanceTab();
  else if (tab === 'points') loadPointsTab();
  else if (tab === 'qr') loadQRTab();
  else if (tab === 'leaders') loadLeadersTab();
  else if (tab === 'scan-inline') loadScanInlineTab();
}

// ===================== PARTICIPANTS TAB =====================
async function loadParticipantsTab(showLoader = true) {
  const content = document.getElementById('dash-content');
  if (showLoader) content.innerHTML = loading();

  try {
    const search = document.getElementById('p-search')?.value || '';
    const sort = document.getElementById('p-sort')?.value || 'points';
    const participants = await api.getParticipants(search, sort);

    content.innerHTML = `
      <div class="stats-grid" id="stats-area">
        <div class="stat-card">
          <span class="icon">👥</span>
          <div class="value">${participants.length}</div>
          <div class="label">إجمالي المشتركين</div>
        </div>
        <div class="stat-card">
          <span class="icon">⭐</span>
          <div class="value">${participants.reduce((s, p) => s + p.total_points, 0).toLocaleString('ar')}</div>
          <div class="label">مجموع النقاط</div>
        </div>
        <div class="stat-card">
          <span class="icon">🏆</span>
          <div class="value">${participants[0]?.total_points?.toLocaleString('ar') || 0}</div>
          <div class="label">أعلى نقاط</div>
        </div>
        <div class="stat-card">
          <span class="icon">📊</span>
          <div class="value">${participants.length ? Math.round(participants.reduce((s,p)=>s+p.total_points,0)/participants.length).toLocaleString('ar') : 0}</div>
          <div class="label">متوسط النقاط</div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-title">📋 قائمة المشتركين</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <div class="search-bar">
            <input type="text" id="p-search" placeholder="🔍 بحث..." value="${search}" oninput="loadParticipantsTab(false)" />
          </div>
          <select id="p-sort" onchange="loadParticipantsTab(false)" style="padding:0.65rem 1rem;background:var(--bg2);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;outline:none;">
            <option value="points" ${sort==='points'?'selected':''}>ترتيب: النقاط</option>
            <option value="name" ${sort==='name'?'selected':''}>ترتيب: الاسم</option>
          </select>
          <button class="btn btn-success btn-sm" onclick="showAddParticipantModal()">➕ إضافة مشترك</button>
        </div>
      </div>

      <div class="table-container">
        ${participants.length === 0 ? empty('لا يوجد مشتركون بعد') : `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>النقاط الكلية</th>
              <th>حضور</th>
              <th>قداس</th>
              <th>اعتراف</th>
              <th>اجتماع</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${participants.map((p, i) => `
              <tr>
                <td>${rankBadge(i + 1)}</td>
                <td><strong>${p.name}</strong></td>
                <td><span class="points-badge">⭐ ${p.total_points.toLocaleString('ar')}</span></td>
                <td>${p.attendance_points}</td>
                <td>${p.mass_points}</td>
                <td>${p.confession_points}</td>
                <td>${p.meeting_points}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-success btn-sm" onclick="showPointsModal(${p.id},'${p.name}')">⭐ نقاط</button>
                    <button class="btn btn-gold btn-sm" onclick="showHistoryModal(${p.id},'${p.name}')">📋 سجل</button>
                    <button class="btn btn-outline btn-sm" onclick="showEditModal(${p.id},'${p.name}')">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteParticipant(${p.id},'${p.name}')">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>`}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div>`;
  }
}

// ===================== ATTENDANCE TAB =====================
async function loadAttendanceTab() {
  const content = document.getElementById('dash-content');
  const today = new Date().toISOString().split('T')[0];

  try {
    const records = await api.getAttendance(today);
    content.innerHTML = `
      <div class="section-header">
        <div class="section-title">📋 سجل الحضور</div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <input type="date" id="att-date" value="${today}" onchange="filterAttendance()" style="padding:0.65rem 1rem;background:var(--bg2);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;outline:none;" />
        </div>
      </div>
      <div class="table-container" id="att-table">
        ${renderAttendanceTable(records)}
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

function renderAttendanceTable(records) {
  if (!records.length) return empty('لا يوجد حضور في هذا اليوم');
  return `
    <table>
      <thead><tr><th>#</th><th>الاسم</th><th>التاريخ</th><th>الوقت</th><th>النقاط</th></tr></thead>
      <tbody>
        ${records.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${r.participant_name}</strong></td>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td><span class="points-tag ${pointsClass(r.points)}">+${r.points}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function filterAttendance() {
  const date = document.getElementById('att-date').value;
  const records = await api.getAttendance(date);
  document.getElementById('att-table').innerHTML = renderAttendanceTable(records);
}

// ===================== POINTS TAB =====================
async function loadPointsTab() {
  const content = document.getElementById('dash-content');
  try {
    const leaderboard = await api.getLeaderboard();
    content.innerHTML = `
      <div class="section-header">
        <div class="section-title">🏆 لوحة المتصدرين</div>
        <button class="btn btn-success btn-sm" onclick="showAddParticipantModal()">➕ مشترك جديد</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>المركز</th><th>الاسم</th><th>النقاط</th><th>حضور</th><th>قداس</th><th>اعتراف</th><th>اجتماع</th><th></th></tr></thead>
          <tbody>
            ${leaderboard.map((p, i) => `
              <tr>
                <td>${rankBadge(i + 1)}</td>
                <td><strong>${p.name}</strong></td>
                <td><span class="points-badge">⭐ ${p.total_points.toLocaleString('ar')}</span></td>
                <td><span class="tag tag-purple">${p.attendance_points}</span></td>
                <td><span class="tag tag-gold">${p.mass_points}</span></td>
                <td><span class="tag tag-green">${p.confession_points}</span></td>
                <td><span class="tag tag-purple">${p.meeting_points}</span></td>
                <td><button class="btn btn-success btn-sm" onclick="showPointsModal(${p.id},'${p.name}')">⭐ تعديل</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

// ===================== QR TAB =====================
async function loadQRTab() {
  const content = document.getElementById('dash-content');
  content.innerHTML = `
    <div class="section-header">
      <div class="section-title">📷 أكواد QR</div>
      <button class="btn btn-primary btn-sm" onclick="generateAllQR()">🔄 توليد الكل</button>
    </div>
    <div style="text-align:center;margin-bottom:1.5rem;">
      <button class="btn btn-gold" onclick="window.print()">🖨️ طباعة</button>
    </div>
    <div id="qr-grid" class="qr-print-area">${loading()}</div>
  `;

  try {
    const participants = await api.getParticipants();
    const grid = document.getElementById('qr-grid');
    if (!participants.length) { grid.innerHTML = empty('لا يوجد مشتركون'); return; }

    // Generate QR for each
    const qrCards = [];
    for (const p of participants) {
      try {
        const qrData = await api.getQR(p.id);
        qrCards.push(`
          <div class="qr-card">
            <img src="${qrData.qr_code}" alt="QR ${p.name}" />
            <div class="qr-name">${p.name}</div>
            <div class="qr-code-text">${p.unique_code.slice(0, 16)}...</div>
          </div>
        `);
      } catch {}
    }
    grid.innerHTML = qrCards.join('');
  } catch (e) {
    document.getElementById('qr-grid').innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

async function generateAllQR() {
  try {
    await api.generateAllQR();
    toast('تم توليد جميع أكواد QR', 'success');
    loadQRTab();
  } catch (e) {
    toast(e.message, 'error');
  }
}

// ===================== LEADERS TAB =====================
async function loadLeadersTab() {
  const content = document.getElementById('dash-content');
  try {
    const leaders = await api.getLeaders();
    content.innerHTML = `
      <div class="section-header">
        <div class="section-title">👑 الخدام</div>
        <button class="btn btn-success btn-sm" onclick="showAddLeaderModal()">➕ إضافة خادم</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>تاريخ الإضافة</th><th>إجراءات</th></tr></thead>
          <tbody>
            ${leaders.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${l.name}</strong></td>
                <td><code style="color:var(--accent2);background:var(--bg3);padding:0.2rem 0.5rem;border-radius:4px;">${l.username}</code></td>
                <td>${l.created_at?.slice(0, 10) || '-'}</td>
                <td>
                  ${auth.user?.name !== l.name ? `<button class="btn btn-danger btn-sm" onclick="deleteLeader(${l.id},'${l.name}')">🗑️ حذف</button>` : '<span class="tag tag-purple">أنت</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

// ===================== SCAN INLINE TAB =====================
function loadScanInlineTab() {
  const content = document.getElementById('dash-content');
  content.innerHTML = `
    <div style="max-width:500px;margin:0 auto;">
      <div class="form-section">
        <h3 style="margin-bottom:1rem;">📷 تسجيل حضور يدوي</h3>
        <p style="color:var(--text2);margin-bottom:1rem;font-size:0.9rem;">أدخل كود المشترك أو امسح QR code</p>
        <div class="scan-input-area">
          <input type="text" id="inline-scan-code" placeholder="أدخل الكود هنا..." style="flex:1;padding:0.875rem 1rem;background:var(--bg2);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:1rem;outline:none;" />
          <button class="btn btn-primary" onclick="doInlineScan()">✅ تسجيل</button>
        </div>
      </div>
      <div id="inline-scan-result"></div>
    </div>
  `;
  document.getElementById('inline-scan-code').addEventListener('keydown', e => { if (e.key === 'Enter') doInlineScan(); });
}

async function doInlineScan() {
  const code = document.getElementById('inline-scan-code').value.trim();
  const resultEl = document.getElementById('inline-scan-result');
  if (!code) { toast('أدخل الكود أولاً', 'error'); return; }

  resultEl.innerHTML = loading();
  try {
    const data = await api.scanQR(code);
    resultEl.innerHTML = `
      <div class="scan-result success">
        <div class="result-icon">✅</div>
        <div class="result-name">${data.participant.name}</div>
        <div class="result-points">+${data.attendance.points} نقطة</div>
        <p style="color:var(--text2);margin-top:0.5rem;">${data.attendance.time} — ${data.attendance.date}</p>
      </div>
    `;
    toast(data.message, 'success');
    document.getElementById('inline-scan-code').value = '';
  } catch (e) {
    resultEl.innerHTML = `
      <div class="scan-result error">
        <div class="result-icon">❌</div>
        <p>${e.message}</p>
      </div>
    `;
  }
}

// ===================== MODALS =====================
function showAddParticipantModal() {
  showModal(`
    <h3 style="margin-bottom:1.25rem;">➕ إضافة مشترك جديد</h3>
    <div class="form-group">
      <label>الاسم الكامل</label>
      <input type="text" id="new-p-name" placeholder="أدخل اسم المشترك" />
    </div>
    <button class="btn btn-primary" onclick="submitAddParticipant()">إضافة</button>
  `);
  document.getElementById('new-p-name').focus();
}

async function submitAddParticipant() {
  const name = document.getElementById('new-p-name').value.trim();
  if (!name) { toast('الاسم مطلوب', 'error'); return; }
  try {
    await api.addParticipant({ name });
    toast(`تم إضافة ${name} بنجاح`, 'success');
    closeModal();
    loadParticipantsTab(false);
  } catch (e) { toast(e.message, 'error'); }
}

function showEditModal(id, currentName) {
  showModal(`
    <h3 style="margin-bottom:1.25rem;">✏️ تعديل بيانات المشترك</h3>
    <div class="form-group">
      <label>الاسم</label>
      <input type="text" id="edit-p-name" value="${currentName}" />
    </div>
    <button class="btn btn-primary" onclick="submitEditParticipant(${id})">حفظ</button>
  `);
}

async function submitEditParticipant(id) {
  const name = document.getElementById('edit-p-name').value.trim();
  if (!name) { toast('الاسم مطلوب', 'error'); return; }
  try {
    await api.updateParticipant(id, { name });
    toast('تم التعديل بنجاح', 'success');
    closeModal();
    loadParticipantsTab(false);
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteParticipant(id, name) {
  if (!confirm(`هل تريد حذف "${name}"؟ سيتم حذف جميع بياناته.`)) return;
  try {
    await api.deleteParticipant(id);
    toast(`تم حذف ${name}`, 'success');
    loadParticipantsTab(false);
  } catch (e) { toast(e.message, 'error'); }
}

function showPointsModal(participantId, name) {
  showModal(`
    <h3 style="margin-bottom:1.25rem;">⭐ إدارة نقاط: ${name}</h3>
    <div class="form-group">
      <label>نوع النقاط</label>
      <select id="pts-type">
        <option value="mass">⛪ قداس</option>
        <option value="confession">🙏 اعتراف</option>
        <option value="meeting">📋 اجتماع</option>
        <option value="manual_add">➕ إضافة يدوية</option>
        <option value="manual_subtract">➖ خصم</option>
      </select>
    </div>
    <div class="form-group">
      <label>عدد النقاط</label>
      <input type="number" id="pts-amount" value="10" min="1" max="1000" />
    </div>
    <div class="form-group">
      <label>ملاحظة (اختياري)</label>
      <input type="text" id="pts-notes" placeholder="سبب التعديل..." />
    </div>
    <div style="display:flex;gap:0.75rem;">
      <button class="btn btn-success" style="flex:1;" onclick="submitPoints(${participantId})">✅ حفظ النقاط</button>
    </div>
  `);
}

async function submitPoints(participantId) {
  const type = document.getElementById('pts-type').value;
  const points = parseInt(document.getElementById('pts-amount').value);
  const notes = document.getElementById('pts-notes').value;
  if (!points || points <= 0) { toast('أدخل عدد نقاط صحيح', 'error'); return; }
  try {
    const res = await api.updatePoints({ participant_id: participantId, type, points, notes });
    const change = res.points_change;
    toast(`تم ${change >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(change)} نقطة`, 'success');
    closeModal();
    loadParticipantsTab(false);
  } catch (e) { toast(e.message, 'error'); }
}

async function showHistoryModal(id, name) {
  showModal(`
    <h3 style="margin-bottom:1rem;">📋 سجل: ${name}</h3>
    <div id="history-tabs" style="display:flex;gap:0.5rem;margin-bottom:1rem;">
      <button class="btn btn-primary btn-sm" onclick="loadModalHistory('attendance',${id})">📅 حضور</button>
      <button class="btn btn-outline btn-sm" onclick="loadModalHistory('points',${id})">⭐ نقاط</button>
    </div>
    <div id="history-content">${loading()}</div>
  `);
  loadModalHistory('attendance', id);
}

async function loadModalHistory(type, id) {
  const el = document.getElementById('history-content');
  el.innerHTML = loading();
  try {
    if (type === 'attendance') {
      const records = await api.getAttendanceHistory(id);
      el.innerHTML = records.length ? records.map(r => `
        <div class="attendance-item">
          <div>
            <div class="att-date">${r.date}</div>
            <div class="att-time">⏰ ${r.time}</div>
          </div>
          <span class="points-tag ${pointsClass(r.points)}">+${r.points}</span>
        </div>
      `).join('') : empty('لا يوجد سجل حضور');
    } else {
      const logs = await api.getPointsLog(id);
      el.innerHTML = logs.length ? logs.map(l => `
        <div class="attendance-item">
          <div>
            <div class="att-date">${POINT_TYPE_LABELS[l.type] || l.type}</div>
            <div class="att-time">${l.date}${l.leader_name ? ' — ' + l.leader_name : ''}</div>
            ${l.notes ? `<div class="att-time" style="color:var(--text3);">${l.notes}</div>` : ''}
          </div>
          <span class="points-tag ${l.points_change >= 0 ? 'high' : 'low'}">${l.points_change >= 0 ? '+' : ''}${l.points_change}</span>
        </div>
      `).join('') : empty('لا يوجد سجل نقاط');
    }
  } catch (e) { el.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`; }
}

function showAddLeaderModal() {
  showModal(`
    <h3 style="margin-bottom:1.25rem;">👑 إضافة خادم جديد</h3>
    <div class="form-group"><label>الاسم</label><input type="text" id="new-l-name" placeholder="الاسم الكامل" /></div>
    <div class="form-group"><label>اسم المستخدم</label><input type="text" id="new-l-username" placeholder="username" /></div>
    <div class="form-group"><label>كلمة المرور</label><input type="password" id="new-l-password" placeholder="كلمة المرور" /></div>
    <button class="btn btn-primary" onclick="submitAddLeader()">إضافة</button>
  `);
}

async function submitAddLeader() {
  const name = document.getElementById('new-l-name').value.trim();
  const username = document.getElementById('new-l-username').value.trim();
  const password = document.getElementById('new-l-password').value;
  if (!name || !username || !password) { toast('جميع الحقول مطلوبة', 'error'); return; }
  try {
    await api.addLeader({ name, username, password });
    toast(`تم إضافة الخادم ${name}`, 'success');
    closeModal();
    loadLeadersTab();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteLeader(id, name) {
  if (!confirm(`حذف الخادم "${name}"؟`)) return;
  try {
    await api.deleteLeader(id);
    toast('تم حذف الخادم', 'success');
    loadLeadersTab();
  } catch (e) { toast(e.message, 'error'); }
}
