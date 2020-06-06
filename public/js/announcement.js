$(document).ready(function () {

    getAnnouncementCount(0);
    loadFilters();
    $("#announcement_date").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        format: "mm/dd/yyyy",
        autoUpdateInput: false
    });

    $('#announcement_date').on('apply.daterangepicker', function (ev, picker) {
        const selected_date = picker.startDate.format('MM/DD/YYYY');
        $(this).val(selected_date);
    });

    $("#announcement_body").keypress(function (event) {
        if (event.charCode == 13) {
            let value = $(this).val();
            $(this).val(value + "</br>");
            alert($(this).val());
        }

    });

    $("#btn_post").click(function () {
        $("#post_announcement_modal").modal();
    });

    $("#btn_save").click(function () {
        const announcement_subject = $("#announcement_subject").val();
        const announcement_date = $("#announcement_date").val();
        const announcement_body = $("#announcement_body").val();

        if(announcement_subject == "" || announcement_date == "" || announcement_body == ""){
            alert("Please fill in blank fields.");
            return;
        }

        $("#post_announcement_modal").modal('hide');
        $("#loader").modal();
        fetch("api/insert_announcement", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                announcement_subject: announcement_subject,
                announcement_date: announcement_date,
                announcement_body: announcement_body
            })
        })
            .then(res => res.json())
            .then(data => {
                setTimeout(function () {
                    $("#loader").modal('hide');
                    $.toast({
                        heading: 'Success',
                        text: "Uploaded successfully",
                        icon: 'info',
                        loader: true,
                        loaderBg: '#9EC600',
                        position: 'bottom-right'
                    });

                    getAnnouncementCount(0);
                    loadFilters();
                }, 1000)

            });
    });

});

function getAnnouncementCount(selected_page) {
    const search_subject = $("#search_subject").val();
    const search_message = $("#search_message").val();
    const search_date = $("#search_date").val();


    fetch("api/get_announcements_count?subject=" + search_subject +
        "&message=" + search_message +
        "&date=" + search_date, {
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
                    loadAnnouncement(page - 1);
                }
            });

            loadAnnouncement(selected_page);
        })
        .catch(err => {
            console.log("ERROR " + err);
        });
}

function loadAnnouncement(selected_page) {
    const search_subject = $("#search_subject").val();
    const search_message = $("#search_message").val();
    const search_date = $("#search_date").val();

    fetch("api/load_announcements?page=" + selected_page +
        "&subject=" + search_subject +
        "&message=" + search_message +
        "&date=" + search_date, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            $("#announcement_list").empty();
            if (data.length < 1) {
                $("#announcement_list").append("<tr class='text-center text-info font-weight-bold'><td colspan='5'><i class='fas fa-info mr-1'></i>No record found</td></tr>");
                $(".pagination-holder").addClass("d-none");
                return;
            }

            $(".pagination-holder").removeClass("d-none");

            data.forEach(it => {
                let row = "<tr>";
                row += "<td>" + it.subject + "</td>";
                row += "<td>" + it.body + "</td>";
                row += "<td>" + it.date_announcement + "</td>";
                row += "</tr>";
                $("#announcement_list").append(row);
            });
        });
}
