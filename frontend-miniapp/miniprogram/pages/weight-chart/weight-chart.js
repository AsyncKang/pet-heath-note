const healthService = require('../../services/health');

Page({
  data: {
    petId: null,
    petName: '',
    loading: false,
    chartPoints: [],
    chartWidth: 0,
    chartHeight: 320,
    hasChartData: false
  },

  onLoad(options) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const { petId, petName = '' } = options;
    if (!petId) {
      wx.showToast({ title: '缺少宠物ID', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }
    const { windowWidth } = wx.getSystemInfoSync();
    this.setData(
      {
        petId,
        petName: petName ? decodeURIComponent(petName) : '',
        chartWidth: windowWidth - 40
      },
      () => {
        this.fetchHealthRecords();
      }
    );
  },

  fetchHealthRecords() {
    this.setData({ loading: true });
    healthService
      .listHealthRecords(this.data.petId, { page: 1, size: 100 })
      .then((res) => {
        const records = res?.records || [];
        const points = records
          .filter((item) => item.weightKg != null && item.recordDate)
          .map((item) => ({
            date: item.recordDate,
            displayDate: item.recordDate ? item.recordDate.replace('T', ' ').slice(0, 16) : '',
            weight: Number(item.weightKg)
          }))
          .filter((item) => !Number.isNaN(item.weight))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        this.setData(
          {
            chartPoints: points,
            hasChartData: points.length > 0,
            loading: false
          },
          () => {
            if (points.length > 0) {
              this.drawChart();
            }
          }
        );
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '获取健康记录失败', icon: 'none' });
      });
  },

  drawChart() {
    const points = this.data.chartPoints;
    if (!points.length) {
      return;
    }
    const ctx = wx.createCanvasContext('weightChart', this);
    const width = this.data.chartWidth;
    const height = this.data.chartHeight;
    const padding = 40;
    const axisColor = '#d9d9d9';
    const textColor = '#666';
    const lineColor = '#667eea';
    const dotColor = '#764ba2';

    ctx.clearRect(0, 0, width, height);

    const weights = points.map((p) => p.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1;

    // axes
    ctx.setStrokeStyle(axisColor);
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.setFontSize(12);
    ctx.setFillStyle(textColor);
    ctx.fillText('体重（kg）', padding, padding - 10);
    ctx.fillText('时间', width - padding - 30, height - padding + 30);

    const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);
    const scaleY = (height - padding * 2) / range;

    ctx.setStrokeStyle(lineColor);
    ctx.setLineWidth(2);
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = padding + stepX * index;
      const y = height - padding - (point.weight - minWeight) * scaleY;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.setFillStyle(dotColor);
    points.forEach((point, index) => {
      const x = padding + stepX * index;
      const y = height - padding - (point.weight - minWeight) * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.setFillStyle(textColor);
      ctx.setFontSize(12);
      ctx.fillText(`${point.weight}kg`, x - 16, y - 10);
      ctx.setFillStyle(textColor);
      ctx.fillText((point.displayDate || point.date || '').slice(5), x - 24, height - padding + 20);
      ctx.setFillStyle(dotColor);
    });

    ctx.draw();
  }
});


