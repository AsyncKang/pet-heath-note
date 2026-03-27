const request = require('../utils/request');

const listReminders = (params = {}) => {
  return request({
    url: '/api/reminders',
    method: 'GET',
    data: params
  });
};

const createReminder = (data) => {
  return request({
    url: '/api/reminders',
    method: 'POST',
    data
  });
};

const updateReminderStatus = (id, status) => {
  return request({
    url: `/api/reminders/${id}/status`,
    method: 'PUT',
    data: { status }
  });
};

const deleteReminder = (id) => {
  return request({
    url: `/api/reminders/${id}`,
    method: 'DELETE'
  });
};

module.exports = {
  listReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder
};


