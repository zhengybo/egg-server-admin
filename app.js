/* 注册 _r */
require('./global/_r.js');
const fs = require('fs')
const path = require('path')
const sendToWormhole = require('stream-wormhole');
const middle = require('./global/middleware.js');
const { Obj, Fs, axios } = _r('@/public/js');

module.exports = app => {
  /**
   * @param {Object} options
   * - {String} namespace 节点名
   * - {String} proxy 代理目标
   */

  app.$router = (options = {}) => {
    const PROXY_METHODS = ['all','delete','post','put','get'];
    const { router : appRouter, controller, middleware } = app;
    const { namespace = '', proxy = '' } = options;
    const router = appRouter.namespace(namespace);
    const target = Obj.proxy(controller,proxy);
    // 所有中间件
    const middles = middle(app);
    const routers = {};
    // 生成 每一个 中间件对应的代理路由
    Object.keys(middles).forEach(key => {
      const proxyRouter = {};
      const routerKey = `${key.match(/[a-z]+/)[0]}Router`;
      let rule = '';
      // 生成代理路由
      PROXY_METHODS.forEach(method => proxyRouter[method] = function (){
        let args = [...arguments];
        if(args.length == 1){
          rule = args[0];
          return proxyRouter[method];
        }
        router[method](
          args[0], 
          middles[key], 
          middleware.ruleRequired()(proxy, rule), 
          ...args.slice(1));
          rule = '';
        return proxyRouter;
      });
      routers[routerKey] = function (value){
        rule = value;
        return proxyRouter;
      };
      Object.assign(routers[routerKey], proxyRouter);
    })
    return fn => fn.call(app,{ router, ...routers }, target, middles);
  }

  app.$writeStream = (stream, filename) => {
    filename = filename || path.resolve(__dirname, './public', stream.filename );
    return new Promise((resolve, reject) => {
      let sw = fs.createWriteStream(filename);
      stream.pipe(sw)
      sw.on('error', err => {
        sendToWormhole(stream);
        reject(err);
      }).on('finish', async () => {
        resolve({ name : stream.filename });
      });
    }).catch((err) => {
      console.log('发生了一个错误',err);
    })
  }

  const rulePath = path.resolve(__dirname, './app/rules');
  Fs.readFilePath({
    RE : /.*\.js$/,
    filePath : rulePath,
    fn : (filePath) => {
      let newPath = path.relative(path.resolve(rulePath, '..'), filePath);
      
      let value = newPath.slice(0, newPath.lastIndexOf('.'))
      .replace(/\\/g, '.').replace(/\//g, '.'); // window 环境和linux环境路径 / \ 反的！！！！！！！！！！！！！！！！！
      let rules = require(filePath);
      if(typeof rules != 'object') return;
      Object.keys(rules).forEach(key => {
        let list = rules[key];
        list.forEach((item, index) => {
          list[index] = Object.assign({}, app.config.rules, item);
        })
      })
      Obj.setValue(app, value, rules);
    },
    deep : true
  })

  app.$axios = axios;
}
