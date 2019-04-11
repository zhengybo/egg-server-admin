'use strict';

/**
 * 评论
 */
module.exports = {
    /**
     * 评论分页校验
     */
    commentPage : [
        {  field : 'id', type : Number,  required : false, payload : 'query', },
        {
            field : 'article_id', type : Number, required : false, payload : 'query',
        },
        {
            field : 'reply_id', type : Number, required : false, payload : 'query',
        },
        {   field : 'status', type : Number, required : false, payload : 'query',
            rules : [
                { rule : (v) => v == 1 || v == 0, message : '状态 错误' }
            ] 
        },
    ],
    /**
     * 删除评论校验
     */
    deleteComment : [
        {  field : 'id', type : Number,  required : true, payload : 'query', },
    ]
}