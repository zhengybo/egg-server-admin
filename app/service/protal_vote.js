
const { SQL } = require('./../public/js/tool')
module.exports = app => {

  return class Vote extends app.Service {
    async votePage(ids){
      if (!ids.trim()) return [];
        return await app.mysql.query(`
            SELECT id, vote_count, content FROM comments WHERE id IN (${ids})
      `);
    }

    async deleteVote(){

    }

    async voteDetailList(id){
      return await app.mysql.query(`
          SELECT uid,created_time,description,vote_type FROM vote WHERE vote_id = ${id} && status = 1
      `);
    }

    /** 用于查询数据条数 和ids */
    async getIdsRows(mysql, { pageSize, currPage ,id }){
        return  await mysql.query(`
        SELECT SQL_CALC_FOUND_ROWS id FROM comments 
        ${SQL.WHERE({ id },['vote_count > 0'])} 
        ORDER BY vote_count DESC
        LIMIT ${pageSize * (currPage - 1)},${pageSize}
      `);
      }

  }

};
