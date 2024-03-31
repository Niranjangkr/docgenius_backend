const express = require('express');
const ocrRouter = require('./ocr')

const router = express.Router();

router.use('/ocr', ocrRouter);

module.exports = router;