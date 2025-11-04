const bcrypt = require('bcryptjs');

//Al ingresar manualmente un usuario a la DB demos poner la contraseña ya encriptada.
//Modifiquen la contraseña.
// Corran "node p.js" en la terminal y copien la respuesta en el insert de la db

const hashedPassword = async () => {
  pa = await bcrypt.hash('password123', 10);
  console.log(pa);
};

hashedPassword();
