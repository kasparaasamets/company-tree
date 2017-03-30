var express = require('express');
var db = require('./db');
var Seq = require('seq');
var config = require('./config');

function getCompanyTree(params, cb) {
  var companyLimit = db.makeLimit(params.companiesLimit, params.companiesOffset, config.maxRequestedCompanies);
  var companyCarsLimit = db.makeLimit(params.companyCarsLimit, null, config.maxRequestedCompanyCars);
  var companyDriversLimit = db.makeLimit(params.companyDriversLimit, null, config.maxRequestedCompanyDrivers);
  var companies;

  Seq().seq(function() {
    db.query('SELECT * FROM company' + companyLimit, this);
  }).seq(function(results) {
    companies = results;
    this(null, companies);
  }).flatten().seqEach(function(company) {
    var that = this;
    // Fill in all cars and drivers for this company.
    // I'm using two queries per company as I was unable to find an optimal SQL solution
    // when getting a subset of each company's cars/drivers.
    Seq().par(function() {
      var sql = 'SELECT * FROM car WHERE `company_id` = ?' + companyCarsLimit;
      var params = [company.id];
      db.query(sql, params, this);
    }).par(function() {
      var sql = 'SELECT * FROM driver WHERE `company_id` = ?' + companyDriversLimit;
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

    // Need a proper input validation here, e.g. express-validator

    var params = {
      companiesOffset: req.query.companiesOffset,
      companiesLimit: req.query.companiesLimit,
      companyCarsLimit: req.query.companyCarsLimit,
      companyDriversLimit: req.query.companyDriversLimit
    };

    getCompanyTree(params, function(err, data) {
      res.json({
        companies: data
      });
    });

  });

  return app;
};