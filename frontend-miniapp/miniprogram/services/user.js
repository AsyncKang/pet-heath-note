const request = require('../utils/request');

const getUser = (userId) => {
  return request({
    url: `/api/users/${userId}`,
    method: 'GET'
  });
};

const updateUser = (userId, data) => {
  return request({
    url: `/api/users/${userId}`,
    method: 'PUT',
    data
  });
};

module.exports = {
  getUser,
  updateUser
};


