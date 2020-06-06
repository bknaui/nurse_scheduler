let search_subject;
let search_message;

$(document).ready(function () {

    $('#search_date').daterangepicker({
        opens: 'left', autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });

    $('#search_date').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        getAnnouncementCount(0);
    });

    $('#search_date').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        getAnnouncementCount(0);
    });

    let $search_subject = $('#search_subject').selectize({
        valueField: "subject",
        labelField: "subject",
        searchField: "subject",
        onChange: function (value) {
            getAnnouncementCount(0);
        }
    });

    let $search_message = $('#search_message').selectize({
        valueField: "body",
        labelField: "body",
        searchField: "body",
        onChange: function (value) {
            getAnnouncementCount(0);
        }
    });

    search_subject = $search_subject[0].selectize;
    search_message = $search_message[0].selectize;
});

function loadFilters() {
    search_subject.load(function (callback) {
        fetch("api/selectize_subject", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                callback(data);
            }).catch(err => {
                console.log(err);
            });
    });

    search_message.load(function (callback) {
        fetch("api/selectize_message", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                callback(data);
            }).catch(err => {
                console.log(err);
            });
    });
}