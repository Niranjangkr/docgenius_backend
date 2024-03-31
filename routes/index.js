const express = require('express');
const ocrRouter = require('./ocr')
const googleRouter = require('./googleOcr')

const router = express.Router();

router.use('/ocr', ocrRouter);
router.use('/googleDoc', googleRouter);

module.exports = router;