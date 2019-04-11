'use strict';
const Controller = require('egg').Controller;
module.exports = app => app.$router({
  namespace : '/api/user',
  proxy : 'api.user'
})(({ router, tokenRouter },u) => {
  router.post('/login', u.login);
  tokenRouter.get('/getUserInfo', u.getUserInfo);
})
