'use strict';
module.exports =  () => {
  /**
   * 用户校验
   */
  return async  function(ctx,next) {
    const token = ctx.req.headers.token;
    let uid = await ctx.app.redis.get(token);
    if(uid){
      ctx.uid = uid;
    }
    await next();
  };
};
