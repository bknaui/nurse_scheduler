let schedule_month_year = "";
let uploaded_deparment = "";

$(document).ready(function () {

    loadFilters();
    getNurseSchedulesCount(0);
    $("#btn_print").click(function () {

    });
    $("#btn_download").click(function () {
        window.open("http://localhost:3000/api/download");
    });


    $("#file_upload").change(function (e) {
        readExcelFile(e);
    });

    $('body').click(function (evt) {
        if (evt.target.id == "user_img" || $(evt.target).closest('#user_img').length) {
            $(".user-container").toggleClass("active");
            return;
        }

        $(".user-container").removeClass("active");
    });

    $("#btn_upload").click(function () {
        $("#upload_modal").modal();
    });

    $("#btn_announcement").click(function () {
        $("#announcement_modal").modal();
    });

    $("#btn_signout").click(function () {
        location.replace('http://localhost:3000');
    });

    $("#btn_save").click(function () {
        const nurse_schedules = [];
        let department = "";
        $("#table_tbody tr").each(function () {
            const row = $(this);
            const month = getIntByMonth(($("#excel_date").html() + "").split(" ")[0]);
            const year = parseInt(($("#excel_date").html() + "").split(" ")[1]);
            const name = row.find("td:eq(0)").html();
            if (row.find("td:eq(1)").html() == "") {
                department = name;
            } else {
                const dates = [];
                for (let i = 1; i <= 31; i++) {
                    const schedule = row.find("td:eq(" + i + ")").html();
                    dates.push({ day: i, schedule: schedule });
                }

                const data = {
                    name: name,
                    department: department,
                    cluster: $("#excel_cluster").html(),
                    month: month,
                    year: year,
                    dates: dates
                };

                nurse_schedules.push(data);
            }

        }).promise().done(function () {
            uploadSchedules(nurse_schedules);
        });
    });


    //modal behavior handler
    $('#upload_modal,#nurse_schedules_modal').on('hidden.bs.modal', function () {
        if ($('.modal:visible').length)
            $('body').addClass('modal-open');

        $("#file_upload").val("");
    });
});

function getNurseSchedulesCount(selected_page) {
    const search_nurse = $("#search_nurse").val();
    const search_department = $("#search_department").val();
    const search_month = $("#search_month").val();
    const search_year = $("#search_year").val();

    fetch("api/get_nurse_schedules_count?nurse=" + search_nurse +
        "&department=" + search_department +
        "&month=" + search_month +
        "&year=" + search_year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            $(".pagination-holder").pagination({
                items: data.length,
                itemsOnPage: 10,
                setOnClick: false,
                cssStyle: 'light-theme',

                onPageClick: function (page, event) {
                    event.preventDefault();
                    loadNurseSchedules(page - 1);
                }
            });
            loadNurseSchedules(selected_page);
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function loadNurseSchedules(selected_page) {
    const search_nurse = $("#search_nurse").val();
    const search_department = $("#search_department").val();
    const search_cluster = $("#search_cluster").val();
    const search_month = $("#search_month").val();
    const search_year = $("#search_year").val();

    fetch("api/load_nurse_schedules?page=" + selected_page +
        "&nurse=" + search_nurse +
        "&department=" + search_department +
        "&cluster=" + search_cluster +
        "&month=" + search_month +
        "&year=" + search_year, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            $("#nurse_schedule_list").empty();
            if (data.length < 1) {
                $("#nurse_schedule_list").append("<tr class='text-center text-info font-weight-bold'><td colspan='5'><i class='fas fa-info mr-1'></i>No record found</td></tr>");
                $(".pagination-holder").addClass("d-none");
                return;
            }

            $(".pagination-holder").removeClass("d-none");

            data.forEach(it => {
                let row = "<tr>";
                row += "<td>" + it.nurse + "</td>";
                row += "<td>" + it.department + "</td>";
                row += "<td>" + it.cluster + "</td>";
                row += "<td>" + getMonthByInt(it.month) + "</td>";
                row += "<td>" + it.year + "</td>";
                row += "<td><button class='btn btn-sm btn-info' onclick='viewSchedule(" + JSON.stringify(it) + ")'><i class='fas fa-info'></i></button></td>";
                row += "</tr>";
                $("#nurse_schedule_list").append(row);
            });
        });
}

function viewSchedule(it) {
    $("#nurse_name").html(it.nurse);
    $("#nurse_department").html(it.department);
    loadCalendarSquares(it.nurse_id, it.year, it.month);
}

function uploadSchedules(nurse_schedules) {
    $("#nurse_schedules_modal").modal('hide');
    $("#loader").modal();
    fetch("api/insert_nurse_schedule", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: nurse_schedules })
    })
        .then(res => res.text())
        .then(message => {
            //PUT LOADER MODAL
            setTimeout(function () {
                $("#loader").modal('hide');
                if (message == "Successfully Uploaded") {
                    $.toast({
                        heading: 'Success',
                        text: message,
                        icon: 'info',
                        loader: true,
                        loaderBg: '#9EC600',
                        position: 'bottom-right'
                    });
                    getNurseSchedulesCount(0);
                }
                else
                    $.toast({
                        heading: 'Error',
                        text: message,
                        icon: 'error',
                        loader: true,
                        loaderBg: '#9EC600',
                        position: 'bottom-right'
                    });
            }, 1000)
        });
}

function readExcelFile(e) {
    $("#upload_modal").modal('hide');

    var files = e.target.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });

        let isWeekdayDone = false;
        let nurse_list = [];
        let nurse_schedules = { department: "", nurses: [] };
        let isDone = false;

        for (let i = 0; i < workbook.SheetNames.length; i++) {
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[i]]);
            for (let xl_row in XL_row_object) {
                const data = XL_row_object[xl_row];
                if (!isDone) {
                    if (data.__rowNum__ == 7) {
                        let schedule = (data.__EMPTY).split(" ");
                        $("#excel_date").html(schedule[schedule.length - 2] + " " + schedule[schedule.length - 1]);
                    }
                    if (data.__rowNum__ == 9) {
                        let cluster = (data.__EMPTY).split(":")[1];
                        $("#excel_cluster").html(cluster.trim());
                    }
                    if (isWeekdayDone) {
                        if (!data.hasOwnProperty('__EMPTY_1') && !data.hasOwnProperty('__EMPTY_5')) {
                            if (nurse_schedules.nurses.length > 0) {
                                nurse_list.push(nurse_schedules);
                                nurse_schedules = { department: "", nurses: [] };
                            }

                            if ((data.__EMPTY + "").toUpperCase().trim() == "PREPARED BY:") {
                                isDone = true;
                            } else if (!isDone) {
                                nurse_schedules.department = (data.__EMPTY + "").toUpperCase().trim();
                            }
                        } else {
                            nurse_schedules.nurses.push(data);
                        }
                    }
                    else if (data.__rowNum__ == 11) {
                        isWeekdayDone = true;
                    }
                }
            }
        }

        $("#table_tbody").empty();
        nurse_list.forEach(it => {
            let table_row = "<tr><td class='bg-dark text-white m-0 p-0'>" + it.department + "</td>";
            for (let i = 1; i <= 31; i++) {
                table_row += "<td class='m-0 p-0'></td>";
            }
            table_row += "</tr>";

            $("#table_tbody").append(table_row);


            const data = it.nurses;

            data.forEach(nurse => {
                table_row = "<tr>";
                let index = 0;
                nurse_loop:
                for (let nurse_obj in nurse) {
                    table_row += "<td class='m-0 p-0'>" + nurse[nurse_obj] + "</td>"
                    index++;
                    if (index == 32) break nurse_loop;
                }
                table_row += "</tr>";
                $("#table_tbody").append(table_row);
            });
        });

        $("#nurse_schedules_modal").modal();
    };
    reader.readAsArrayBuffer(f);
}

function loadCalendarSquares(id, year, month) {
    fetch("api/load_nurse_schedule?nurse_id=" + id +
        "&year=" + year +
        "&month=" + month, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            $(".bg-primary text-white").removeClass("bg-primary text-white");
            $("#calendar_title").html(getMonthByInt(month) + " " + year);

            $("#column_1").children().not(':first-child').remove();
            $("#column_2").children().not(':first-child').remove();
            $("#column_3").children().not(':first-child').remove();
            $("#column_4").children().not(':first-child').remove();
            $("#column_5").children().not(':first-child').remove();
            $("#column_6").children().not(':first-child').remove();
            $("#column_7").children().not(':first-child').remove();

            const firstDayOfMonth = moment(year + "-" + month + "-01", "YYYY-MM-DD")
            const lastDayOfMonth = parseInt(moment(year + "-" + month + "-01").endOf('month').format('DD'));
            const current = firstDayOfMonth.format('dddd');

            let current_column = getColumnByName(current);
            let day = 1;

            for (let row = 1; row <= 6; row++) {
                for (let column = 1; column <= 7; column++) {
                    let date = day;

                    let div = "<div class='border-1 calendar-date'>";
                    if (column == 7) {
                        div = "<div class='border-7 calendar-date'>";
                    }
                    if ((column != current_column && day == 1) || (day) == lastDayOfMonth + 1) {
                        div = "<div class='border-1 calendar-date text-transparent'>";
                        if (column == 7) {
                            div = "<div class='border-7 calendar-date text-transparent'>";
                        }
                        div += "<div class='text-right text-transparent p-1'>_</div>";
                    }
                    else {
                        div += "<div class='text-right p-1' id='schedule_" + date + "_container'>" + date + "</div>";
                        day++;
                    }

                    div += "<div class='text-center pb-2 font-weight-bold'>";
                    div += "<div class-text-center>RD</div>";
                    div += "</div></div>";

                    $("#column_" + column).append(div);
                }
            }

            data.forEach(it => {
                $("#schedule_" + it.day + "_container").next().children().eq(0).html(it.schedule);
            });
            $("#detail_modal").modal();
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function getIntByMonth(month) {
    switch (month) {
        case "JANUARY":
            return 1;
        case "FEBRUARY":
            return 2;
        case "MARCH":
            return 3;
        case "APRIL":
            return 4;
        case "MAY":
            return 5;
        case "JUNE":
            return 6;
        case "JULY":
            return 7;
        case "AUGUST":
            return 8;
        case "SEPTEMBER":
            return 9;
        case "OCTOER":
            return 10;
        case "NOVEMBER":
            return 11;
        case "DECEMBER":
            return 12;
        default: return -1;
    }
}

function getMonthByInt(month) {
    switch (month) {
        case 1:
            return "January";
        case 2:
            return "February";
        case 3:
            return "March";
        case 4:
            return "April";
        case 5:
            return "May";
        case 6:
            return "June";
        case 7:
            return "July";
        case 8:
            return "August";
        case 9:
            return "September";
        case 10:
            return "October";
        case 11:
            return "November";
        case 12:
            return "December";
        default: return "ERROR";
    }
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

