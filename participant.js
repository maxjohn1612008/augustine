// Participant Page
let participantPoller = null;

async function renderParticipantPage(participantId) {
  const el = document.getElementById('page-participant');
  el.innerHTML = `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="icon">✝️</div>
        <h2>أوغسطين</h2>
      </div>
      <div class="navbar-user">
        <button class="btn btn-outline btn-sm" onclick="doLogout()">خروج</button>
      </div>
    </nav>
    <div id="participant-content" style="max-width:700px;margin:0 auto;padding:1rem;">${loading()}</div>
  `;

  await loadParticipantData(participantId);

  // Real-time polling
  if (participantPoller) participantPoller.stop();
  participantPoller = new Poller(() => loadParticipantData(participantId), 7000);
  participantPoller.start();
}

async function loadParticipantData(id) {
  try {
    const [p, attendance, pointsLog] = await Promise.all([
      api.getParticipant(id),
      api.getAttendanceHistory(id),
      api.getPointsLog(id),
    ]);

    document.getElementById('participant-content').innerHTML = `
      <div class="participant-hero" style="animation: slideUp 0.5s ease both;">
        <div class="participant-avatar">👤</div>
        <div class="participant-name">${p.name}</div>
        <p style="color:var(--text2);font-size:0.9rem;">مرحباً بك في نظام أوغسطين</p>

        <div class="total-points-display">
          <div>
            <div class="points-num">${p.total_points.toLocaleString('ar')}</div>
            <div class="points-label">نقطة</div>
          </div>
          <div style="font-size:2rem;">⭐</div>
        </div>
      </div>

      <div class="points-breakdown">
        <div class="breakdown-card">
          <div class="emoji">🕐</div>
          <div class="b-points">${p.attendance_points}</div>
          <div class="b-label">حضور</div>
        </div>
        <div class="breakdown-card">
          <div class="emoji">⛪</div>
          <div class="b-points">${p.mass_points}</div>
          <div class="b-label">قداس</div>
        </div>
        <div class="breakdown-card">
          <div class="emoji">🙏</div>
          <div class="b-points">${p.confession_points}</div>
          <div class="b-label">اعتراف</div>
        </div>
        <div class="breakdown-card">
          <div class="emoji">📋</div>
          <div class="b-points">${p.meeting_points}</div>
          <div class="b-label">اجتماع</div>
        </div>
      </div>

      <!-- QR Code -->
      <div class="form-section" style="text-align:center;margin:0 1rem 1.5rem;">
        <h3 style="margin-bottom:1rem;">📷 كود QR الخاص بك</h3>
        <div id="my-qr">${loading()}</div>
        <p style="color:var(--text3);font-size:0.8rem;margin-top:0.75rem;">امسح هذا الكود لتسجيل الحضور</p>
      </div>

      <!-- Attendance History -->
      <div class="form-section" style="margin:0 1rem 1.5rem;">
        <h3 style="margin-bottom:1rem;">📅 سجل الحضور</h3>
        ${attendance.length ? attendance.slice(0, 10).map(r => `
          <div class="attendance-item">
            <div>
              <div class="att-date">${r.date}</div>
              <div class="att-time">⏰ ${r.time}</div>
            </div>
            <span class="points-tag ${pointsClass(r.points)}">+${r.points} نقطة</span>
          </div>
        `).join('') : empty('لا يوجد سجل حضور بعد')}
      </div>

      <!-- Points Log -->
      <div class="form-section" style="margin:0 1rem 2rem;">
        <h3 style="margin-bottom:1rem;">⭐ سجل النقاط</h3>
        ${pointsLog.length ? pointsLog.slice(0, 15).map(l => `
          <div class="attendance-item">
            <div>
              <div class="att-date">${POINT_TYPE_LABELS[l.type] || l.type}</div>
              <div class="att-time">${l.date}${l.notes ? ' — ' + l.notes : ''}</div>
            </div>
            <span class="points-tag ${l.points_change >= 0 ? 'high' : 'low'}">${l.points_change >= 0 ? '+' : ''}${l.points_change}</span>
          </div>
        `).join('') : empty('لا يوجد سجل نقاط بعد')}
      </div>
    `;

    // Load QR
    loadMyQR(id);
  } catch (e) {
    const c = document.getElementById('participant-content');
    if (c) c.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${e.message}</p></div>`;
  }
}

async function loadMyQR(id) {
  const el = document.getElementById('my-qr');
  if (!el) return;
  try {
    const data = await api.getQR(id);
    el.innerHTML = `<img src="${data.qr_code}" alt="QR Code" style="width:160px;height:160px;border-radius:12px;" />`;
  } catch {
    el.innerHTML = '<p style="color:var(--text3);">تعذر تحميل QR</p>';
  }
}
