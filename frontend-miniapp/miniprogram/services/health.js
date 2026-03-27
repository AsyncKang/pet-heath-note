const request = require('../utils/request');

const listHealthRecords = (petId, params = {}) => {
  return request({
    url: `/api/pets/${petId}/health-records`,
    method: 'GET',
    data: params
  });
};

const createHealthRecord = (petId, data, options = {}) => {
  const query = options.force ? '?force=true' : '';
  return request({
    url: `/api/pets/${petId}/health-records${query}`,
    method: 'POST',
    data
  });
};

const updateHealthRecord = (id, data) => {
  return request({
    url: `/api/health-records/${id}`,
    method: 'PUT',
    data
  });
};

const deleteHealthRecord = (id) => {
  return request({
    url: `/api/health-records/${id}`,
    method: 'DELETE'
  });
};

const getHealthRecordByTime = (petId, recordDate) => {
  return request({
    url: `/api/pets/${petId}/health-records/by-time`,
    method: 'GET',
    data: {
      recordDate
    }
  });
};

module.exports = {
  listHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthRecordByTime
};


