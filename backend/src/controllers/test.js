const bcrypt = require('bcrypt');

// Regex que valida mayúscula, número y símbolo especial
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\W]{8,25}$/;

// Contraseña de prueba
const password = '!Pass.evr20071';

if (passwordRegex.test(password)) {
  console.log('✅ Contraseña válida');

  bcrypt.hash(password, 10).then((hashed) => {
    console.log('🔐 Hash generado:', hashed);
  });
} else {
  console.log('❌ Contraseña inválida');
}
