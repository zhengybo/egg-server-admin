const path = require('path');
const config = require('./config');
global._r = (name = '') => {
  let first = name.split('/')[0];
  let pt = config.alias[first];
  name = name.replace(first,pt);
  if(first && pt){
    return require(path.resolve(pt,name));
  }
  return require(name);
}
