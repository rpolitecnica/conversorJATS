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



//Manejador de los articulos segun la publicacion
router.get('/publicacion/:idPublica', isLoggedIn, async (req, res) => {
 const { idPublica } = req.params;
  const links = await pool.query('SELECT * FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE publicacion.idPublica = ? ORDER BY pagInicial ASC', [idPublica]);//SELECT usert.fullname, articulo.title, date_format(articulo.created_at,"%d-%M-%Y") as created_at FROM usert inner join articulo ON articulo.usert_id = usert.id');
  res.render('links/articles', { links });
});

//Construye el archivo xml y gestiona la descarga
router.get('/downloadxml/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const allData = await pool.query('SELECT titulo, title, numArticulo, pagInicial, pagFinal, fecRecibido, fecAceptado, fecPublicacion, resumen, abstract, agradecimientos, doi, urlgaleradahtml, publicacion_id FROM articulo WHERE idArtic = ?', [idArtic]);
  const publicaInfo = await pool.query('SELECT volumen, numero FROM publicacion where idPublica = ?', [allData[0].publicacion_id]);

  const totAutores = await pool.query('SELECT @num_ref_lines  := 1 + length(autores) - length(replace(autores, "\n", "")) as autorES FROM articulo WHERE idArtic = ?', [idArtic]);
  const totPalaClaves = await pool.query('SELECT @num_ref_lines  := 1 + length(palClaves) - length(replace(palClaves, "\n", "")) as palabClaves FROM articulo WHERE idArtic = ?', [idArtic]);
  const totKeyw = await pool.query('SELECT @num_ref_lines  := 1 + length(keywords) - length(replace(keywords, "\n", "")) as keyWord FROM articulo WHERE idArtic = ?', [idArtic]);
  const totReferencias = await pool.query('SELECT @num_ref_lines  := 1 + length(referencias) - length(replace(referencias, "\n", "")) as num_ref_lines FROM articulo WHERE idArtic = ?', [idArtic]);

  const autoresData = await pool.query('call bdrevistapoli.checkAutores(?, ?)', [idArtic, totAutores[0].autorES]);
  const palabClavesData = await pool.query('call bdrevistapoli.checkPalClaves(?, ?)', [idArtic, totPalaClaves[0].palabClaves]);
  const keywordsData = await pool.query('call bdrevistapoli.checkKeywords(?, ?)', [idArtic, totKeyw[0].keyWord]);
  const referenciaData = await pool.query('call bdrevistapoli.checkReferencias(?, ?)', [idArtic, totReferencias[0].num_ref_lines]);

  //console.log(allData);
  //console.log(palabClavesData);
  //console.log(referenciaData);
  //console.log(keywordsData);

  /*
  console.log(totAutores);
  console.log(totPalaClaves);
  console.log(totKeyw);
  console.log(totReferencias);
  */

  //console.log(autoresData[0][0].author.toString().match(/^([^,]+)/));
  //console.log(autoresData[0][0].author.toString().match(/, ([^;]+)/));
  //console.log(palabClavesData[0][0].palclave);
  //console.log(keywordsData[0][0].keyword);
  //console.log(referenciaData[0][0].refes);

  //Se recuperan los autores y se separan para insertarlos en el XML
  var todosAutores = [];
  var emailAutores = [];
  for (var i = 0; i < totAutores[0].autorES; i++) {
    todosAutores[i] = {
      'contrib': {
        '@contrib-type': 'author',
        'name': {
          'surname': autoresData[0][i].author.toString().match(/^([^,]+)/)[0],
          'given-names': autoresData[0][i].author.toString().match(/, ([^(.|;)]+)/)[1]
        },
        'xref': {
          '@ref-type': 'aff',
          '@rid': 'aff1',
          'sup': '1'
        }
      }
    }
    if (autoresData[0][i].author.toString().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/) != null) {
      emailAutores[i] = {
        'email': autoresData[0][i].author.toString().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)[0]
      }
    } else {
      emailAutores[i] = {
        'email': ''
      }
    }
  };


  //Se recuperan las palabras claves y se separan para insertarlos en el XML
  var todasPalClaves = [];
  for (var i = 0; i < totPalaClaves[0].palabClaves; i++) {
    todasPalClaves[i] = {
      'kwd': palabClavesData[0][i].palclave.toString().match(/([^;]+)/)[0]
    }
  };

  //Se recuperan las keywords y se separan para insertarlos en el XML
  var todasKeyWords = [];
  for (var i = 0; i < totKeyw[0].keyWord; i++) {
    todasKeyWords[i] = {
      'kwd': keywordsData[0][i].keyword.toString().match(/([^;]+)/)[0]
    }
  };

  //Se recuperan las referencias y se separan para insertarlos en el XML
  var todosReferencias = [];
  for (var i = 0; i < totReferencias[0].num_ref_lines; i++) {
    var aux = referenciaData[0][i].refes.toString().match(/(.*)\b([^\r])/)[0];
    var interObj = aux.replace(/[;]$/, '');
    todosReferencias[i] = {
      'ref': {
        '@id': 'R'+(i+1),
        'label': '[' + (i+1)+ ']',
        'mixed-citation': interObj//match(/(.*)([^;][^\r])/)[0] OR match(/(.*)([^\r])/)[0]
      }
    }
  };


  const article = xmlbuilder.create('article', { version: '1.0', encoding: 'UTF-8' }, { sysID: 'https://jats.nlm.nih.gov/archiving/1.0/JATS-archivearticle1.dtd' })
      .att('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .att('xmlns:mml', 'http://www.w3.org/1998/Math/MathML')
      .att('dtd-version', '1.0')
      .att('article-type', 'rapid-communication')
      .att('xml:lang', 'es')
    .com('FRONT')
    .ele('front')//Inicio FRONT
      .ele('journal-meta')//Inicio Journal Meta
        .ele('journal-id', { 'journal-id-type': 'doi' }, '10.33571/rpolitec').up()
        .ele('journal-title-group')
          .ele('journal-title', 'Revista Politécnica').up()
          .ele('abbrev-journal-title', {'abbrev-type': 'publisher'}, 'Revista Politécnica').up()
        .up()
        .ele('issn', { 'pub-type': 'ppub' }, '1900-2351').up()
        .ele('issn', { 'pub-type': 'epub' }, '2256-5353').up()
        .ele('publisher')
          .ele('publisher-name', 'Politécnico Colombiano Jaime Isaza Cadavid').up()
        .up()
      .up()//Fin Journal Meta
      .ele('article-meta')//Inicio Article Meta
        .ele('article-id', { 'pub-id-type': 'doi' }, allData[0].doi.replace('https://doi.org/','')).up()
        .ele('article-categories')
          .ele('subj-group', { 'subj-group-type': 'contenido' })
            .ele('subject', 'Artículo').up()
          .up()
        .up()
        .ele('title-group')
          .ele('article-title', {'xml:lang': 'es'}, allData[0].titulo).up()
        .up()
        .com('AUTORES')
        .ele('contrib-group')
          .ele(todosAutores).up()//Imprime todos los autores
        .up()
        .com('AFILIACIONES')
        .ele('author-notes')
          .ele('corresp')
            .ele('label', 'Correspondencia | Correspondence').up()
            .ele(emailAutores).up()
          .up()
        .up()
        .ele('pub-date', { 'pub-type': 'epub-ppub' })
          .ele('month', allData[0].fecPublicacion.getMonth() + 1).up()
          .ele('year', allData[0].fecPublicacion.getFullYear()).up()
        .up()
        .ele('volume', publicaInfo[0].volumen).up()
        .ele('issue', publicaInfo[0].numero).up()
        .ele('fpage', allData[0].pagInicial).up()
        .ele('lpage', allData[0].pagFinal).up()
        .ele('history')
          .ele('date', { 'date-type': 'received' })
            .ele('day', allData[0].fecRecibido.getDate()).up()
            .ele('month', allData[0].fecRecibido.getMonth() + 1).up()
            .ele('year', allData[0].fecRecibido.getFullYear()).up()
          .up()
          .ele('date', { 'date-type': 'accepted' })
            .ele('day', allData[0].fecAceptado.getDate()).up()
            .ele('month', allData[0].fecAceptado.getMonth() + 1).up()
            .ele('year', allData[0].fecAceptado.getFullYear()).up()
          .up()
        .up()
        .ele('abstract', { 'xml:lang': 'es' })
          .ele('p', allData[0].resumen.toString()).up()
        .up()
        .ele('kwd-group', { 'xml:lang': 'es' })
          .ele(todasPalClaves).up()//Imprime todas las palabras claves
        .up()
        .ele('counts')
          .ele('fig-count', {'count': ''}).up()
          .ele('ref-count', {'count': totReferencias[0].num_ref_lines.toString()}).up()
          .ele('page-count', {'count': (allData[0].pagFinal - allData[0].pagInicial + 1).toString()}).up()
        .up()
      .up()//Fin Article Meta
    .up()//FIN FRONT
    .com('BODY')
    .ele('body')//Inicio BODY
      .ele('p', 'no').up()
    .up()//Fin BODY
    .com('BACK')
    .ele('back')//Inicio BACK
      .ele('ack')
        .ele('title', 'AGRADECIMIENTOS').up()
        .ele('p', allData[0].agradecimientos.toString()).up()
      .up()
      .com('REFERENCIAS')
      .ele('ref-list')
        .ele('title', 'REFERENCIAS').up()
        .ele(todosReferencias).up()
      .up()
    .up()//Fin BACK
    .com('EN INGLES')
    .ele('sub-article')
      .att('article-type', 'translation')
      .att('id', 'TRen')
      .att('xml:lang', 'en')
      .ele('front-stub')
        .ele('article-categories')
          .ele('subj-group', {'subj-group-type': 'content'}).up()
        .up()
        .ele('title-group')
          .ele('article-title', {'xml:lang': 'en'}, allData[0].title).up()
        .up()
        .ele('abstract', { 'xml:lang': 'en' })
          .ele('p', allData[0].abstract.toString()).up()
        .up()
        .ele('kwd-group', { 'xml:lang': 'en' })
          .ele(todasKeyWords).up()//Imprime todas las keywords
        .up()
      .up()
      .ele('body')
        .ele('p', 'Not in english').up()
      .up()
      .ele('back')
      .ele('p', 'No back').up()
      .up()
    .up()
    .end({ pretty: true });

  //var xmldoc = article.toString({ pretty: true });
  const xmldoc = article.toString({ pretty: true });

  fs.writeFile(dirPath+'articleId'+idArtic+'.xml', xmldoc, function (err) { //
    if (err) { return console.log(err); }
    console.log("File was saved!");
    //res.render('links/saludo', { link: xmldoc, documento: dirPath+'articleId'+idArtic+'.xml'});
    res.download(dirPath + 'articleId' + idArtic + '.xml');
  });

  //res.render('links/saludo', { link: article });
});


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
  })(req, res, next);
});

//GET PROFILE
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
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