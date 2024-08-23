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
      is_social_signin BOOLEAN DEFAULT false,
      profile_picture_url VARCHAR(255) DEFAULT "https://link.storjshare.io/raw/jvpsqe6bo4xj7zhlfgsnkpza6p4a/summer/default.jpg" ,
      address VARCHAR(255),
      plan ENUM('free','silver','gold') DEFAULT 'free',
      subscription_start_date DATETIME,
      subscription_end_date DATETIME,
      role ENUM('ADMIN','USER') DEFAULT 'USER'
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
