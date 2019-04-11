'use strict';

module.exports = app => app.$router({
  namespace : '/api/portal',
  proxy : 'web.vote'
})(({ webtokenRouter },t) => {

  webtokenRouter
  .get('votePage')('/votePage', t.votePage)
  .get('voteDetailList')('/voteDetailList', t.voteDetailList)
})
