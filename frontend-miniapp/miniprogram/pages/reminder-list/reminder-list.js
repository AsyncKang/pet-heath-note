const reminderService = require('../../services/reminder');

Page({
  data: {
    reminders: [],
    loading: false,
    userId: null,
    petId: null,
    statusFilter: '',
    typeFilter: '',
    statusOptions: [
      { label: '全部', value: '' },
      { label: '待提醒', value: 0 },
      { label: '已完成', value: 1 }
    ],
    statusLabel: '全部',
    statusIndex: 0,
    typeOptions: [
      { label: '全部类型', value: '' },
      { label: '疫苗提醒', value: '疫苗提醒' },
      { label: '驱虫提醒', value: '驱虫提醒' }
    ],
    typeLabel: '全部类型',
    typeIndex: 0
  },

  onLoad(options = {}) {
    if (options.petId) {
      this.setData({ petId: Number(options.petId) || options.petId });
    }
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const userId = app?.globalData?.user?.id;
    this.setData({ userId }, () => {
      this.fetchReminders();
    });
  },

  fetchReminders() {
    if (!this.data.userId) {
      return;
    }
    this.setData({ loading: true });
    reminderService
      .listReminders({
        userId: this.data.userId,
        petId: this.data.petId || undefined,
        status: this.data.statusFilter,
        reminderType: this.data.typeFilter,
        page: 1,
        size: 50
      })
      .then((res) => {
        this.setData({
          reminders: res?.records || [],
          loading: false
        });
      })
      .catch((err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '获取失败',
          icon: 'none'
        });
      });
  },

  handleFilterChange(e) {
    const { value } = e.detail;
    const option = this.data.statusOptions[value];
    this.setData(
      {
        statusFilter: option.value,
        statusLabel: option.label,
        statusIndex: Number(value)
      },
      () => this.fetchReminders()
    );
  },

  handleRefresh() {
    this.fetchReminders();
  },

  handleTypeChange(e) {
    const { value } = e.detail;
    const option = this.data.typeOptions[value];
    this.setData(
      {
        typeFilter: option.value,
        typeLabel: option.label,
        typeIndex: Number(value)
      },
      () => this.fetchReminders()
    );
  },

  handleAddReminder() {
    const query = this.data.petId ? `?petId=${this.data.petId}` : '';
    wx.navigateTo({
      url: `/pages/reminder-form/reminder-form${query}`
    });
  },

  handleFinish(e) {
    const { id } = e.currentTarget.dataset;
    reminderService
      .updateReminderStatus(id, 1)
      .then(() => {
        wx.showToast({ title: '已完成', icon: 'success' });
        this.fetchReminders();
      })
      .catch((err) => {
        wx.showToast({
          title: typeof err === 'string' ? err : '操作失败',
          icon: 'none'
        });
      });
  },

  handleDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除提醒',
      content: '确定删除该提醒吗？',
      success: (res) => {
        if (res.confirm) {
          reminderService
            .deleteReminder(id)
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchReminders();
            })
            .catch((err) => {
              wx.showToast({
                title: typeof err === 'string' ? err : '删除失败',
                icon: 'none'
              });
            });
        }
      }
    });
  }
});


