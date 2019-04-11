'use strict';

/**
 * 用户模块校验规则
 */
module.exports = {
    /* 登录 */
    login : [
        {
            field : 'username', type : String, required : true, payload : 'body',
            rules : [
                { 
                    rule : v => v.length <= 20 && v.length >= 5, 
                    message : '用户名格式不正确' 
                },
            ],
        },
        {
            field : 'password', type : String, required : true, payload : 'body',
            rules : [
                {
                    rule : v => v.length == 32, 
                    message : '用户名或密码错误' 
                }
            ]
        }
    ],
    getUsers : [
        {
            field : 'name', type : String, required : true
        },
    ],
    forbidden : [
        {
            field : 'uid', type : String, required : true, payload : 'body',
            rules : [
                {
                    rule : v => v.length == 32, 
                    message : '非法的用户id' 
                }
            ]
        },
        {
            field : 'status', type : Boolean, required : true, payload : 'body'
        },
    ]
}