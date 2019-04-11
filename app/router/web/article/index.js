'use strict';

module.exports = app => app.$router({
  namespace : '/api/portal/article',
  proxy : 'web.article'
})(({ router, webtokenRouter },t) => {
  webtokenRouter
  .get('/crossDomain', t.crossDomain)
  .get('getArticlePage')('/getArticlePage', t.getArticlePage)
  .get('getArticleDetail')('/getArticleDetail', t.getArticleDetail)
  .delete('deleteArticle')('/deleteArticle', t.deleteArticle)

  .get('/search/tags', t.getTags)
  .delete('delTag')('/search/tags', t.delTag)
  .post('postTag')('/search/tags', t.postTag)

  .get('/category', t.getCategory)
  .delete('delCategory')('/category', t.delCategory)
  .post('postCategory')('/category', t.postCategory)
  .put('categoryStatus')('/categoryStatus', t.categoryStatus)

  .get('getHotAtricle')('/hotAtricle', t.getHotAtricle)
  .delete('delHotAtricle')('/hotAtricle', t.delHotAtricle)
  .post('postHotAtricle')('/hotAtricle', t.postHotAtricle)

  .get('/wheelAtricle', t.getWheelAtricle)
  .delete('delWheelAtricle')('/wheelAtricle', t.delWheelAtricle)
  .post('postWheelAtricle')('/wheelAtricle', t.postWheelAtricle)

  .put('modifyArticleFiles')('/modifyArticleFiles', t.modifyArticleFiles)
  .post('uploadArticleFiles')('/uploadArticleFiles', t.uploadArticleFiles);
})
