'use strict';

module.exports = app => app.$router({
  namespace : '/api/article',
  proxy : 'api.article'
})(({ router, tokenRouter, userRouter },t) => {
  router
  .get('/page', t.page)
  .get('/category', t.getCategory)
  .get('/page/detail', t.detail)
  .get('/search/tags', t.getTags)
  .get('/getWheel',t.getWheel);
  userRouter
  .get('search')('/search', t.search)
  .get('/replys', t.replys)
  .get('/getComment',t.getComment)
  .get('/comments', t.comments);
  tokenRouter
  .get('/star', t.getStar)
  .post('/comment', t.comment)
  .post('/reply', t.reply)
  .post('/star', t.setStar)
  .post('/vote', t.vote)
})
