let timer = 0;

let weeks_in_month;
let current_selected_week_in_month = 1;

let selected_date;

let selected_week_startday = 1;
let selected_week_endday = 1;
let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let filter = "";
let cluster = "CLUSTER I";
let selected_filter_type = 0;

const CURRENT_DATE = moment();
const MINUTE = 1;
const CHECK_INTERVAL = (60000 * MINUTE);

// let selected_month = CURRENT_DATE.format("MMMM");
// let selected_year = parseInt(CURRENT_DATE.format("YYYY"));

$(document).ready(function () {
    startDateTime();
    $("#calendar_title").html(CURRENT_DATE.format("MMMM") + " " + CURRENT_DATE.format("YYYY"));
    displayCalendar(CURRENT_DATE.format("M"), CURRENT_DATE.format("YYYY"));

    checkNewAnnouncement();

    $("#filter_modal").on('hidden.bs.modal', function (e) {
        $("#filter_modal").modal('hide');
        $("#nurse_list_modal").modal();
    });

    $("#btn_filter").click(function () {
        $("#nurse_list_modal").modal('hide');
        $("#filter_modal").modal();
    });

    $("#btn_today").click(function () {
        if ($(this).hasClass("btn-dark")) return;
        const new_moment = moment();
        const month_name = new_moment.format("MMMM");
        const month = new_moment.format("M");
        const year = parseInt(new_moment.format("YYYY"));

        $("#btn_today").addClass("btn-dark");
        $("#btn_today").removeClass("btn-secondary");

        $("#calendar_title").html(month_name + " " + year);
        checkNewAnnouncement();
        displayCalendar(month, year);
    });


    $("#daily_caret_left").click(function () {
        const daily_moment = moment($("#daily_title").html(), "MMMM D, YYYY");
        const new_moment = daily_moment.subtract(1, "days");

        const month = new_moment.format("M");
        const day = new_moment.format("D");
        const year = new_moment.format("YYYY");

        $("#daily_title").html(new_moment.format("MMMM D, YYYY"));
        fetchDaily(month, day, year);
    });

    $("#daily_caret_right").click(function () {
        const daily_moment = moment($("#daily_title").html(), "MMMM D, YYYY");
        const new_moment = daily_moment.add(1, "days");

        const month = new_moment.format("M");
        const day = new_moment.format("D");
        const year = new_moment.format("YYYY");

        $("#daily_title").html(new_moment.format("MMMM D, YYYY"));
        fetchDaily(month, day, year);
    });

    $("#calendar_caret_right").click(function () {
        const calendar_moment = moment($("#calendar_title").html(), "MMMM YYYY");
        const new_moment = calendar_moment.add(1, "M");
        const month_name = new_moment.format("MMMM");
        const month = new_moment.format("M");
        const year = parseInt(new_moment.format("YYYY"));
        const current_month = moment().format("MMMM");
        const current_year = moment().format("YYYY");

        if (month_name == current_month && year == current_year) {
            $("#btn_today").addClass("btn-dark");
            $("#btn_today").removeClass("btn-secondary");
        } else {
            $("#btn_today").removeClass("btn-dark");
            $("#btn_today").addClass("btn-secondary");
        }

        $("#calendar_title").html(month_name + " " + year);
        checkNewAnnouncement();
        displayCalendar(month, year);
    });

    $("#calendar_caret_left").click(function () {
        const calendar_moment = moment($("#calendar_title").html(), "MMMM YYYY");
        const new_moment = calendar_moment.subtract(1, "M");
        const month_name = new_moment.format("MMMM");
        const month = new_moment.format("M");
        const year = new_moment.format("YYYY");
        const current_month = moment().format("MMMM");
        const current_year = moment().format("YYYY");

        if (month_name == current_month && year == current_year) {
            $("#btn_today").addClass("btn-dark");
            $("#btn_today").removeClass("btn-secondary");
        } else {
            $("#btn_today").removeClass("btn-dark");
            $("#btn_today").addClass("btn-secondary");
        }

        $("#calendar_title").html(month_name + " " + year);
        checkNewAnnouncement();
        displayCalendar(month, year);
    });

    $("#month_caret_left").click(function () {
        const new_moment = selected_date.subtract(1, "M");
        const month_name = new_moment.format("MMMM");
        const month = new_moment.format("M");
        const year = new_moment.format("YYYY");

        $("#monthly_title").html(month_name + " " + year);
        fetchMonthly(month, year);

    });

    $("#month_caret_right").click(function () {
        const new_moment = selected_date.add(1, "M");
        const month_name = new_moment.format("MMMM");
        const month = new_moment.format("M");
        const year = new_moment.format("YYYY");

        $("#monthly_title").html(month_name + " " + year);
        fetchMonthly(month, year);
    });

    $("#btn_view_announcement").click(function () {
        const current_moment = moment($("#calendar_title").html(), "MMMM YYYY");
        const month = current_moment.format("MM");
        const year = current_moment.format("YYYY");

        $("#announcements_modal").modal();
        $("#announcement_loader").removeClass("d-none");
        $("#announcement_list").addClass("d-none");
        fetch("api/get_announcements?month=" + month +
            "&year=" + year, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                $("#announcement_list").empty();
                $("#announcement_list").removeClass("d-none");
                $("#announcement_loader").addClass("d-none");
                if (data.length < 1) {
                    $("#announcement_list").append("<div class='p-3 text-secondary text-center'><i class='fa fa-info-circle mr-1'></i>No announcements for this month</div>");
                    return;
                }
                data.forEach(it => {
                    let announcement_item = "<div class='card p-2 m-2'>";
                    announcement_item += "<div class='d-flex justify-content-between'>";
                    announcement_item += "<div class='announcement-header'>" + it.subject + "</div>";

                    if (moment().format("MM/DD/YYYY") <= it.date_announcement)
                        announcement_item += "<div><span class='badge badge-danger'>New</span></div>";

                    announcement_item += "</div>";
                    announcement_item += "<div class='announcement-body'>" + it.body + "</div>";
                    announcement_item += "<div class='announcement-footer'>" + it.date_announcement + "</div>"
                    announcement_item += "</div>";

                    $("#announcement_list").append(announcement_item);
                });
            })
            .catch(err => {
                console.log("ERROR " + err);
            });
    });

    $("body").on("click", ".calendar-date", function () {
        const day = $(this).children().eq(0).html();
        selected_date = moment($("#calendar_title").html() + " " + day, "MMMM YYYY DD");
        cluster = "CLUSTER I";
        filter = "";

        const month_name = selected_date.format("MMMM");
        const month = selected_date.format("M");
        const year = selected_date.format("YYYY");


        $(".table-schedule").addClass("d-none");
        $("#daily_table").removeClass("d-none");
        $("#weekly_table").add("d-none");
        $("#monthly_table").addClass("d-none");
        $("#daily_title").html(month_name + " " + day + ", " + year);

        $(".btn-filter").removeClass("btn-dark");
        $(".btn-filter").addClass("btn-secondary");
        $(".btn-shift").removeClass("btn-dark");
        $(".btn-shift").addClass("btn-secondary");
        $(".btn-cluster").removeClass("btn-dark");
        $(".btn-cluster").addClass("btn-secondary");
        $(".btn-filter:eq(0)").addClass("btn-dark");
        $(".btn-cluster:eq(0)").addClass("btn-dark");

        fetchDaily(month, day, year);
    });

    $("#btn_weekly_left").click(function () {
        if (current_selected_week_in_month == 1) return;
        $("#weekly_indicator").html("Week " + (--current_selected_week_in_month));

        selected_week_startday -= 7;
        selected_week_endday -= 7;

        const month = selected_date.format("M");
        const year = selected_date.format("YYYY");

        fetchWeekly(month, year)
    });
    $("#btn_weekly_right").click(function () {
        const end = selected_date.endOf('month');
        const start = selected_date.startOf('month');
        console.log(start);
        console.log(end);

        const weeks_in_month = moment(moment().endOf('month') - moment().startOf('month')).weeks();

        if (current_selected_week_in_month == weeks_in_month) return;
        $("#weekly_indicator").html("Week " + (++current_selected_week_in_month));

        selected_week_startday = selected_week_endday + 1;
        selected_week_endday += 7;

        const month = selected_date.format("M");
        const year = selected_date.format("YYYY");

        fetchWeekly(month, year)
    });

    $(".btn-cluster").click(function () {
        $(".btn-cluster").removeClass("btn-dark");
        $(".btn-cluster").addClass("btn-secondary");

        $(this).addClass("btn-dark");
        cluster = $(this).val();

        const month = selected_date.format("M");
        const day = parseInt(selected_date.format("DD"));
        const year = selected_date.format("YYYY");

        switch (selected_filter_type) {
            case 0:
                fetchDaily(month, day, year);
                break;
            case 1:
                fetchWeekly(month, year)
                break;
            case 2:
                fetchMonthly(month, year);
                break;
        }
    });

    $(".btn-shift").click(function () {
        const isSelected = $(this).hasClass("btn-dark");

        $(".btn-shift").removeClass("btn-dark");
        $(".btn-shift").addClass("btn-secondary");

        if (!isSelected) {
            $(this).addClass("btn-dark");
            filter = $(this).html();
        } else
            filter = "";

        const month = selected_date.format("M");
        const day = parseInt(selected_date.format("DD"));
        const year = selected_date.format("YYYY");

        switch (selected_filter_type) {
            case 0:
                fetchDaily(month, day, year);
                break;
            case 1:
                fetchWeekly(month, year)
                break;
            case 2:
                fetchMonthly(month, year);
                break;
        }
    });

    $(".btn-filter").click(function () {
        $(".btn-filter").removeClass("btn-dark");
        $(".btn-filter").addClass("btn-secondary");

        $(this).addClass("btn-dark");

        selected_date = moment($("#daily_title").html(), "MMMM DD YYYY");

        const month_name = selected_date.format("MMMM");
        const month = selected_date.format("M");
        const day = parseInt(selected_date.format("DD"));
        const year = selected_date.format("YYYY");

        switch ($(this).html()) {
            case "Daily":
                selected_filter_type = 0;

                $(".table-schedule").addClass("d-none");
                $("#daily_table").removeClass("d-none");

                fetchDaily(month, day, year);
                break;
            case "Weekly":


                selected_filter_type = 1;
                selected_week_startday = 1;
                current_selected_week_in_month = 1;

                const dt = moment(year + "-" + month + "-" + selected_week_startday, "YYYY-MM-D").format("dddd").substr(0, 3);
                selected_week_endday = (weekdays.length - (weekdays.indexOf(dt) + 1)) + selected_week_startday;

                $("#weekly_title").html(month_name + " " + year);
                $("#weekly_indicator").html("Week " + current_selected_week_in_month);

                fetchWeekly(month, year);
                break;
            case "Monthly":
                selected_filter_type = 2;

                $("#monthly_title").html(month_name + " " + year);
                $(".table-schedule").addClass("d-none");
                $("#monthly_table").removeClass("d-none");

                fetchMonthly(month, year);
                break;
        }
    });

});

function fetchDaily(month, day, year) {
    const isShown = ($("#filter_modal").data('bs.modal') || {})._isShown;
    if (!isShown || isShown === undefined) {
        $("#nurse_list_modal").modal();
    }

    fetch("api/load_nurse_daily?month=" + month +
        "&filter=" + filter +
        "&cluster=" + cluster +
        "&day=" + day +
        "&year=" + year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            let department = "";
            $("#daily_tbody").empty();
            if (data.length < 1) {
                $("#daily_tbody").append("<tr class='bg-secondary text-white font-weight-bold'><td class='p-3' colspan='2'>No Record Found</td></tr>");
                return;
            }
            data.forEach(it => {
                if (department != it.department) {
                    department = it.department;
                    $("#daily_tbody").append("<tr class='bg-dark text-white font-weight-bold'><td>" + it.department + "</td><td></td></tr>");
                    $("#daily_tbody").append("<tr><td class='text-left'>" + it.nurse + "</td><td>" + it.schedule + "</td></tr>");
                } else {
                    $("#daily_tbody").append("<tr><td class='text-left'>" + it.nurse + "</td><td>" + it.schedule + "</td></tr>");
                }
            });
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function fetchWeekly(month, year) {
    const isShown = ($("#filter_modal").data('bs.modal') || {})._isShown;
    if (!isShown || isShown === undefined) {
        $("#nurse_list_modal").modal();
    }

    fetch("api/load_nurse_weekly?start=" + selected_week_startday +
        "&end=" + selected_week_endday +
        "&filter=" + filter +
        "&cluster=" + cluster +
        "&month=" + month +
        "&year=" + year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $(".table-schedule").addClass("d-none");
            $("#weekly_table").removeClass("d-none");
            $("#weekly_tbody").empty();
            if (data.length < 1) {
                $("#weekly_tbody").append("<tr class='bg-secondary text-white font-weight-bold'><td class='p-3' colspan='8'>No Record Found</td></tr>");
                return;
            }

            let department = "";
            data.forEach(it => {

                if (department != it.department) {
                    department = it.department;
                    $("#weekly_tbody").append("<tr class='bg-dark text-white text-center font-weight-bold m-0 p-0'><td class='m-0 pt-0 pb-0 pr-0 pl-1' colspan='8'>" + it.department + "</td></tr>");
                } else {
                    let table_row = "<tr class='text-left m-0 p-0'><td class='m-0 pt-0 pb-0 pr-0 pl-1' style='width:38%'>" + it.nurse + "</td>";
                    if (it.schedules.length < 7 && it.schedules.length > 0) {
                        const weekdays_looper = weekdays.indexOf(it.schedules[0].day.substr(0, 3));
                        for (let i = 0; i < weekdays_looper; i++) {
                            table_row += "<td class='text-center m-0 p-0' style='width:2%'></td>";
                        }
                    }

                    it.schedules.forEach(schedule => {
                        table_row += "<td class='text-center m-0 p-0' style='width:2%'>" + schedule.schedule + "</td>";
                    });

                    table_row += "</tr>";
                    $("#weekly_tbody").append(table_row);
                }
            });
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function fetchMonthly(month, year) {
    const isShown = ($("#filter_modal").data('bs.modal') || {})._isShown;
    if (!isShown || isShown === undefined) {
        $("#nurse_list_modal").modal();
    }
    fetch("api/load_nurse_monthly?month=" + month +
        "&filter=" + filter +
        "&cluster=" + cluster +
        "&year=" + year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $("#monthly_tbody").empty();
            if (data.length < 1) {
                $("#monthly_tbody").append("<tr class='bg-secondary text-white font-weight-bold'><td class='p-3' colspan='32'>No Record Found</td></tr>");
                return;
            }
            let department = "";
            data.forEach(it => {
                if (department != it.department) {
                    department = it.department;
                    $("#monthly_tbody").append("<tr class='bg-dark text-white text-center font-weight-bold m-0 p-0'><td class='m-0 pt-0 pb-0 pr-0 pl-1' style='width:38%'>" + it.department + "</td></tr>");
                    let department_row = "<tr>";
                    for (let i = 0; i < 31; i++) {
                        department_row += "<td style='width:2%'></td>";
                    }
                    department_row += "</tr>";
                } else {
                    let table_row = "<tr class='text-left m-0 p-0'><td class='m-0 pt-0 pb-0 pr-0 pl-1' style='width:38%'>" + it.nurse + "</td>";
                    it.schedules.forEach(schedule => {
                        table_row += "<td class='text-center m-0 p-0' style='width:2%'>" + schedule.schedule + "</td>";
                    });
                    table_row += "</tr>";
                    $("#monthly_tbody").append(table_row);
                }

            });
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function loadNurseCount(selected_page) {
    fetch("api/load_nurse_count", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $(".pagination-holder").pagination({
                items: data[0].COUNT,
                itemsOnPage: 10,
                setOnClick: false,
                cssStyle: 'light-theme',

                onPageClick: function (page, event) {
                    event.preventDefault();
                    loadNurses(page - 1);
                }
            });
            loadNurses(selected_page);
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function loadNurses(page) {
    const search_nurse = $("#search_nurse").val();
    const search_department = $("#search_department").val();

    fetch("api/load_nurse?page=" + page +
        "&nurse=" + search_nurse +
        "&department=" + search_department, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $("#nurse_list").empty();
            if (data.length < 1) {
                $("#nurse_list").append("<tr class='text-center font-weight-bold bg-info'><td colspan='3'>No record found</td></tr>");
                $(".pagination-holder").addClass("d-none");
                return;
            }

            $(".pagination-holder").removeClass("d-none");
            $("table").removeClass("d-none");
            $("#no_result").addClass("d-none");
            data.forEach(function (it) {
                let tr = "<tr class='p-0 m-0'>";
                tr += "<td class='p-1 m-0'><div class='d-flex justify-content-center align-items-center'>" + it.nurse + "</div></td>";
                tr += "<td class='p-1 m-0'><div class='d-flex justify-content-center align-items-center'>" + it.department + "</div></td>";
                tr += "<td class='p-1 m-0'><div class='d-flex justify-content-center align-items-center'><button class='btn btn-sm btn-info' onClick='viewSchedules(" + JSON.stringify(it.id) + "," + JSON.stringify(it.nurse) + "," + JSON.stringify(it.department) + ")'><i class='fa fa-info'></i></button></div></td>";
                tr += "</tr>";

                $("#nurse_list").append(tr);
            });
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function startDateTime() {
    const _date = moment().format("MM/DD/YYYY");
    const _time = moment().format("h:mm a");

    $("#date").html(_date);
    $("#time").html(_time);

    setTimeout(startDateTime, 1000);
}

function getColumnByName(name) {
    switch (name) {
        case "Sunday": return 1;
        case "Monday": return 2;
        case "Tuesday": return 3;
        case "Wednesday": return 4;
        case "Thursday": return 5;
        case "Friday": return 6;
        case "Saturday": return 7;
        default: return 0;
    }
}

function getValueByLabel(label) {
    for (let i = 0; i < legends.length; i++) {
        if (legends[i].label == label) {
            return legends[i].value;
        }
    }
}

function displayCalendar(month, year) {
    $(".bg-primary text-white").removeClass("bg-primary text-white");

    $("#column_1").empty();
    $("#column_2").empty();
    $("#column_3").empty();
    $("#column_4").empty();
    $("#column_5").empty();
    $("#column_6").empty();
    $("#column_7").empty();

    $("#column_1").append("<div class='border-1'>Sun</div>");
    $("#column_2").append("<div class='border-1'>Mon</div>");
    $("#column_3").append("<div class='border-1'>Tue</div>");
    $("#column_4").append("<div class='border-1'>Wed</div>");
    $("#column_5").append("<div class='border-1'>Thu</div>");
    $("#column_6").append("<div class='border-1'>Fri</div>");
    $("#column_7").append("<div class='border-1'>Sat</div>");

    const firstDayOfMonth = moment(year + "-" + month + "-01", "YYYY-MM-DD")
    const lastDayOfMonth = parseInt(moment(year + "-" + month + "-01").endOf('month').format('DD'));
    const current = firstDayOfMonth.format('dddd');

    const current_day = parseInt(moment().format("DD"));
    const current_year = parseInt(moment().format("YYYY"));
    const current_month = moment().format("M");

    let current_column = getColumnByName(current);

    let day = 1;

    for (let row = 1; row <= 6; row++) {
        for (let column = 1; column <= 7; column++) {
            let div = "<div class='border-1 calendar-date";
            if (column == 7) {
                div = "<div class='border-7 calendar-date";
            }

            if (current_day == day && current_month == month && current_year == year) {
                div += " bg-primary text-white'>";
            } else {
                div += "'>";
            }

            if (day > lastDayOfMonth || (column != current_column && day == 1)) {
                div += "<div class='text-right text-transparent p-1'>_</div>";
            }
            else {
                div += "<div class='text-right p-1 date-value'>" + day + "</div>";
                day++;
            }

            div += "<div class='text-center font-weight-bold h-100 d-flex align-items-center justify-content-center'>";
            div += "<div class='text-center font-weight-bold'></div>";
            div += "</div></div>";

            $("#column_" + column).append(div);
        }
    }
}

function checkNewAnnouncement() {
    return;
    const current_moment = moment($("#calendar_title").html(), "MMMM YYYY");
    const month = current_moment.format("MM");
    const year = current_moment.format("YYYY");

    fetch("api/get_current_announcement_count?month=" + month +
        "&year=" + year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $("#new_announcement").html("" + data[0].TOTAL);
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}