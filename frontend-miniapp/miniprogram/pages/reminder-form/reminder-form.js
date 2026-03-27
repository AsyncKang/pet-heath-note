const reminderService = require('../../services/reminder');

const formatDate = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

Page({
  data: {
    form: {
      reminderType: '',
      title: '',
      content: '',
      remindDate: formatDate(),
      remindTime: '09:00',
      petId: ''
    },
    submitting: false
  },

  onLoad(options = {}) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
    if (options.petId) {
      this.setData({
        'form.petId': options.petId
      });
    }
  },

  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  bindDateChange(e) {
    this.setData({
      'form.remindDate': e.detail.value
    });
  },

  bindTimeChange(e) {
    this.setData({
      'form.remindTime': e.detail.value
    });
  },

  handleSubmit() {
    if (this.data.submitting) {
      return;
    }
    const { reminderType, title, remindDate, remindTime, petId } = this.data.form;
    if (!reminderType) {
      wx.showToast({ title: '请输入提醒类型', icon: 'none' });
      return;
    }
    if (!title) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!remindDate || !remindTime) {
      wx.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const remindTimeStr = `${remindDate} ${remindTime}:00`;
    const payload = {
      reminderType,
      title,
      content: this.data.form.content,
      remindTime: remindTimeStr,
      userId,
      petId: petId ? Number(petId) : null
    };
    this.setData({ submitting: true });
    reminderService
      .createReminder(payload)
      .then(() => {
        wx.showToast({ title: '创建成功', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchReminders?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '创建失败',
          icon: 'none'
        });
      });
  }
});


