const request = require('../utils/request');

const getCurrentWeather = (lat, lon) => {
  return request({
    url: '/api/weather/current',
    method: 'GET',
    data: { lat, lon }
  });
};

module.exports = {
  getCurrentWeather
};


