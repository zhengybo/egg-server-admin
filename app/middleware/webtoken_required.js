'use strict';
const Interface = _r('@/controller/extends/interface');
const Code = _r('@/../global/code.js');
module.exports =  () => {
  /**
   * 用户校验
   */
  return async  function(ctx,next) {
    const TOKEN_EXPIRE = ctx.app.config.basis.redisTokenExpire;
    const token = ctx.req.headers.token;
    let uid = await ctx.app.redis.get(token);
    if(!uid){ // redis 没有取到
      let data = await ctx.service.user.getToken(token); // 取数据库token
      if(data){
        await ctx.app.redis.set(data.token, `${data.username}-${data.uid}`, 'EX', TOKEN_EXPIRE);
        uid = data.uid;
      }
    }
    if(!uid){
      ctx.body = {
        [Interface.success] : false,
        [Interface.code] : '00043',
        [Interface.msg] : Code['00043']
      }
      return;
    }
    ctx.uid = uid.split('-')[1];
    ctx.username = uid.split('-')[0];
    await next();
  };
};
