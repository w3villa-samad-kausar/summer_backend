const conn = require("../config/db_config");


// Function to create table
const createVerificationTable = () => {
  const createTableQuery = `
    CREATE TABLE  if not exists user_verification_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email varchar(500) unique,
    mobile_number varchar(10) unique,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verification_hash varchar(255) NULL,
    email_expire_at DATETIME NULL,
    mobile_otp_expire_at DATETIME NULL,
    email_verified_at DATETIME NULL,
    mobile_verified_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    otp_retry_count INT DEFAULT 0,
    email_retry_count INT DEFAULT 0,
    comment TEXT NULL,
    user_data JSON NULL,
    is_email_verified boolean default false,
    is_mobile_verified boolean default false,
    is_processed boolean default false,
    mobile_otp VARCHAR(4) NULL
);

  `;

  conn.query(createTableQuery, (error, results) => {
    if (error) {
      console.error('Error creating table:', error);
      return;
    }
    console.log('Table created ');
  });
};

// Call the function to ensure table is created
// createVerificationTable();

// Export the functions
module.exports = { createVerificationTable };
