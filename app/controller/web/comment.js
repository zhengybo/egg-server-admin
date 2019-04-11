'use strict';

const { Pagination } = require('./../../public/js/tool')
class CommentController extends require('./../extends/base')  {
    async commentPage(ctx){
        let { article_id, category, status, pageSize, currPage, id, reply_id } = ctx.query;
        await Pagination.execute(this, async (mysql) => {
            return await ctx.service.protalComment.getIdsRows(mysql, { pageSize, currPage , category, article_id , id, reply_id, is_deleted : status } );
          }).then(async ({success, list}) => {
            if(!success) return;
            let IN = list.map(item => item.id).join(',');
            list = []
            if(IN.length){
              list = await ctx.service.protalComment.commentPage(IN);
            }
            await ctx.service.portalUser.matchUserToList(list, { author_id : 'author', reply_author_id : 'reply_author' });
            success({ 
              list
            })
          })
    }

    async deleteComment(ctx){
      let { id } = ctx.query;
      let data = await ctx.service.protalComment.deleteComment(id);
      this.success({
        data
      })
    }

    async getComment(){

    }
 
}

module.exports = CommentController;
