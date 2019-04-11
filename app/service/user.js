const md5 = require('js-md5');
module.exports = app => {
  const TOKEN_EXPIRE = app.config.basis.redisTokenExpire;
  return class User extends app.Service {
    /** 用户登录 */
    async user(openid, userInfo){

      let data = await app.mysql.get('user', { openid }); // 查
      let token = md5(JSON.stringify(openid) + new Date().getTime().toString());

      if(!data){
        const conn = await app.mysql.beginTransaction();
        const uid = md5(openid);
        console.log('没有查到数据, 新注册了一个用户');
        try {
          await conn.insert('user', { openid, uid, token });
          await conn.insert('userinfo', {
             icon : userInfo.avatarUrl, name : userInfo.nickName, uid, created_time : ~~(new Date().getTime() / 1000)
          });
          await conn.commit();
        } catch (e) {
          await conn.rollback();
          throw e;
        }
        await app.redis.set(token, uid, 'EX', TOKEN_EXPIRE); // 设置旧的token 过期
        return token;
      }
      let oldToken = data.token;  // 旧的token
      if(oldToken){
        await app.redis.set(oldToken, '', 'EX', 1); // 设置旧的token 过期
      }

      await app.redis.set(token, data.uid, 'EX', TOKEN_EXPIRE); // 设置旧的token 过期
      await app.mysql.update('user', {
        token,
      },{ where: { openid } });

      return token;
    }

    async getArticleDetail(article_id){

    }

    async comments(category, article_id){

    }

    async getUserInfo(uid){
      let data = await app.mysql.query(`SELECT name,uid,icon,forbidden FROM userinfo WHERE uid='${uid}' LIMIT 1`);
      return  data[0];
    }

    async getToken(token){
      return await app.mysql.get('user',{
        token
      })
    }

  }

};
