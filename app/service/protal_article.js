const { SQL } = require('./../public/js/tool')
const { Obj } = _r('@/public/js');
module.exports = app => {
  return class User extends app.Service {
    async pulishArticle(params){
      let { title, category,content, cover, uid, date, author_id } = params;
      let time = new Date().getTime() / 1000;
      await app.mysql.insert('article', {
        title, category, content,
        cover : `${app.config.staticDomain.img}/${date}/${cover}`,
        uid : author_id,
        editor : uid,
        created_time : time,
        edit_time : time
      })
    }

    async modifyArticleFiles(params = {}){
      let { title, category,content, cover, id, uid, author_id } = params;
      let row  = Obj.clear({title, category,content, cover, uid : author_id}) ;
      await app.mysql.update('article', {
        ...row,
        edit_time : new Date().getTime() / 1000,
        editor : uid
      }, {
        where: { id }
      })
    }

    async getArticlePage(ids){
      if (!ids.trim()) return [];
      return await app.mysql.query(`
        SELECT a.*, b.icon,b.name
        FROM (
          SELECT id,title,cover,category,created_time, edit_time,is_deleted,views,comments,star_count,uid,editor,hot
          FROM  article 
          WHERE id IN ( ${ids}) 
        ) a 
        LEFT JOIN userinfo b ON a.uid = b.uid
        GROUP BY a.id
        ORDER BY edit_time DESC, created_time DESC,id
      `);
    }
    /** 用于查询数据条数 和ids */
    async getIdsRows(mysql, { pageSize, currPage , title, category, status, id, author_id }){
      return await mysql.query(`
        SELECT SQL_CALC_FOUND_ROWS id FROM article 
        ${SQL.where(title, category, status, id, author_id)} 
        ORDER BY edit_time DESC, created_time DESC, id
        LIMIT ${pageSize * (currPage - 1)},${pageSize}
        
      `);
    }

    async getArticleDetail(id){
      let result = await app.mysql.query(`
        SELECT a.*,b.icon,b.name,COUNT(c.id) star_count
        FROM article a 
        JOIN userinfo b on a.id = ${id} && a.uid = b.uid
        LEFT JOIN star c on a.id = c.star_id
      `);
      return result[0];
    }

    async deleteArticle(id){
      let result = await app.mysql.query(`
        UPDATE article SET is_deleted=1 WHERE id = ${id}
      `);
      return result[0];
    }

    /**
     * 获取热门文章
     */
    async getHotAtricle(ids){
      if (!ids.trim()) return [];
      return await app.mysql.query(`
        SELECT 
        art.title,art.uid,art.is_deleted,art.cover,art.hot, hot.created_time,hot.operator_id,hot.article_id
        FROM article art 
        JOIN hot_article hot 
        ON art.id = hot.article_id && art.id IN ( ${ids}) 
      `);
    }
    /**
     * 获取热门文章ids
     */
    async getHotIdsRows(mysql, { pageSize, currPage, article_id }){
      return await mysql.query(`
      SELECT SQL_CALC_FOUND_ROWS article_id FROM hot_article ${SQL.WHERE({ article_id })} 
        ORDER BY created_time DESC, id
        LIMIT ${pageSize * (currPage - 1)},${pageSize}
      `);
    }
    /**
     * 删除热门文章
     */
    async delHotAtricle(article_id){
      const conn = await app.mysql.beginTransaction();
      try {
        let has = await app.mysql.query(`
        SELECT id FROM hot_article WHERE article_id=${article_id} LIMIT 1
        `);
        if(has[0]){
          await app.mysql.update('article', { hot : 0 }, {
            where: { id : article_id }
          })
          await app.mysql.delete('hot_article', {
            article_id,
          });
          return true;
        }else{
          return false;
        }
      }catch(e){
        await conn.rollback();
        throw e;
      }
    }
    /**
     * 新增热门文章
     */
    async postHotAtricle(article_id, uid){
      const conn = await app.mysql.beginTransaction();
      try {
        let article = await app.mysql.query(`
        SELECT id FROM article WHERE id=${article_id} LIMIT 1
        `);
        if(!article[0]){
          return 'no';
        }
        let has = await app.mysql.query(`
        SELECT id FROM hot_article WHERE article_id=${article_id} LIMIT 1
        `)
        if(!has[0]){
          await app.mysql.insert('hot_article', {
            article_id,
            created_time : new Date().getTime() / 1000,
            operator_id : uid
          });
          await app.mysql.update('article', { hot : 1 }, {
            where: { id : article_id }
          });
          return true;
        }else{
          return false;
        }
      }catch(e){
        await conn.rollback();
        throw e;
      }
    }
    /**
     * 获取轮播文章
     */
    async getWheelAtricle(){
      return await app.mysql.query(`
        SELECT 
        art.title,art.uid,art.is_deleted,art.cover, wheel.created_time,wheel.operator_id,wheel.article_id,wheel.picture
        FROM article art 
        RIGHT JOIN wheel_article wheel 
        ON art.id = wheel.article_id
      `);
    }
    /**
     * 删除轮播
     */
    async delWheelAtricle(article_id){
      const conn = await app.mysql.beginTransaction();
      try {
        let has = await app.mysql.query(`
        SELECT id FROM wheel_article WHERE article_id=${article_id} LIMIT 1
        `);
        if(has[0]){
          await app.mysql.delete('wheel_article', {
            article_id
          });
          return true;
        }else{
          return false;
        }
      }catch(e){
        await conn.rollback();
        throw e;
      }
    }
    /**
     * 新增轮播
     */
    async postWheelAtricle(article_id, picture, uid){
      const conn = await app.mysql.beginTransaction();
      try {
        let has = await app.mysql.query(`
        SELECT id FROM wheel_article WHERE article_id=${article_id} LIMIT 1
        `);
        let article = await app.mysql.query(`
        SELECT id FROM article WHERE id=${article_id} LIMIT 1
        `);
        if(!article[0]){
          return 'no';
        }
        
        if(!has[0]){
          await app.mysql.insert('wheel_article', {
            article_id,
            picture,
            created_time : new Date().getTime() / 1000,
            operator_id : uid
          });
          await app.mysql.update('article', { hot : 1 }, {
            where: { id : article_id }
          });
          return true;
        }else{
          return false;
        }
      }catch(e){
        await conn.rollback();
        throw e;
      }
    }


    async getTags(){
      return await app.mysql.query(`SELECT name FROM hot_tag`);
    }

    async postTag(name){
      let data = await app.mysql.query(`
       SELECT id FROM hot_tag WHERE name='${name}'
      `)
      if(data[0]){ return false; }
      await app.mysql.insert('hot_tag', { name });
    }
  
    async delTag(name){
      let data = await app.mysql.query(` SELECT id FROM hot_tag WHERE name='${name}' `)
      if(!data[0]){ return false; }
      await app.mysql.delete('hot_tag', { name });
    }

    async getCategory(){
      return await app.mysql.query(`SELECT name,code,disabled FROM category`);
    }

    async postCategory(name, code){
      let data = await app.mysql.query(`
       SELECT id FROM category WHERE code='${code}'
      `)
      if(data[0]){ return false; }
      await app.mysql.insert('category', { name, code });
    }
  
    async delCategory(name, code){
      let data = await app.mysql.query(` SELECT id FROM category WHERE code='${code}' `);
      if(!data[0]){ return false; }

      let counts = await app.mysql.query(` SELECT count(*) FROM article WHERE category='${code}' `);
      if(!counts[0]) return 'HAS_CONNECT'
      await app.mysql.delete('category', { code });
    }

    async categoryStatus(code, disabled){
      let data = await app.mysql.query(` SELECT id FROM category WHERE code='${code}' `);
      if(!data[0]){ return false; };
      await app.mysql.query(`UPDATE category SET disabled=${disabled} WHERE code = '${code}'`);
    }

  }

};
