'use strict';
const fs = require('fs')
const path = require('path')
const Controller = require('egg').Controller;
const { SQL, Pagination, Fs, Verification, Dated } = require('./../../public/js/tool')

class UserController extends require('./../extends/base')  {
  /**
   * 上传文章
   */
  async uploadArticleFiles(ctx) {
    let { date } = ctx.query;
    if(!date){
      this.fail({},'','日期必须有');
      return;
    }
    let filepath = path.resolve(ctx.app.config.staticAssets.img, date);
    let { files = [] } = ctx;
    let { img, temp } = ctx.app.config.staticAssets;
    if(!fs.existsSync(filepath)){
      fs.mkdirSync(filepath);
    }

    for(let i = 0; i< files.length; i ++){
      await fs.renameSync(path.resolve(temp, files[i].filename), path.resolve(img, date,files[i].filename),err => {
        this.fail({},'','未知错误')
      });
    }
    await ctx.service.protalArticle.pulishArticle({...ctx.query, uid : ctx.uid});
    this.success();
  }

  async modifyArticleFiles(ctx){
    let { date } = ctx.query;
    if(!date){
      this.fail({},'','日期必须有');
      return;
    }
    let filepath = path.resolve(ctx.app.config.staticAssets.img, date);
    let { img, temp } = ctx.app.config.staticAssets;
    let { files = [] } = ctx;
    for(let i = 0; i< files.length; i ++){
      await fs.renameSync(path.resolve(temp, files[i].filename), path.resolve(img, date,files[i].filename), err => {
        this.fail({},'','未知错误')
      });
    }
    await ctx.service.protalArticle.modifyArticleFiles({...ctx.query, uid : ctx.uid});
    this.success();
  }
  /** 跨域复制粘贴处理 */
  async crossDomain(ctx){
    let { src } = ctx.query;
    await ctx.app.$axios({
      url : src,
      responseType : 'arraybuffer'
    }, ctx).then(res => {
      this.success({
        data : res.toString('base64')
      })
    })
  }
  /** 获取文章分页 */
  async getArticlePage(ctx){

    let { title, category, status, pageSize, currPage, id, author_id } = ctx.query;
    if(!isNaN(+id)){
      id = `id = ${+id}`
    }
    if(author_id){
      author_id = `uid = '${author_id}'`
    }
    if(title){
      title = `title LIKE '%${title}%'`
    }
    if(category){
      category = `category = '${category}'`
    }
    if(status){
      status = Number(+status)
      if(status !== 0 || status !== 1){
        this.fail({},'status格式不正确')
      }
      status = `is_deleted = ${status}`
    }

    await Pagination.execute(this, async (mysql) => {
      return await ctx.service.protalArticle.getIdsRows(mysql, { pageSize, currPage , title, category, status, id, author_id } );
    }).then(async ({success, list}) => {
      if(!success) return;
      let IN = list.map(item => item.id).join(',');
      list = await ctx.service.protalArticle.getArticlePage(IN);
      await ctx.service.portalUser.matchUserToList(list, { uid : 'author', editor : 'editor' });
      // await ctx.service.portalUser.matchUserToList(list);
      success({ 
        list 
      })
    })
  }

  async getArticleDetail(ctx){
    let { id } = ctx.query;
    let data = await ctx.service.protalArticle.getArticleDetail(+id);
    this.success({
      data
    })
  }

  async deleteArticle(ctx){
    let { id } = ctx.query;
    let data = await ctx.service.protalArticle.deleteArticle(+id);
    this.success({
      data
    })
  }
  /**
   * 获取热门文章
   */
  async getHotAtricle(ctx){
    let { article_id, pageSize, currPage } = ctx.query;
    await Pagination.execute(this, async (mysql) => {
      return await ctx.service.protalArticle.getHotIdsRows(mysql, { pageSize, currPage , article_id });
    }).then(async ({success, list}) => {
      if(!success) return;
      let IN = list.map(item => item.article_id).join(',');
      list = await ctx.service.protalArticle.getHotAtricle(IN);
      await ctx.service.portalUser.matchUserToList(list, { uid : 'author', operator_id : 'operator' });
      success({ 
        list 
      })
    })
  }
  /**
   * 删除热门文章
   */
  async delHotAtricle(ctx){
    let { article_id } = ctx.query;
    let success = await ctx.service.protalArticle.delHotAtricle(article_id);
    if(success === false){
      this.fail({},'0003', '该文章已经不是热门文章')
      return;
    }
    this.success({})
  }
  /**
   * 新增热门文章
   */
  async postHotAtricle(ctx){
    let { article_id } = ctx.request.body;
    let success = await ctx.service.protalArticle.postHotAtricle(article_id, ctx.uid);
    if(success === false){
      this.fail({},'0003', '该文章已经是热门文章')
      return;
    }
    if(success === 'no'){
      this.fail({},'0003', '该文章不存在')
      return;
    }
    this.success({})
  }
  /**
   * 获取轮播文章
   */
  async getWheelAtricle(ctx){
    let list = await ctx.service.protalArticle.getWheelAtricle();
    await ctx.service.portalUser.matchUserToList(list, { uid : 'author', operator_id : 'operator' });
    this.success({
      list
    })
  }
  /**
   * 删除轮播文章
   */
  async delWheelAtricle(ctx){
    let { article_id } = ctx.query;
    let success = await ctx.service.protalArticle.delWheelAtricle(article_id);
    if(success === false){
      this.fail({},'0003', '该文章已经不在轮播中')
      return;
    }
    this.success({})
  }
  /**
   * 提交轮播文章
   */
  async postWheelAtricle(ctx){
    
    let date = Dated.getDateSmooth();
    let filepath = path.resolve(ctx.app.config.staticAssets.img, Dated.getDateSmooth());
    let { files = [], query : { article_id } } = ctx;
    let { img, temp } = ctx.app.config.staticAssets;
    if(!fs.existsSync(filepath)){
      fs.mkdirSync(filepath);
    }    
    filepath = `${ctx.app.config.staticDomain.img}/${date}/${files[0].filename}`;
    let success = await ctx.service.protalArticle.postWheelAtricle(article_id, filepath, ctx.uid);
    if(success === false){
      this.fail({},'0003', '该文章已经在轮播中')
      return;
    }
    if(success === 'no'){
      this.fail({},'0003', '该文章不存在')
      return;
    }
    for(let i = 0; i< files.length; i ++){
      await fs.renameSync(path.resolve(temp, files[i].filename), path.resolve(img, date,files[i].filename),err => {
        this.fail({},'','未知错误')
      });
    }
    this.success();
  }

  async getTags(ctx){
    let list = await ctx.service.protalArticle.getTags();
    this.success({ list })
  }

  async postTag(ctx){
    let { name } = ctx.request.body;
    let result = await ctx.service.protalArticle.postTag(name);
    if(result === false){
      this.fail({},'','标签已经存在');
      return;
    }
    this.success({})
  }

  async delTag(ctx){
    let { name } = ctx.query;
    let result = await ctx.service.protalArticle.delTag(name);
    if(result === false){
      this.fail({},'','标签已经不存在');
      return;
    }
    this.success({})
  }

  async getCategory(ctx){
    let list = await ctx.service.protalArticle.getCategory();
    this.success({ list })
  }

  async postCategory(ctx){
    let { name, code } = ctx.request.body;
    let result = await ctx.service.protalArticle.postCategory(name, code);
    if(result === false){
      this.fail({},'','分类已经存在');
      return;
    }
    this.success({})
  }

  async delCategory(ctx){
    let { name, code } = ctx.query;
    let result = await ctx.service.protalArticle.delCategory(name, code);
    if(result === false){
      this.fail({},'','分类已经不存在');
      return;
    }
    if(result === 'HAS_CONNECT'){ 
      this.fail({},'','分类存在绑定文章，请确保所有文章解绑');
      return;
    }
    this.success({})
  }

  async categoryStatus(ctx){
    let { code, disabled } = ctx.request.body;
    let result = await ctx.service.protalArticle.categoryStatus(code, disabled);
    if(result === false){
      this.fail({},'','分类已经不存在');
      return;
    }
    this.success({})
  }

  

}

module.exports = UserController;
