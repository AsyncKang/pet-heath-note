const petService = require('../../services/pet');

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

Page({
  data: {
    loading: false,
    pets: [],
    defaultPetAvatar: PET_AVATAR_PLACEHOLDER
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.fetchPets();
  },

  fetchPets() {
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    this.setData({ loading: true });
    petService
      .listPets({
        page: 1,
        size: 20,
        userId
      })
      .then((res) => {
        const list = (res?.records || []).map((item) => ({
          ...item,
          ageText: formatAge(item.birthDate)
        }));
        this.setData({
          pets: list,
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
    this.fetchPets();
  },

  handleAddPet() {
    wx.navigateTo({
      url: '/pages/pet-form/pet-form'
    });
  },

  handleToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/pet-detail/pet-detail?petId=${id}`
    });
  }
});


