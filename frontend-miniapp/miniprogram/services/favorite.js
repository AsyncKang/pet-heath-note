const request = require('../utils/request');

const listFavoritePlaces = (userId, params = {}) => {
  return request({
    url: `/api/users/${userId}/favorite-places`,
    method: 'GET',
    data: params
  });
};

const createFavoritePlace = (userId, data) => {
  return request({
    url: `/api/users/${userId}/favorite-places`,
    method: 'POST',
    data
  });
};

const getFavoritePlace = (id) => {
  return request({
    url: `/api/favorite-places/${id}`,
    method: 'GET'
  });
};

const updateFavoritePlace = (id, data) => {
  return request({
    url: `/api/favorite-places/${id}`,
    method: 'PUT',
    data
  });
};

const deleteFavoritePlace = (id) => {
  return request({
    url: `/api/favorite-places/${id}`,
    method: 'DELETE'
  });
};

module.exports = {
  listFavoritePlaces,
  createFavoritePlace,
  getFavoritePlace,
  updateFavoritePlace,
  deleteFavoritePlace
};


