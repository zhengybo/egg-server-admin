'use strict';

class UserController extends require('./../extends/base')  {

  async login(ctx) {
    const { miniProgram } = ctx.app.config;
    const { js_code, grant_type, userInfo = {} } = ctx.request.body;
    await ctx.app.$axios({
      url : 'https://api.weixin.qq.com/sns/jscode2session',
      params : {
        js_code,
        grant_type,
        ...miniProgram
      },
    }).then(async (data) => {
      // console.log()
      if(data.errcode){
        this.fail({data},'0001','登录失败');
        return ;
      }
      let token = await ctx.service.user.user(data.openid, userInfo)
      this.success({
        data : { token }
      })
    })
  }

  async getUserInfo(ctx) {
    let data = await ctx.service.user.getUserInfo(ctx.uid);
    this.success({
      data
    })
  }
}

module.exports = UserController;
