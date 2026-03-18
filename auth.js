// Augustine Auth State
const auth = {
  token: null,
  user: null,

  save(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  load() {
    this.token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    this.user = u ? JSON.parse(u) : null;
    return !!(this.token && this.user);
  },

  clear() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isLeader() { return this.user?.role === 'leader'; },
  isParticipant() { return this.user?.role === 'participant'; },
};
