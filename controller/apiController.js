const api = require('../api/api');
const Nurse = require('../model/Nurse');
const moment = require('moment');

exports.download_template = function (req, res) {
    const file = "./public/file/STAFFING_SCHEDULE_TEMPLATE.xlsx";
    res.download(file);
}

exports.insert_announcement = async function (req, res) {
    try {
        const result = await api.insert_announcement(req.body.announcement_subject, req.body.announcement_date, req.body.announcement_body);
        res.send(result);
    } catch (err) {
        throw err;
    }
}
exports.get_announcements_count = async function (req, res) {
    try {
        const result = await api.get_announcements_count(req.query.subject, req.query.message, req.query.date);
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.load_announcements = async function (req, res) {
    try {
        const result = await api.load_announcements(req.query.subject, req.query.message, req.query.date, req.query.page * 10);
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.insert_nurse_schedule = async function (req, res) {
    try {
        let nurse_list = req.body.data;

        if (nurse_list.length < 1) {
            res.send("No data found");
            return;
        }

        let check_if_already_uploaded = await api.check_if_already_uploaded(nurse_list[0].cluster, nurse_list[0].month, nurse_list[0].year);
        if (check_if_already_uploaded.length > 0) {
            res.send("Schedule for this month is already uploaded");
            return;
        }

        for (let i = 0; i < nurse_list.length; i++) {
            let nurse = new Nurse();
            nurse.setName(nurse_list[i].name);
            nurse.setDepartment(nurse_list[i].department);
            nurse.setCluster(nurse_list[i].cluster);
            nurse.setMonth(nurse_list[i].month);
            nurse.setYear(nurse_list[i].year);

            const schedule_dates = nurse_list[i].dates;
            const result = await api.insert_nurse(nurse);
            nurse.setId(result.insertId);

            for (let j = 0; j < schedule_dates.length; j++) {
                nurse.setDay(schedule_dates[j].day);
                nurse.setSchedule(schedule_dates[j].schedule);

                await api.insert_nurse_schedule(nurse);
            }
        }

        res.send("Successfully Uploaded");
    } catch (err) {
        throw err;
    }
}

exports.load_nurse = async function (req, res) {
    try {
        const result = await api.load_nurse(req.query.nurse, req.query.department, req.query.page * 10);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.load_nurse_daily = async function (req, res) {
    try {
        const result = await api.load_nurse_daily(req.query.month, req.query.day, req.query.year, req.query.filter, req.query.cluster);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.load_nurse_weekly = async function (req, res) {
    try {
        const size = await api.load_nurse_weekly_count(req.query.start, req.query.end, req.query.month, req.query.year, req.query.filter, req.query.cluster);
        if (size[0].COUNT < 1) {
            res.send([]);
        } else {
            const result = await api.load_nurse_weekly(req.query.start, req.query.end, req.query.month, req.query.year, req.query.cluster);
            const custom_result = [];
            let isFirstRun = true;

            let nurse_json = { nurse: "", department: "", schedules: [] };
            result.forEach(it => {
                let isExists = false;
                let schedule_value = it.schedule;
                if (req.query.filter != "") {
                    if (req.query.filter == it.schedule) {
                        schedule_value = it.schedule;
                        isExists = true;
                    } else {
                        schedule_value = "";
                    }
                }
                else {
                    isExists = true;
                }
                const weekday = moment(it.month + "-" + it.day + "-" + it.year, "MM-DD-YYYY").format("dddd");
                if (isFirstRun) {
                    isFirstRun = false;
                    nurse_json.nurse = it.nurse;
                    nurse_json.department = it.department;
                    nurse_json.schedules.push({ day: weekday, schedule: schedule_value });
                } else if (nurse_json.nurse == it.nurse) {
                    nurse_json.schedules.push({ day: weekday, schedule: schedule_value });
                } else {
                    if (isExists) {
                        custom_result.push(nurse_json);
                        nurse_json = { nurse: "", department: "", schedules: [] };
                        nurse_json.nurse = it.nurse;
                        nurse_json.department = it.department;
                        nurse_json.schedules.push({ day: weekday, schedule: schedule_value });
                    }
                }
            });

            if (nurse_json.schedules.length > 0) {
                custom_result.push(nurse_json);
            }

            res.send(custom_result);
        }
    } catch (err) {
        console.log(err);
    }
}

exports.load_nurse_monthly = async function (req, res) {
    try {
        const size = await api.load_nurse_monthly_count(req.query.month, req.query.year, req.query.filter, req.query.cluster);
        if (size[0].COUNT < 1) {
            console.log(size[0].COUNT);
            res.send([]);
        } else {
            const result = await api.load_nurse_monthly(req.query.month, req.query.year, req.query.cluster);
            const custom_result = [];
            let isFirstRun = true;
            let nurse_json = { nurse: "", department: "", schedules: [] };
            result.forEach(it => {
                let isExists = false;
                let schedule_value = it.schedule;
                if (req.query.filter != "") {
                    if (req.query.filter == it.schedule) {
                        schedule_value = it.schedule;
                        isExists = true;
                    } else {
                        schedule_value = "";
                    }
                } else {
                    isExists = true;
                }

                if (isFirstRun) {
                    isFirstRun = false;
                    nurse_json.nurse = it.nurse;
                    nurse_json.department = it.department;
                    nurse_json.schedules.push({ day: it.day, schedule: schedule_value });
                } else if (nurse_json.nurse == it.nurse) {
                    nurse_json.schedules.push({ day: it.day, schedule: schedule_value });
                } else {
                    if (isExists) {
                        custom_result.push(nurse_json);
                        nurse_json = { nurse: "", department: "", schedules: [] };
                        nurse_json.nurse = it.nurse;
                        nurse_json.department = it.department;
                        nurse_json.schedules.push({ day: it.day, schedule: schedule_value });
                    }
                }
            });

            if (nurse_json.schedules.length > 0) {
                custom_result.push(nurse_json);
            }

            res.send(custom_result);
        }
    } catch (err) {
        console.log(err);
    }
}

exports.load_nurse_count = async function (req, res) {
    try {
        const result = await api.load_nurse_count();
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.get_current_announcement_count = async function (req, res) {
    try {
        const result = await api.get_current_announcement_count(req.query.month, req.query.year);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.get_announcements = async function (req, res) {
    try {
        const result = await api.get_announcements(req.query.month, req.query.year);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}




exports.load_nurse_schedule = async function (req, res) {
    try {
        const result = await api.load_nurse_schedule(req.query.nurse_id, req.query.month, req.query.year);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.get_nurse_schedules_count = async function (req, res) {
    try {
        const result = await api.get_nurse_schedules_count(req.query.nurse, req.query.department, req.query.month, req.query.year);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}

exports.load_nurse_schedules = async function (req, res) {
    try {
        const result = await api.load_nurse_schedules(req.query.nurse, req.query.department, req.query.cluster, req.query.month, req.query.year, req.query.page * 10);
        res.send(result);
    } catch (err) {
        console.log(err);
    }
}


exports.selectize_nurse = async function (req, res) {
    try {
        const result = await api.selectize_nurse();
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.selectize_department = async function (req, res) {
    try {
        const result = await api.selectize_department();
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.selectize_cluster = async function (req, res) {
    try {
        const result = await api.selectize_cluster();
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.selectize_subject = async function (req, res) {
    try {
        const result = await api.selectize_subject();
        res.send(result);
    } catch (err) {
        throw err;
    }
}

exports.selectize_message = async function (req, res) {
    try {
        const result = await api.selectize_message();
        res.send(result);
    } catch (err) {
        throw err;
    }
}