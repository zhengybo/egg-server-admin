'use strict';

class TopicController extends require('./../extends/base') {

  async page(ctx) {
    let { pageSize = 10, lastId = -1, category, more = false } = ctx.query;
    more = Boolean(+more);
    if(typeof +lastId != 'number' && +typeof pageSize != 'number' ){
      this.fail({}, '0002', '请求参数错误lastId,category')
      return ;
    }
    let  data = await ctx.service.article.getArticle({
      pageSize, lastId, category, more
    });
    this.success({
      data
    })
  }

  async getWheel(ctx){
    let list = await ctx.service.article.getWheel();
    this.success({
      list
    })

  }

  async detail(ctx) {
    let article_id = +ctx.query.article_id;
    if(isNaN(article_id)){
      this.fail({},'0001','错误的请求');
      return
    }

    let data = await ctx.service.article.getArticleDetail(article_id);
    // console.log(data);
    if(!data){
      this.fail({},'0001','文章不存在或者已被删除');
      return;
    }
    let author = await ctx.service.user.getUserInfo(data.uid);
    data.author = author;
    this.success({
      data
    })
  }

  /* 查询单条评论 */
  async getComment(ctx){
    let { id } = ctx.query;
    if(isNaN(+id) || typeof(+id) != 'number'){
      this.fail({},'0001','id不能为空');
      return ;
    }
    let data = await ctx.service.article.getComment(id);
    if(!data){
      this.fail({},'0001','评论不存在');
      return ;
    }
    let authors = await ctx.service.article.getAuthors([
      data.author_id, data.reply_author_id
    ]);

    data.author = authors.find(item => item.uid = data.author_id)
    data.reply_author = authors.find(item => item.uid = data.reply_author_id);
    this.success({
      data
    })
  }
  /* 查询全部评论 */
  async comments(ctx) {
    let { article_id, last_id } = ctx.query;
    if(isNaN(+article_id) || typeof(+article_id) != 'number'){
      this.fail({},'0001','id不能为空');
      return ;
    }
    let data = await ctx.service.article.comments(article_id, last_id, ctx.uid) || [];
    let list = [];
    data.forEach(item => {
      list.push(item, ...item.children_comments)
    })

    await ctx.service.portalUser.matchUserToList(list, { author_id : 'author', reply_author_id : 'reply_to_author' });
    this.success({
      data
    })
  }
  /* 查询全部回复 */
  async replys(ctx){
    let { id, last_id } = ctx.query;
    if(!id){
      this.fail({},'0001','id不能为空');
      return;
    }
    let data = await ctx.service.article.replys(id, last_id);
    await ctx.service.portalUser.matchUserToList(data, { author_id : 'author', reply_author_id : 'reply_to_author' });
    this.success({
      data
    })
  }
  /* 回复操作 */
  async reply(ctx){
    await this.comment(ctx, 'answer');
  }
  /* 评论操作 */
  async comment(ctx, resource_type = 'article'){

    let { reply_id = null, content = '', article_id, reply_author_id = null } = ctx.request.body;
    if(!article_id){
      this.fail({},'0006',"id不能为空");
      return ;
    }

    if(reply_author_id && !String(reply_author_id).trim()){
      this.fail({},'0005',"回复作者不能为空");
      return ;
    }

    if(!String(content).trim()){
      this.fail({},'0002','回复内容不能为空');
      return;
    }

    let user = await ctx.service.user.getUserInfo(ctx.uid);
    if(!user){
      this.fail({},'0002','用户不存在');
      return;
    }else{
      if(!!user.forbidden){
        this.fail({},'0003','你评论受到限制');
        return;
      }
    }

    let data = await ctx.service.article.comment({
      author_id : ctx.uid,
      resource_type,
      reply_id,
      content,
      article_id,
      reply_author_id
    })
    this.success({
      data
    })
  }
  /* 设置点赞 */
  async setStar(ctx){
    let { article_id, status, comment_id } = ctx.request.body;
    let type = '', id;
    if(!article_id || typeof (+article_id) != 'number'){
      if(!comment_id || typeof (+comment_id) != 'number'){
        this.fail({}, '0008', '点赞id不正确');
        return ;
      }else{
        id = comment_id;
        type = 'comment';
      }
    }else{
      id = article_id
      type = 'article';
    }

    if(status != '0' && status != '1'){
      this.fail({}, '0004', '状态不正确');
    }
    await ctx.service.article.setStar(id, status, ctx.uid, type);
    this.success({})
  }
  /*  获取点赞 */
  async getStar(ctx){
    let { article_id } = ctx.query;
    let type = ''
    if(!article_id || typeof (+article_id) != 'number'){
      if(!comment_id || typeof (+comment_id) != 'number'){
        this.fail({}, '0008', '点赞id不正确');
        return ;
      }else{
        type = 'comment'
      }
    }else{
      type = 'article'
    }
    let result = await ctx.service.article.getStar(article_id, ctx.uid, type);
    if(result){
      this.success({
        status : !!result.status
      })
    }else{
      this.success({
        status : false
      })
    }
    
  }

  /* 举报 */
  async vote(ctx){
    let { article_id, status, comment_id } = ctx.request.body;
    let type = '', id;
    if(!article_id || typeof (+article_id) != 'number'){
      if(!comment_id || typeof (+comment_id) != 'number'){
        this.fail({}, '0008', '举报id不正确');
        return ;
      }else{
        id = comment_id;
        type = 'comment';
      }
    }else{
      id = article_id
      type = 'article';
    }

    if(status != '0' && status != '1'){
      this.fail({}, '0004', '状态不正确');
    }
    await ctx.service.article.vote(id, status, ctx.uid, type);
    this.success({})
  }

  async search(ctx){
    let { key, pageSize, currPage } = ctx.query;
    let list = await ctx.service.article.search({ key, pageSize, currPage });
    this.success({
      list
    })
  }

  async getTags(ctx){
    let list = await ctx.service.article.getTags();
    this.success({
      list
    })
  }

  async getCategory(ctx){
    let list = await ctx.service.article.getCategory();
    this.success({ list })
  }

}

module.exports = TopicController;
