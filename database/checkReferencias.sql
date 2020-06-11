USE `bdrevistapolitecnica`;
DROP procedure IF EXISTS `checkReferencias`;

DELIMITER $$
USE `bdrevistapolitecnica`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkReferencias`(IN idArticulo INT, IN num_ref_lines INT)
BEGIN
	DECLARE countRows INT DEFAULT 0;
  DROP TEMPORARY TABLE IF EXISTS Tabreferencias;
  CREATE TEMPORARY TABLE Tabreferencias (refes BLOB);

	WHILE countRows < num_ref_lines DO
		INSERT INTO TabReferencias (refes)
			SELECT
				if(num_ref_lines > countRows, SUBSTRING_INDEX(SUBSTRING_INDEX(referencias, '\n', countRows+1), '\n', -1), '') as refer
			FROM articulo
			WHERE idArtic = idArticulo;
		SET countRows = countRows + 1;
	END WHILE;
  SELECT * FROM TabReferencias;
END$$

DELIMITER ;