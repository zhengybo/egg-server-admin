'use strict';
/**
 * respone 返回基类
 */
const Controller = require('egg').Controller;
const Interface = require('./interface');
const Code = _r('@/../global/code.js');
class Base extends Controller {
  constructor(props) {
    super(props)
  }

  callback(option = {}){
    const { success, msg, code } = Interface;
    this.ctx.body = Object.assign({
      ...option,
      [success] : option[success] !== undefined ? option[success] : true,
      [msg] : option[msg] || '',
      [code] : option[code] || '',
    })
  }

  success(data = {}){
    this.callback(data);
  }

  fail(data = {},code = '0000',msg = ''){
    this.callback(Object.assign({}, {
      [Interface.code] : code,
      [Interface.success] : false,
      [Interface.msg] : msg,
      ...data
     }));
  }

  error(status = 403, msg = ''){
    this.ctx.throw(status, msg)
  }
}

module.exports = Base;
