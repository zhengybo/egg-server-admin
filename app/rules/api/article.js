'use strict';

/**
 * 文章
 */
module.exports = {
  
    /**
     * search
     */
    search : [
        {  field : 'key', type : String,  required : true, payload : 'query' },
        {  field : 'pageSize', type : Number,  required : true, payload : 'query',
            rules : [
                { rule : (v) => v >= 0, message : '错误的pagesize' }
            ]
        },
        {  field : 'currPage', type : Number,  required : true, payload : 'query',
            rules : [
                { rule : (v) => v >= 0, message : '错误的currPage' }
            ]
        },
    ]
}