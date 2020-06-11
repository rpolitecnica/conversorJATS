const mysql = require('mysql');
const { promisify } = require('util')
const { database } = require('./keys')
const pool = mysql.createPool(database);


pool.getConnection((err, connection) => {
  //console.log(err);
  //console.log(connection);
  if(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections');
    }
    if (err.code === 'ECONNREUSED') {
      console.error('Database connection was refused');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied for user ' + database.user + '@' + database.host + ' (using password: YES)');
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Unknown database: ' + database.database);
    }
  }

  if (connection) {
    connection.release()
    console.log('Connected to database: ' + connection.config.database);
  }
  return;
});

//Promisify pool queries
pool.query = promisify(pool.query);

module.exports = pool;