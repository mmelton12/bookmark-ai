const Anthropic = require('@anthropic-ai/sdk');

const createClaudeClient = (apiKey) => {
    if (!apiKey) {
        throw new Error('Claude API key is required. Please add it in your account settings.');
    }
    return new Anthropic({
        apiKey: apiKey
    });
};

exports.analyzeContent = async (url, content, userApiKey) => {
    try {
        console.log('Starting content analysis with Claude...');
        const claude = createClaudeClient(userApiKey);
        
        // Run all analysis in parallel for better performance
        const [summaryResult, tagsResult, categoryResult] = await Promise.all([
            this.generateSummary(content, claude).catch(error => {
                console.error('Summary generation failed:', error);
                return 'Summary generation failed. Please try again later.';
            }),
            this.generateTags(content, url, claude).catch(error => {
                console.error('Tag generation failed:', error);
                return [];
            }),
            this.determineCategory(content, url, claude).catch(error => {
                console.error('Category determination failed:', error);
                return 'Article';
            })
        ]);

        console.log('Analysis complete:', {
            summaryLength: summaryResult.length,
            tagsCount: tagsResult.length,
            category: categoryResult,
            tags: tagsResult
        });

        return {
            summary: summaryResult,
            tags: tagsResult,
            category: categoryResult
        };
    } catch (error) {
        console.error('Error in analyzeContent:', error);
        return {
            summary: 'Summary generation failed. Please try again later.',
            tags: [],
            category: 'Article'
        };
    }
};

exports.determineCategory = async (content, url, claudeClient) => {
    try {
        console.log('Determining category for URL:', url);
        
        // Quick URL-based category detection
        const urlLower = url.toLowerCase();
        if (urlLower.includes('youtube.com') || 
            urlLower.includes('vimeo.com') || 
            urlLower.includes('dailymotion.com') ||
            urlLower.includes('video')) {
            console.log('Category determined from URL: Video');
            return 'Video';
        }
        
        if (urlLower.includes('arxiv.org') || 
            urlLower.includes('research') || 
            urlLower.includes('paper') ||
            urlLower.includes('doi.org')) {
            console.log('Category determined from URL: Research');
            return 'Research';
        }

        // If no quick match, use Claude to determine category
        const response = await claudeClient.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 10,
            temperature: 0.1,
            system: "You are a content classifier that categorizes web content into one of three categories: 'Article', 'Video', or 'Research'. Return ONLY the category name as a single word, no explanation or additional text. Use these guidelines:\n- 'Video': For video content, video sharing sites, or video-focused pages\n- 'Research': For academic papers, scientific articles, research publications, or technical documentation\n- 'Article': For general articles, blog posts, news, and other text-based content",
            messages: [{
                role: "user",
                content: `URL: ${url}\n\nContent: ${content.substring(0, 1000)}` // Only send first 1000 chars to avoid token limits
            }]
        });

        const category = response.content[0].text.trim();
        console.log('Claude determined category:', category);
        
        // Ensure the category is one of our valid options
        if (['Article', 'Video', 'Research'].includes(category)) {
            return category;
        }
        
        console.log('Invalid category returned, defaulting to Article');
        return 'Article';
    } catch (error) {
        console.error('Error determining category:', error);
        return 'Article';
    }
};

exports.generateTags = async (content, url, claudeClient) => {
    try {
        console.log('Generating tags for URL:', url);
        const response = await claudeClient.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 100,
            temperature: 0.3,
            system: `You are a tag generator for web content. Your task is to generate 3-5 specific, descriptive tags that best categorize the content.

Rules:
1. Return ONLY a JSON array of lowercase strings, no other text
2. Each tag should be 1-3 words maximum
3. Never use generic terms like 'other', 'miscellaneous', 'general'
4. Focus on the main topics and themes
5. Include technology names, concepts, or proper nouns when relevant
6. Make tags specific and meaningful

Example good response: ["artificial intelligence", "machine learning", "neural networks"]
Example bad response: ["technology", "article", "general", "other"]

The response must be valid JSON and contain only the array of tags.`,
            messages: [{
                role: "user",
                content: `URL: ${url}\n\nContent: ${content.substring(0, 1000)}` // Only send first 1000 chars to avoid token limits
            }]
        });

        let tags = [];
        try {
            const tagContent = response.content[0].text;
            console.log('Raw tag response:', tagContent);
            tags = JSON.parse(tagContent);
            // Filter and clean tags
            tags = tags
                .map(tag => tag.toLowerCase().trim())
                .filter(tag => {
                    // Remove empty tags, 'other', and generic terms
                    const genericTerms = ['other', 'miscellaneous', 'general', 'misc', 'various', 'article', 'content'];
                    return tag && 
                           tag.length > 0 && 
                           !genericTerms.includes(tag.toLowerCase()) &&
                           tag.length <= 50; // Reasonable length limit
                });
            console.log('Generated tags:', tags);
        } catch (parseError) {
            console.error('Error parsing tags:', parseError);
            return [];
        }

        return tags;
    } catch (error) {
        console.error('Error generating tags:', error);
        return [];
    }
};

exports.generateSummary = async (content, claudeClient) => {
    try {
        console.log('Generating summary...');
        const response = await claudeClient.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 150,
            temperature: 0.3,
            system: "You are a helpful assistant that generates concise summaries of web content. Generate a brief, informative summary in 2-3 sentences.",
            messages: [{
                role: "user",
                content: content.substring(0, 1000) // Only send first 1000 chars to avoid token limits
            }]
        });

        const summary = response.content[0].text.trim();
        console.log('Generated summary length:', summary.length);
        return summary || 'No summary available.';
    } catch (error) {
        console.error('Error generating summary:', error);
        return 'Summary generation failed. Please try again later.';
    }
};
