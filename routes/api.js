var express = require('express');
var router = express.Router();
var apiController = require('../controller/apiController');

router.get('/download', apiController.download_template);

router.get('/load_nurse', apiController.load_nurse);
router.get('/load_nurse_count', apiController.load_nurse_count);
router.get('/get_current_announcement_count', apiController.get_current_announcement_count);
router.get('/get_announcements', apiController.get_announcements);

router.get('/load_nurse_schedule', apiController.load_nurse_schedule);

router.get('/get_nurse_schedules_count', apiController.get_nurse_schedules_count);
router.get('/load_nurse_schedules', apiController.load_nurse_schedules);
router.get('/load_nurse_daily', apiController.load_nurse_daily);
router.get('/load_nurse_weekly', apiController.load_nurse_weekly);
router.get('/load_nurse_monthly', apiController.load_nurse_monthly);

router.get('/get_announcements_count', apiController.get_announcements_count);
router.get('/load_announcements', apiController.load_announcements);

router.post('/insert_announcement', apiController.insert_announcement);
router.post('/insert_nurse_schedule', apiController.insert_nurse_schedule);

//SELECTIZE
router.get('/selectize_nurse', apiController.selectize_nurse);
router.get('/selectize_department', apiController.selectize_department);
router.get('/selectize_cluster', apiController.selectize_cluster);

router.get('/selectize_subject', apiController.selectize_subject);
router.get('/selectize_message', apiController.selectize_message);


module.exports = router;