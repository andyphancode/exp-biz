/** Database setup for BizTime. */

// Replaced code to fix bug on Ubuntu side, not sure if it'll work for mac.

const { Client } = require("pg");

const DB = (process.env.NODE_ENV === "test") 
  ? "biztime_test"
  : "biztime";

let db = new Client({
    host: "/var/run/postgresql/",
    database: DB
  });

db.connect();

module.exports = db;