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
    var sql = `CREATE TABLE announcement (
               id INT AUTO_INCREMENT PRIMARY KEY,
               posted_by INT,
               subject TEXT,
               body TEXT,
               date_announcement VARCHAR(12),
               date_created TIMESTAMP)`;

    con.query(sql, function (err, result) {
        if (err) { throw err };
        console.log("Table created");
    });
});

