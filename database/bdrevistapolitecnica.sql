CREATE DATABASE bdrevistapolitecnica;

USE bdrevistapolitecnica;

--USUARIO
CREATE TABLE usert(
  id INT(11) NOT NULL,
  username VARCHAR(60) NOT NULL,
  password VARCHAR(60) NOT NULL,
  fullname VARCHAR(150) NOT NULL
);

ALTER TABLE usert
  ADD PRIMARY KEY (id);

ALTER TABLE usert
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


--PUBLICACION
CREATE TABLE publicacion(
  idPublica INT(11) NOT NULL,
  anyo INT(5) NOT NULL,
  volumen INT(11) NOT NULL,
  numero INT(20) NOT NULL,
  usert_id INT(11) NOT NULL,
  created_publicacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (usert_id) REFERENCES usert(id)
);

ALTER TABLE publicacion
  ADD PRIMARY KEY (idPublica);

ALTER TABLE publicacion
  MODIFY idPublica INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


--ARTICULO
CREATE TABLE articulo(
  idArtic INT(11) NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  title VARCHAR(500) NOT NULL,
  numArticulo INT(11) NOT NULL,
  pagInicial INT(11) NOT NULL,
  pagFinal INT(11) NOT NULL,
  autores BLOB(1000) NOT NULL,
  fecRecibido DATE,
  fecAceptado DATE,
  fecPublicacion DATE,
  resumen BLOB(5000) NOT NULL,
  abstract BLOB(5000) NOT NULL,
  palClaves BLOB(1000) NOT NULL,
  keywords BLOB(1000) NOT NULL,
  agradecimientos BLOB(1000),
  referencias BLOB(5000) NOT NULL,
  doi VARCHAR(300) NOT NULL,
  urlgaleradahtml VARCHAR(300) NOT NULL,
  publicacion_id INT(11) NOT NULL,
  created_articulo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_publicacion FOREIGN KEY (publicacion_id) REFERENCES publicacion(idPublica)
);

ALTER TABLE articulo
  ADD PRIMARY KEY (idArtic);

ALTER TABLE articulo
  MODIFY idArtic INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;
