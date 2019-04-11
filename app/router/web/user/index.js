'use strict';

module.exports = app => app.$router({
  namespace : '/api/portal',
  proxy : 'web.user'
})(({ router, webtokenRouter, defaultRouter },t) => {
  defaultRouter('login')
  .post('/login', t.login);
  webtokenRouter
  .get('/getUserInfo', t.getUserInfo)
  .post('/modifyPassword', t.modifyPassword)
  .get('/user/userPage', t.userPage)
  .get('getUsers')('/user/getUsers', t.getUsers)
  .put('forbidden')('/user/forbidden', t.forbidden)
})
