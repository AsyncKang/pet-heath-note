const reminderService = require('../../services/reminder');

Page({
  data: {
    upcomingReminders: [],
    loading: false
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.loadUpcomingReminders();
  },

  loadUpcomingReminders() {
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    if (!userId) {
      return;
    }
    this.setData({ loading: true });
    reminderService
      .listReminders({
        userId,
        status: 0,
        page: 1,
        size: 5
      })
      .then((res) => {
        this.setData({
          upcomingReminders: res?.records || [],
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  handleViewAllReminders() {
    wx.navigateTo({
      url: '/pages/reminder-list/reminder-list'
    });
  },

  handleGoPets() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  handleAddHealthRecord() {
    wx.showToast({
      title: '请在宠物详情页新增记录',
      icon: 'none'
    });
  }
});


