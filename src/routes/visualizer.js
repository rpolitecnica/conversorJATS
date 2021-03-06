const express = require('express');
const router = express.Router();
const pool = require('../database');
const convert = require('../lib/convesor2html');
const dirPath = __dirname + "/../public/xmlfiles/";
const creadorXML = require('../lib/generadorxml');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

//Ver el articulo construido con XML
router.get('/visualarticle/:idArtic', isLoggedIn, async (req, res) => {

  const { idArtic } = req.params;
  const xml = dirPath + 'articleId' + idArtic + '.xml';

  //Crear archivo XML
  const archivoxml = await creadorXML.crearArchivoXML(idArtic);

  //Convertir XML con XSL a HTML
  const htmlFormato = convert.xml2html(xml);

  //const doc = DOMParser().parseFromString(htmlFormato, 'text/html');
  //console.log(doc);
  if (archivoxml == 'Error' || htmlFormato == 'Error') {
    if (archivoxml == 'Error') {
      req.flash('message', 'Validar el formato en los datos del artículo. Descargar archivo');
    } else {
      req.flash('message', 'Validar el formato en los datos del artículo. En visualizar');
    }
    res.redirect('/links/edit/' + idArtic);
  } else {
    res.render('links/verarticulo', { link: htmlFormato, idArtic: idArtic });
  }
});

router.get('/descargarxml/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const archivoxml = await creadorXML.crearArchivoXML(idArtic);
  if (archivoxml == 'Error') {
    req.flash('message', 'Validar el formato en los datos del artículo. En descargar');
    res.redirect('/links/edit/' + idArtic);
  } else {
    res.download(dirPath + 'articleId' + idArtic + '.xml');
  }
});

router.get('/urlgalerada/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const galeradaHTML = await pool.query('SELECT urlgaleradahtml FROM articulo WHERE idArtic = ?', [idArtic]);
  console.log(galeradaHTML[0].urlgaleradahtml);
  if (galeradaHTML[0].urlgaleradahtml == 0) {
    req.flash('message', 'No existe galerada HTML o PFD.');
    res.redirect('/visualarticle/' + idArtic);
  } else {
    res.redirect(galeradaHTML[0].urlgaleradahtml);
  }
});

module.exports = router;