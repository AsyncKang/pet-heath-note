const authService = require('../../services/auth');

Page({
  data: {
    loading: false,
    showAvatarNickname: false,
    tempAvatar: '',
    tempNickname: '',
    loginCode: ''
  },
  onShow() {
    const app = getApp();
    if (app.isLoggedIn && app.isLoggedIn()) {
      console.log('[login] user already logged in, redirect to index');
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
  handleLogin() {
    if (this.data.loading) {
      return;
    }
    this.setData({ loading: true });
    wx.login({
      success: (res) => {
        if (!res.code) {
          this.setData({ loading: false });
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          return;
        }
        // 直接显示头像昵称填写界面
        this.setData({
          loginCode: res.code,
          showAvatarNickname: true,
          loading: false
        });
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: '无法获取登录信息', icon: 'none' });
      }
    });
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    console.log('[login] avatar chosen:', avatarUrl);
    this.setData({
      tempAvatar: avatarUrl
    });
  },
  
  onNicknameInput(e) {
    this.setData({
      tempNickname: e.detail.value
    });
  },
  
  onNicknameBlur(e) {
    this.setData({
      tempNickname: e.detail.value
    });
  },
  
  handleConfirmLogin() {
    if (this.data.loading) {
      return;
    }
    
    if (!this.data.tempNickname || this.data.tempNickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    const userInfo = {
      nickName: this.data.tempNickname.trim(),
      avatarUrl: this.data.tempAvatar || '',
      gender: 0
    };
    
    console.log('[login] manual login with:', userInfo);
    this.sendLoginRequest(this.data.loginCode, userInfo);
  },
  sendLoginRequest(code, userInfo) {
    const app = getApp();
    const baseUrl = app?.globalData?.baseUrl || 'http://192.168.32.130:8080';
    console.log('[login] sending login request to:', baseUrl);
    console.log('[login] login payload:', {
      code: code.substring(0, 10) + '...',
      nickname: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      fullUserInfo: userInfo
    });
    
    // 确保字段名与后端匹配（微信返回 nickName，后端期望 nickname）
    const loginPayload = {
      code,
      nickname: userInfo.nickName || userInfo.nickname || '',
      avatarUrl: userInfo.avatarUrl || '',
      gender: userInfo.gender || 0
    };
    console.log('[login] final login payload:', loginPayload);
    
    authService
      .login(loginPayload)
      .then((resp) => {
        console.log('[login] login success, set session', resp);
        if (app.setSession) {
          app.setSession(resp);
        }
        this.setData({ loading: false });
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1200
        });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 800);
      })
      .catch((err) => {
        console.error('[login] login failed', err);
        this.setData({ loading: false });
        
        // 如果是连接错误，显示更详细的提示
        if (err && err.includes('无法连接到后端服务')) {
          wx.showModal({
            title: '连接失败',
            content: err + '\n\n请检查网络连接或联系管理员',
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          wx.showToast({
            title: err || '登录失败',
            icon: 'none',
            duration: 3000
          });
        }
      });
  }
});


