// Mock implementation for local development
exports.analyzeContent = async (url, content) => {
    console.log('Mock analysis for URL:', url);
    return {
        summary: 'This is a mock summary for local development. OpenAI integration is disabled.',
        tags: ['development', 'mock', 'local', 'testing', 'demo']
    };
};

exports.generateTags = async (content) => {
    return ['development', 'mock', 'local', 'testing', 'demo'];
};

exports.generateSummary = async (content) => {
    return 'This is a mock summary for local development. OpenAI integration is disabled.';
};
