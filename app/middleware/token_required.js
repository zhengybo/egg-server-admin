'use strict';
const Interface = _r('@/controller/extends/interface');
const Code = _r('@/../global/code.js');
module.exports =  () => {
  /**
   * 登录校验
   */
  return async  function(ctx,next) {
    const token = ctx.req.headers.token;
    let uid = await ctx.app.redis.get(token);
    if(!uid){ // redis 没有取到
      let data = await ctx.service.user.getToken(token); // 取数据库token
      if(data){
        await ctx.app.redis.set(data.token, data.uid, 'EX', 10);
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
    ctx.uid = uid;
    await next();
  };
};
