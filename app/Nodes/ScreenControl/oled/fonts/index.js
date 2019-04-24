const fs = require('fs');
const path = require('path');
module.exports = fs.readdirSync(__dirname).filter((fn) => fn.endsWith('.json')).reduce((fonts, c) => Object.assign(fonts, {[c.split('.json').join('')]: require(`./${c}`)}), {});
