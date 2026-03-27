const request = require('../utils/request');

const listVaccineRecords = (petId, params = {}) =>
  request({
    url: `/api/pets/${petId}/vaccine-records`,
    method: 'GET',
    data: params
  });

const createVaccineRecord = (petId, data) =>
  request({
    url: `/api/pets/${petId}/vaccine-records`,
    method: 'POST',
    data
  });

const getVaccineRecord = (id) =>
  request({
    url: `/api/vaccine-records/${id}`,
    method: 'GET'
  });

const updateVaccineRecord = (id, data) =>
  request({
    url: `/api/vaccine-records/${id}`,
    method: 'PUT',
    data
  });

const deleteVaccineRecord = (id) =>
  request({
    url: `/api/vaccine-records/${id}`,
    method: 'DELETE'
  });

module.exports = {
  listVaccineRecords,
  createVaccineRecord,
  getVaccineRecord,
  updateVaccineRecord,
  deleteVaccineRecord
};


