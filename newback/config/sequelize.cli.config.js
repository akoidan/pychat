const {generateConfig} = require('../src/data/database/ormconfig');

// fucking sequelize-cli hack
const conf = generateConfig((sql) => console.log(sql));
module.exports = {
  development: conf
};

