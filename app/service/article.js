const COUNTS = 3;
module.exports = app => {
  return class User extends app.Service {
    async getArticle({ pageSize = 10, lastId = -1, category, more }){
      let cateSql = category ? `category='${category}' ` :  '';
      let r;
      if(!more){
        if(category == 'recommend'){
         
          r = await app.mysql.query(`
          SELECT art.id,title,art.category,art.created_time,art.cover,art.comments,art.uid,art.star_count
          FROM article art 
          JOIN hot_article hot
          ON hot.id > ${lastId} && hot.article_id = art.id
          ORDER BY hot.id DESC
          LIMIT ${pageSize}
        `)
        }else{
          r = await app.mysql.query(`
          SELECT id,title,category,created_time,cover,comments,uid,star_count
          FROM article
          WHERE id > ${lastId} && ${cateSql}
          ORDER BY id DESC
          LIMIT ${pageSize}
        `)
        }
        
      }else{
        if(category == 'recommend'){
          r = await app.mysql.query(`
            SELECT art.id,title,art.category,art.created_time,art.cover,art.comments,art.uid,art.star_count
            FROM article art 
            JOIN hot_article hot
            ON ${lastId > 0 ? `art.id < ${lastId} &&`: ''} hot.article_id = art.id
            ORDER BY hot.created_time DESC
            LIMIT ${pageSize}
          `)
        }else{
          r = await app.mysql.query(`
          SELECT id,title,category,created_time,cover,comments,uid,star_count
          FROM article 
          WHERE id 
          IN  (
            SELECT id 
            FROM ( 
              SELECT id 
              FROM article 
              WHERE ${ lastId > 0 ? `id < ${lastId} &&` : '' } ${cateSql}
              ORDER BY id DESC
              LIMIT ${pageSize}
              ) self
            )
          `)
        }
        
      }
      return r;
    }

    async getWheel(){
      return await app.mysql.query(`
        SELECT 
        art.title,art.cover, wheel.picture,wheel.article_id
        FROM article art 
        RIGHT JOIN wheel_article wheel 
        ON art.id = wheel.article_id && art.is_deleted=0
      `);
    }

    async getArticleDetail(id){
      await app.mysql.query( // 该评论子评论数
        `update article set views=views+1
        where id = ${id}`
      )
      return await app.mysql.get('article',{
        id
      });
    }

    /* 查询所有评论 */
    async comments(article_id, last_id, uid){
      // 查询一级评论
      let sql = ''
      if(last_id > 0){
        sql = `AND id < ${last_id}`;
      }
      const comments = await app.mysql.query(`
        SELECT 
          comment.* ,
          COUNT(c.id) vote_count,
          IF( GROUP_CONCAT(c.uid)  REGEXP  '${uid}' ,true,false) voting
        FROM (
          SELECT 
            a.*,
            IF( GROUP_CONCAT(b.uid)  REGEXP  '${uid}' ,true,false) staring,
            COUNT(b.id) star_count
          FROM
            (
              SELECT id,author_id,content,created_time,resource_type,
              child_comment_count,article_id
              FROM comments WHERE article_id = ${article_id} ${sql} && resource_type = 'article' && is_deleted = 0
              ORDER BY created_time DESC, id DESC
              LIMIT 10
            ) a
          LEFT JOIN star b ON a.id = b.star_id  && b.status = 1
          GROUP  BY a.id
        ) comment 
        LEFT JOIN vote c ON comment.id = c.vote_id  && c.status = 1
        GROUP  BY comment.id
        ORDER BY comment.id DESC
      `)
      if(!comments.length) return null;

      // 查询 回复评论
      
      const ids = comments.map(item => item.id).join(','); // 回复ids
      // 所有回复评论
      
      const children_comments =  await app.mysql.query(`
        SELECT 
            comment.* ,
            COUNT(c.id) vote_count,
            IF( GROUP_CONCAT(c.uid)  REGEXP  '${uid}' ,true,false) voting
          FROM (
            SELECT 
              a.*,
              IF( GROUP_CONCAT(b.uid)  REGEXP  '${uid}' ,true,false) staring,
              COUNT(b.id) star_count
            FROM
              (
                SELECT
                reply.id, reply.author_id,reply.reply_id,reply.child_comment_count,reply.allow_delete,reply.resource_type,
                reply.content, reply.created_time,reply.article_id,reply.reply_author_id
                FROM comments reply LEFT JOIN comments reply_other
                ON reply.reply_id = reply_other.reply_id && reply.id > reply_other.id  && reply.resource_type = 'answer' && reply.is_deleted = 0
                GROUP BY reply.id,reply.reply_id
                HAVING COUNT(reply.id) < ${COUNTS} && reply.reply_id in (${ids})
                ORDER BY reply.id ASC
              ) a
            LEFT JOIN star b ON a.id = b.star_id  && b.status = 1
            GROUP  BY a.id
          ) comment 
          LEFT JOIN vote c ON comment.id = c.vote_id  && c.status = 1
          GROUP  BY comment.id
          ORDER BY comment.id DESC
      `);

      // const authorIds = [  // 作者ids
      //   ...comments.map(item => item.author_id),
      //   ...children_comments.map(item => item.author_id)
      // ];

      // const authors = await this.getAuthors(authorIds);
      // [...children_comments, ...comments].forEach(item => {
      //   item.author = authors.find(list => list.uid == item.author_id);
      // });
      comments.forEach(item => {
        item.children_comments = []
      });
      // console.log('?????????????/')
      // children_comments.forEach(item => {
      //   console.log(item)
      //   item.reply_to_author = authors.find(list => list.uid == item.reply_author_id);
      // })

      children_comments.forEach(item => {
        let r = comments.find(list => list.id == item.reply_id);
        if(r){
          r.children_comments.push(item);
        }
      });

      return comments;
    }

    /* 查看全部回复 */
    async replys(id, last_id){
      let sql = ''

      if(last_id > 0){
        sql = `AND id > ${last_id}`;
      }
      let replys = await app.mysql.query(`
        SELECT
        id, reply_id, author_id, reply_author_id,article_id,
        content, created_time, vote_count
        FROM comments
        WHERE id
        IN (
        	SELECT reply_other.id
        	FROM  (
        		SELECT id FROM comments WHERE reply_id = ${id} ${sql} LIMIT 10
        	) reply_other
        )
      `);
      // let authorIds = replys.map(item => );
      // authorIds = [...new Set(authorIds)]
      // console.log(authorIds)
      // const authors = await this.getAuthors(authorIds);

      // replys.forEach(item => {
      //   item.author = authors.find(list => list.uid == item.author_id);
      //   item.reply_to_author = authors.find(list => list.uid == item.reply_author_id)
      // });
      return replys;
    }

    async getAuthors(authorIds = []){
      if(!authorIds.length) return [];
      let ids = [...new Set(authorIds)].map(id => `'${id}'`).join(',')

      return await app.mysql.query( // 所有评论人信息
        `SELECT name,icon,uid FROM userinfo WHERE uid IN(${ids})`
      );
    }

    /* 查询单挑评论 */
    async getComment(id){
      let data = await app.mysql.query( // 所有评论人信息
        `SELECT
          id, reply_id, author_id, reply_author_id,article_id,child_comment_count,
          content, created_time, vote_count
        FROM comments WHERE id=${id}`
      );
      return data[0];
    }

    /* 评论 */
    async comment(opts){
      let {
        reply_id, content,
        resource_type,
        reply_author_id,
        article_id, author_id } = opts;
      const conn = await app.mysql.beginTransaction();
      let result = null;
      let created_time = ~~(new Date().getTime() / 1000);
      try {
        if(resource_type == 'answer'){
          await conn.query( // 该评论子评论数
            `update comments set child_comment_count=child_comment_count+1
            where id = ${reply_id}`
          )
        }
        await conn.insert('comments', {
          reply_id,
          author_id,
          reply_author_id,
          resource_type,
          content,
          article_id,
          created_time
        });
        await conn.query( // 所有评论人信息
          `update article set comments=comments+1
          where id = ${article_id}`
        )

        result = await conn.query(`
          SELECT LAST_INSERT_ID() id FROM comments LIMIT 1
        `)
        result = result[0]
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        result = null;
        throw e;
      }
      if(result){ // 正确的插入数据
        return {
          id : result.id,
          created_time
        }
      }
      return result;
    }

    async getArticleAuthorId(where){
      let data = await app.mysql.select('article', {
        where : {
          ...where,
          is_deleted : false
        },
        columns : ['author_id','category'],
        limit : 1,
        offset : 0
      });
      return data[0] ? data[0] : null
    }

    async getCommentId(where){
      let data = await app.mysql.select('comments', {
        where : {
          ...where,
          is_deleted : false
        },
        columns : ['author_id','category','article_id'],
        limit : 1,
        offset : 0
      });
      return data[0] ? data[0] : null
    }
    /* 点赞 */
    async setStar(star_id, status, uid, type = 'article'){
      const conn = await app.mysql.beginTransaction();
      try {
        let data = await conn.query(`
       SELECT id FROM star WHERE uid = '${uid}' && type = '${type}' && star_id = ${star_id} LIMIT 1
      `)
        if(data[0]){
          await conn.query( 
            `update star set status=${Number(status)},created_time=${new Date().getTime() / 1000}
            WHERE uid = '${uid}' && type = '${type}' && star_id = ${star_id} LIMIT 1`
          )
        } else {
          await conn.insert('star', { type, star_id, uid, status : true, created_time : new Date().getTime() / 1000 })
        }
        if(type  == 'comment'){
          await conn.query( 
            `update comments set star_count=star_count${status ? '+1' : '-1'}
            WHERE id=${star_id} LIMIT 1`
          )
        } 
        if(type  == 'article'){
          await conn.query( 
            `update article set star_count=star_count${status ? '+1' : '-1'}
            WHERE id=${star_id} LIMIT 1`
          )
        }
        await conn.commit();
      } catch (e) {

        await conn.rollback();
        throw e;
      }
    }
    /* 举报 */
    async vote(vote_id, status, uid, type = 'article'){
      const conn = await app.mysql.beginTransaction();
      try {
        let data = await conn.query(`
       SELECT id FROM vote WHERE uid = '${uid}' && type = '${type}' && vote_id = ${vote_id} LIMIT 1
      `)
        if(type  == 'comment'){
          await conn.query( 
            `update comments set vote_count=vote_count${status ? '+1' : '-1'}
            WHERE id=${vote_id} LIMIT 1`
          )
        } 
        if(data[0]){
          await conn.query( 
            `update vote set status=${Number(status)},created_time=${new Date().getTime() / 1000}
            where uid = '${uid}' && type = '${type}' && vote_id = ${vote_id} LIMIT 1`
          )
          
        } else {
          await conn.insert('vote', { type, vote_id, uid, status : true, created_time : new Date().getTime() / 1000 })
        }
        await conn.commit();
      } catch (e) {

        await conn.rollback();
        throw e;
      }
    }
    /* 获取点赞*/
    async getStar(star_id, uid){
      let r =  await app.mysql.query(`
      SELECT status FROM star WHERE uid = '${uid}' && star_id = ${star_id} LIMIT 1
     `);
      return r[0]
    }

    async search({key, pageSize, currPage}){
      return await app.mysql.query(`
      SELECT art.id,art.title,art.category,art.cover,art.comments,art.star_count,info.name
      FROM article art
      JOIN userinfo info 
      ON art.uid = info.uid && (info.name like '%${key}%' || art.title like '%${key}%')
      LIMIT ${pageSize * (currPage - 1)},${pageSize}
     `);
    }

    async getTags(){
      return await app.mysql.query(`SELECT name FROM hot_tag`);
    }

    async getCategory(){
      return await app.mysql.query(`SELECT name,code FROM category WHERE disabled=0`);
    }
  }

};
