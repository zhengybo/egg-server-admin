'use strict';
/**
 * 规则校验中间件 用于校验 所用接口规则(规则配置在app/rule/* 进行配置)
 */
const { Obj } = _r('@/public/js');
const { Fs } = _r('@/public/js/tool');
const fs = require('fs');
const Path = require('path')
module.exports =  () => {
  return (proxy, key) => {
    return async  function(ctx, next) {
      
      let rules = Obj.proxy(ctx.app.rules, `${proxy}.${key}`);
      if(rules){
        rules = [...rules]; // 去存
        let hasFormData = rules.some(item => /formData/i.test(item.payload));
        let result = '',path = '';
        if(hasFormData){
          path = ctx.app.config.staticAssets.temp;
          result = await Fs.saveFiles(ctx, path, false);
          ctx.query = Object.assign(ctx.query, result.params || {});
          ctx.files = result.files;
        }
        for (let i = 0; i < rules.length; i++) {
          let item = { ...rules[i] };
          if(hasFormData){
            item.payload = 'query';
          }
          
          let check = await checkRule(item, ctx);
          if(!check){
            if(hasFormData){
              let { files = [] } = result
              files.forEach(file => {
                fs.unlink(Path.resolve(path, file.filename),err => {
                  if(err) console.log(err);
                });
              })
            }
            return;
          }
        }
      }
      await next();
    };
    
  }
};

async function checkRule(item, ctx){
 
  let { rules, required, payload, type, field, message, code  } = item;
  let value = '';
  switch (payload) {
    case 'query':
      value = ctx.query[field];
      if(required){
        if(value === undefined){
          return returnBody(ctx, `${field}字段必填`, code);
        }
        if(type){
          if(type == String){
            if(!value.trim()){
              return returnBody(ctx, `${field}字段必填`, code);
            }
          }
          if(type == Number){
            if(!value.trim() || isNaN((+value))){
              return returnBody(ctx, `${field}字段类型错误`, code);
            }
          }
        }
      }
      
      break;
    case 'body':
      value = ctx.request.body[field];
      if(required){
        if(value === undefined || value === null){
          return returnBody(ctx, `${field}字段必填`, code);
        }
        if(type){
          if(type == String){
            value = value.toString();
            if(value.__proto__ == String.prototype){
              if(!value.trim()){
                return returnBody(ctx, `${field}字段必填`, code);;
              }
            }else{
              return returnBody(ctx, `${field}字段类型错误`, code);
            }
          }

          if(type == Number){
            value = +value;
            if(value.__proto__ == Number.prototype && !isNaN(value)){
            }else{
              return returnBody(ctx, `${field}字段类型错误`, code);
            }
          }
          let types = [Array, RegExp, Object]
          for(let i = 0 ;i < types.length; i ++){
            if(type == types[i]){
              if(!(value instanceof types[i])){
                return returnBody(ctx, `${field}字段类型错误`, code);
              }
              break;
            }
          }
        }
      }
      break;
    default:
  }

  
  if(!required) { // 非必填
    if(value !== null && value !== undefined){
      if(type == String){
        // if(value){}
        value = value.toString();
      }
  
      if(type == Number){
        value = + value;
        if(isNaN(value)){
          return returnBody(ctx, `${field}字段类型错误`, code);
        }
       
        if(payload == 'query'){
          
          ctx.query[field] = +value;
        }
        if(payload == 'body'){
          ctx.request.body[field] = +value;
        }
      }
  
      if(type == Boolean){
        if(value.__proto__ != Boolean.prototype){
          return returnBody(ctx, `${field}字段类型错误`, code);
        }
      }
  
      if(type == Array){
        if(value.__proto__ != Array.prototype){
          return returnBody(ctx, `${field}字段类型错误`, code);
        }
      }
  
      if(type == Object){
        if(value.__proto__ != Object.prototype){
          return returnBody(ctx, `${field}字段类型错误`, code);
        }
      }
    }else{
      return true;
    }
  } 
  if(rules){
    for(let i = 0; i< rules.length; i ++){
      let item = rules[i];
      if(item.rule instanceof RegExp){
        if(!item.rule.test(value)){
          return returnBody(ctx, item.message, code);
        }
      }
      if(item.rule instanceof Function){
        if(!item.rule(value)){
          return returnBody(ctx, item.message, code);
        }
      }
    }
  }


  return true;
}

function returnBody(ctx, message, code){
  ctx.body = {
    returnSuccess : false,
    returnErrMsg : message,
    returnErrCode : code || '0008' 
  }
  return false;
}
