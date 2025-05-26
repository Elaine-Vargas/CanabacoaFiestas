import express from 'express';
import sequelize  from './config/index'; 

const app = express();
const PORT = process.env.PORT || 3000;

async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  testDbConnection();
});
