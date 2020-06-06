var mysql = require("mysql");
var moment = require("moment");
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "db_nurse_scheduling",
    password: "1234"
});

exports.check_if_already_uploaded = function (cluster, month, year) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT n. id FROM nurse n LEFT JOIN nurse_schedule s ON s.nurse_id = n.id WHERE n.cluster=? AND s.month=? AND s.year=? LIMIT 1";

        con.query(sql, [cluster, month, year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.get_current_announcement_count = function (month, year) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT COUNT(id) as 'TOTAL' FROM announcement WHERE date_announcement>=?";
        
        con.query(sql, [month + "/01/" + year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.get_announcements = function (month, year) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM announcement WHERE date_announcement>=? ORDER BY date_announcement DESC";

        con.query(sql, [month + "/01/" + year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.insert_announcement = function (announcement_subject, announcement_date, announcement_body) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO announcement VALUES(?,?,?,?,?,NOW())";
        const values = [0, 1, announcement_subject, announcement_body, announcement_date];

        con.query(sql, values, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

exports.get_announcements_count = function (subject, message, date_posted) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT COUNT(id) as 'TOTAL' FROM announcement WHERE id <> 0";

        if (subject != "") {
            sql = sql + " AND subject='" + subject + "'";
        }
        if (message != "") {
            sql = sql + " AND body='" + message + "'";
        }
        if (date_posted != "") {
            const from_date = date_posted.split("-")[0].trim();
            const to_date = date_posted.split("-")[1].trim();
            sql = sql + " AND date_announcement BETWEEN '" + from_date + "' AND '" + to_date + "'";
        }


        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR COUNT" + err);

            resolve(result);
        });
    });
}

exports.load_announcements = function (subject, message, date_posted, page) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM announcement WHERE id <> 0";
        if (subject != "") {
            sql = sql + " AND subject='" + subject + "'";
        }
        if (message != "") {
            sql = sql + " AND body='" + message + "'";
        }
        if (date_posted != "") {
            const from_date = date_posted.split("-")[0].trim();
            const to_date = date_posted.split("-")[1].trim();
            sql = sql + " AND date_announcement BETWEEN '" + from_date + "' AND '" + to_date + "'";
        }

        sql = sql + " LIMIT 10 OFFSET " + page;

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR SSS" + err);

            resolve(result);
        });
    });
}

exports.insert_nurse = function (nurse) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO nurse VALUES(?,?,?,?,NOW())";
        const values = [0, nurse.getName(), nurse.getDepartment(), nurse.getCluster()];

        con.query(sql, values, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

exports.insert_nurse_schedule = function (nurse) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO nurse_schedule VALUES(?,?,?,?,?,?,NOW())";
        const values = [0, nurse.getId(), nurse.getMonth(), nurse.getDay(), nurse.getYear(), nurse.getSchedule()];

        con.query(sql, values, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

exports.load_nurse_count = function () {
    return new Promise(function (resolve, reject) {
        let sql = `SELECT COUNT(id) as 'COUNT' FROM nurse`;
        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse = function (nurse, department, page) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT id,nurse,department FROM nurse WHERE id <> 0";
        if (nurse != "")
            sql = sql + " AND nurse='" + nurse + "'";
        if (department != "")
            sql = sql + " AND department='" + department + "'";

        sql = sql + " LIMIT 10 OFFSET " + page;
        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_schedule = function (id, month, year) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM nurse_schedule WHERE nurse_id=" + id + " AND month=" + month + " AND year=" + year;

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.get_nurse_schedules_count = function (nurse, department, month, year) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT s.id FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id WHERE s.nurse_id <> 0";
        if (nurse != "") {
            sql = sql + " AND n.nurse = '" + nurse + "'";
        }
        if (department != "") {
            sql = sql + " AND n.department = '" + department + "'";
        }
        if (month != "") {
            sql = sql + " AND s.month = " + month;
        }
        if (year != "") {
            sql = sql + " AND s.year = " + year;
        }

        sql = sql + " GROUP BY month,year,nurse_id";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_schedules = function (nurse, department, cluster, month, year, page) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT s.nurse_id,n.nurse,n.department,n.cluster,s.month,s.year FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id WHERE s.nurse_id <> 0";
        if (nurse != "") {
            sql = sql + " AND n.nurse = '" + nurse + "'";
        }
        if (department != "") {
            sql = sql + " AND n.department = '" + department + "'";
        }
        if (cluster != "") {
            sql = sql + " AND n.cluster = '" + cluster + "'";
        }
        if (month != "") {
            sql = sql + " AND s.month = " + month + "";
        }
        if (year != "") {
            sql = sql + " AND s.year = " + year + "";
        }
        sql = sql + " GROUP BY month,year,nurse_id LIMIT 10 OFFSET " + page;
        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_daily = function (month, day, year, filter, cluster) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT n.nurse,n.department,s.schedule FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id  WHERE s.month=? AND s.day=? AND s.year=?";
        if (filter != "") {
            sql = sql + " AND s.schedule='" + filter + "'";
        }
        if (cluster != "") {
            sql = sql + " AND n.cluster='" + cluster + "'";
        }
        sql = sql + " ORDER BY n.department,n.nurse ASC";

        con.query(sql, [month, day, year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_weekly_count = function (start, end, month, year, filter, cluster) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT COUNT(n.id) as 'COUNT' FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id  WHERE s.day>=? AND s.day<=? AND s.month=? AND s.year=?";
        if (filter != "") {
            sql = sql + " AND s.schedule='" + filter + "'";
        }
        if (cluster != "") {
            sql = sql + " AND n.cluster='" + cluster + "'";
        }
        sql = sql + " ORDER BY n.department,n.nurse,s.day ASC LIMIT 1";

        con.query(sql, [start, end, month, year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}


exports.load_nurse_weekly = function (start, end, month, year, cluster) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT n.nurse,n.department,n.cluster,s.day,s.month,s.year,s.schedule FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id  WHERE s.day>=? AND s.day<=? AND s.month=? AND s.year=? AND n.cluster=? ORDER BY n.department,n.nurse,s.day ASC";
        con.query(sql, [start, end, month, year, cluster], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_monthly_count = function (month, year, filter, cluster) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT COUNT(n.id) as 'COUNT' FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id  WHERE s.month=? AND s.year=?";
        if (filter != "") {
            sql = sql + " AND s.schedule = '" + filter + "'";
        }
        if (cluster != "") {
            sql = sql + " AND n.cluster='" + cluster + "'";
        }
        sql = sql + " ORDER BY n.department,n.nurse,s.day ASC LIMIT 1";

        con.query(sql, [month, year], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.load_nurse_monthly = function (month, year, cluster) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT n.nurse,n.department,s.day,s.schedule FROM nurse_schedule s LEFT JOIN nurse n ON n.id = s.nurse_id  WHERE s.month=? AND s.year=? AND n.cluster=? ORDER BY n.department,n.nurse,s.day ASC";

        con.query(sql, [month, year, cluster], function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.selectize_nurse = function () {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT DISTINCT nurse FROM nurse";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.selectize_department = function () {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT DISTINCT department FROM nurse";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.selectize_cluster = function () {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT DISTINCT cluster FROM nurse";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.selectize_subject = function () {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT DISTINCT subject FROM announcement";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

exports.selectize_message = function () {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT DISTINCT body FROM announcement";

        con.query(sql, function (err, result, fields) {
            if (err) reject("ERROR " + err);

            resolve(result);
        });
    });
}

