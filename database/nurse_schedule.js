var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "db_nurse_scheduling",
    password: "1234"
});

//create table
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `CREATE TABLE nurse_schedule (
               id INT AUTO_INCREMENT PRIMARY KEY,
               nurse_id INT,
               month INT,
               day INT,
               year INT,
               schedule TEXT,
               date_created TIMESTAMP)`;

    con.query(sql, function (err, result) {
        if (err) { throw err };
        console.log("Table created");
    });
});