const petService = require('../../services/pet');

const PET_AVATAR_PLACEHOLDER = 'https://cdn.jsdelivr.net/gh/placeholderlogo/pet-avatar@main/pet.png';

const formatDate = (date = new Date()) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

Page({
  data: {
    petId: null,
    isEdit: false,
    form: {
      name: '',
      species: '',
      breed: '',
      gender: '',
      birthDate: '',
      weightKg: '',
      remark: '',
      avatarUrl: ''
    },
    speciesOptions: [
      { label: '狗', value: '狗' },
      { label: '猫', value: '猫' },
      { label: '兔', value: '兔' },
      { label: '鸟', value: '鸟' },
      { label: '爬宠', value: '爬宠' },
      { label: '其他', value: '其他' }
    ],
    speciesIndex: 0,
    genderOptions: [
      { label: '公', value: 1 },
      { label: '母', value: 2 },
      { label: '未知', value: 0 }
    ],
    genderIndex: 2,
    submitting: false,
    avatarUploading: false,
    placeholderAvatar: PET_AVATAR_PLACEHOLDER,
    breedOptionsMap: {
      狗: ['金毛', '拉布拉多', '哈士奇', '泰迪', '博美', '萨摩耶', '边牧', '柴犬', '柯基', '比熊', '法斗', '德牧', '吉娃娃', '阿拉斯加', '秋田', '松狮', '其他'],
      猫: ['中华田园猫', '英短', '美短', '布偶', '暹罗', '缅因', '挪威森林', '苏格兰折耳', '异短', '狸花猫', '橘猫', '狸花', '无毛猫', '孟加拉豹猫', '布偶', '波斯', '其他'],
      兔: ['安哥拉兔', '荷兰侏儒兔', '海棠兔', '法国垂耳兔', '比利时兔', '灰狮兔', '美洲兔', '其他'],
      鸟: ['虎皮鹦鹉', '玄凤鹦鹉', '牡丹鹦鹉', '金太阳鹦鹉', '葵花鹦鹉', '八哥', '文鸟', '黄眉鹀', '其他'],
      爬宠: ['鬃狮蜥', '球蟒', '玉米蛇', '豹纹守宫', '王蛇', '缅甸蟒', '绿鬣蜥', '守宫', '蜥蜴', '龟类', '其他'],
      其他: ['其他']
    },
    breedOptions: [],
    breedIndex: 0,
    maxBirthDate: formatDate()
  },

  onLoad(options = {}) {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const { petId } = options;
    if (petId) {
      this.setData(
        {
          petId,
          isEdit: true
        },
        () => {
          wx.setNavigationBarTitle({ title: '编辑宠物信息' });
          this.fetchPetDetail(petId);
        }
      );
    } else {
      wx.setNavigationBarTitle({ title: '新增宠物' });
      const defaultSpecies = this.data.speciesOptions[0].value;
      this.setData({
        'form.species': defaultSpecies,
        'form.gender': this.data.genderOptions[2].value,
        'form.birthDate': ''
      });
      this.updateBreedOptions(defaultSpecies);
    }
  },

  fetchPetDetail(petId) {
    petService
      .getPet(petId)
      .then((res) => {
        const speciesIndex = Math.max(
          0,
          this.data.speciesOptions.findIndex((option) => option.value === (res.species || this.data.speciesOptions[0].value))
        );
        const genderIndex = Math.max(
          0,
          this.data.genderOptions.findIndex((option) => option.value === (res.gender ?? this.data.genderOptions[2].value))
        );
        this.setData({
          form: {
            name: res.name || '',
            species: res.species || this.data.speciesOptions[speciesIndex].value,
            breed: res.breed || '',
            gender: res.gender ?? this.data.genderOptions[genderIndex].value,
            birthDate: res.birthDate || '',
            weightKg: res.weightKg != null ? String(res.weightKg) : '',
            remark: res.remark || '',
            avatarUrl: res.avatarUrl || ''
          },
          speciesIndex,
          genderIndex
        });
        this.updateBreedOptions(res.species || this.data.speciesOptions[speciesIndex].value, res.breed || '');
      })
      .catch(() => {
        wx.showToast({ title: '获取宠物信息失败', icon: 'none' });
      });
  },

  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  bindSpeciesChange(e) {
    const index = Number(e.detail.value);
    const option = this.data.speciesOptions[index];
    this.setData({
      speciesIndex: index,
      'form.species': option.value
    });
    this.updateBreedOptions(option.value);
  },

  bindGenderChange(e) {
    const index = Number(e.detail.value);
    const option = this.data.genderOptions[index];
    this.setData({
      genderIndex: index,
      'form.gender': option.value
    });
  },

  handleBirthDateChange(e) {
    this.setData({
      'form.birthDate': e.detail.value || ''
    });
  },

  handleChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths?.[0];
        if (filePath) {
          this.uploadAvatar(filePath);
        }
      },
      fail: () => {
        wx.showToast({ title: '未选择图片', icon: 'none' });
      }
    });
  },

  uploadAvatar(filePath) {
    const app = getApp();
    const baseUrl = app?.globalData?.baseUrl;
    if (!baseUrl) {
      wx.showToast({ title: '缺少上传地址', icon: 'none' });
      return;
    }
    this.setData({ avatarUploading: true });
    wx.showLoading({ title: '上传中...', mask: true });
    wx.uploadFile({
      url: `${baseUrl}/api/files/upload`,
      filePath,
      name: 'file',
      header: this.buildUploadHeaders(),
      success: (res) => {
        let payload = {};
        try {
          payload = JSON.parse(res.data || '{}');
        } catch (error) {
          console.error('[pet-form] parse upload response failed', error);
        }
        if (payload.code === 0 && payload.data?.url) {
          this.setData({
            'form.avatarUrl': payload.data.url
          });
          wx.showToast({ title: '上传成功', icon: 'success' });
        } else {
          wx.showToast({
            title: payload.message || '上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('[pet-form] upload failed', err);
        wx.showToast({ title: '上传失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ avatarUploading: false });
        wx.hideLoading();
      }
    });
  },

  buildUploadHeaders() {
    const app = getApp();
    const headers = {};
    if (app?.globalData?.token) {
      headers.Authorization = `Bearer ${app.globalData.token}`;
    }
    return headers;
  },

  handleRemoveAvatar() {
    this.setData({
      'form.avatarUrl': ''
    });
  },

  updateBreedOptions(speciesValue, currentBreed = '') {
    const species = speciesValue || this.data.speciesOptions[0].value;
    let options = this.data.breedOptionsMap[species] ? [...this.data.breedOptionsMap[species]] : ['其他'];
    if (currentBreed && currentBreed !== '' && !options.includes(currentBreed)) {
      options = [currentBreed, ...options];
    }
    const defaultBreed = currentBreed || options[0];
    const breedIndex = Math.max(0, options.findIndex((item) => item === defaultBreed));
    this.setData({
      breedOptions: options,
      breedIndex,
      'form.breed': defaultBreed
    });
  },

  handleBreedChange(e) {
    const index = Number(e.detail.value);
    const value = this.data.breedOptions[index];
    this.setData({
      breedIndex: index,
      'form.breed': value
    });
  },

  handleSubmit() {
    const app = getApp();
    if (!app.isLoggedIn || !app.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    const userId = app?.globalData?.user?.id;
    const { name } = this.data.form;
    if (!name) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const payload = {
      ...this.data.form,
      birthDate: this.data.form.birthDate || null,
      gender: this.data.form.gender !== '' ? Number(this.data.form.gender) : null,
      weightKg: this.data.form.weightKg !== '' ? Number(this.data.form.weightKg) : null
    };
    if (!this.data.isEdit) {
      payload.userId = userId;
    }
    const request = this.data.isEdit
      ? petService.updatePet(this.data.petId, payload)
      : petService.createPet(payload);
    request
      .then(() => {
        wx.showToast({ title: this.data.isEdit ? '保存成功' : '创建成功', icon: 'success' });
        this.setData({ submitting: false });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage?.fetchPets?.();
        prevPage?.fetchPetDetail?.();
        wx.navigateBack();
      })
      .catch((err) => {
        this.setData({ submitting: false });
        wx.showToast({
          title: typeof err === 'string' ? err : this.data.isEdit ? '保存失败' : '创建失败',
          icon: 'none'
        });
      });
  }
});


