'use strict';
/**
 * Pagination respone 分页返回
 */
const Base = require('./base');

class Pagination extends Base {
  constructor(props) {
    super(props)
  }
  success(data = {}){
    super.success(Object.assign({
      totalPages : 0,
      totalElements : 0
    },data))
  }
}
