// Augustine API Helper
const API_BASE = '/api';

const api = {
  getToken() { return localStorage.getItem('token'); },
  
  headers() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async request(method, endpoint, body = null) {
    const options = { method, headers: this.headers() };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'حدث خطأ غير متوقع');
    }
    return data;
  },

  get: (endpoint) => api.request('GET', endpoint),
  post: (endpoint, body) => api.request('POST', endpoint, body),
  put: (endpoint, body) => api.request('PUT', endpoint, body),
  delete: (endpoint) => api.request('DELETE', endpoint),

  // Auth
  loginLeader: (data) => api.post('/auth/login/leader', data),
  loginParticipant: (data) => api.post('/auth/login/participant', data),
  verifyToken: () => api.get('/auth/verify'),

  // Participants
  getParticipants: (search='', sort='points') => api.get(`/participants?search=${encodeURIComponent(search)}&sort=${sort}`),
  getParticipant: (id) => api.get(`/participants/${id}`),
  addParticipant: (data) => api.post('/participants', data),
  updateParticipant: (id, data) => api.put(`/participants/${id}`, data),
  deleteParticipant: (id) => api.delete(`/participants/${id}`),
  getAttendanceHistory: (id) => api.get(`/participants/${id}/attendance`),
  getPointsLog: (id) => api.get(`/participants/${id}/points-log`),

  // Leaders
  getLeaders: () => api.get('/leaders'),
  addLeader: (data) => api.post('/leaders', data),
  deleteLeader: (id) => api.delete(`/leaders/${id}`),

  // Attendance
  scanQR: (code) => api.post('/attendance/scan', { unique_code: code }),
  getAttendance: (date='') => api.get(`/attendance?date=${date}`),

  // Points
  updatePoints: (data) => api.post('/points/update', data),
  getLeaderboard: () => api.get('/points/leaderboard'),

  // QR
  getQR: (id) => api.get(`/qr/${id}`),
  generateAllQR: () => api.post('/qr/generate-all', {}),
};
