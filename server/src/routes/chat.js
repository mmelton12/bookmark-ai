const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const createOpenAIClient = (apiKey) => {
    if (!apiKey) {
        throw new Error('OpenAI API key is required');
    }
    const configuration = new Configuration({
        apiKey: apiKey
    });
    return new OpenAIApi(configuration);
};

router.post('/chat', async (req, res) => {
    try {
        const { message, apiKey } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        if (!apiKey) {
            return res.status(400).json({ error: 'OpenAI API key is required' });
        }

        const openai = createOpenAIClient(apiKey);

        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that helps users with their questions and tasks."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('No response from OpenAI');
        }

        res.json({ 
            reply: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Chat error:', error);
        
        // Handle specific error types
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'Invalid OpenAI API key' });
        }
        
        if (error.message === 'OpenAI API key is required') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ 
            error: 'Failed to get chat response',
            details: error.message
        });
    }
});

module.exports = router;
