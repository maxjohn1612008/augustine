// Augustine Utilities

function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || '📢'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr;
}

function pointsClass(pts) {
  if (pts >= 20) return 'high';
  if (pts >= 5) return 'mid';
  return 'low';
}

const POINT_TYPE_LABELS = {
  attendance: '🕐 حضور',
  mass: '⛪ قداس',
  confession: '🙏 اعتراف',
  meeting: '📋 اجتماع',
  manual_add: '➕ إضافة يدوية',
  manual_subtract: '➖ خصم يدوي',
};

function rankBadge(rank) {
  const cls = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
  const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
  return `<span class="rank-badge ${cls}">${icon}</span>`;
}

function loading() {
  return `<div class="loading"><div class="spinner"></div> جارٍ التحميل...</div>`;
}

function empty(msg = 'لا توجد بيانات') {
  return `<div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div>`;
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// Polling helper for real-time updates
class Poller {
  constructor(fn, intervalMs = 5000) {
    this.fn = fn;
    this.interval = intervalMs;
    this._timer = null;
  }
  start() { this._timer = setInterval(this.fn, this.interval); }
  stop() { clearInterval(this._timer); this._timer = null; }
}
