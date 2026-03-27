const walkService = require('../../services/walk');
const petService = require('../../services/pet');

const formatDate = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (date = new Date()) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

Page({
  data: {
    petId: '',
    petName: '',
    pets: [],
    petIndex: 0,
    form: {
      walkDate: formatDate(),
      startTime: formatTime(),
      durationMinutes: '',
      distanceKm: '',
      location: '',
      weather: '',
      mood: '',
      remark: ''
    },
    submitting: false
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
    this.loadPets(app.globalData.user?.id || null, petId);
  },

  loadPets(userId, presetPetId) {
    if (!userId) {
      return;
    }
    petService
      .listPets({
        page: 1,
        size: 50,
        userId
      })
      .then((res) => {
        const list = res?.records || [];
        const fallback = list.find((item) => `${item.id}` === `${presetPetId}`) || list[0] || {};
        const idx = fallback && list.length > 0 ? list.findIndex((item) => item.id === fallback.id) : 0;
        this.setData({
          pets: list,
          petId: fallback?.id || '',
          petName: fallback?.name || '',
          petIndex: idx >= 0 ? idx : 0
        });
      })
      .catch(() => {
        this.setData({ pets: [], petId: '', petName: '' });
      });
  },

  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  bindDateChange(e) {
    this.setData({
      'form.walkDate': e.detail.value
    });
  },

  bindTimeChange(e) {
    this.setData({
      'form.startTime': e.detail.value
    });
  },

  bindPetChange(e) {
    const index = Number(e.detail.value);
    const pet = this.data.pets[index];
    this.setData({
      petId: pet?.id || '',
      petName: pet?.name || '',
      petIndex: index
    });
  },

  handleSubmit() {
    if (this.data.submitting) {
      return;
    }
    const { petId } = this.data;
    const { walkDate, startTime, durationMinutes, distanceKm } = this.data.form;
    if (!petId) {
      wx.showToast({ title: '请选择宠物', icon: 'none' });
      return;
    }
    if (!walkDate || !startTime) {
      wx.showToast({ title: '请选择时间', icon: 'none' });
      return;
    }
    if (!durationMinutes) {
      wx.showToast({ title: '请填写时长', icon: 'none' });
      return;
    }
    if (!distanceKm) {
      wx.showToast({ title: '请填写距离', icon: 'none' });
      return;
    }
    const payload = {
      ...this.data.form,
      durationMinutes: Number(durationMinutes),
      distanceKm: Number(distanceKm),
      startTime: `${walkDate} ${startTime}:00`
    };
    this.setData({ submitting: true });
    walkService
      .createWalkRecord(petId, payload)
      .then(() => {
        wx.showToast({ title: '记录成功', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchWalkData?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '保存失败',
          icon: 'none'
        });
      });
  }
});


