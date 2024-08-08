const conn = require("../config/db_config");


// Function to create table
const createTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) unique ,
      password VARCHAR(100),
      mobile_number VARCHAR(10),
      next_action VARCHAR(30) DEFAULT "OTP Verification",
      is_social_sigin BOOLEAN DEFAULT false
    );
  `;

  conn.query(createTableQuery, (error, results) => {
    if (error) {
      console.error('Error creating table:', error);
      return;
    }
    console.log('Table created');
  });
};

// Call the function to ensure table is created
// createTable();

// Export the functions
module.exports = { createTable };
