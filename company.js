var express = require('express');
var db = require('./db');
var Seq = require('seq');

function getCompanyTree(cb) {
  var companies;
  Seq().seq(function() {
    var sql = 'SELECT * FROM company';
    // Get all companies
    db.query(sql, this);
  }).seq(function(results) {
    companies = results;
    this(null, companies);
  }).flatten().parEach(function(company) {
    var that = this;

    // Fill in all cars and drivers for this company
    Seq().par(function() {
      var sql = 'SELECT * FROM car WHERE `company_id` = ?';
      var params = [company.id];
      db.query(sql, params, this);
    }).par(function() {
      var sql = 'SELECT * FROM driver WHERE `company_id` = ?';
      var params = [company.id];
      db.query(sql, params, this);
    }).seq(function(cars, drivers) {
      company.cars = cars;
      company.drivers = drivers;
      that();
    });

  }).seq(function() {
    cb(null, companies);
  });
}

module.exports = function () {
  var app = express();

  app.get('/tree', function (req, res, next) {

    getCompanyTree(function(err, data) {
      res.send(data);
    });

  });

  return app;
};