const healthService = require('../../services/health');

Page({
  data: {
    petId: null,
    form: {
      recordDate: '',
      recordTime: '',
      weightKg: '',
      temperatureC: '',
      appetite: '',
      spirit: '',
      stool: '',
      note: ''
    },
    submitting: false,
    yearRange: [],
    monthRange: [],
    dayRange: [],
    hourRange: [],
    minuteRange: [],
    datetimePickerValue: [0, 0, 0, 0, 0],
    appetiteOptions: [
      { label: '很差', value: 1 },
      { label: '一般', value: 2 },
      { label: '良好', value: 3 }
    ],
    spiritOptions: [
      { label: '萎靡', value: 1 },
      { label: '平稳', value: 2 },
      { label: '活跃', value: 3 }
    ],
    stoolOptions: [
      { label: '异常（稀/干）', value: 1 },
      { label: '略异常', value: 2 },
      { label: '正常', value: 3 }
    ],
    appetiteIndex: 2,
    spiritIndex: 1,
    stoolIndex: 2
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
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:00`;
    this.initDatetimePicker(defaultDate, defaultTime);
    this.setData({
      'form.appetite': this.data.appetiteOptions[this.data.appetiteIndex].value,
      'form.spirit': this.data.spiritOptions[this.data.spiritIndex].value,
      'form.stool': this.data.stoolOptions[this.data.stoolIndex].value
    });
  },

  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  initDatetimePicker(defaultDate, defaultTime) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearRange = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i += 1) {
      yearRange.push(`${i}年`);
    }
    const monthRange = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}月`);
    const hourRange = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`);
    const minuteRange = Array.from({ length: 60 }, (_, i) => `${String(i).padStart(2, '0')}分`);

    const [year, month, day] = defaultDate.split('-').map((item) => Number(item));
    const hour = Number(defaultTime.split(':')[0] || 0);
    const minute = Number(defaultTime.split(':')[1] || 0);

    const dayRange = this.generateDayRange(year, month);

    const datetimePickerValue = [
      yearRange.findIndex((item) => item.startsWith(year)),
      month - 1,
      day - 1,
      hour,
      minute
    ];

    this.setData({
      yearRange,
      monthRange,
      dayRange,
      hourRange,
      minuteRange,
      datetimePickerValue,
      'form.recordDate': defaultDate,
      'form.recordTime': `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    });
  },

  generateDayRange(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${String(i + 1).padStart(2, '0')}日`);
  },

  handleDatetimeChange(e) {
    const value = e.detail.value;
    const year = this.data.yearRange[value[0]].replace('年', '');
    const month = String(value[1] + 1).padStart(2, '0');
    const day = String(value[2] + 1).padStart(2, '0');
    const hour = String(value[3]).padStart(2, '0');
    const minute = String(value[4]).padStart(2, '0');
    this.setData({
      datetimePickerValue: value,
      'form.recordDate': `${year}-${month}-${day}`,
      'form.recordTime': `${hour}:${minute}`
    });
  },

  handleDatetimeColumnChange(e) {
    const { column, value } = e.detail;
    if (column === 0 || column === 1) {
      const yearIndex = column === 0 ? value : this.data.datetimePickerValue[0];
      const monthIndex = column === 1 ? value : this.data.datetimePickerValue[1];
      const year = Number(this.data.yearRange[yearIndex].replace('年', ''));
      const month = monthIndex + 1;
      const dayRange = this.generateDayRange(year, month);
      let dayIndex = this.data.datetimePickerValue[2];
      if (dayIndex >= dayRange.length) {
        dayIndex = dayRange.length - 1;
      }
      const datetimePickerValue = [...this.data.datetimePickerValue];
      if (column === 0) {
        datetimePickerValue[0] = value;
      }
      if (column === 1) {
        datetimePickerValue[1] = value;
      }
      datetimePickerValue[2] = Math.max(0, dayIndex);
      this.setData({
        dayRange,
        datetimePickerValue
      });
    }
  },

  handlePickerChange(e) {
    const { field } = e.currentTarget.dataset;
    const index = Number(e.detail.value);
    if (field === 'appetite') {
      this.setData({
        appetiteIndex: index,
        'form.appetite': this.data.appetiteOptions[index].value
      });
    } else if (field === 'spirit') {
      this.setData({
        spiritIndex: index,
        'form.spirit': this.data.spiritOptions[index].value
      });
    } else if (field === 'stool') {
      this.setData({
        stoolIndex: index,
        'form.stool': this.data.stoolOptions[index].value
      });
    }
  },

  handleSubmit() {
    const payload = { ...this.data.form };
    if (!payload.recordDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (!payload.recordTime) {
      wx.showToast({ title: '请选择时间', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const recordDateTime = `${payload.recordDate}T${payload.recordTime}:00`;
    const data = {
      ...payload,
      recordDate: recordDateTime,
      weightKg: payload.weightKg ? Number(payload.weightKg) : null,
      temperatureC: payload.temperatureC ? Number(payload.temperatureC) : null,
      appetite: payload.appetite ? Number(payload.appetite) : null,
      spirit: payload.spirit ? Number(payload.spirit) : null,
      stool: payload.stool ? Number(payload.stool) : null
    };
    this.checkDuplicateAndSubmit(data);
  },

  checkDuplicateAndSubmit(payload) {
    healthService
      .getHealthRecordByTime(this.data.petId, payload.recordDate)
      .then((existing) => {
        if (existing && existing.id) {
          wx.showModal({
            title: '提示',
            content: '当前时间节点已添加过健康记录，是否覆盖？',
            success: (res) => {
              if (res.confirm) {
                this.updateHealthRecord(existing.id, payload);
              } else {
                this.setData({ submitting: false });
              }
            }
          });
        } else {
          this.createHealthRecord(payload, false);
        }
      })
      .catch(() => {
        this.createHealthRecord(payload, false);
      });
  },

  createHealthRecord(payload, force) {
    healthService
      .createHealthRecord(this.data.petId, payload, { force })
      .then(() => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchHealthRecords?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({ title: typeof err === 'string' ? err : '保存失败', icon: 'none' });
      });
  },

  updateHealthRecord(recordId, payload) {
    healthService
      .updateHealthRecord(recordId, payload)
      .then(() => {
        wx.showToast({ title: '已覆盖', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchHealthRecords?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({ title: typeof err === 'string' ? err : '覆盖失败', icon: 'none' });
      });
  }
});


