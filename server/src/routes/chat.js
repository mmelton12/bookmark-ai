const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const { protect } = require('../middleware/auth');

const createOpenAIClient = (apiKey) => {
    if (!apiKey) {
        throw new Error('OpenAI API key is required');
    }
    const configuration = new Configuration({
        apiKey: apiKey.trim()
    });
    return new OpenAIApi(configuration);
};

// Add auth protection to chat route
router.post('/chat', protect, async (req, res) => {
    try {
        // Log full request details
        console.log('Chat request received:', { 
            userId: req.user?.id,
            body: {
                hasMessage: !!req.body.message,
                hasApiKey: !!req.body.apiKey,
                messageLength: req.body.message?.length,
                apiKeyLength: req.body.apiKey?.length
            },
            headers: {
                authorization: req.headers.authorization ? 'Bearer token present' : 'No bearer token',
                'content-type': req.headers['content-type']
            }
        });
        
        const { message, apiKey } = req.body;
        
        if (!message?.trim()) {
            console.log('Chat error: Message is required');
            return res.status(400).json({ 
                error: 'Message is required',
                details: 'Message is empty or missing'
            });
        }
        
        if (!apiKey?.trim()) {
            console.log('Chat error: OpenAI API key is required');
            return res.status(400).json({ 
                error: 'OpenAI API key is required',
                details: 'API key is empty or missing'
            });
        }

        const openai = createOpenAIClient(apiKey);

        console.log('Sending request to OpenAI...');
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that helps users with their questions and tasks."
                },
                {
                    role: "user",
                    content: message.trim()
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        if (!response.data.choices || response.data.choices.length === 0) {
            console.log('Chat error: No response from OpenAI');
            throw new Error('No response from OpenAI');
        }

        console.log('Successfully received response from OpenAI');
        res.json({ 
            reply: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Chat error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack,
            requestBody: {
                hasMessage: !!req.body.message,
                hasApiKey: !!req.body.apiKey,
                messageLength: req.body.message?.length,
                apiKeyLength: req.body.apiKey?.length
            }
        });
        
        // Handle specific error types
        if (error.response?.status === 401) {
            return res.status(401).json({ 
                error: 'Invalid OpenAI API key',
                details: error.response?.data
            });
        }
        
        if (error.message === 'OpenAI API key is required') {
            return res.status(400).json({ 
                error: error.message,
                details: 'API key validation failed'
            });
        }

        res.status(500).json({ 
            error: 'Failed to get chat response',
            details: error.message
        });
    }
});

module.exports = router;
