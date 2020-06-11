USE `bdrevistapolitecnica`;
DROP procedure IF EXISTS `checkPalClaves`;

DELIMITER $$
USE `bdrevistapolitecnica`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkPalClaves`(IN idArticulo INT, IN num_ref_lines INT)
BEGIN
	DECLARE countRows INT DEFAULT 0;
  DROP TEMPORARY TABLE IF EXISTS TabPalclaves;
  CREATE TEMPORARY TABLE TabPalclaves (palclave BLOB);

  WHILE countRows < num_ref_lines DO
		INSERT INTO TabPalclaves (palclave)
			SELECT
				if(num_ref_lines > countRows, SUBSTRING_INDEX(SUBSTRING_INDEX(palClaves, '\n', countRows+1), '\n', -1), '') as palclave
			FROM articulo
			WHERE idArtic = idArticulo;
		SET countRows = countRows + 1;
	END WHILE;
  SELECT * FROM TabPalclaves;
END$$

DELIMITER ;