var express = require('express');
var db = require('./db');
var Seq = require('seq');
var config = require('./config');

function getCompanyTree(params, cb) {
  var mappedCompanies = {};
  var companyLimit = '';
  var companyCarsLimit = '';
  var companyDriversLimit = '';

  var companyIds = [];
  var companies;

  if (!params.companiesLimit || params.companiesLimit > config.maxRequestedCompanies) {
    params.companiesLimit = config.maxRequestedCompanies;
  }

  companyLimit = ' LIMIT ' + params.companiesLimit;
  if (params.companiesOffset) {
    companyLimit += ' OFFSET ' + params.companiesOffset;
  }
  if (params.companyCarsLimit) {
    companyCarsLimit = ' LIMIT ' + params.companyCarsLimit;
  }
  if (params.companyDriversLimit) {
    companyDriversLimit = ' LIMIT ' + params.companyDriversLimit;
  }
  Seq().seq(function() {
    db.query('SELECT * FROM company' + companyLimit, this);
  }).seq(function(results) {
    companies = results;


    // Map companies to object with ID as key for faster car and driver mapping
    for (var i in companies) {
      var company = companies[i];
      mappedCompanies[company.id] = company;
      companyIds.push(company.id);
    }
    this();
  }).par(function() {
    db.query('SELECT * FROM car WHERE company_id IN (' + companyIds.join(',') + ')', this);
  }).par(function() {
    db.query('SELECT * FROM driver WHERE company_id IN (' + companyIds.join(',') + ')', this);
  }).seq(function(cars, drivers) {

    // Fill in company cars
    for (var i in cars) {
      var car = cars[i];
      console.log('car', car);
      var company = mappedCompanies[car.company_id];
      if (!company) {
        continue;
      }
      if (!company.cars) {
        company.cars = [];
      }
      company.cars.push(car);
    }

    // Fill in company drivers
    for (var i in drivers) {
      var driver = drivers[i];
      var company = mappedCompanies[driver.company_id];
      if (!company) {
        continue;
      }
      if (!company.drivers) {
        company.drivers = [];
      }
      company.drivers.push(driver);
    }

    // Re-flatten companies to array for proper output
    var flattenedCompanies = [];
    for (var i in companies) {
      flattenedCompanies.push(companies[i]);
    }
    cb(null, flattenedCompanies);

  });
}

module.exports = function () {
  var app = express();

  app.get('/tree', function (req, res, next) {

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