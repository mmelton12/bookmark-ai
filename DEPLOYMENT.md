# Deploying BookmarkAI to Siteground

## Prerequisites

1. Siteground hosting account
2. SSH access to your Siteground server
3. Node.js enabled on your hosting (via Siteground Site Tools)
4. MongoDB Atlas account (for database)

## Deployment Steps

### 1. Build the Frontend

```bash
# In the client directory
npm run build
```

### 2. Set Up Node.js on Siteground

1. Log in to Siteground Site Tools
2. Go to DevOps > Node.js
3. Create a new Node.js instance:
   - Select Node.js version 18.x or higher
   - Set the domain/subdomain where you want to deploy
   - Note the Node.js environment path

### 3. Upload Files

1. Build files:
   ```bash
   # In the client directory
   npm run build
   ```

2. Connect to Siteground via SSH or FTP
3. Create a directory structure:
   ```
   yourdomain.com/
   ├── public_html/     # Frontend build files
   └── nodeapp/         # Backend files
   ```

4. Upload files:
   - Copy contents of `client/build/` to `public_html/`
   - Copy contents of `server/` to `nodeapp/`

### 4. Configure Environment Variables

Create `.env` file in your nodeapp directory:
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

### 5. Install Dependencies and Start Server

```bash
# In the nodeapp directory
npm install
npm install pm2 -g
pm2 start src/index.js
```

### 6. Configure Nginx/Apache (via Siteground Site Tools)

1. Go to Site Tools > Security > HTTPS Enforce
2. Enable HTTPS

3. Set up reverse proxy for the API:
   - Go to Site Tools > Domains > Site
   - Add subdomain (e.g., api.yourdomain.com)
   - Configure proxy to point to your Node.js port (3000)

### 7. Update Frontend API Configuration

Update the API endpoint in your frontend code:
```javascript
// client/src/services/api.ts
const API_URL = 'https://api.yourdomain.com';
```

### 8. MongoDB Setup

1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist Siteground IP address
4. Update MONGODB_URI in .env file

## Post-Deployment Checks

1. Visit your domain to verify frontend loads
2. Test user registration/login
3. Test bookmark creation
4. Monitor Node.js logs:
   ```bash
   pm2 logs
   ```

## Troubleshooting

1. Check Node.js logs:
   ```bash
   pm2 logs
   ```

2. Verify environment variables:
   ```bash
   pm2 env 0
   ```

3. Check MongoDB connection:
   ```bash
   mongo your_mongodb_uri --eval "db.adminCommand('ping')"
   ```

4. Common issues:
   - CORS errors: Verify domain configuration
   - 502 Bad Gateway: Check Node.js process is running
   - Database connection errors: Check MongoDB URI and network access

## Maintenance

1. Update application:
   ```bash
   # Pull latest changes
   git pull origin main

   # Rebuild frontend
   cd client
   npm run build

   # Restart backend
   cd ../nodeapp
   pm2 restart all
   ```

2. Monitor performance:
   ```bash
   pm2 monit
   ```

3. View logs:
   ```bash
   pm2 logs
