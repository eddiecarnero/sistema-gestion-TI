const bcrypt = require('bcrypt');

const passwords = ['Admin123!', 'Tecnico123!', 'Practicante123!', 'Jefe123!', 'Usuario123!'];

passwords.forEach(pass => {
  const hash = bcrypt.hashSync(pass, 10);
  console.log(`${pass} => ${hash}`);
});
