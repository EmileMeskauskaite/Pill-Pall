const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");

db = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME, ----pasirenkamas per schema
  multipleStatements: true, // Kad eitu daug tables deti i schema.sql
});

const runSql = async (sql) => {
  try {
    await db.query(sql);
    console.log("Schema executed correctly.");
  } catch (err) {
    console.error("Error executing schema:", err);
  }
};

const setupDatabase = async () => {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const dummyPath = path.join(__dirname, "dummydata.sql");
  const dummySql = fs.readFileSync(dummyPath, "utf8");

  await runSql(schemaSql, "Schema");
  await runSql(dummySql, "Dummy Data");
};

setupDatabase();

module.exports = db;