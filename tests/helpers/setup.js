require('browser-env')();
const hooks = require('require-extension-hooks');

// Setup vue files to be processed by `require-extension-hooks-vue`
// Setup vue and js files to be processed by `require-extension-hooks-babel`
hooks(['js']).plugin('babel').push();