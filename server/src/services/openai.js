const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

exports.analyzeContent = async (url, content) => {
    try {
        const summary = await this.generateSummary(content);
        const tags = await this.generateTags(content);
        return { summary, tags };
    } catch (error) {
        console.error('Error analyzing content:', error);
        throw error;
    }
};

exports.generateTags = async (content) => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates relevant tags for web content. Generate 3-5 relevant tags that best describe the content. Return only the tags as a JSON array of strings."
                },
                {
                    role: "user",
                    content: content
                }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        const tags = JSON.parse(response.data.choices[0].message.content);
        return tags;
    } catch (error) {
        console.error('Error generating tags:', error);
        return ['error', 'failed-to-generate-tags'];
    }
};

exports.generateSummary = async (content) => {
    try {
        const response = await openai.createChatCompletion({
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

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        return 'Failed to generate summary';
    }
};
