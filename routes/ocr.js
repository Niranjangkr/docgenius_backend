const express = require('express');
const { DocumentOcr } = require('llm-document-ocr');
const router = express.Router();

const documentOcr = new DocumentOcr({
    apiKey: process.env.OPENAI_API_KEY, // required, defaults to
    model: "gpt-4-vision-preview", // optional, defaults to "gpt-4-vision-preview"
    standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.2.146/standard_fonts/", // optional, defaults to "https://unpkg.com/pdfjs-dist@3.2.146/standard_fonts/". You can use the systems fonts or the fonts under ./node_modules/pdfjs-dist/standard_fonts/ as well.
});

router.post('/fetchData', async function(req, res){
    try {
        const { droppedFileBase64, mimeType } = req.body;
        console.log('test12', mimeType);
        const documentData = await documentOcr.process({
            document: droppedFileBase64, // Base64 String, Base64 URI, or Buffer
            mimeType: mimeType, // mime-type of the document or image
            prompt: `invoice number, invoice amount, currency (as ISO 4217 code), dueDate, invoiceDate, serviceStartDate, serviceEndDate,
            vendor's [name, email with @, website],
            line items [amnt, price, qty, des, name, cur (as ISO 4217 code)]`, // system prompt for data extraction. See examples below.
            pageOptions: 'ALL' // optional, defaults to 'ALL'. Determines which page of the PDF will be processed. Available options are 'ALL', 'FIRST_AND_LAST', 'FIRST', 'LAST'.
        })
    
        console.log("hi", documentData);
        res.status(200).json({
            message: "successful",
            data: documentData
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "successful",
            error
        });
    }
})

module.exports = router