const favoriteService = require('../../services/favorite');

const PLACE_TYPE_LABEL = {
  HOSPITAL: '宠物医院',
  SHOP: '宠物店',
  PARK: '宠物公园',
  OTHER: '其他'
};

Page({
  data: {
    favoriteId: null,
    favorite: null,
    loading: false
  },

  onLoad(options) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '缺少收藏ID', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ favoriteId: id }, () => {
      this.fetchFavorite();
    });
  },

  fetchFavorite() {
    this.setData({ loading: true });
    favoriteService
      .getFavoritePlace(this.data.favoriteId)
      .then((res) => {
        this.setData({
          favorite: {
            ...res,
            typeLabel: PLACE_TYPE_LABEL[res.placeType] || '其他'
          },
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      });
  },

  copyAddress() {
    if (!this.data.favorite?.address) return;
    wx.setClipboardData({
      data: this.data.favorite.address,
      success: () => {
        wx.showToast({ title: '地址已复制', icon: 'success' });
      }
    });
  },

  callPhone() {
    if (!this.data.favorite?.contact) return;
    wx.makePhoneCall({
      phoneNumber: this.data.favorite.contact
    });
  },

  handleNavigate() {
    const fav = this.data.favorite;
    if (!fav?.latitude || !fav?.longitude) {
      wx.showToast({ title: '缺少位置信息', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude: Number(fav.latitude),
      longitude: Number(fav.longitude),
      name: fav.name,
      address: fav.address
    });
  },

  handleEdit() {
    wx.navigateTo({
      url: `/pages/favorite-form/favorite-form?id=${this.data.favoriteId}`
    });
  },

  handleDelete() {
    wx.showModal({
      title: '删除收藏',
      content: '确定删除该地点吗？',
      confirmColor: '#d81e06',
      success: (res) => {
        if (res.confirm) {
          favoriteService
            .deleteFavoritePlace(this.data.favoriteId)
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 800);
            })
            .catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  }
});


