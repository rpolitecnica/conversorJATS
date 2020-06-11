CREATE DATABASE dbrevista;

USE dbrevista;

CREATE TABLE usert(
  id INT(11) NOT NULL,
  username VARCHAR(16) NOT NULL,
  password VARCHAR(60) NOT NULL,
  fullname VARCHAR(100) NOT NULL
);

ALTER TABLE usert
  ADD PRIMARY KEY (id);

ALTER TABLE usert
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


--ARTICULO
CREATE TABLE articulo(
  id INT(11) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  numArticulo INT(11) NOT NULL,
  pagInicial INT(11) NOT NULL,
  pagFinal INT(11) NOT NULL,
  autores VARCHAR(255) NOT NULL,
  fecRecibido DATE,
  fecAceptado DATE,
  fecPublicacion DATE,
  resumen VARCHAR(3000) NOT NULL,
  abstract VARCHAR(2000) NOT NULL,
  palClaves VARCHAR(255) NOT NULL,
  keywords VARCHAR(255) NOT NULL,
  agradecimientos VARCHAR(300),
  referencias VARCHAR(5000) NOT NULL,
  usert_id INT(11),
  publicacion_id INT(11),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (usert_id) REFERENCES usert(id),
  CONSTRAINT fk_publicacion FOREIGN KEY (publicacion_id) REFERENCES publicacion(id)
);

ALTER TABLE articulo
  ADD PRIMARY KEY (id);

ALTER TABLE articulo
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


--PUBLICACION
CREATE TABLE publicacion(
  id INT(11) NOT NULL,
  anyo INT(5) NOT NULL,
  volumen INT(11) NOT NULL,
  numero INT(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE publicacion
  ADD PRIMARY KEY (id);

ALTER TABLE publicacion
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;