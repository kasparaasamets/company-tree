var config = require('./config');
var express = require('express');
var app = express();

app.use('/company', require('./company')());

app.listen(config.port, config.host, function () {
  console.log('Listening on port ' + config.port);
});