const request = require('../utils/request');

const login = (payload) => {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data: payload
  });
};

module.exports = {
  login
};


