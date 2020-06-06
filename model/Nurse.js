class Nurse {
    constructor() { }

    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }

    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }

    setDepartment(department) {
        this.department = department;
    }
    getDepartment() {
        return this.department;
    }

    setCluster(cluster) {
        this.cluster = cluster;
    }
    getCluster() {
        return this.cluster;
    }

    setMonth(month) {
        this.month = month;
    }
    getMonth() {
        return this.month;
    }

    setDay(day) {
        this.day = day;
    }
    getDay() {
        return this.day;
    }

    setYear(year) {
        this.year = year;
    }
    getYear() {
        return this.year;
    }

    setSchedule(schedule) {
        this.schedule = schedule;
    }
    getSchedule() {
        return this.schedule;
    }
}

module.exports = Nurse;