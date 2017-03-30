module.exports = {
  host: '0.0.0.0',
  port: 8080,
  db: {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'taxify-test',
    connectionLimit: 10
  },
  maxRequestedCompanies: 100
};