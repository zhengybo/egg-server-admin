'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports = {};
  config.bodyParser = {
    formLimit: '10mb',
    jsonLimit : '10mb'
  }

config.cluster = {
  listen: {
    port: 7001
    // host: '0.0.0.0',
    // path: '/var/run/egg.sock',
  }
}

  config.multipart = {
    fileSize : "50mb",
    files: 50
  }
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1534152271790_5005';

  // add your config here
  config.middleware = [];

  config.topic = {
    perDayPerUserLimitCount: 10,
  };

  // 静态资源目录
  config.staticDomain = {
    img : 'http://127.0.0.1:7001/image'
    // img : 'https://wufagoumai.cn/image'
    
  }
  // 上传目录
  config.staticAssets = {
    img : path.resolve(__dirname, '../public/image'),
    temp : path.resolve(__dirname, '../temp') // 临时文件夹
  }

  // 静态资源目录
  config.rules = {
    field : null,
    type : null,
    rules : null,
    message : '',
    required : false,
    payload : 'query',
    code : null
  }

  config.redis = {
    client: {
      host: process.env.EGG_REDIS_HOST || '127.0.0.1',
      port: process.env.EGG_REDIS_PORT || 6379,
      password: process.env.EGG_REDIS_PASSWORD || '',
      db: process.env.EGG_REDIS_DB || '0',
    },
  };

  config.static = {
    prefix: '/image/',
    dir: path.join(appInfo.baseDir, 'public/image')
  };

  config.basis = {
    redisTokenExpire : 60 * 60 * 2 // redis 过期token时间
  }

  config.mysql = {
    // 单数据库信息配置
    client: {
      host: 'xxxx',
      // host : 'localhost',
      port: 'xxxx',
      user: 'xxxx',
      password: 'xxxxx',
      database: 'xxxxx'
    },
    app: true,
    agent: false,
  };

  config.security = {
    csrf: {
      ignore: '/api/*/*',
    },
  };
  return config;
};
