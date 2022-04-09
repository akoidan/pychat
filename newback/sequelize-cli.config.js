const { config: sequelizeCliConfig } = require('node-config-ts');

const { postgres } = sequelizeCliConfig.db;

postgres.password = postgres.password.replace(/\n/g, '');

// fucking sequelize-cli hack
module.exports = {
  local: postgres,
  development: postgres,
  staging: postgres,
  production: postgres,
};
