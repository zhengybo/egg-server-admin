/**
 * 一个默认检验器(用于生成默认rule校验router）
 */
'use strict';
module.exports =  () => {
  return async  function(ctx,next) {


    await next();
  };
};
