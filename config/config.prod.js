'use strict';
module.exports = () => {
  const config = exports = {};
  config.bodyParser = {
    formLimit: '10mb',
    jsonLimit : '10mb'
  }
  config.miniProgram = {
    appid : 'xxxxxxxxxxxxx',
    secret : 'xxxxxxxxxxxxxxxx'
  }

  config.staticDomain = {
    img : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }

  return config;
};
