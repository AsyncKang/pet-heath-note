const vaccineService = require('../../services/vaccine');

const formatDate = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

Page({
  data: {
    petId: null,
    recordId: null,
    isEdit: false,
    isDeworm: false,
    form: {
      vaccineName: '',
      vaccineType: '',
      dose: '',
      injectionDate: formatDate(),
      nextInjectionDate: '',
      hospitalName: '',
      remark: ''
    },
    submitting: false,
    // 疫苗名称选项
    vaccineNameOptions: [
      { label: '三联疫苗', value: '三联疫苗' },
      { label: '四联疫苗', value: '四联疫苗' },
      { label: '五联疫苗', value: '五联疫苗' },
      { label: '狂犬疫苗', value: '狂犬疫苗' },
      { label: '芯片疫苗', value: '芯片疫苗' },
      { label: '其他', value: '其他' }
    ],
    // 驱虫药品选项
    dewormNameOptions: [
      { label: '拜宠清', value: '拜宠清' },
      { label: '大宠爱', value: '大宠爱' },
      { label: '福来恩', value: '福来恩' },
      { label: '爱沃克', value: '爱沃克' },
      { label: '海乐妙', value: '海乐妙' },
      { label: '其他', value: '其他' }
    ],
    // 疫苗类型选项
    vaccineTypeOptions: [
      { label: '核心疫苗', value: '核心疫苗' },
      { label: '非核心疫苗', value: '非核心疫苗' },
      { label: '其他', value: '其他' }
    ],
    // 驱虫类型选项
    dewormTypeOptions: [
      { label: '体内驱虫', value: '体内驱虫' },
      { label: '体外驱虫', value: '体外驱虫' },
      { label: '体内外同驱', value: '体内外同驱' },
      { label: '其他', value: '其他' }
    ],
    // 当前使用的选项（根据 isDeworm 动态切换）
    currentNameOptions: [],
    currentTypeOptions: [],
    vaccineNameIndex: 0,
    vaccineTypeIndex: 0
  },

  onLoad(options = {}) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const { petId, type, recordId } = options;
    if (petId) {
      this.setData({ petId });
    }
    if (!recordId && !petId) {
      wx.showToast({ title: '缺少宠物ID', icon: 'none' });
      return;
    }
    const isDeworm = type === 'deworm';
    this.applyOptionLists(isDeworm);
    if (recordId) {
      this.setData(
        {
          recordId,
          isEdit: true
        },
        () => {
          this.loadRecord(recordId);
        }
      );
    } else {
      wx.setNavigationBarTitle({
        title: isDeworm ? '添加驱虫记录' : '添加疫苗记录'
      });
    }
  },

  applyOptionLists(isDeworm, preserveSelection = false) {
    const nameOptions = isDeworm ? this.data.dewormNameOptions : this.data.vaccineNameOptions;
    const typeOptions = isDeworm ? this.data.dewormTypeOptions : this.data.vaccineTypeOptions;
    const updates = {
      isDeworm,
      currentNameOptions: nameOptions,
      currentTypeOptions: typeOptions
    };
    if (!preserveSelection) {
      updates['form.vaccineName'] = nameOptions[0].value;
      updates['form.vaccineType'] = typeOptions[0].value;
      updates.vaccineNameIndex = 0;
      updates.vaccineTypeIndex = 0;
    }
    this.setData(updates);
  },

  loadRecord(recordId) {
    wx.showLoading({ title: '加载中...', mask: true });
    vaccineService
      .getVaccineRecord(recordId)
      .then((res) => {
        const isDeworm = this.isDewormRecord(res);
        const nameOptions = isDeworm ? this.data.dewormNameOptions : this.data.vaccineNameOptions;
        const typeOptions = isDeworm ? this.data.dewormTypeOptions : this.data.vaccineTypeOptions;
        const nameIndex = Math.max(0, nameOptions.findIndex((item) => item.value === res.vaccineName));
        const typeIndex = Math.max(0, typeOptions.findIndex((item) => item.value === res.vaccineType));
        this.setData({
          petId: res.petId || this.data.petId,
          currentNameOptions: nameOptions,
          currentTypeOptions: typeOptions,
          isDeworm,
          vaccineNameIndex: nameIndex,
          vaccineTypeIndex: typeIndex,
          form: {
            vaccineName: res.vaccineName || nameOptions[Math.max(nameIndex, 0)].value,
            vaccineType: res.vaccineType || typeOptions[Math.max(typeIndex, 0)].value,
            dose: res.dose || '',
            injectionDate: res.injectionDate || formatDate(),
            nextInjectionDate: res.nextInjectionDate || '',
            hospitalName: res.hospitalName || '',
            remark: res.remark || ''
          }
        });
        wx.setNavigationBarTitle({
          title: isDeworm ? '编辑驱虫记录' : '编辑疫苗记录'
        });
      })
      .catch(() => {
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  isDewormRecord(record = {}) {
    const { vaccineType, vaccineName } = record;
    return (
      (vaccineType && vaccineType.indexOf('驱虫') > -1) ||
      (vaccineName && vaccineName.indexOf('驱虫') > -1)
    );
  },

  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  bindDateChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  handlePickerChange(e) {
    const { field } = e.currentTarget.dataset;
    const index = Number(e.detail.value);
    if (field === 'vaccineName') {
      this.setData({
        vaccineNameIndex: index,
        'form.vaccineName': this.data.currentNameOptions[index].value
      });
    } else if (field === 'vaccineType') {
      this.setData({
        vaccineTypeIndex: index,
        'form.vaccineType': this.data.currentTypeOptions[index].value
      });
    }
  },

  handleSubmit() {
    if (this.data.submitting) {
      return;
    }
    const { vaccineName, injectionDate } = this.data.form;
    const fieldName = this.data.isDeworm ? '驱虫药品' : '疫苗名称';
    const dateFieldName = this.data.isDeworm ? '驱虫日期' : '接种日期';
    if (!vaccineName) {
      wx.showToast({ title: `请填写${fieldName}`, icon: 'none' });
      return;
    }
    if (!injectionDate) {
      wx.showToast({ title: `请选择${dateFieldName}`, icon: 'none' });
      return;
    }
    const formData = { ...this.data.form };
    this.requestSubscribeMessage()
      .catch(() => {})
      .finally(() => {
        this.submitForm(formData);
      });
  },

  submitForm(formData) {
    this.setData({ submitting: true });
    const request = this.data.isEdit
      ? vaccineService.updateVaccineRecord(this.data.recordId, formData)
      : vaccineService.createVaccineRecord(this.data.petId, formData);
    request
      .then(() => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchRecords?.();
        prevPage?.fetchVaccineRecords?.();
        prevPage?.fetchDewormRecords?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: typeof err === 'string' ? err : '保存失败',
          icon: 'none'
        });
      });
  },

  requestSubscribeMessage() {
    const templateIds = this.getTemplateIds();
    if (!templateIds.length) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      wx.requestSubscribeMessage({
        tmplIds: templateIds,
        complete: () => resolve()
      });
    });
  },

  getTemplateIds() {
    const app = getApp();
    const templates = app?.globalData?.subscribeTemplateIds || {};
    const templateId = this.data.isDeworm ? templates.deworm : templates.vaccine;
    return templateId ? [templateId] : [];
  }
});


