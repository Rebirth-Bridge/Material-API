/**
 * Created by chamathbogahawatta on 03/10/2019.
 */
const mysql = require('mysql');

let pool;

const getPool = () => {
  if (pool) return pool;
  pool = mysql.createPool({
    host: 'mysql-bridge-ap.c8ug87x2cehw.ap-southeast-1.rds.amazonaws.com',
    port: '3306',
    user: 'rebirth',
    password: '9ijnBGT5',
    database: 'BRIDGE',
  });
  return pool;
};

module.exports = {
  getPool
}; 