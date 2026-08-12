# Authentication Deployment Fixes

## Issues Fixed

The following authentication issues occurred after deployment and have been fixed:

### 1. Google OAuth `redirect_uri_mismatch` Error
**Problem**: Google OAuth was failing with `redirect_uri_mismatch` error because the callback URL was configured for localhost instead of the production Render URL.

**Fix**: Updated `backend/config/passport.js` to use the correct production callback URL:
- Changed default callback URL from `http://localhost:5000/auth/google/callback` to `http://localhost:5000/api/auth/google/callback`
- Added proper environment variable support for `GOOGLE_CALLBACK_URL`

### 2. CORS Configuration Issues
**Problem**: CORS configuration was not properly allowing the production Vercel frontend domain.

**Fix**: Enhanced CORS configuration in `backend/app.js`:
- Added explicit methods and allowed headers
- Ensured proper support for preflight requests
- Configured to allow `https://livedocs-brown.vercel.app`

### 3. Session Cookie Configuration for Cross-Domain
**Problem**: Session cookies were not properly configured for cross-domain production use between Vercel and Render.

**Fix**: Updated session cookie configuration in `backend/app.js`:
- Added support for custom cookie domain via `COOKIE_DOMAIN` environment variable
- Maintained proper `sameSite: none` for production
- Kept `secure: true` for production

### 4. Missing Credentials in Register API Call
**Problem**: The Register API call was missing `credentials: include`, preventing session cookie handling.

**Fix**: Added `credentials: include` to the register API call in `frontend/src/pages/Register.jsx`

### 5. Missing Environment Variables Configuration
**Problem**: No clear documentation for required Render environment variables.

**Fix**: Created `backend/render.env.example` with all required environment variables

## Required Action Items

### 1. Update Google Cloud Console OAuth Settings

Go to your Google Cloud Console and update the OAuth 2.0 credentials:

**Authorized JavaScript origins:**
- Add: `https://livedocs-brown.vercel.app`

**Authorized redirect URIs:**
- Add: `https://collaboration-editor-yfm8.onrender.com/api/auth/google/callback`

### 2. Configure Render Environment Variables

In your Render dashboard for the backend service, add these environment variables:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secure_random_string
FRONTEND_URL=https://livedocs-brown.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://collaboration-editor-yfm8.onrender.com/api/auth/google/callback
NODE_ENV=production
```

### 3. Redeploy Backend

After updating environment variables in Render:
1. Push the code changes to GitHub
2. Render will automatically redeploy
3. Or manually trigger a deploy in Render dashboard

### 4. Clear Browser Cookies and Test

After deployment:
1. Clear all cookies for both livedocs-brown.vercel.app and collaboration-editor-yfm8.onrender.com
2. Test regular email/password login
3. Test Google OAuth login
4. Test registration flow

## Why These Issues Occurred After Deployment

These issues happened because:

1. **Environment-specific configurations**: Local development uses localhost URLs, but production requires actual domain URLs
2. **Cross-domain cookie restrictions**: Browsers have stricter security for cookies between different domains (Vercel → Render)
3. **OAuth callback URL validation**: Google OAuth validates the callback URL exactly, so it must match the production URL
4. **CORS security**: CORS prevents unauthorized cross-origin requests, so production domains must be explicitly allowed
5. **Session handling**: Session cookies need proper security attributes for production cross-domain scenarios

## Verification Steps

After implementing these fixes:

1. **Test Email/Password Login**: Should work without errors
2. **Test Google OAuth**: Should redirect properly and authenticate
3. **Test Registration**: Should create account and maintain session
4. **Test Session Persistence**: User should stay logged in across page refreshes
5. **Test Cross-Domain Requests**: API calls from Vercel frontend to Render backend should work

## Additional Notes

- The backend is configured to trust proxies (`app.set("trust proxy", 1)`) which is essential for proper cookie handling behind load balancers like Render
- Session cookies are set to `httpOnly: true` for security (prevents XSS attacks)
- In production, cookies use `secure: true` and `sameSite: none` for cross-domain functionality
- The session timeout is set to 30 minutes with rolling sessions (refreshes on activity)
