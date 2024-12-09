# BookmarkAI

An AI-powered bookmark manager that automatically generates tags and summaries for your bookmarks.

## Features

- Automatic content tagging using GPT-4
- AI-generated summaries of bookmarked content
- User authentication
- Search bookmarks by tags
- Clean, minimalist interface

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- AI: OpenAI GPT-4 API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with your configuration:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development servers:
   ```bash
   # Start the backend server (from server directory)
   npm start

   # Start the frontend development server (from client directory)
   npm start
   ```

## Usage

1. Sign up for an account
2. Enter a URL in the input field
3. The system will automatically:
   - Generate relevant tags
   - Create a summary of the content
   - Store the bookmark for later retrieval
4. Use the search bar to find bookmarks by tags

## Version

Alpha 1.0.0 - Initial release with core functionality
