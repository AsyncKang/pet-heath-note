const request = require('../utils/request');

const listPets = (params = {}) => {
  return request({
    url: '/api/pets',
    method: 'GET',
    data: params
  });
};

const createPet = (data) => {
  return request({
    url: '/api/pets',
    method: 'POST',
    data
  });
};

const getPet = (petId) => {
  return request({
    url: `/api/pets/${petId}`,
    method: 'GET'
  });
};

const updatePet = (petId, data) => {
  return request({
    url: `/api/pets/${petId}`,
    method: 'PUT',
    data
  });
};

module.exports = {
  listPets,
  createPet,
  getPet,
  updatePet
};


