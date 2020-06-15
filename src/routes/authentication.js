const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const xmlbuilder = require('xmlbuilder');
const fs = require('fs');
const dirPath = __dirname + "/../public/xmlfiles/";
const sendmail = require('../lib/email');
const helpers = require('../lib/helpers')
const nodemailer = require('nodemailer');
const { transporter, mailOptions } = require('../lib/email');


//GET SIGNUP
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup')
});

//POST SIGNUP
router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

//GET SIGNIN
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

//POST SIGNIN
router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  }
  )(req, res, next);
});

//GET PROFILE
router.get('/profile', isLoggedIn, (req, res) => {
  if (req.user.tipousuario_id == 1) { //Usuario Administrador
    res.render('profileadmin');
  } else {
    res.render('profile');
  }
});

//GET LOGOUT
router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/signin');
});


//GET REMEMBER PASSWORD
router.get('/rememberpass', (req, res) => {
  res.render('auth/rememberpass');
});

//POST REMEMBER PASSWORD
router.post('/rememberpass', async (req, res) => {
  const { username } = req.body;
  const consulta = await pool.query('SELECT username, password FROM usert WHERE username = ?', [username]);

  if (consulta == 0) {
    req.flash('message', 'Usuario no existe!');
    res.redirect('/rememberpass');
  } else {
    const passw = await helpers.decryptPassword(consulta[0].password);
    const optionsMail = mailOptions(username, passw);
    const transForm = transporter();

    transForm.sendMail(optionsMail, (error, info) => {
      if (error) {
        console.log(error),
        req.flash('message', 'Correo no enviado. valide con el Administrador');
        res.redirect('/signin');
      } else {
        req.flash('success', 'Email enviado!');
        res.render('links/passconfirma', { email: username });
      }
    });
  }
});


module.exports = router;