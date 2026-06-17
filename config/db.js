const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',      
    password: process.env.DB_PASSWORD || '',      
    database: process.env.DB_NAME || 'demo', 
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

const promisePool = pool.promise();

// অটোমেটিক টেবিল তৈরি করার ফাংশন
const initDatabase = async () => {
    try {
        // এখানে আপনার employees টেবিলের কুয়েরিটি দেওয়া হলো
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                department VARCHAR(255),
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const createDeptTableQuery = `
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;


        await promisePool.query(createTableQuery);

         // ৩. অ্যাডমিন টেবিলে অটোমেটিক ডেটা ইনসার্ট (ইমেল ও পাসওয়ার্ড)
        // IGNORE ব্যবহার করা হয়েছে যাতে প্রতিবার সার্ভার চালু হলে একই ডেটা বারবার ইনসার্ট না হয়
        const insertAdminQuery = `
            INSERT IGNORE INTO admin (email, password) 
            VALUES ('admin@gmail.com', '123');
        `;
        await promisePool.query(insertAdminQuery);


        console.log("🚀 Employees table checked/created successfully in Aiven Cloud!");
    } catch (error) {
        console.error("❌ Error creating table in cloud:", error);
    }
};

// সার্ভার চালু হওয়ার সাথে সাথে রান হবে
initDatabase();

module.exports = promisePool;