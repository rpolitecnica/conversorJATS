const nodemailer = require('nodemailer');
const { emailkeys } = require('../lib/emailkeys')
const configEmail = {};


configEmail.transporter = () => {

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    //service: 'Gmail',
    auth: {
        user: emailkeys.user,
        pass: emailkeys.password
    }
  });
  return transporter;
}

configEmail.mailOptions = (email, password) => {
  var mailOptions = {
    from: 'Revista Politécnica ' + emailkeys.user,
    to: email,
    subject: 'Contraseña Conversor XML/JATS',
    //text: password
    text: 'For clients with plaintext support only',
    //html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
    html: `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <p>Hola,</p>
        <p>Solicitaste recordar tu contraseña.</p>
        <p>Tu contraseña es: `+ password +`</p><hr/>
      </body>
    </html>`
  };
  return mailOptions;
}

module.exports = configEmail;

/*
exports.sendEmail = async (req, res, email, password) => {

  // Definimos el transporter
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    //service: 'Gmail',
    auth: {
        user: emailkeys.user,
        pass: emailkeys.password
    }
  });

  // Definimos el email
  var mailOptions = {
    from: emailkeys.user,
    to: email,
    subject: 'Contraseña Conversor XML/JATS',
    //text: password
    text: 'For clients with plaintext support only',
    //html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
    html: `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <p>Hola,</p>
        <p>Solicitaste recordar tu contraseña.</p>
        <p>Tu contraseña es: `+ password +`</p><hr/>
      </body>
    </html>`
  };


  // Enviamos el email
  transporter.sendMail(mailOptions, (error, info) => {

    if (error) {
      console.log(error.message);
      res. status(500).send(error.message);
    }
    console.log('Message sent!') //res.status(200).jsonp(req.body);
  });


};
*/
