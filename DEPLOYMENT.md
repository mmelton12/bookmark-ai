# Deploying BookmarkAI to Railway

## Prerequisites

1. GitHub account with your BookmarkAI repository
2. Railway account (https://railway.app)
3. MongoDB Atlas account (for database)
4. Google OAuth credentials

## Deployment Steps

### 1. MongoDB Atlas Setup

1. Create MongoDB Atlas cluster (M0 Free tier is sufficient to start)
2. Create database user with read/write permissions
3. Configure network access:
   - Add `0.0.0.0/0` to whitelist for Railway access
   - For development, add your local IP
4. Get connection string for Railway environment variables

### 2. Railway Project Setup

1. Log in to Railway using GitHub account
2. Create a new project:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your BookmarkAI repository

3. Add MongoDB environment variable:
   - Go to project settings
   - Add environment variable:
     ```
     MONGODB_URI=your_mongodb_atlas_uri
     ```

### 3. Configure Services

#### Backend Service:
1. Add these environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=24h
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=https://your-frontend-url.railway.app
   SERVER_URL=https://your-backend-url.railway.app
   ```

2. Configure start command:
   ```
   cd server && npm install && npm start
   ```

#### Frontend Service:
1. Add these environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

2. Configure start command:
   ```
   cd client && npm install && npm run build && npm install -g serve && serve -s build
   ```

### 4. Update Google OAuth Configuration

1. Go to Google Cloud Console
2. Update OAuth 2.0 credentials with Railway URLs:
   
   Authorized JavaScript Origins:
   ```
   https://your-frontend-url.railway.app
   ```
   
   Authorized Redirect URIs:
   ```
   https://your-backend-url.railway.app/api/auth/google/callback
   ```

### 5. Domain Configuration (Optional)

1. Add custom domain in Railway:
   - Go to project settings
   - Click "Add Domain"
   - Follow DNS configuration instructions

2. Update environment variables with custom domain
3. Update Google OAuth configuration with custom domain

### 6. Verify Deployment

1. Check frontend:
   - Visit your Railway frontend URL
   - Verify assets load correctly
   - Check browser console for errors

2. Test API:
   - Test authentication endpoints
   - Test bookmark operations
   - Verify Google OAuth flow

### 7. Monitoring and Maintenance

1. View logs in Railway dashboard:
   - Real-time logs available
   - Error tracking
   - Deployment history

2. Monitor usage:
   - Check Railway dashboard for resource usage
   - Monitor MongoDB Atlas metrics
   - Track API response times

3. Update application:
   - Push changes to GitHub
   - Railway automatically rebuilds and deploys

### 8. Common Issues & Solutions

1. CORS errors:
   - Verify CLIENT_URL and SERVER_URL in backend env vars
   - Check REACT_APP_API_URL in frontend env vars
   - Ensure all URLs use https://

2. Build failures:
   - Check Railway build logs
   - Verify start commands
   - Check for missing dependencies

3. Database connection issues:
   - Verify MongoDB Atlas IP whitelist
   - Check MONGODB_URI format
   - Ensure MongoDB Atlas cluster is active

4. OAuth issues:
   - Verify Google OAuth credentials
   - Check authorized origins and redirect URIs
   - Ensure all URLs match Railway domains

### 9. Scaling Considerations

1. Railway Hobby Plan ($5/month) includes:
   - 8 GB RAM / 8 vCPU per service
   - Sufficient for moderate traffic
   - US regions

2. MongoDB Atlas scaling:
   - Start with M0 Free tier
   - Upgrade based on usage
   - Monitor performance metrics

3. Performance optimization:
   - Enable MongoDB indexes
   - Implement caching if needed
   - Monitor API response times

### 10. Security Best Practices

1. Environment variables:
   - Use Railway's environment variable management
   - Never commit sensitive data to Git
   - Regularly rotate secrets

2. MongoDB security:
   - Use strong database passwords
   - Regular security audits
   - Enable MongoDB Atlas security features

3. Application security:
   - Keep dependencies updated
   - Regular security patches
   - Implement rate limiting if needed
