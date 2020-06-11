const passport = require('passport');
const localStrategy = require('passport-local');
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new localStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM usert WHERE username = ?', [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password);
      if (validPassword) {
        done(null, user, req.flash('success', 'Bienvenido ' + user.username));
      } else {
        done(null, false, req.flash('message', 'Contraseña Inválida'));
      }
    } else {
      return done(null, false, req.flash('message', 'Usuario ' + username + ' no existe. Registrese.'));
    }
}));

passport.use('local.signup', new localStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname } = req.body;
    const newUser = {
      username,
      password,
      fullname
    };
    const rows = await pool.query('SELECT * FROM usert WHERE username = ?', [username]);
    if (rows.length > 0) {
      done(null, false, req.flash('message', 'Usuario ya existe'));
    } else {
      newUser.password = await helpers.encryptPassword(password);
      const result = await pool.query('INSERT INTO usert SET ?', [newUser]);
      newUser.id = result.insertId;
      return done(null, newUser, req.flash('success', 'Bienvenido ' + newUser.username));
    }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM usert WHERE id = ?', [id]);
  done(null, rows[0]);
});

