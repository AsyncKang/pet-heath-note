const userService = require('../../services/user');
const petService = require('../../services/pet');
const favoriteService = require('../../services/favorite');

Page({
  data: {
    userInfo: null,
    genderLabel: '未知',
    petCount: 0,
    favoriteCount: 0,
    notificationVaccineEnabled: true,
    notificationDewormEnabled: true,
    loading: false,
    genderOptions: [
      { label: '男', value: 1 },
      { label: '女', value: 2 },
      { label: '未知', value: 0 }
    ]
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const notifyVaccine = wx.getStorageSync('notifyVaccine');
    const notifyDeworm = wx.getStorageSync('notifyDeworm');
    this.setData({
      notificationVaccineEnabled: typeof notifyVaccine === 'boolean' ? notifyVaccine : true,
      notificationDewormEnabled: typeof notifyDeworm === 'boolean' ? notifyDeworm : true
    });
    this.loadUserInfo();
    this.loadPetCount();
    this.loadFavoriteCount();
  },

  loadUserInfo() {
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    if (!userId) {
      return;
    }
    this.setData({ loading: true });
    userService
      .getUser(userId)
      .then((user) => {
        this.setData({
          userInfo: user,
          genderLabel: this.resolveGender(user.gender),
          loading: false,
          notificationVaccineEnabled: user.notifyVaccine !== false,
          notificationDewormEnabled: user.notifyDeworm !== false
        });
        wx.setStorageSync('notifyVaccine', user.notifyVaccine !== false);
        wx.setStorageSync('notifyDeworm', user.notifyDeworm !== false);
        app.setSession({
          token: app.globalData.token,
          user
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  resolveGender(value) {
    if (value === 1) return '男';
    if (value === 2) return '女';
    return '未知';
  },

  loadPetCount() {
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    if (!userId) {
      return;
    }
    petService
      .listPets({
        page: 1,
        size: 1,
        userId
      })
      .then((res) => {
        this.setData({
          petCount: res?.total || 0
        });
      })
      .catch(() => {
        this.setData({ petCount: 0 });
      });
  },

  loadFavoriteCount() {
    const app = getApp();
    const userId = app?.globalData?.user?.id;
    if (!userId) {
      return;
    }
    favoriteService
      .listFavoritePlaces(userId, { page: 1, size: 1 })
      .then((res) => {
        this.setData({
          favoriteCount: res?.total || 0
        });
      })
      .catch(() => {
        this.setData({ favoriteCount: 0 });
      });
  },

  handleAvatarTap() {
    const actions = ['同步微信头像', '输入头像链接'];
    wx.showActionSheet({
      itemList: actions,
      success: (res) => {
        if (res.tapIndex === 0) {
          this.syncWeChatAvatar();
        } else if (res.tapIndex === 1) {
          this.promptAvatarUrl();
        }
      }
    });
  },

  syncWeChatAvatar() {
    wx.getUserProfile({
      desc: '用于更新头像和昵称',
      success: (profile) => {
        const userInfo = profile.userInfo || {};
        const updateData = {};
        
        if (userInfo.avatarUrl) {
          updateData.avatarUrl = userInfo.avatarUrl;
        }
        
        // 同时更新昵称（如果不是默认值）
        if (userInfo.nickName && 
            userInfo.nickName !== '微信用户' && 
            userInfo.nickName.trim() !== '') {
          updateData.nickname = userInfo.nickName;
        }
        
        // 更新性别
        if (userInfo.gender !== undefined) {
          updateData.gender = userInfo.gender;
        }
        
        if (Object.keys(updateData).length > 0) {
          console.log('[profile] syncing WeChat profile:', updateData);
          this.updateUserProfile(updateData);
        } else {
          wx.showToast({
            title: '未获取到有效信息',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      }
    });
  },

  promptAvatarUrl() {
    wx.showModal({
      title: '自定义头像',
      editable: true,
      placeholderText: '请输入图片链接',
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateUserProfile({ avatarUrl: res.content });
        }
      }
    });
  },

  handleEditProfile() {
    wx.showActionSheet({
      itemList: ['修改昵称', '修改性别'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.promptNickname();
        } else if (res.tapIndex === 1) {
          this.promptGender();
        }
      }
    });
  },

  promptNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新的昵称',
      content: this.data.userInfo?.nickname || '',
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateUserProfile({ nickname: res.content });
        }
      }
    });
  },

  promptGender() {
    const labels = this.data.genderOptions.map((item) => item.label);
    wx.showActionSheet({
      itemList: labels,
      success: (res) => {
        const option = this.data.genderOptions[res.tapIndex];
        this.updateUserProfile({ gender: option.value });
      }
    });
  },

  updateUserProfile(payload) {
    const userId = this.data.userInfo?.id;
    if (!userId) {
      return;
    }
    userService
      .updateUser(userId, payload)
      .then(() => {
        wx.showToast({ title: '已更新', icon: 'success' });
        this.loadUserInfo();
      })
      .catch((err) => {
        wx.showToast({
          title: typeof err === 'string' ? err : '更新失败',
          icon: 'none'
        });
      });
  },

  handleToggleVaccine(e) {
    const enabled = e.detail.value;
    const previous = this.data.notificationVaccineEnabled;
    this.setData({
      notificationVaccineEnabled: enabled,
      'userInfo.notifyVaccine': enabled
    });
    wx.setStorageSync('notifyVaccine', enabled);
    this.updateNotificationSetting(
      { notifyVaccine: enabled },
      'notificationVaccineEnabled',
      previous,
      'notifyVaccine'
    );
  },

  handleToggleDeworm(e) {
    const enabled = e.detail.value;
    const previous = this.data.notificationDewormEnabled;
    this.setData({
      notificationDewormEnabled: enabled,
      'userInfo.notifyDeworm': enabled
    });
    wx.setStorageSync('notifyDeworm', enabled);
    this.updateNotificationSetting(
      { notifyDeworm: enabled },
      'notificationDewormEnabled',
      previous,
      'notifyDeworm'
    );
  },

  updateNotificationSetting(payload, stateField, previousValue, storageKey) {
    const userId = this.data.userInfo?.id;
    if (!userId) {
      return;
    }
    userService.updateUser(userId, payload).catch((err) => {
      wx.showToast({
        title: (err && err.message) || '设置保存失败',
        icon: 'none'
      });
      if (previousValue !== undefined) {
        this.setData({ [stateField]: previousValue });
        if (storageKey) {
          wx.setStorageSync(storageKey, previousValue);
        }
      }
    });
  },

  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const session = {
            token: app.globalData.token,
            user: app.globalData.user
          };
          wx.clearStorage({
            success: () => {
              app.setSession(session);
              wx.setStorageSync('notifyVaccine', this.data.notificationVaccineEnabled);
              wx.setStorageSync('notifyDeworm', this.data.notificationDewormEnabled);
              wx.showToast({ title: '已清除', icon: 'success' });
            }
          });
        }
      }
    });
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？退出后需重新登录。',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.clearSession();
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  handleViewPets() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  handleViewFavorites() {
    wx.navigateTo({
      url: '/pages/favorite-list/favorite-list'
    });
  },

  handleHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  handleAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  }
});



