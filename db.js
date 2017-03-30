var config = require('./config');
var mysql = require('mysql');
var pool = mysql.createPool(config.db);

module.exports = {

  // Execute a query
  query: function(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    pool.getConnection(function(err, connection) {
      if (err) {
        console.error(err);
        return;
      }
      connection.query(sql, params, function (error, results, fields) {
        cb(null, results);
        connection.release();
        if (error) throw error;
      });
    });
  },

  // Generate a limit/offset string for query
  makeLimit: function(limit, offset, maxLimit) {
    if (!limit || limit > maxLimit) {
      limit = maxLimit;
    }
    var result = ' LIMIT ' + limit;
    if (offset) {
      result += ' OFFSET ' + offset;
    }
    return result;
  }

};