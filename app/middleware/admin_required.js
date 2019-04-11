'use strict';
module.exports =  () => {
  /**
   * 管理校验
   */
  return async  function(ctx,next) {


    await next();
  };
};
