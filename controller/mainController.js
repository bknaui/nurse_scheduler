exports.index = function (req, res) {
    if (req.session.username == "ADMIN") {
        res.redirect('/home');
    } else {
        res.render('index');
    }
}

exports.admin = function (req, res) {
    if (req.session.username == "ADMIN") {
        res.render('admin');
    } else {
        res.redirect('/');
    }
}

exports.announcement = function (req, res) {
    if (req.session.username == "ADMIN") {
        res.render('announcement');
    } else {
        res.redirect('/');
    }
}

exports.tv = function (req, res) {
    res.render('tv');
}


exports.login = function (req, res) {
    if (req.body.username == "ADMIN" && req.body.password == "nurse_scheduler_admin") {
        req.session.username = "ADMIN";
        res.send("OK");
    } else {
        res.send("FAIL");
    }
}

exports.logout = function (req, res) {
    req.session.destroy();
    res.redirect("/");
}


