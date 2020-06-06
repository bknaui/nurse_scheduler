let search_nurse;
let search_department;
let search_cluster;
let search_month;
let search_year;

$(document).ready(function () {
    let $search_nurse = $('#search_nurse').selectize({
        valueField: "nurse",
        labelField: "nurse",
        searchField: "nurse",
        onChange: function (value) {
            getNurseSchedulesCount(0);
        }
    });

    let $search_department = $('#search_department').selectize({
        valueField: "department",
        labelField: "department",
        searchField: "department",
        onChange: function (value) {
            getNurseSchedulesCount(0);
        }
    });

    let $search_cluster = $('#search_cluster').selectize({
        valueField: "cluster",
        labelField: "cluster",
        searchField: "cluster",
        onChange: function (value) {
            getNurseSchedulesCount(0);
        }
    });

    let $search_month = $('#search_month').selectize({
        valueField: "value",
        labelField: "month",
        searchField: "value",
        onChange: function (value) {
            getNurseSchedulesCount(0);
        }
    });

    let $search_year = $('#search_year').selectize({
        valueField: "year",
        labelField: "year",
        searchField: "year",
        onChange: function (value) {
            getNurseSchedulesCount(0);
        }
    });

    search_nurse = $search_nurse[0].selectize;
    search_department = $search_department[0].selectize;
    search_cluster = $search_cluster[0].selectize;
    search_month = $search_month[0].selectize;
    search_year = $search_year[0].selectize;


    search_month.load(function (callback) {
        const month = [];
        month.push({ value: 1, month: "January" });
        month.push({ value: 2, month: "February" });
        month.push({ value: 3, month: "March" });
        month.push({ value: 4, month: "April" });
        month.push({ value: 5, month: "May" });
        month.push({ value: 6, month: "June" });
        month.push({ value: 7, month: "July" });
        month.push({ value: 8, month: "August" });
        month.push({ value: 9, month: "September" });
        month.push({ value: 10, month: "October" });
        month.push({ value: 11, month: "November" });
        month.push({ value: 12, month: "December" });
        callback(month);
    });

    search_year.load(function (callback) {
        const year = [];
        for (let i = 2020; i <= moment().format("YYYY"); i++) {
            year.push({ year: i });
        }
        callback(year);
    });

});

function loadFilters() {
    search_nurse.load(function (callback) {
        fetch("api/selectize_nurse", {
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

    search_department.load(function (callback) {
        fetch("api/selectize_department", {
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

    search_cluster.load(function (callback) {
        fetch("api/selectize_cluster", {
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