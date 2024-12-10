const { Configuration, OpenAIApi } = require('openai');

const createOpenAIClient = (apiKey) => {
    if (!apiKey) {
        throw new Error('OpenAI API key is required. Please add it in your account settings.');
    }
    const configuration = new Configuration({
        apiKey: apiKey
    });
    return new OpenAIApi(configuration);
};

exports.analyzeContent = async (url, content, userApiKey) => {
    try {
        const openai = createOpenAIClient(userApiKey);
        const summary = await this.generateSummary(content, openai);
        const tags = await this.generateTags(content, openai);
        return { summary, tags };
    } catch (error) {
        console.error('Error analyzing content:', error);
        // Return default values instead of throwing
        return {
            summary: 'Summary generation failed. Please try again later.',
            tags: []
        };
    }
};

exports.generateTags = async (content, openaiClient) => {
    try {
        const response = await openaiClient.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates relevant tags for web content. Generate 3-5 specific, descriptive tags that best categorize the content. Never use generic tags like 'other', 'miscellaneous', or 'general'. Return only the tags as a JSON array of strings, all in lowercase. Example: ['technology', 'artificial-intelligence', 'machine-learning']"
                },
                {
                    role: "user",
                    content: content
                }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        let tags = [];
        try {
            tags = JSON.parse(response.data.choices[0].message.content);
            // Filter and clean tags
            tags = tags
                .map(tag => tag.toLowerCase().trim())
                .filter(tag => {
                    // Remove empty tags, 'other', and generic terms
                    const genericTerms = ['other', 'miscellaneous', 'general', 'misc', 'various'];
                    return tag && 
                           tag.length > 0 && 
                           !genericTerms.includes(tag.toLowerCase()) &&
                           tag.length <= 50; // Reasonable length limit
                });
        } catch (parseError) {
            console.error('Error parsing tags:', parseError);
            return [];
        }

        return tags;
    } catch (error) {
        console.error('Error generating tags:', error);
        return []; // Return empty array instead of throwing
    }
};

exports.generateSummary = async (content, openaiClient) => {
    try {
        const response = await openaiClient.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates concise summaries of web content. Generate a brief, informative summary in 2-3 sentences."
                },
                {
                    role: "user",
                    content: content
                }
            ],
            temperature: 0.3,
            max_tokens: 150
        });

        const summary = response.data.choices[0].message.content.trim();
        return summary || 'No summary available.';
    } catch (error) {
        console.error('Error generating summary:', error);
        return 'Summary generation failed. Please try again later.';
    }
};
