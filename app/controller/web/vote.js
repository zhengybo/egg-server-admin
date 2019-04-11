'use strict';

const { Pagination } = require('./../../public/js/tool')
class VoteController extends require('./../extends/base')  {
    async votePage(ctx){
        let { article_id, category, status, pageSize, currPage, id } = ctx.query;
        await Pagination.execute(this, async (mysql) => {
            return await ctx.service.protalVote.getIdsRows(mysql, { pageSize, currPage , category, status, article_id , id } );
          }).then(async ({success, list}) => {
            if(!success) return;
            let IN = list.map(item => item.id).join(',');
            list = []
            if(IN.length){
                list = await ctx.service.protalVote.votePage(IN);
            }
            
            success({ 
              list
            })
          })
    }

    async voteDetailList(ctx){
      let { id } = ctx.query;
      let list = await ctx.service.protalVote.voteDetailList(id);
      await ctx.service.portalUser.matchUserToList(list);
      this.success({
        list
      })
    }

    async deleteComment(){

    }

    async getComment(){

    }
 
}

module.exports = VoteController;
