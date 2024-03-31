const express = require('express');
const router = express.Router();
const axios = require('axios');
const {VertexAI, HarmCategory, HarmBlockThreshold} = require('@google-cloud/vertexai');

const project = 'key-petal-389107';
const location = 'us-central1';

const textModel =  'gemini-1.0-pro';
const visionModel = 'gemini-1.0-pro-vision';

const vertex_ai = new VertexAI({project: project, location: location});

router.post('/upload', async function (req, res) {
    try {

        const { droppedFileBase64, mimeType } = req.body;

        const base64Image = droppedFileBase64;
        const filePart = { inline_data: { data: base64Image, mime_type: mimeType } };
        const textPart = { text: 'Given the OPD prescription file, extract the names of medicines written in the prescription as well as hospital name and address. Answer in key value pair format.' };
        const request = {
            contents: [{ role: 'user', parts: [textPart, filePart] }],
        };
        const resp = await generativeVisionModel.generateContentStream(request);
        const contentResponse = await resp.response;

        console.log(contentResponse.candidates[0].content.parts[0].text);

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error
        });
    }
})

module.exports = router