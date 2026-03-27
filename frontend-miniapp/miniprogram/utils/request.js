const buildBaseUrl = () => {
  const app = getApp();
  return app?.globalData?.baseUrl || 'http://192.168.32.130:8080';
};

const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const app = getApp();
  const token = app?.globalData?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleUnauthorized = () => {
  const app = getApp();
  if (app?.clearSession) {
    app.clearSession();
  }
  wx.showToast({
    title: '请先登录',
    icon: 'none',
    duration: 1500,
    complete: () => {
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }, 600);
    }
  });
};

const request = ({ url, method = 'GET', data = {} }) => {
  return new Promise((resolve, reject) => {
    const fullUrl = `${buildBaseUrl()}${url}`;
    console.log(`[request] ${method} ${fullUrl}`, data);
    
    wx.request({
      url: fullUrl,
      method,
      data,
      header: buildHeaders(),
      success(res) {
        console.log(`[request] ${method} ${fullUrl} success`, res.statusCode, res.data);
        if (res.statusCode === 401) {
          handleUnauthorized();
          reject('UNAUTHORIZED');
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const payload = res.data || {};
          if (payload.code === 0) {
            resolve(payload.data);
          } else {
            reject(payload.message || '接口返回异常');
          }
        } else {
          reject(res.errMsg || '网络错误');
        }
      },
      fail(err) {
        console.error(`[request] ${method} ${fullUrl} failed`, err);
        // 如果是连接被拒绝，提供更友好的错误提示
        if (err.errMsg && err.errMsg.includes('ERR_CONNECTION_REFUSED')) {
          const baseUrl = buildBaseUrl();
          reject(`无法连接到后端服务 (${baseUrl})。请检查网络连接或联系管理员。`);
        } else {
          reject(err.errMsg || '网络请求失败');
        }
      }
    });
  });
};

module.exports = request;


