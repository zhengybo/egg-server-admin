module.exports =  (app) => {
  const { middleware, config } = app;
  /* token校验 */
  const tokenRequired = middleware.tokenRequired();
  /* token校验 */
  const  webtokenRequired = middleware.webtokenRequired();
  /* 管理员校验校验 */
  const adminRequired = middleware.adminRequired();
  /* 用户校验校验 */
  const userRequired = middleware.userRequired();
  /* 规则校验 */
  const defaultRequired = middleware.defaultRequired();
  return {
    tokenRequired,
    adminRequired,
    userRequired,
    webtokenRequired,
    defaultRequired
  }
}
