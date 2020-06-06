var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234"
});

con.connect(function (err) {
    if (err) throw err;

    con.query("CREATE DATABASE db_nurse_scheduling", function (err, result) {
        if (err) throw err;

        console.log("Database created");
    });
});