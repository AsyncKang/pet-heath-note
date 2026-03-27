const request = require('../utils/request');

const listWalkRecords = (petId, params = {}) => {
  return request({
    url: `/api/pets/${petId}/walk-records`,
    method: 'GET',
    data: params
  });
};

const getWalkStats = (petId) => {
  return request({
    url: `/api/pets/${petId}/walk-records/stats`,
    method: 'GET'
  });
};

const createWalkRecord = (petId, data) => {
  return request({
    url: `/api/pets/${petId}/walk-records`,
    method: 'POST',
    data
  });
};

const getWalkRecord = (walkRecordId) => {
  return request({
    url: `/api/walk-records/${walkRecordId}`,
    method: 'GET'
  });
};

module.exports = {
  listWalkRecords,
  getWalkStats,
  createWalkRecord,
  getWalkRecord
};


