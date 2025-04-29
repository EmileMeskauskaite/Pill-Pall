const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

const updateDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log("Starting database update...");
    
    // Read the update script
    const updatePath = path.join(__dirname, "update_schema.sql");
    const updateSql = fs.readFileSync(updatePath, "utf8");
    
    // Execute the update script
    await connection.query(updateSql);
    
    console.log("Database update completed successfully!");
  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await connection.end();
  }
};

updateDatabase(); 