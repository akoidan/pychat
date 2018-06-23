//https://webpack.js.org/guides/dependency-management/#require-context
var req = require.context('./smileys', true, /.*\.gif$/);
req.keys().forEach(req);
