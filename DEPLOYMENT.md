# Deploying BookmarkAI to Siteground

## Prerequisites

1. Siteground hosting account
2. SSH access to your Siteground server
3. Node.js enabled on your hosting (via Siteground Site Tools)
4. MongoDB Atlas account (for database)

## Deployment Steps

### 1. Prepare the Application

1. Update API configuration:
   ```typescript
   // client/src/services/api.ts
   const API_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
   ```

2. Create production build:
   ```bash
   # In the client directory
   npm run build
   ```

### 2. Set Up Node.js on Siteground

1. Log in to Siteground Site Tools
2. Go to DevOps > Node.js
3. Create a new Node.js instance:
   - Select Node.js version 18.x or higher (recommended: 18.16.0 LTS)
   - Set the domain/subdomain for your API (e.g., api.yourdomain.com)
   - Note the Node.js environment path and port number

### 3. Upload Files

1. Connect to Siteground via SSH or FTP
2. Create directory structure:
   ```
   yourdomain.com/
   ├── public_html/     # Frontend build files
   └── nodeapp/         # Backend files
   ```

3. Upload files:
   - Copy contents of `client/build/` to `public_html/`
   - Copy contents of `server/` to `nodeapp/`
   - Ensure `.env` and `node_modules` are not uploaded

### 4. Configure Environment Variables

1. Create `.env` file in your nodeapp directory:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   PORT=your_assigned_nodejs_port
   NODE_ENV=production
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Set up environment variables in Siteground:
   - Go to Site Tools > DevOps > Node.js
   - Select your Node.js instance
   - Add environment variables in the "Environment Variables" section

### 5. Install Dependencies and Start Server

```bash
# In the nodeapp directory
cd nodeapp
npm install --production
npm install pm2 -g
pm2 start src/index.js --name bookmarkai
```

### 6. Configure Domain and SSL

1. Set up main domain:
   - Go to Site Tools > Domains > Site
   - Point your main domain to `public_html/`
   - Enable HTTPS (Site Tools > Security > SSL Manager)

2. Set up API subdomain:
   - Create subdomain (e.g., api.yourdomain.com)
   - Configure reverse proxy:
     - Go to Site Tools > Domains > Site
     - Select your API subdomain
     - Enable proxy and point to your Node.js port
     - Add these proxy rules:
       ```
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header Host $http_host;
       proxy_set_header X-NginX-Proxy true;
       ```

### 7. MongoDB Atlas Setup

1. Create MongoDB Atlas cluster (M0 Free tier is sufficient to start)
2. Create database user with read/write permissions
3. Configure network access:
   - Add Siteground server IP to whitelist
   - For development, add your local IP
4. Get connection string and update MONGODB_URI in .env

### 8. Frontend Configuration

1. Create `.env.production` in client directory:
   ```
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

2. Rebuild frontend with production settings:
   ```bash
   cd client
   npm run build
   ```

### 9. Post-Deployment Verification

1. Test frontend:
   - Visit https://yourdomain.com
   - Verify assets load correctly
   - Check browser console for errors

2. Test API:
   - Verify https://api.yourdomain.com/api/health returns 200
   - Test authentication endpoints
   - Test bookmark operations

3. Monitor logs:
   ```bash
   pm2 logs bookmarkai
   ```

### 10. Common Issues & Solutions

1. CORS errors:
   - Verify CORS_ORIGIN in backend .env
   - Check API_URL in frontend
   - Ensure SSL is properly configured

2. 502 Bad Gateway:
   - Check pm2 process status: `pm2 list`
   - Verify Node.js port configuration
   - Check proxy settings in Siteground

3. Database connection issues:
   - Verify MongoDB Atlas IP whitelist
   - Check MONGODB_URI format
   - Test connection with MongoDB Compass

4. Static file issues:
   - Verify build files in public_html
   - Check file permissions (should be 644)
   - Clear browser cache

### 11. Maintenance

1. Update application:
   ```bash
   # Pull latest changes
   git pull origin main

   # Update backend
   cd nodeapp
   npm install --production
   pm2 restart bookmarkai

   # Update frontend
   cd ../client
   npm install
   npm run build
   # Copy build files to public_html
   ```

2. Monitor performance:
   ```bash
   pm2 monit
   ```

3. View logs:
   ```bash
   pm2 logs bookmarkai
   ```

4. Backup database:
   - Use MongoDB Atlas automated backups
   - Schedule regular backups via Atlas UI

5. Security maintenance:
   - Regularly update Node.js version
   - Keep dependencies updated
   - Monitor Siteground security notifications
   - Regularly rotate JWT_SECRET

### 12. Performance Optimization

1. Enable Siteground caching:
   - Go to Site Tools > Speed > Caching
   - Enable Dynamic Caching
   - Configure browser caching

2. Configure PM2:
   ```bash
   pm2 start src/index.js --name bookmarkai -i max
   ```

3. Monitor and adjust:
   - Use Siteground Site Tools > Statistics
   - Monitor PM2 metrics
   - Adjust MongoDB Atlas tier if needed
