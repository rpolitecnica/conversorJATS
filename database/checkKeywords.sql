USE `bdrevistapolitecnica`;
DROP procedure IF EXISTS `checkKeywords`;

DELIMITER $$
USE `bdrevistapolitecnica`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `checkKeywords`(IN idArticulo INT, IN num_ref_lines INT)
BEGIN
	DECLARE countRows INT DEFAULT 0;
  DROP TEMPORARY TABLE IF EXISTS Keywords;
  CREATE TEMPORARY TABLE Keywords (keyword BLOB);

	WHILE countRows < num_ref_lines DO
		INSERT INTO Keywords (keyword)
			SELECT
				if(num_ref_lines > countRows, SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '\n', countRows+1), '\n', -1), '') as keywor
			FROM articulo
			WHERE idArtic = idArticulo;
		SET countRows = countRows + 1;
	END WHILE;
  SELECT * FROM Keywords;
END$$

DELIMITER ;