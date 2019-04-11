'use strict';

const Controller = require('egg').Controller;
const md5 = require('js-md5');
const { Pagination } = require('./../../public/js/tool')
class UserController extends require('./../extends/base')  {

  async login(ctx) {
    let { username, password } = ctx.request.body;
    let isExit = await ctx.service.portalUser.checkUser(username, password);
    if(!isExit){
      return this.fail({}, '', '用户名或密码错误');
    }
    let token = await ctx.service.portalUser.login(username, password );
    this.success({
      data : { token }
    })
  }

  async getUserInfo(ctx) {
    let token = ctx.req.headers.token;
    // let username = await ctx.app.redis.get(token);
    let data = await ctx.service.portalUser.getUserInfo(ctx.uid);
    this.success({
      data : {
        ...data,
        uploadDomain : ctx.app.config.staticDomain,
        rights : [
          "home",
          "vote",
          "voteDetail",
          "comments",
          "userManage",
          
          "articleManage",
          
          "articleManageCenter",
          "articleCenterPublish",
          "articleCenterModify",
          "articleCenterDetail",

          "articleManageHot",
          "articleManageWheel",
          "articleCategory",
          "articleHotTag"
        ]
      }
    })
  }

  async modifyPassword(ctx){
    let { password, newPassword } = ctx.request.body;
    let isReally = await ctx.service.portalUser.checkUser(ctx.username, password);
    if(isReally){
      let token = await ctx.service.portalUser.modifyPassword(ctx.username, newPassword);
      this.success({
        data : { token }
      })
    }else {
      return this.fail({},'','密码不正确')
    }
  }


  async userPage(ctx){
    let { name, pageSize, currPage, uid } = ctx.query;
    await Pagination.execute(this, async (mysql) => {
      return await ctx.service.portalUser.getIdsRows(mysql, { name, pageSize, currPage, uid } );
    }).then(async ({success, list}) => {
      if(!success) return;
      let IN = list.map(item => `'${item.uid}'`).join(',');
      list = await ctx.service.portalUser.userPage(IN);
      success({ 
        list 
      })
    })
  }

  async getUsers(ctx){
    let { name } = ctx.query;
    let list = await ctx.service.portalUser.getUsers(name);
    this.success({
      list
    })
  }

  async forbidden(ctx){
    let { status, uid } = ctx.request.body;
    await ctx.service.portalUser.forbidden(uid, +status);
    this.success({})
  }
}

module.exports = UserController;
