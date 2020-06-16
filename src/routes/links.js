const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn, isAdmin } = require('../lib/auth')
const helpers = require('../lib/helpers');

//Manejador de las Publicaciones
router.get('/archives/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  //const links = await pool.query('SELECT * FROM publicacion WHERE usert_id = ? ORDER BY anyo DESC, volumen DESC, numero DESC', [id]);
  const links = await pool.query('SELECT idPublica, anyo, volumen, numero, usert_id, count(idArtic) as total \
  FROM publicacion \
  LEFT OUTER JOIN articulo \
  ON publicacion.idPublica=articulo.publicacion_id \
  WHERE usert_id = ? \
  GROUP BY idPublica \
  ORDER BY anyo DESC, volumen DESC, numero DESC', [id]);
  res.render('links/archives', { links, id: id });
});


//Manejador de los articulos segun la publicacion
router.get('/publicacion/:idPublica', isLoggedIn, async (req, res) => {
  const { idPublica } = req.params;
  const links = await pool.query('SELECT titulo, pagInicial, pagFinal, idArtic, autores \
   FROM articulo \
   JOIN publicacion ON \
   publicacion.idPublica=articulo.publicacion_id \
   WHERE publicacion.idPublica = ? \
   ORDER BY pagInicial ASC', [idPublica]);
   res.render('links/articles', { links });
 });



//GET Router para editar la Edicion (publicacion)
router.get('/editEdicion/:idPublica', isLoggedIn, async (req, res) => {
  const { idPublica } = req.params;
  const links = await pool.query('SELECT * FROM publicacion WHERE idPublica = ?', [idPublica]);
  res.render('links/publicationedit', { link: links[0] });
});

//POST Router para guardar la edicion Editada
router.post('/editEdicion/:idPublica', isLoggedIn, async (req, res) => {
  const { idPublica } = req.params;
  const { anyo, volumen, numero } = req.body;
  const validarEdicion = await pool.query('SELECT idPublica FROM publicacion WHERE anyo = ? AND volumen = ? AND numero = ? ', [anyo, volumen, numero]);

  if (validarEdicion == 0 || validarEdicion[0].idPublica == idPublica) {
    const editPublicacion = {
      anyo,
      volumen,
      numero
    };
    await pool.query('UPDATE publicacion SET ? WHERE idPublica = ?', [editPublicacion, idPublica]);
    req.flash('success', 'Edición guardada');
  } else {
    req.flash('message', 'Publicación ya existe.');
  }
  const usert_id = await pool.query('SELECT usert_id FROM publicacion WHERE idPublica = ?', [idPublica]);
  res.redirect('/links/archives/'+ usert_id[0].usert_id);
});


//GET Router para formulario para guardar articulo
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

//GET Router para guardar articulo
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

//GET Router de formulario para crear Edicion
router.get('/publication/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params
  res.render('links/publication', {id: id});
});

//GET Router para guardar Edicion
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
  res.redirect('/links/archives/'+ id);
});

//GET Router para listar todos los articulos del usuario
router.get('/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const links = await pool.query('SELECT * FROM articulo JOIN publicacion \
  ON publicacion.idPublica=articulo.publicacion_id \
  WHERE publicacion.idPublica \
  IN (SELECT idPublica FROM publicacion WHERE usert_id = ?) \
  ORDER BY anyo DESC, volumen DESC, numero DESC', [id]);
  res.render('links/list', { links, id: id });
});


//GET crear usuarios
router.get('/adduser/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  res.render('links/adduser', {id});
});

//POST Guardar usuario creado
router.post('/adduser/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { fullname, username, password, tipousuario_id } = req.body;
  const newUser = {
    username,
    password,
    fullname,
    tipousuario_id
  };
  const rows = await pool.query('SELECT * FROM usert WHERE username = ?', [username]);
  if (rows.length > 0) {
    req.flash('message', 'Usuario ya existe');
  } else {
    newUser.password = await helpers.encryptPassword(password);
    await pool.query('INSERT INTO usert SET ?', [newUser]);
    req.flash('success', 'Usuario creado.');
  }
  res.redirect('/profile');
});

//GET Listar usuarios si quien ingresa es administrador
router.get('/listusers/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const links = await pool.query('SELECT * FROM usert');// WHERE id != ?', [id]);
  links.forEach(element => {
    if (element.tipousuario_id == 1) {
      element.tipousuario_id = 'Administrador';
    } else {
      element.tipousuario_id = 'Usuario';
    }
  });
  res.render('links/listusers', { links });
});


//Router borrar un usuario
router.get('/deleteuser/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const tipousuario = await pool.query('SELECT tipousuario_id \
  FROM usert \
  WHERE id = ?', [id]);
  if (tipousuario[0].tipousuario_id == 1) {
    req.flash('message', 'No se puede borrar un Administrador');
  } else {
    await pool.query('DELETE FROM usert WHERE id = ?', [id]);
    req.flash('success', 'Usuario eliminado');
  }
  res.redirect('/profile');
});

//Router para editar un usuario
router.get('/edituser/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const links = await pool.query('SELECT id, username, fullname, tipousuario_id \
  FROM usert \
  WHERE id = ?', [id]);
  if (links[0].tipousuario_id == 1) {
    req.flash('message', 'No se puede editar un Administrador');
    res.redirect('/profile');
  } else {
    res.render('links/edituser', { link: links[0] });
  }
});

//Router guarda los cambios del usuario
router.post('/edituser/:id', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { fullname, username, tipousuario_id } = req.body;
  const editUser = {
    username,
    fullname,
    tipousuario_id
  };
  await pool.query('UPDATE usert SET ? WHERE id = ?', [editUser, id]);
  req.flash('success', 'Datos guardados');
  res.redirect('/profile');
});


//Router para borrar un articulo
router.get('/delete/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const usert_id = await pool.query('SELECT publicacion.usert_id FROM articulo JOIN publicacion ON publicacion.idPublica=articulo.publicacion_id WHERE idArtic = ?', [idArtic]);
  await pool.query('DELETE FROM articulo WHERE idArtic = ?', [idArtic]);
  req.flash('success', 'Articulo eliminado');
  res.redirect('/links/' + usert_id[0].usert_id); //Accede al router de /:id para consultar de nuevo los articulos que quedan y presentarlos.
});

//GET Router para editar el articulo
router.get('/edit/:idArtic', isLoggedIn, async (req, res) => {
  const { idArtic } = req.params;
  const links = await pool.query('SELECT * FROM articulo WHERE idArtic = ?', [idArtic]);
  res.render('links/edit', { link: links[0] });
});

//POST Router para guardar el articulo editado
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