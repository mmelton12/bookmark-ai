const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeContent = async (url, content) => {
    try {
        console.log('Attempting OpenAI analysis for URL:', url);
        console.log('Content length:', content.length);
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that analyzes web content and provides relevant tags and summaries. Return a JSON object with 'summary' and 'tags' fields, where tags is an array of exactly 5 strings."
                },
                {
                    role: "user",
                    content: `Analyze this content and provide a JSON response with exactly this format:
                    {
                        "summary": "your concise summary here (max 200 words)",
                        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
                    }
                    
                    URL: ${url}
                    Content: ${content.substring(0, 4000)}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const result = JSON.parse(response.choices[0].message.content);
        
        // Validate the response format
        if (!result.summary || !Array.isArray(result.tags)) {
            console.error('Invalid response format from OpenAI:', result);
            throw new Error('Invalid response format from OpenAI: Missing required fields');
        }

        // Ensure we have exactly 5 tags
        const tags = result.tags.slice(0, 5);
        while (tags.length < 5) {
            tags.push(`tag${tags.length + 1}`);
        }

        console.log('Successfully generated tags:', tags);
        console.log('Successfully generated summary, length:', result.summary.length);

        return {
            summary: result.summary,
            tags: tags
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Return default values if analysis fails
        return {
            summary: 'AI analysis failed. Please try again later.',
            tags: ['error', 'failed', 'retry', 'tag4', 'tag5']
        };
    }
};

exports.generateTags = async (content) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates relevant tags for web content. Return a JSON object with a 'tags' field containing exactly 5 tags."
                },
                {
                    role: "user",
                    content: `Generate exactly 5 relevant tags for this content. Return a JSON object with a 'tags' field containing an array of exactly 5 strings.
                    
                    Content: ${content.substring(0, 4000)}`
                }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        const result = JSON.parse(response.choices[0].message.content);
        const tags = Array.isArray(result.tags) ? result.tags : [];
        
        // Ensure we have exactly 5 tags
        const finalTags = tags.slice(0, 5);
        while (finalTags.length < 5) {
            finalTags.push(`tag${finalTags.length + 1}`);
        }

        return finalTags;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return ['error', 'failed', 'retry', 'tag4', 'tag5'];
    }
};

exports.generateSummary = async (content) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates concise summaries of web content. Return a JSON object with a 'summary' field."
                },
                {
                    role: "user",
                    content: `Generate a concise summary (max 200 words) for this content. Return a JSON object with a 'summary' field.
                    
                    Content: ${content.substring(0, 4000)}`
                }
            ],
            temperature: 0.5,
            max_tokens: 300
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result.summary || 'No summary available';
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return 'Failed to generate summary. Please try again later.';
    }
};
