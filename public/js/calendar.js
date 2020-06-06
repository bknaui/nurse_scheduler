let $selected_date = "";

$(document).ready(function () {

    let year = parseInt(moment().format("YYYY"));
    let month = parseInt(moment().format("MM"));

    loadCalendarSquares(year, month);

    $(".btn-info").click(function () {
        $("#detail_modal").modal();
    });

    $("#today_month").click(function () {
        year = parseInt(moment().format("YYYY"));
        month = parseInt(moment().format("MM"));

        loadCalendarSquares(year, month);
    });

    $("#prev_month").click(function () {
        if (month == 1) {
            month = 12;
            year--;
        } else {
            month--;
        }

        loadCalendarSquares(year, month);
    });

    $("#next_month").click(function () {
        if (month == 12) {
            month = 1;
            year++;
        } else {
            month++;
        }
        loadCalendarSquares(year, month);
    });

    $("body").on("click", ".calendar-date", function () {
        const date = $(this).children().eq(0);

        if (date.html() == "_") return;

        $selected_date = $(this);
        $("#assign_nurse_modal").modal();
    });

    $("#btn_save_assign").click(function () {
        $selected_date.addClass("bg-primary text-white");
        $("#assign_nurse_modal").modal('hide');
    });
});

function loadCalendarSquares(year, month) {
    $(".bg-primary text-white").removeClass("bg-primary text-white");
    $("#calendar_title").html(getCalendarTitle(year, month));

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
            let div = "<div class='border border-secondary calendar-date'>";
            if ((column != current_column && day == 1) || (day) == lastDayOfMonth + 1) {
                div += "<div class='text-right text-white p-1' id='" + row + "x" + column + "'>_</div>";
            }
            else {
                div += "<div class='text-right p-1' id='" + row + "x" + column + "'>" + date + "</div>";
                day++;
            }

            div += "<div class='text-center pb-4 pt-4' id='event_" + row + "x" + column + "'>";
            div += "</div></div>";

            $("#column_" + column).append(div);
        }
    }
}

function getCalendarTitle(year, month) {
    switch (month) {
        case 1:
            return "January " + year;
        case 2:
            return "February " + year;
        case 3:
            return "March " + year;
        case 4:
            return "April " + year;
        case 5:
            return "May " + year;
        case 6:
            return "June " + year;
        case 7:
            return "July " + year;
        case 8:
            return "August " + year;
        case 9:
            return "September " + year;
        case 10:
            return "October " + year;
        case 11:
            return "November " + year;
        case 12:
            return "December " + year;
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