const fs = require('fs');
module.exports = fs.readdirSync('./lcd/fonts').filter((fn) => fn.endsWith('.json')).reduce((fonts, c) => Object.assign(fonts, {[c.split('.json').join('')]: require(`./${c}`)}), {});
