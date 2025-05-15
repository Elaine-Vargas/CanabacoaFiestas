const {Sequelize} = require('sequelize');
const express = require('express'); 

const sequelize = new Sequelize('blp0tk1o1q7zrxhh0pfs', 'uoriku2xu2gib2wl', 'bdSoecvHHN9onNyx93yY', {
  host: 'blp0tk1o1q7zrxhh0pfs-mysql.services.clever-cloud.com',
  dialect: 'mysql',
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos.');

  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
  }
})();

module.exports = sequelize;
