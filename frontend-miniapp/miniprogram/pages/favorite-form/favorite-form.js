const favoriteService = require('../../services/favorite');

const PLACE_TYPES = [
  { label: '宠物医院', value: 'HOSPITAL' },
  { label: '宠物店', value: 'SHOP' },
  { label: '宠物公园', value: 'PARK' },
  { label: '其他', value: 'OTHER' }
];

Page({
  data: {
    userId: null,
    favoriteId: null,
    form: {
      name: '',
      placeType: 'HOSPITAL',
      contact: '',
      remark: '',
      address: '',
      latitude: null,
      longitude: null
    },
    placeTypes: PLACE_TYPES,
    saving: false,
    contactError: ''
  },

  onLoad(options) {
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
    const { id } = options;
    this.setData(
      {
        userId,
        favoriteId: id || null
      },
      () => {
        if (id) {
          wx.setNavigationBarTitle({ title: '编辑收藏' });
          this.fetchFavoriteDetail(id);
        } else {
          wx.setNavigationBarTitle({ title: '添加收藏' });
        }
      }
    );
  },

  fetchFavoriteDetail(id) {
    favoriteService
      .getFavoritePlace(id)
      .then((res) => {
        this.setData({
          form: {
            name: res.name || '',
            placeType: res.placeType || 'HOSPITAL',
            contact: res.contact || '',
            remark: res.remark || '',
            address: res.address || '',
            latitude: res.latitude || null,
            longitude: res.longitude || null
          }
        });
      })
      .catch(() => {
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      });
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    if (field === 'contact') {
      const valid = /^[0-9+\-]*$/.test(value);
      this.setData({
        contactError: valid ? '' : '请输入正确的联系方式'
      });
      if (!valid) {
        return;
      }
    }
    this.setData({
      [`form.${field}`]: value
    });
  },

  handleTypeChange(e) {
    const { value } = e.detail;
    this.setData({
      'form.placeType': value
    });
  },

  handleChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.address': res.address || res.name,
          'form.latitude': res.latitude,
          'form.longitude': res.longitude,
          'form.name': this.data.form.name || res.name || ''
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('auth')) {
          wx.showModal({
            title: '提示',
            content: '需要定位权限才能选择地点，是否前往设置？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        }
      }
    });
  },

  validateForm() {
    const { name, placeType, address, latitude, longitude } = this.data.form;
    if (!name) {
      wx.showToast({ title: '请填写地点名称', icon: 'none' });
      return false;
    }
    if (!placeType) {
      wx.showToast({ title: '请选择地点类型', icon: 'none' });
      return false;
    }
    if (!address) {
      wx.showToast({ title: '请通过地图选点获取地址', icon: 'none' });
      return false;
    }
    if (latitude == null || longitude == null) {
      wx.showToast({ title: '请通过地图选点确定位置', icon: 'none' });
      return false;
    }
    if (this.data.contactError) {
      wx.showToast({ title: this.data.contactError, icon: 'none' });
      return false;
    }
    return true;
  },

  handleSubmit() {
    if (this.data.saving) return;
    if (!this.validateForm()) return;
    this.setData({ saving: true });
    const payload = { ...this.data.form };
    const request = this.data.favoriteId
      ? favoriteService.updateFavoritePlace(this.data.favoriteId, payload)
      : favoriteService.createFavoritePlace(this.data.userId, payload);
    request
      .then(() => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.setData({ saving: false });
        setTimeout(() => {
          wx.navigateBack();
        }, 800);
      })
      .catch((err) => {
        console.error('[favorite-form] save failed', err);
        this.setData({ saving: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '保存失败',
          icon: 'none'
        });
      });
  }
});


