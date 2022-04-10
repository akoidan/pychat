const { config: sequelizeCliConfig } = require('node-config-ts');

console.log('as')
// fucking sequelize-cli hack
const conf = {
  ...sequelizeCliConfig.mysql,
  dialect: 'mysql'
}
module.exports = {

  development: conf
};

