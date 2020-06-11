USE `bdrevistapolitecnica`;
DROP procedure IF EXISTS `checkAutores`;

DELIMITER $$
USE `bdrevistapolitecnica`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkAutores`(IN idArticulo INT, IN num_ref_lines INT)
BEGIN
	DECLARE countRows INT DEFAULT 0;
  DROP TEMPORARY TABLE IF EXISTS Tabautores;
  CREATE TEMPORARY TABLE Tabautores (author BLOB);

  WHILE countRows < num_ref_lines DO
		INSERT INTO Tabautores (author)
			SELECT
				if(num_ref_lines > countRows, SUBSTRING_INDEX(SUBSTRING_INDEX(autores, '\n', countRows+1), '\n', -1), '') as autor
			FROM articulo
			WHERE idArtic = idArticulo;
		SET countRows = countRows + 1;
	END WHILE;
  SELECT * FROM Tabautores;
END$$

DELIMITER ;