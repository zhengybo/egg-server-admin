const md5 = require('js-md5');
const { SQL } = require('./../public/js/tool')
module.exports = app => {
  const TOKEN_EXPIRE = app.config.basis.redisTokenExpire;
  return class User extends app.Service {
    async login(username, password){
      let web_token = await this.updateToken(username, password);
      await app.mysql.update('user', { web_token },{ where: { username } });
      return web_token;
    }

    async checkUser(username, password){
      return !! await app.mysql.get('user', {
        username,
        password
      });
    }

    async modifyPassword(username, password){
      let web_token = await this.updateToken(username, password);
      await app.mysql.update('user', {
        password,
        web_token
      },{ where: { username } });
      return web_token;
    }

    async getUserInfo(uid){
      return await app.mysql.get('userinfo', { uid });
    }

    async updateToken(username, password){
      let oldToken = await app.mysql.query(
        `SELECT web_token,uid,username from user WHERE username = '${username}' LIMIT 1`
      );
      if(oldToken[0] && oldToken[0].web_token){ // 设置旧token过期
        await app.redis.set(oldToken[0].web_token, '', 'EX', 1);
      }
      let web_token =  md5('web-' + JSON.stringify({ username, password }) + new Date().getTime().toString())
      await app.redis.set(web_token, oldToken[0] ? `${oldToken[0].username}-${oldToken[0].uid}` : '', 'EX', TOKEN_EXPIRE);
      return web_token;
    }

    async userPage(ids){
      if (!ids.trim()) return [];
      return await app.mysql.query(`
       SELECT name,username,icon,uid,created_time,identity,forbidden FROM userinfo WHERE uid IN (${ids})
      `);
    }


    async getIdsRows(mysql, { pageSize, currPage , name = '', uid = ''}){
      if(!name) name = '';
      if(!uid) uid = '';
      name = name.trim() ? `name like '%${name.trim()}%'` : '' ;
      uid = uid.trim() ? `uid = '${uid.trim()}'` : '' ;
      let sql = '';
      
      return await mysql.query(`
        SELECT SQL_CALC_FOUND_ROWS uid FROM userinfo 
        ${SQL.where(name,uid)} 
        ORDER BY id DESC
        LIMIT ${pageSize * (currPage - 1)},${pageSize}
      `);
    }

    async matchUserToList(list, fileds = { uid : 'author' }){
      if(!list.length) return [];
      let uids = []; 
      list.map(item => {
        Object.keys(fileds).forEach(key => {
          if(item[key]){
            uids.push(item[key])
          };
        })
      });
      uids = [...new Set(uids)];
      uids = uids.map(uid => `'${uid}'`).join(',');
      if(!uids.trim()) return list;
      let authors =  await app.mysql.query(`SELECT name,uid,icon FROM userinfo WHERE uid in (${uids})`);
      list.forEach(item => {
        Object.keys(fileds).forEach(key => {
          let author = authors.find(lt => lt.uid == item[key]);
          delete item[key];
          item[fileds[key]] = author || {};
        })   
      });
      return list;
    }

    async getUsers(name){
      return await app.mysql.query(`
      SELECT name,uid,icon FROM userinfo WHERE uid ='${encodeURIComponent(name)}' || name like '%${name}%' LIMIT 10`
      );
    }

    async forbidden(uid, forbidden){
      return await app.mysql.query(`
        UPDATE userinfo SET forbidden=${+forbidden} WHERE uid = '${uid}'
      `);
    }
  }

};
