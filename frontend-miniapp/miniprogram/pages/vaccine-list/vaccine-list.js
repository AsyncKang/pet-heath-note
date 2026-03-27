const vaccineService = require('../../services/vaccine');

Page({
  data: {
    petId: null,
    records: [],
    loading: false
  },

  onLoad(options) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const { petId } = options;
    if (!petId) {
      wx.showToast({ title: '缺少宠物ID', icon: 'none' });
      return;
    }
    this.setData({ petId });
    this.fetchRecords();
  },

  fetchRecords() {
    this.setData({ loading: true });
    vaccineService
      .listVaccineRecords(this.data.petId, { page: 1, size: 20 })
      .then((res) => {
        this.setData({
          records: res?.records || [],
          loading: false
        });
      })
      .catch((err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '获取数据失败',
          icon: 'none'
        });
      });
  },

  handleRefresh() {
    this.fetchRecords();
  },

  handleAddRecord() {
    wx.navigateTo({
      url: `/pages/vaccine-form/vaccine-form?petId=${this.data.petId}`
    });
  }
});


