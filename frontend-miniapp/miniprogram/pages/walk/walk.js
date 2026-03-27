const petService = require('../../services/pet');
const walkService = require('../../services/walk');
const weatherService = require('../../services/weather');

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

Page({
  data: {
    userId: null,
    pets: [],
    selectedPetId: '',
    selectedPetName: '',
    selectedPetIndex: 0,
    walkRecords: [],
    stats: {
      totalDistanceKm: 0,
      totalDurationMin: 0
    },
    loading: false,
    statsLoading: false,

    isRecording: false,
    elapsedSeconds: 0,
    elapsedText: '00:00',
    recordingStartTime: null,
    recordingTimer: null,
    pathPoints: [],
    distanceKm: 0,
    weatherDesc: '',
    locationWatcher: null,
    recordingPetId: ''
  },

  onShow() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.setData({ userId: app.globalData.user?.id || null }, () => {
      this.loadPets();
    });
  },

  onUnload() {
    this.stopRecording();
  },

  loadPets() {
    const userId = this.data.userId;
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
        const records = res?.records || [];
        const selected = records.length > 0 ? records[0] : null;
        const selectedIndex = selected ? records.findIndex((item) => item.id === selected.id) : 0;
        this.setData(
          {
            pets: records,
            selectedPetId: selected ? selected.id : '',
            selectedPetName: selected ? selected.name : '',
            selectedPetIndex: selected ? selectedIndex : 0
          },
          () => {
            if (this.data.selectedPetId) {
              this.fetchWalkData();
            }
          }
        );
      })
      .catch(() => {
        this.setData({ pets: [], selectedPetId: '' });
      });
  },

  fetchWalkData() {
    if (!this.data.selectedPetId) {
      return;
    }
    this.fetchWalkRecords();
    this.fetchWalkStats();
  },

  fetchWalkRecords() {
    this.setData({ loading: true });
    walkService
      .listWalkRecords(this.data.selectedPetId, { page: 1, size: 20 })
      .then((res) => {
        this.setData({
          walkRecords: res?.records || [],
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  fetchWalkStats() {
    this.setData({ statsLoading: true });
    walkService
      .getWalkStats(this.data.selectedPetId)
      .then((res) => {
        this.setData({
          stats: res || { totalDistanceKm: 0, totalDurationMin: 0 },
          statsLoading: false
        });
      })
      .catch(() => {
        this.setData({ statsLoading: false });
      });
  },

  handlePetPicker(e) {
    const index = Number(e.detail.value);
    const pet = this.data.pets[index];
    this.setData(
      {
        selectedPetId: pet?.id || '',
        selectedPetName: pet?.name || '',
        selectedPetIndex: index
      },
      () => this.fetchWalkData()
    );
  },

  ensureLocationAuth() {
    return new Promise((resolve, reject) => {
      // 直接尝试获取定位，系统会自动处理授权
      wx.getLocation({
        type: 'gcj02',
        desc: '用于记录遛弯轨迹和计算距离',
        success: (location) => {
          console.log('[walk] location obtained, auth granted');
          resolve(location);
        },
        fail: (err) => {
          console.error('[walk] getLocation failed', err);
          // 如果是权限问题（包括 require permission desc），引导用户去设置
          if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('permission') || err.errMsg.includes('unauthorized') || err.errMsg.includes('require permission'))) {
            wx.getSetting({
              success: (res) => {
                console.log('[walk] location auth setting:', res.authSetting['scope.userLocation']);
                // 如果用户之前拒绝过，需要引导去设置页面
                if (res.authSetting['scope.userLocation'] === false) {
                  wx.showModal({
                    title: '需要定位权限',
                    content: '请允许获取定位信息以记录遛弯轨迹。点击"去设置"后，请在设置页面开启定位权限。',
                    confirmText: '去设置',
                    cancelText: '取消',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        wx.openSetting({
                          success: (settingRes) => {
                            console.log('[walk] settings opened, auth result:', settingRes.authSetting['scope.userLocation']);
                            // 检查用户是否在设置页面授权了
                            if (settingRes.authSetting['scope.userLocation'] === true) {
                              // 授权成功，再次尝试获取定位
                              wx.getLocation({
                                type: 'gcj02',
                                desc: '用于记录遛弯轨迹和计算距离',
                                success: (location) => {
                                  resolve(location);
                                },
                                fail: (err2) => {
                                  console.error('[walk] getLocation failed after auth', err2);
                                  reject('获取定位失败，请检查GPS是否开启');
                                }
                              });
                            } else {
                              reject('用户未授权定位权限');
                            }
                          },
                          fail: () => {
                            reject('打开设置页面失败');
                          }
                        });
                      } else {
                        reject('用户取消授权');
                      }
                    }
                  });
                } else {
                  // 可能是其他错误（如GPS未开启）
                  reject('获取定位失败，请检查GPS是否开启');
                }
              },
              fail: () => {
                reject('获取权限设置失败');
              }
            });
          } else {
            // 其他错误（如GPS未开启、网络问题等）
            reject('获取定位失败，请检查GPS是否开启');
          }
        }
      });
    });
  },

  handleStartWalk() {
    if (this.data.isRecording) return;
    if (!this.data.selectedPetId) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }
    console.log('[walk] starting walk, checking location auth...');
    this.ensureLocationAuth()
      .then((location) => {
        console.log('[walk] location obtained:', location);
        this.beginRecording(location);
      })
      .catch((err) => {
        console.error('[walk] location auth failed', err);
        // 显示错误提示
        if (err && typeof err === 'string' && err.includes('取消')) {
          // 用户取消，不显示提示
          return;
        }
        wx.showToast({ 
          title: err || '无法获取定位权限', 
          icon: 'none', 
          duration: 2000 
        });
      });
  },

  beginRecording(initialLocation) {
    const now = new Date();
    const firstPoint = {
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      timestamp: now.toISOString() // 存储为 ISO 字符串，后续提交时再格式化
    };
    this.setData({
      isRecording: true,
      recordingStartTime: now,
      recordingPetId: this.data.selectedPetId,
      pathPoints: [firstPoint],
      elapsedSeconds: 0,
      elapsedText: '00:00',
      distanceKm: 0,
      weatherDesc: '获取中...'
    });
    this.fetchWeather(initialLocation.latitude, initialLocation.longitude);
    this.startTimer();
    this.startLocationUpdates();
    wx.showToast({ title: '开始记录', icon: 'success' });
  },

  startTimer() {
    const timer = setInterval(() => {
      const next = this.data.elapsedSeconds + 1;
      this.setData({
        elapsedSeconds: next,
        elapsedText: this.formatDuration(next)
      });
    }, 1000);
    this.setData({ recordingTimer: timer });
  },

  stopTimer() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.setData({ recordingTimer: null });
    }
  },

  startLocationUpdates() {
    const handler = (location) => {
      const points = this.data.pathPoints.slice();
      const last = points[points.length - 1];
      const distanceDelta = last
        ? haversine(last.latitude, last.longitude, location.latitude, location.longitude)
        : 0;
      points.push({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString() // 存储为 ISO 字符串
      });
      this.setData({
        pathPoints: points,
        distanceKm: +(this.data.distanceKm + distanceDelta).toFixed(3)
      });
    };
    wx.startLocationUpdate({
      type: 'gcj02',
      desc: '用于实时记录遛弯轨迹'
    });
    wx.onLocationChange(handler);
    this.setData({ locationWatcher: handler });
  },

  stopLocationUpdates() {
    if (this.data.locationWatcher) {
      wx.offLocationChange(this.data.locationWatcher);
      this.setData({ locationWatcher: null });
    }
    wx.stopLocationUpdate();
  },

  fetchWeather(lat, lon) {
    weatherService
      .getCurrentWeather(lat, lon)
      .then((res) => {
        this.setData({ weatherDesc: res || '' });
      })
      .catch(() => {
        this.setData({ weatherDesc: '' });
      });
  },

  handleStopWalk() {
    if (!this.data.isRecording) return;
    this.stopRecording();
    this.promptMoodAndRemark()
      .then((result) => {
        if (result) {
          this.submitWalkRecord(result.mood, result.remark);
        } else {
          wx.showToast({ title: '已取消记录', icon: 'none' });
        }
      })
      .catch(() => {});
  },

  stopRecording() {
    if (!this.data.isRecording) return;
    this.stopTimer();
    this.stopLocationUpdates();
    this.setData({
      isRecording: false
    });
  },

  promptMoodAndRemark() {
    const moodOptions = ['开心', '放松', '普通', '疲惫'];
    return new Promise((resolve) => {
      wx.showActionSheet({
        itemList: moodOptions,
        success: (res) => {
          const mood = moodOptions[res.tapIndex];
          wx.showModal({
            title: '填写备注（可选）',
            editable: true,
            placeholderText: '记录宠物表现、遇到的情况等',
            success: (modalRes) => {
              if (modalRes.confirm) {
                resolve({ mood, remark: modalRes.content || '' });
              } else {
                resolve(null);
              }
            },
            fail: () => resolve(null)
          });
        },
        fail: () => resolve(null)
      });
    });
  },

  submitWalkRecord(extraMood, extraRemark) {
    const endTime = new Date();
    const startTime = this.data.recordingStartTime || new Date();
    const durationMinutes = Math.max(1, Math.round(this.data.elapsedSeconds / 60));
    
    // 格式化日期时间为 ISO 8601 格式 (YYYY-MM-DDTHH:mm:ss)
    const formatDateTime = (date) => {
      if (!date) return '';
      return date.toISOString().slice(0, 19);
    };
    
    // 格式化 pathPoints，确保数据类型正确
    const formattedPathPoints = this.data.pathPoints.map(point => {
      const pointDate = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      return {
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        timestamp: formatDateTime(pointDate)
      };
    });
    
    const payload = {
      walkDate: startTime.toISOString().slice(0, 10), // YYYY-MM-DD
      startTime: formatDateTime(startTime), // YYYY-MM-DDTHH:mm:ss
      endTime: formatDateTime(endTime), // YYYY-MM-DDTHH:mm:ss
      durationMinutes,
      distanceKm: Math.max(0.1, Number(this.data.distanceKm.toFixed(2))), // 确保至少 0.1km，满足后端验证
      location: this.data.pathPoints.length ? `${this.data.pathPoints[0].latitude.toFixed(3)},${this.data.pathPoints[0].longitude.toFixed(3)}` : '',
      weatherDesc: this.data.weatherDesc || '',
      mood: extraMood || '',
      remark: extraRemark || '',
      pathPoints: formattedPathPoints
    };
    
    console.log('[walk] submitting walk record:', JSON.stringify(payload, null, 2));
    walkService
      .createWalkRecord(this.data.recordingPetId, payload)
      .then(() => {
        wx.showToast({ title: '遛弯记录已保存', icon: 'success' });
        this.fetchWalkData();
        this.resetRecordingState();
      })
      .catch((err) => {
        wx.showToast({ title: typeof err === 'string' ? err : '保存失败', icon: 'none' });
      });
  },

  resetRecordingState() {
    this.setData({
      pathPoints: [],
      recordingStartTime: null,
      recordingPetId: '',
      elapsedSeconds: 0,
      elapsedText: '00:00',
      distanceKm: 0,
      weatherDesc: ''
    });
  },

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  toIsoString(date) {
    if (!date) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  },

  handleAddWalk() {
    wx.navigateTo({
      url: `/pages/walk-form/walk-form?petId=${this.data.selectedPetId}`
    });
  },

  handleViewTrack(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      wx.showToast({ title: '记录ID无效', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/walk-track/walk-track?walkRecordId=${id}`
    });
  }
});


