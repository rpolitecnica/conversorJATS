const fs = require('fs');
const dirPath = __dirname + "/../public/xmlfiles/";
const convert = {};
const xsl = fs.readFileSync(dirPath + 'poli.xsl').toString(); //'../public/xmlfiles/poli.xsl';
const procesador = require('xslt-processor');

convert.xml2html = (xml) => {

  try {
    const contxml = fs.readFileSync(xml).toString();
    const outXmlString = procesador.xsltProcess(
      procesador.xmlParse(contxml).documentElement,
      procesador.xmlParse(xsl)
    );
    return outXmlString;
  } catch (error) {
    return 'Error';
  }
};

module.exports = convert;


