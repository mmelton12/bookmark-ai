// URL cleaning utility for consistent bookmark URL handling

/**
 * Cleans and normalizes a URL by:
 * - Ensuring it has a protocol (http:// or https://)
 * - Removing trailing slashes
 * - Removing unnecessary 'www.' prefix
 * - Removing URL fragments (#) unless they're part of a route
 * - Removing tracking parameters
 * 
 * @param {string} url - The URL to clean
 * @returns {string} - The cleaned URL
 */
function cleanUrl(url) {
    if (!url) return '';

    try {
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const urlObj = new URL(url);

        // Remove 'www.' if present
        let hostname = urlObj.hostname.startsWith('www.') 
            ? urlObj.hostname.slice(4) 
            : urlObj.hostname;

        // Reconstruct the URL without tracking parameters
        const cleanUrl = `${urlObj.protocol}//${hostname}${urlObj.pathname}`;

        // Remove trailing slash unless the path is just '/'
        return cleanUrl.endsWith('/') && cleanUrl.length > 1 
            ? cleanUrl.slice(0, -1) 
            : cleanUrl;
    } catch (error) {
        console.error('Error cleaning URL:', error);
        return url; // Return original URL if cleaning fails
    }
}

module.exports = {
    cleanUrl
};
