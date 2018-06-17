//https://webpack.js.org/guides/dependency-management/#require-context
var req = require.context('./assets/smileys', true, /.*\.gif$/);
req.keys().forEach(req);
