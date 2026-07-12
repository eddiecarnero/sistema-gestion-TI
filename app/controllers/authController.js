const bcrypt = require('bcrypt');
const Tecnico = require('../models/tecnicoModel');
const Usuario = require('../models/usuarioModel');

const authController = {
  getLogin(req, res) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login', { error: null, layout: false });
  },

  async postLogin(req, res) {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.render('auth/login', { error: 'Por favor complete todos los campos.', layout: false });
    }

    try {
      // 1. Try to find in tecnico table
      let staff = await Tecnico.getByCorreo(req, correo);
      if (staff) {
        const isMatch = await bcrypt.compare(contrasena, staff.contrasena);
        if (isMatch) {
          req.session.user = {
            id: staff.id_tecnico,
            nombres: staff.nombres,
            apellidos: staff.apellidos,
            correo: staff.correo,
            rol: staff.rango_nombre, // 'administrador', 'tecnico', 'practicante'
            tabla: 'tecnico'
          };
          const redirectUrl = req.session.returnTo || '/dashboard';
          delete req.session.returnTo;
          return res.redirect(redirectUrl);
        }
      }

      // 2. Try to find in usuario table
      let user = await Usuario.getByCorreo(req, correo);
      if (user) {
        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (isMatch) {
          req.session.user = {
            id: user.id_usuario,
            nombres: user.nombres,
            apellidos: user.apellidos,
            correo: user.correo,
            rol: user.cargo === 'jefe' ? 'jefe' : 'empleado',
            tabla: 'usuario'
          };
          const redirectUrl = req.session.returnTo || '/dashboard';
          delete req.session.returnTo;
          return res.redirect(redirectUrl);
        }
      }

      // Credentials don't match
      return res.render('auth/login', { error: 'Correo o contraseña incorrectos.', layout: false });
    } catch (err) {
      console.error(err);
      return res.render('auth/login', { error: 'Ocurrió un error en el servidor.', layout: false });
    }
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/auth/login');
    });
  }
};

module.exports = authController;
