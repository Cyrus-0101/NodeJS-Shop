const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', '0740673050', { 
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;