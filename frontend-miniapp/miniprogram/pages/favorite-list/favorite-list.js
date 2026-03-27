const favoriteService = require('../../services/favorite');

const PLACE_TYPE_TABS = [
  { label: '全部', value: 'ALL' },
  { label: '宠物医院', value: 'HOSPITAL' },
  { label: '宠物店', value: 'SHOP' },
  { label: '宠物公园', value: 'PARK' },
  { label: '其他', value: 'OTHER' }
];

const PLACE_TYPE_LABEL = {
  HOSPITAL: '宠物医院',
  SHOP: '宠物店',
  PARK: '宠物公园',
  OTHER: '其他'
};

Page({
  data: {
    userId: null,
    favorites: [],
    placeTypeTabs: PLACE_TYPE_TABS,
    activeType: 'ALL',
    loading: false,
    page: 1,
    size: 50
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    const userId = app.globalData.user?.id;
    if (!userId) {
      wx.showToast({ title: '未获取到用户信息', icon: 'none' });
      return;
    }
    this.setData({ userId }, () => {
      this.fetchFavorites();
    });
  },

  fetchFavorites() {
    if (!this.data.userId) return;
    this.setData({ loading: true });
    const params = {
      page: this.data.page,
      size: this.data.size
    };
    if (this.data.activeType && this.data.activeType !== 'ALL') {
      params.placeType = this.data.activeType;
    }
    favoriteService
      .listFavoritePlaces(this.data.userId, params)
      .then((res) => {
        const records = res?.records || [];
        const formatted = records.map((item) => ({
          ...item,
          typeLabel: PLACE_TYPE_LABEL[item.placeType] || '其他',
          displayAddress: item.address?.length > 20 ? `${item.address.slice(0, 20)}...` : item.address
        }));
        this.setData({
          favorites: formatted,
          loading: false
        });
      })
      .catch((err) => {
        console.error('[favorite-list] fetch favorites failed', err);
        this.setData({ loading: false });
        wx.showToast({ title: '获取收藏失败', icon: 'none' });
      });
  },

  handleFilterTap(e) {
    const { value } = e.currentTarget.dataset;
    if (value === this.data.activeType) return;
    this.setData(
      {
        activeType: value,
        page: 1
      },
      () => this.fetchFavorites()
    );
  },

  handleAddFavorite() {
    wx.navigateTo({
      url: '/pages/favorite-form/favorite-form'
    });
  },

  handleItemTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/favorite-detail/favorite-detail?id=${id}`
    });
  },

  handleItemLongPress(e) {
    const { id } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({ url: `/pages/favorite-form/favorite-form?id=${id}` });
        } else if (res.tapIndex === 1) {
          this.confirmDelete(id);
        }
      }
    });
  },

  confirmDelete(id) {
    wx.showModal({
      title: '提示',
      content: '确定删除该收藏吗？',
      confirmColor: '#d81e06',
      success: (res) => {
        if (res.confirm) {
          favoriteService
            .deleteFavoritePlace(id)
            .then(() => {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchFavorites();
            })
            .catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  }
});


