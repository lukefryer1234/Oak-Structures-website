#!/usr/bin/env node

const https = require('https');

const API_KEY = process.env.GOOGLE_API_KEY;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

if (!API_KEY) {
    console.error('❌ GOOGLE_API_KEY environment variable not set');
    process.exit(1);
}

const testGemini = async (prompt = "Hello! Are you Gemini 2.5 Pro? Please confirm your model version.") => {
    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: '/v1beta/models/gemini-2.5-pro:generateContent',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY,
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    if (response.candidates && response.candidates[0]) {
                        const text = response.candidates[0].content.parts[0].text;
                        console.log('✅ Gemini 2.5 Pro Response:');
                        console.log('─'.repeat(50));
                        console.log(text);
                        console.log('─'.repeat(50));
                        console.log(`📊 Model Version: ${response.modelVersion || 'Unknown'}`);
                        console.log(`🔢 Tokens Used: ${response.usageMetadata?.totalTokenCount || 'Unknown'}`);
                        resolve(text);
                    } else {
                        console.error('❌ No response from model:', response);
                        reject(new Error('No response from model'));
                    }
                } catch (error) {
                    console.error('❌ Error parsing response:', error);
                    console.error('Raw response:', responseData);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

// Test the connection
console.log('🚀 Testing Gemini 2.5 Pro connection...');
console.log(`📁 Project: ${PROJECT_ID}`);
console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not set'}`);
console.log('');

testGemini().catch(console.error);
