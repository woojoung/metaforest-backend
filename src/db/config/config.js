const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  "development": {
    "username": "admin",
    "password": process.env.DB_PASSWORD,
    "database": "database1_dev",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false,
    "timezone": "+09:00",
    "dialectOptions": {
      "timezone": "+09:00"
    }
  },
  "test": {
    "username": "admin",
    "password": process.env.DB_PASSWORD,
    "database": "database1_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+09:00",
    "dialectOptions": {
      "timezone": "+09:00"
    }
  },
  "production": {
    "username": "admin",
    "password": process.env.DB_PASSWORD,
    "database": "database1_prod",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+09:00",
    "dialectOptions": {
      "timezone": "+09:00"
    }
  }
}
