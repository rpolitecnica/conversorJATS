const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth')

//Manejador de las Publicaciones
router.get('/archives/:id', async (req, res) => {
  const { id } = req.params;
  const links = await pool.query('SELECT * FROM publicacion WHERE usert_id = ? ORDER BY numero DESC', [id]);//SELECT usert.fullname, articulo.title, date_format(articulo.created_at,"%d-%M-%Y") as created_at FROM usert inner join articulo ON articulo.usert_id = usert.id');
  res.render('links/archives', { links });
});


router.get('/add/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const publicacionUser = await pool.query('SELECT * FROM publicacion WHERE usert_id = ? ORDER BY numero DESC', [id]);
  if (publicacionUser == 0) {
    req.flash('message', 'No tiene ediciones creadas. Debe crear alguna.');
    res.redirect('/profile');
  } else {
    res.render('links/add', {id: id, ediciones: publicacionUser});
  };
});

//INGRESO NUEVO ARTICULO  - ***FALTA ARREGLAR QUE VALIDE LAS PAGINAS INGRESADAS****
router.post('/add/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params
  const { titulo, title, edicion, numArticulo, doi, pagInicial, pagFinal,
    autores, fecRecibido, fecAceptado, fecPublicacion, resumen,
    abstract, palClaves, keywords, agradecimientos, referencias, urlgaleradahtml } = req.body;

  const valoresArticulo = await pool.query('SELECT articulo.idArtic, articulo.numArticulo, articulo.pagInicial, articulo.pagFinal FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE publicacion.idPublica = ?', [edicion]);

  var noExisteNumArticulo = false;
  var rangoPaginas = [];

  if (valoresArticulo.length == 0) {
    noExisteNumArticulo = true;
  } else {
    for (var key = 0; key < valoresArticulo.length; key++) {
      var row = valoresArticulo[key];
      if ( numArticulo == row.numArticulo) {
        noExisteNumArticulo = false;
        break;
      } else {
        noExisteNumArticulo = true;
      }
      if ((pagInicial < row.pagInicial || row.pagInicial < pagFinal) && (pagInicial < row.pagFinal || row.pagFinal < pagFinal) && (row.pagInicial < pagInicial || row.pagFinal > pagFinal) ){//(pagInicial < row.pagInicial || pagInicial > row.pagFinal) && (pagFinal < row.pagInicial || pagFinal > row.pagFinal)) {
        rangoPaginas[key] = true;
      } else {
        rangoPaginas[key] = false;
      }
    }
  }

  rangoValido = (rangoPaginas.includes(false));
  console.log(rangoPaginas);
  console.log(rangoValido);

  if (noExisteNumArticulo && !rangoValido) {
    const newlink = {
      titulo,
      title,
      numArticulo,
      pagInicial,
      pagFinal,
      autores,
      fecRecibido,
      fecAceptado,
      fecPublicacion,
      resumen,
      abstract,
      palClaves,
      keywords,
      agradecimientos,
      referencias,
      doi,
      urlgaleradahtml,
      publicacion_id: edicion
    };
    await pool.query('INSERT INTO articulo set ?', [newlink]);
    req.flash('success', 'Articulo guardado');
    res.redirect('/links/' + id);
  }
  if (!noExisteNumArticulo) {
    req.flash('message', 'El numero del artículo ya existe en la edición: ' + edicion);
    res.redirect('/profile');
  }
  if (rangoValido) {
    req.flash('message', 'El numero de pagina inicial y/o final ya pertenece a otro articulo ');
    res.redirect('/profile');
  }
});


router.get('/publication/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params
  res.render('links/publication', {id: id});
});


router.post('/publication/:id', isLoggedIn, async (req, res) => {
  const { anyo, volumen, numero } = req.body;
  const { id } = req.params;
  const rows = await pool.query('SELECT * FROM publicacion WHERE anyo = ? AND volumen = ? AND numero = ? AND usert_id = ?', [anyo, volumen, numero, id]);
  if (rows == 0) {
    const newpublication = {
      anyo,
      volumen,
      numero,
      usert_id: id
    };
    await pool.query('INSERT INTO publicacion set ?', [newpublication]);
    req.flash('success', 'Publicación creada!');
  } else {
    req.flash('message', 'Publicación ya existe.');
  }
  const links = await pool.query('SELECT * FROM publicacion WHERE usert_id = ? ORDER BY numero DESC', [id]);
  res.render('links/archives', { links });
});


router.get('/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const links = await pool.query('SELECT * FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE publicacion.idPublica IN (SELECT idPublica FROM publicacion WHERE usert_id = ?) ORDER BY publicacion.numero DESC', [id]);//('SELECT * FROM articulo WHERE usert_id = ?', [id]);
  res.render('links/list', { links, id: id });
});

router.get('/delete/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const usert_id = await pool.query('SELECT publicacion.usert_id FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE idArtic = ?', [idArtic]);
  await pool.query('DELETE FROM articulo WHERE idArtic = ?', [idArtic]);
  req.flash('success', 'Articulo eliminado');
  res.redirect('/links/'+usert_id[0].usert_id) //Accede al router de /:id para consultar de nuevo los articulos que quedan y presentarlos.
});


router.get('/edit/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const links = await pool.query('SELECT * FROM articulo WHERE idArtic = ?', [idArtic]);
  res.render('links/edit', { link: links[0] });
});


router.post('/edit/:idArtic', isLoggedIn, async (req, res) => {//No se permite editar el numero de publicación
  const { idArtic } = req.params;
  const { titulo, title, doi, autores, resumen, abstract, palClaves, keywords,
    agradecimientos, referencias, urlgaleradahtml } = req.body;

  const usert_id = await pool.query('SELECT publicacion.usert_id FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE idArtic = ?', [idArtic]);

  const editLink = {
    titulo,
    title,
    doi,
    autores,
    resumen,
    abstract,
    palClaves,
    keywords,
    agradecimientos,
    referencias,
    urlgaleradahtml
  };
  await pool.query('UPDATE articulo SET ? WHERE idArtic = ?', [editLink, idArtic]);
  req.flash('success', 'Articulo guardado');
  res.redirect('/links/' + usert_id[0].usert_id);
});


module.exports = router;