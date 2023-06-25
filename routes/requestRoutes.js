const express = require('express');
const router = express.Router();
const requestViews = require('../views/requestViews');

router.post('/pay', requestViews.requestPayment);
router.get('/view-requests',requestViews.receivedRequests);
router.get('/my-requests',requestViews.myRequests);
router.put('/status-change/:id',requestViews.changeStatus);
router.delete('/status-delete/:id',requestViews.deleteStatus);
router.get('/send-mail/:id',requestViews.sendRemindMail);
router.get('/paid-mail/:id',requestViews.sendPaidMail);

module.exports = router;