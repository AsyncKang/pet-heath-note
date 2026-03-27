// 生产环境后端地址
const DEFAULT_BASE_URL = 'http://192.168.32.130:8080';

App({
  globalData: {
    baseUrl: DEFAULT_BASE_URL,
    token: '',
    user: null,
    // 订阅消息模板ID，请替换为微信公众平台申请到的ID
    subscribeTemplateIds: {
      vaccine: 'l21wHbmOMHcR-d5jD4tUkoyYUNVeYjr5E6XrUuFAwJI',
      deworm: 'l21wHbmOMHcR-d5jD4tUkoyYUNVeYjr5E6XrUuFAwJI'
    }
  },
  onLaunch() {
    const token = wx.getStorageSync('token');
    const user = wx.getStorageSync('user');
    if (token) {
      this.globalData.token = token;
      this.globalData.user = user || null;
    }
  },
  setSession(session) {
    if (!session) {
      return;
    }
    this.globalData.token = session.token || '';
    this.globalData.user = session.user || null;
    if (session.token) {
      wx.setStorageSync('token', session.token);
    } else {
      wx.removeStorageSync('token');
    }
    if (session.user) {
      wx.setStorageSync('user', session.user);
    } else {
      wx.removeStorageSync('user');
    }
  },
  clearSession() {
    this.globalData.token = '';
    this.globalData.user = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('user');
  },
  isLoggedIn() {
    return !!this.globalData.token;
  }
});


