'use strict';


module.exports = {
    /**
     * 分页校验
     */
    getArticlePage : [
        {  field : 'id', type : Number,  required : false, payload : 'query', },
        {
            field : 'category', type : String, required : false, payload : 'query',
        },
        {
            field : 'author_id', type : String, required : false, payload : 'query',
            rules : [
                { rule : (v) => v.length == 32, message : '非法的作者id' }
            ] 
        },
        {
            field : 'title', type : String, required : false, payload : 'query',
        },
        {   field : 'status', type : Number, required : false, payload : 'query',
            rules : [
                { rule : (v) => v == 1 || v == 0, message : '状态 错误' }
            ] 
        },
    ],
    /**
     * 详情校验
     */
    getArticleDetail : [ { field : 'id', type : Number, required : true } ],
    /**
     * 删除校验
     */
    deleteArticle : [ 
        {   field : 'id', type : Number, required : true,
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]  
        },
    ],
    /**
     * 热门文章
     */
    getHotAtricle : [  // 获取
        {   field : 'article_id', type : Number, required : false,
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]  
        },
    ],
    delHotAtricle : [  // 删除
        {   field : 'article_id', type : Number, required : true,
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]  
        },
    ],
    postHotAtricle : [  // 新增
        {   field : 'article_id', type : Number, required : true, payload : 'body',
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]  
        },
    ],

    /**
     * 轮播
     */
    delWheelAtricle : [  // 删除
        {   field : 'article_id', type : Number, required : true,
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]
        },
    ],
    postWheelAtricle : [  // 新增
        {   field : 'article_id', type : Number, required : true, payload : 'formData',
            rules : [
                { rule : (v) => v >= 0, message : '非法id' }
            ]  
        },
    ],


    /**
     * 修改文章校验
     */
    modifyArticleFiles : [ 
        {   field : 'id', type : Number,  required : true },
        {   field : 'title', type : String, required : true, payload : 'formData' },
        {   field : 'author_id', type : String, required : true, payload : 'formData',
            rules : [
                { rule : (v) => v.length ==32, message : '非法发布人' }
            ]  
        },
        {   field : 'category', type : String, required : true, payload : 'formData' },
        {
            field : 'content', type : String, required : true, payload : 'formData',
            rules : [
                { rule : (v) => v.length > 50, message : '内容不能低于50个字' }
            ]
        } 
    ],
    /**
     * 上传文章校验
     */
    uploadArticleFiles : [
        {
            field : 'title', type : String, required : true, payload : 'formData'
        },
        {   field : 'author_id', type : String, required : true, payload : 'formData' ,
            rules : [
                { rule : (v) => v.length ==32, message : '非法发布人' }
            ]    
        },
        {   field : 'cover', type : String, required : true, payload : 'formData' },
        {   field : 'category', type : String, required : true, payload : 'formData' },
        {
            field : 'content', type : String, required : true, payload : 'formData',
            rules : [
                { rule : (v) => v.length > 50, message : '内容不能低于50个字' }
            ]
        } 
    ],

    /* 标签栏 */ 
    delTag : [
        {   field : 'name', type : String, required : true  },
    ],

    postTag : [
        {   field : 'name', type : String, required : true , payload : 'body' },
    ],

    delCategory : [
        {   field : 'code', type : String, required : true, rules : [
            { rule : (v) => /^[_a-zA-Z0-9]{1,32}$/.test(v), message : '非法的code' }
        ]},
    ],

    /* 分类栏 */
    postCategory : [
        {   field : 'code', type : String, required : true , payload : 'body', rules : [
            { rule : (v) => /^[_a-zA-Z0-9]{1,32}$/.test(v), message : '非法的code' },
            
        ] },
        {   field : 'name', type : String, required : true, payload : 'body', rules : [
            { rule : (v) => /^[_\u4e00-\u9fa5a-zA-Z0-9]{1,50}$/.test(v), message : '分类名格式错误' }
        ]},
    ],

    categoryStatus : [
        {   field : 'code', type : String, required : true , payload : 'body', rules : [
            { rule : (v) => /^[_a-zA-Z0-9]{1,32}$/.test(v), message : '非法的code' },
        ] },
        {   field : 'disabled', type : Number, required : true , payload : 'body', rules : [
            { rule : (v) => v === 0 || v === 1, message : '禁用状态错误' },
        ] },
    ]
}