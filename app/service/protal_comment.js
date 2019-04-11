
const { SQL } = require('./../public/js/tool')
module.exports = app => {

  return class Comment extends app.Service {
    async commentPage(ids){
      if(!ids.trim()) return [];
      return await app.mysql.query(`
          SELECT * FROM comments WHERE id IN (${ids})
      `);
    }

    async deleteComment(id){
      let result = await app.mysql.query(`
        UPDATE comments SET is_deleted=1 WHERE id = ${id}
      `);
      return result[0];
    }

    async getComment(){

    }

    /** 用于查询数据条数 和ids */
    async getIdsRows(mysql, { pageSize, currPage , category, is_deleted, article_id , id,reply_id }){
      let r = await mysql.query(`
      SELECT SQL_CALC_FOUND_ROWS id FROM comments 
      ${SQL.WHERE({category, is_deleted, article_id , id,reply_id})} 
      LIMIT ${pageSize * (currPage - 1)},${pageSize}
    `);
        return r  

      }


    
  }

};
