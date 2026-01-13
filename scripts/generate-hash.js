const bcrypt = require('bcryptjs');

// Cambia esta contraseña por la que quieres hashear
const password = 'password';

// Genera el hash
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n=================================');
console.log('Contraseña original:', password);
console.log('Hash generado:', hash);
console.log('=================================');
console.log('\nCopia este hash y actualiza tu usuario en la base de datos:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'tu@email.com';`);
console.log('=================================\n');
