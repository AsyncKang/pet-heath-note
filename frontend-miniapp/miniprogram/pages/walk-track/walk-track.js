const walkService = require('../../services/walk');

Page({
  data: {
    walkRecordId: null,
    walkRecord: null,
    pathPoints: [],
    polyline: [],
    markers: [],
    latitude: 0,
    longitude: 0,
    scale: 18,
    loading: false
  },

  onLoad(options) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const { walkRecordId } = options;
    if (!walkRecordId) {
      wx.showToast({ title: '缺少记录ID', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    this.setData({ walkRecordId });
    this.fetchWalkRecord();
  },

  fetchWalkRecord() {
    this.setData({ loading: true });
    walkService
      .getWalkRecord(this.data.walkRecordId)
      .then((record) => {
        console.log('[walk-track] walk record loaded:', record);
        this.setData({ walkRecord: record });
        
        // 解析轨迹点
        const pathPoints = this.parsePathPoints(record.pathPoints);
        if (pathPoints.length > 0) {
          this.renderPath(pathPoints);
        } else {
          this.setData({ loading: false });
          wx.showToast({ title: '该记录没有轨迹数据', icon: 'none' });
        }
      })
      .catch((err) => {
        console.error('[walk-track] fetch walk record failed', err);
        this.setData({ loading: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '获取记录失败',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      });
  },

  parsePathPoints(pathPointsStr) {
    if (!pathPointsStr) {
      return [];
    }
    try {
      const points = typeof pathPointsStr === 'string' ? JSON.parse(pathPointsStr) : pathPointsStr;
      if (!Array.isArray(points)) {
        return [];
      }
      return points.map(point => ({
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        timestamp: point.timestamp
      }));
    } catch (e) {
      console.error('[walk-track] parse pathPoints failed', e);
      return [];
    }
  },

  renderPath(points) {
    if (points.length === 0) {
      wx.showToast({ title: '该记录没有轨迹数据', icon: 'none' });
      return;
    }

    // 计算中心点和边界
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLon = points[0].longitude;
    let maxLon = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLon = Math.min(minLon, point.longitude);
      maxLon = Math.max(maxLon, point.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // 构建折线 - 使用更粗的线条和更明显的颜色以支持高清显示
    const polyline = [{
      points: points.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude
      })),
      color: '#1890ff',
      width: 8,
      borderColor: '#ffffff',
      borderWidth: 3,
      arrowLine: true,
      arrowIconPath: '',
      arrowSpacing: 20
    }];

    // 构建标记点（起点和终点）
    const markers = [];
    if (points.length > 0) {
      // 起点 - 使用默认图标样式，通过 callout 显示文字
      markers.push({
        id: 0,
        latitude: points[0].latitude,
        longitude: points[0].longitude,
        width: 20,
        height: 20,
        callout: {
          content: '起点',
          color: '#ffffff',
          bgColor: '#1890ff',
          borderRadius: 8,
          padding: 8,
          fontSize: 24,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      });

      // 终点
      if (points.length > 1) {
        markers.push({
          id: 1,
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
          width: 20,
          height: 20,
          callout: {
            content: '终点',
            color: '#ffffff',
            bgColor: '#ff4d4f',
            borderRadius: 8,
            padding: 8,
            fontSize: 24,
            display: 'ALWAYS',
            textAlign: 'center'
          }
        });
      }
    }

    this.setData({
      latitude: centerLat,
      longitude: centerLon,
      pathPoints: points,
      polyline,
      markers,
      loading: false
    }, () => {
      // 地图渲染完成后，调整视野以包含所有轨迹点
      this.adjustMapView();
    });
  },

  adjustMapView() {
    // 使用 map 组件的 include-points 属性来调整视野
    // 或者使用 mapCtx.includePoints
    const mapCtx = wx.createMapContext('walkMap');
    if (this.data.pathPoints.length > 0) {
      // 延迟执行以确保地图已渲染
      setTimeout(() => {
        mapCtx.includePoints({
          points: this.data.pathPoints.map(p => ({
            latitude: p.latitude,
            longitude: p.longitude
          })),
          padding: [60, 60, 200, 60] // 底部留更多空间给信息卡片
        });
      }, 500);
    }
  },

  onMapTap(e) {
    console.log('[walk-track] map tapped', e);
  },

  onRegionChange(e) {
    console.log('[walk-track] region changed', e);
  }
});

