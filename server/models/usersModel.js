const conn = require("../config/db_config");


// Function to create table
const createTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) unique ,
      password VARCHAR(100),
      mobile_number varchar(10)
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
createTable();

// Export the functions
module.exports = { createTable };
