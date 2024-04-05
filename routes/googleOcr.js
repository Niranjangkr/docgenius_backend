const dotenv = require('dotenv');
const express = require('express');
const router = express.Router();
const axios = require('axios');

dotenv.config();

const credential = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString()
)

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const projectId = process.env.PROJECT_ID;
const location = process.env.LOCATION; // Format is 'us' or 'eu'
const processorId = process.env.PROCESSOR_ID; // Create processor in Cloud Console

const client = new DocumentProcessorServiceClient({
    projectId: credential.project_id,
    credentials: {
        client_email: credential.client_email,
        private_key: credential.private_key,
    },
});
router.post('/ocr', async function (req, res) {
    try {
        const { droppedFileBase64, mimeType } = req.body
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        const request = {
            name,
            rawDocument: {
                content: droppedFileBase64,
                mimeType: mimeType,
            },
        };

        // Recognizes text entities in the PDF document
        const [result] = await client.processDocument(request);
        console.log('res', result);
        const { document } = result;

        // Get all of the document text as one big string
        const { text } = document;

        // Extract shards from the text field
        const getText = textAnchor => {
            if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
                return '';
            }

            // First shard in document doesn't have startIndex property
            const startIndex = textAnchor.textSegments[0].startIndex || 0;
            const endIndex = textAnchor.textSegments[0].endIndex;

            return text.substring(startIndex, endIndex);
        };

        // Read the text recognition output from the processor
        console.log('The document contains the following paragraphs:');
        const [page1] = document.pages;
        const { paragraphs } = page1;

        let concat_data = '';
        for (const paragraph of paragraphs) {
            const paragraphText = getText(paragraph.layout.textAnchor);
            concat_data += paragraphText;
        }

        console.log("finalTextGoogle ", concat_data)

        // openAI response Formating
        const url = 'https://api.openai.com/v1/chat/completions'
        const headers = {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
        const data = {
            "model": "gpt-3.5-turbo-1106",
            "response_format": { "type": "json_object" },
            "messages": [
                {
                    "role": "system",
                    "content": `\nGiven the OPD prescription file, extract the names of medicines written in the prescription as well as hospital name and address. Answer in the json key value pair format.`
                },
                {
                    "role": "user",
                    "content": concat_data
                },
            ],
            "temperature": 1,
            "max_tokens": 256,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        }
    
        try {
            const response = await axios.post(url, data, { headers: headers });
            
            const formatedOutput = JSON.parse(response?.data?.choices[0]?.message?.content)         
            res.status(200).json({
                success: true,
                response: formatedOutput
            })
        } catch (error) {
            console.log("formating the googledocAI output from completion api failed");
            res.status(400).json({
                success: false,
                message: "formating the googledocAI output from completion api failed",
                error
            })
        }

    } catch (error) {
        console.log('errorNi: ', error)
        res.status(500).json({
            success: false,
            message: error,
            error
        });
    }
})

module.exports = router