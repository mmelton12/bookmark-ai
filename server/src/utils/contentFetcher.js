const axios = require('axios');
const cheerio = require('cheerio');

const fetchContent = async (url) => {
    try {
        console.log('Fetching content from URL:', url);
        
        // Configure axios with headers to mimic a browser
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 10000, // 10 second timeout
            maxRedirects: 5
        });
        
        // Get the HTML content
        const html = response.data;
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('header').remove();
        $('footer').remove();
        $('[class*="menu"]').remove();
        $('[class*="sidebar"]').remove();
        $('[class*="banner"]').remove();
        $('[class*="ad"]').remove();
        $('iframe').remove();

        // Try to get the main content first
        let content = '';
        const mainSelectors = [
            'article',
            'main',
            '[role="main"]',
            '.content',
            '#content',
            '.post',
            '.article',
            '.post-content',
            '.article-content'
        ];

        // Try each selector until we find content
        for (const selector of mainSelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                elements.each((i, elem) => {
                    content += $(elem).text() + ' ';
                });
                break;
            }
        }

        // If no main content found, get body content
        if (!content.trim()) {
            content = $('body').text();
        }

        // Clean the content
        content = content
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/\n+/g, ' ')  // Replace newlines with space
            .replace(/\t+/g, ' ')  // Replace tabs with space
            .trim();

        // Get title with fallbacks
        const title = 
            $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            $('h1').first().text() ||
            url.split('/').pop() ||
            'Untitled';

        // Get description with fallbacks
        const description = 
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            content.substring(0, 200) + '...';

        console.log('Successfully fetched content:', {
            title: title.trim(),
            contentLength: content.length,
            url
        });

        // Limit content length but ensure we don't cut in the middle of a word
        const maxLength = 5000;
        let truncatedContent = content.substring(0, maxLength);
        if (content.length > maxLength) {
            truncatedContent = truncatedContent.substring(0, truncatedContent.lastIndexOf(' '));
        }

        return {
            title: title.trim(),
            content: truncatedContent,
            description: description.trim()
        };
    } catch (error) {
        console.error('Error fetching content:', {
            message: error.message,
            url,
            status: error.response?.status,
            statusText: error.response?.statusText
        });

        // Throw a more specific error based on the type of failure
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Could not connect to the website. Please check the URL and try again.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('Request timed out. Please try again.');
        } else if (error.response?.status === 403) {
            throw new Error('Access to this website is forbidden. The website might be blocking our requests.');
        } else if (error.response?.status === 404) {
            throw new Error('The page could not be found. Please check the URL and try again.');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests to this website. Please try again later.');
        } else {
            throw new Error('Failed to fetch content: ' + (error.message || 'Unknown error'));
        }
    }
};

module.exports = { fetchContent };
