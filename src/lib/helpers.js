const helpers = {};
const bcrypt = require('bcryptjs');
const encode = require('nodejs-base64-encode');

helpers.encryptPassword = async (password) => {
  //const salt = await bcrypt.genSalt(10);
  //const hash = await bcrypt.hash(password, salt);
  const hash = await encode.encode(password, 'base64');
  return hash;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
    //return await bcrypt.compare(password, savedPassword)
    const decode = await encode.decode(savedPassword, 'base64');
    return password === decode ? true : false
  } catch (e) {
    console.log(e);
  }
};

helpers.decryptPassword = async (password) => {
  return await encode.decode(password, 'base64');
};


module.exports = helpers;