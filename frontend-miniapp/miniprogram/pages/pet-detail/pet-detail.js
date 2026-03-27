const petService = require('../../services/pet');
const healthService = require('../../services/health');
const vaccineService = require('../../services/vaccine');
const reminderService = require('../../services/reminder');

const PET_AVATAR_PLACEHOLDER = 'https://cdn.jsdelivr.net/gh/placeholderlogo/pet-avatar@main/pet.png';

const formatAge = (birthDateStr) => {
  if (!birthDateStr) return '未知';
  const birthDate = new Date(birthDateStr);
  if (Number.isNaN(birthDate.getTime())) return '未知';
  const now = new Date();
  if (birthDate > now) return '未知';
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years > 0) {
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
  }
  if (months > 0) {
    return `${months}个月`;
  }
  return `${Math.max(days, 1)}天`;
};

const formatDateTime = (value) => {
  if (!value) return '';
  const baseValue = typeof value === 'string' ? value.replace('T', ' ') : value;
  const date = new Date(baseValue.replace(/-/g, '/'));
  if (Number.isNaN(date.getTime())) return baseValue || '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

Page({
  data: {
    petId: null,
    pet: null,
    healthRecords: [],
    vaccineRecords: [],
    dewormRecords: [],
    reminders: [],
    loading: false,
    vaccineLoading: false,
    dewormLoading: false,
    reminderLoading: false,
    defaultPetAvatar: PET_AVATAR_PLACEHOLDER
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
    this.fetchPetDetail();
    this.fetchHealthRecords();
    this.fetchVaccineRecords();
    this.fetchDewormRecords();
    this.fetchReminders();
  },

  onShow() {
    if (this.data.petId) {
      this.fetchPetDetail();
      this.fetchReminders();
    }
  },

  fetchPetDetail() {
    petService
      .getPet(this.data.petId)
      .then((res) => {
        const petWithAge = {
          ...res,
          ageText: formatAge(res.birthDate)
        };
        this.setData({ pet: petWithAge });
      })
      .catch(() => {
        wx.showToast({ title: '获取宠物失败', icon: 'none' });
      });
  },

  fetchVaccineRecords() {
    this.setData({ vaccineLoading: true });
    vaccineService
      .listVaccineRecords(this.data.petId, { page: 1, size: 20 })
      .then((res) => {
        // 过滤出疫苗记录（排除驱虫记录）
        const allRecords = res?.records || [];
        const vaccineRecords = allRecords.filter(record => {
          const type = (record.vaccineType || '').toLowerCase();
          return !type.includes('驱虫') && type !== 'deworming';
        });
        this.setData({
          vaccineRecords,
          vaccineLoading: false
        });
      })
      .catch(() => {
        this.setData({ vaccineLoading: false });
        wx.showToast({ title: '获取疫苗记录失败', icon: 'none' });
      });
  },

  fetchDewormRecords() {
    this.setData({ dewormLoading: true });
    vaccineService
      .listVaccineRecords(this.data.petId, { page: 1, size: 20 })
      .then((res) => {
        // 过滤出驱虫记录
        const allRecords = res?.records || [];
        const dewormRecords = allRecords.filter(record => {
          const type = (record.vaccineType || '').toLowerCase();
          return type.includes('驱虫') || type === 'deworming';
        });
        this.setData({
          dewormRecords,
          dewormLoading: false
        });
      })
      .catch(() => {
        this.setData({ dewormLoading: false });
        wx.showToast({ title: '获取驱虫记录失败', icon: 'none' });
      });
  },

  fetchHealthRecords() {
    this.setData({ loading: true });
    healthService
      .listHealthRecords(this.data.petId, { page: 1, size: 20 })
      .then((res) => {
        const records = (res?.records || []).map((item) => ({
          ...item,
          displayDate: item.recordDate ? item.recordDate.replace('T', ' ') : '',
          swipeOffset: 0,
          deleteVisible: false
        }));
        this.setData({
          healthRecords: records,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '获取健康记录失败', icon: 'none' });
      });
  },

  fetchReminders() {
    this.setData({ reminderLoading: true });
    reminderService
      .listReminders({
        petId: this.data.petId,
        status: 0,
        page: 1,
        size: 20
      })
      .then((res) => {
        const reminders = (res?.records || []).map((item) => ({
          ...item,
          typeTag: item.reminderType || '提醒',
          displayTime: formatDateTime(item.remindTime)
        }));
        this.setData({
          reminders,
          reminderLoading: false
        });
      })
      .catch(() => {
        this.setData({ reminderLoading: false });
      });
  },

  handleAddRecord() {
    wx.navigateTo({
      url: `/pages/health-record-form/health-record-form?petId=${this.data.petId}`
    });
  },

  handleAddVaccine() {
    wx.navigateTo({
      url: `/pages/vaccine-form/vaccine-form?petId=${this.data.petId}`
    });
  },

  handleAddDeworm() {
    wx.navigateTo({
      url: `/pages/vaccine-form/vaccine-form?petId=${this.data.petId}&type=deworm`
    });
  },

  handleViewWeightChart() {
    const petName = this.data.pet?.name ? encodeURIComponent(this.data.pet.name) : '';
    wx.navigateTo({
      url: `/pages/weight-chart/weight-chart?petId=${this.data.petId}&petName=${petName}`
    });
  },

  handleEditVaccineRecord(e) {
    const { id, isDeworm } = e.currentTarget.dataset;
    if (!id) return;
    const typeParam = isDeworm ? '&type=deworm' : '';
    wx.navigateTo({
      url: `/pages/vaccine-form/vaccine-form?petId=${this.data.petId}&recordId=${id}${typeParam}`
    });
  },

  handleDeleteVaccineRecord(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.showModal({
      title: '删除记录',
      content: '确定删除该记录吗？',
      confirmColor: '#d81e06',
      success: (res) => {
        if (res.confirm) {
          vaccineService
            .deleteVaccineRecord(id)
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchRecords();
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
  },

  handleReminderDone(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    reminderService
      .updateReminderStatus(id, 1)
      .then(() => {
        wx.showToast({ title: '已完成', icon: 'success' });
        this.fetchReminders();
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  handleViewReminders() {
    wx.navigateTo({
      url: `/pages/reminder-list/reminder-list?petId=${this.data.petId}`
    });
  },

  handleEditPet() {
    wx.navigateTo({
      url: `/pages/pet-form/pet-form?petId=${this.data.petId}`
    });
  },

  handleDeleteHealth(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }
    wx.showModal({
      title: '删除健康记录',
      content: '确定删除该健康记录吗？',
      confirmColor: '#d81e06',
      success: (res) => {
        if (res.confirm) {
          healthService
            .deleteHealthRecord(id)
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchHealthRecords();
            })
            .catch((err) => {
              wx.showToast({ title: typeof err === 'string' ? err : '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  handleHealthTouchStart(e) {
    const { id } = e.currentTarget.dataset;
    this.touchStartX = e.touches[0].clientX;
    this.touchMoveId = id;
    const current = this.data.healthRecords.find((record) => record.id === id);
    this.startOffset = current?.swipeOffset || 0;
    const reset = this.data.healthRecords.map((record) => ({
      ...record,
      swipeOffset: record.id === id ? record.swipeOffset || 0 : 0,
      deleteVisible: record.id === id ? record.deleteVisible : false
    }));
    this.setData({ healthRecords: reset });
  },

  handleHealthTouchMove(e) {
    if (!this.touchMoveId) return;
    const moveX = e.touches[0].clientX;
    const diff = moveX - this.touchStartX;
    const deleteWidth = 140;
    const { id } = e.currentTarget.dataset;
    if (id !== this.touchMoveId) return;
    let offset = this.startOffset + diff;
    offset = Math.min(0, offset);
    offset = Math.max(-deleteWidth, offset);
    this.setData({
      healthRecords: this.data.healthRecords.map((record) =>
        record.id === id
          ? { ...record, swipeOffset: offset, deleteVisible: offset < 0 }
          : record
      )
    });
  },

  handleHealthTouchEnd(e) {
    const { id } = e.currentTarget.dataset;
    if (!this.touchMoveId || id !== this.touchMoveId) return;
    const deleteWidth = 140;
    const threshold = deleteWidth / 2;
    const current = this.data.healthRecords.find((record) => record.id === id);
    const finalOffset = current && Math.abs(current.swipeOffset || 0) >= threshold ? -deleteWidth : 0;
    this.setData({
      healthRecords: this.data.healthRecords.map((record) =>
        record.id === id
          ? { ...record, swipeOffset: finalOffset, deleteVisible: finalOffset !== 0 }
          : record
      )
    });
    this.touchMoveId = null;
  },

  fetchRecords() {
    this.fetchVaccineRecords();
    this.fetchDewormRecords();
    this.fetchReminders();
  }
});


