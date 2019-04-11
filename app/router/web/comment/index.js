'use strict';

module.exports = app => app.$router({
  namespace : '/api/portal',
  proxy : 'web.comment'
})(({ router, webtokenRouter, defaultRouter },t) => {

  webtokenRouter
  .get('commentPage')('/commentPage', t.commentPage)
  .delete('/comment', t.deleteComment)
  .get('/comment', t.getComment)
})
