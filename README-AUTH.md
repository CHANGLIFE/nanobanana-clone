# GitHub Authentication Setup Guide

This document explains how to set up GitHub authentication with Supabase for the Nano Banana application.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **GitHub Account**: Required for OAuth setup

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Choose your organization
4. Enter project details:
   - Project Name: `nano-banana-auth`
   - Database Password: Create a strong password
   - Region: Choose your nearest region
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key

## Step 3: Configure OAuth Providers in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **GitHub** in the list and click to expand
3. Toggle **Enable sign in with GitHub** to ON
4. Find **Google** in the list and click to expand
5. Toggle **Enable sign in with Google** to ON
6. You'll need to create OAuth Apps for both providers (see next step)

## Step 4: Create OAuth Applications

### GitHub OAuth App
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: `Nano Banana Development`
   - **Homepage URL**: `http://localhost:3005`
   - **Authorization callback URL**: `http://localhost:3005/api/auth/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**

### Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the consent screen if prompted
6. Select **Web application** as the application type
7. Fill in the details:
   - **Name**: `Nano Banana Development`
   - **Authorized redirect URIs**: `http://localhost:3005/api/auth/callback`
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

## Step 5: Complete Supabase OAuth Configuration

### GitHub Configuration
1. Go back to Supabase **Authentication** → **Providers** → **GitHub**
2. Enter your GitHub credentials:
   - **Client ID**: From GitHub OAuth App
   - **Client Secret**: From GitHub OAuth App
3. Click **Save**

### Google Configuration
1. Go to Supabase **Authentication** → **Providers** → **Google**
2. Enter your Google credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Click **Save**

## Step 6: Update Environment Variables

1. Copy `.env.local` file:
   ```bash
   cp .env.local .env.local.example
   ```

2. Update your `.env.local` file with your Supabase credentials:
   ```env
   # OpenRouter Configuration
   OPENROUTER_API_KEY=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
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   SITE_URL=http://localhost:3005
   SITE_NAME=Nano Banana

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Step 7: Test the Application

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3005`

3. Click "Sign in with GitHub" button

4. You should be redirected to GitHub for authorization

5. After authorization, you'll be redirected back to the app

## Features Implemented

✅ **Server-side Authentication**: Secure auth flow using Supabase SSR
✅ **GitHub OAuth**: Complete GitHub login integration
✅ **User Session Management**: Persistent login state
✅ **User Profile Display**: Avatar and user info in header
✅ **Logout Functionality**: Secure sign-out capability
✅ **Error Handling**: Authentication error page
✅ **Loading States**: Better user experience

## API Routes Created

- `POST /api/auth/login` - Initiate GitHub OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Sign out user
- `GET /api/auth/user` - Get current user info

## Security Notes

- All authentication is handled server-side
- Tokens are stored in secure HTTP-only cookies
- Environment variables are never exposed to client
- Proper error handling prevents information leakage

## Troubleshooting

**Common Issues:**

1. **"Authentication Error" page**:
   - Check GitHub OAuth App callback URL
   - Verify Supabase GitHub provider settings
   - Ensure GitHub app has correct permissions

2. **"Login failed"**:
   - Check environment variables are set correctly
   - Verify Supabase project URL and keys
   - Check network connectivity

3. **"User not found"**:
   - Ensure GitHub account has public email
   - Check if user authorized the application

For more help, check the Supabase documentation:
- [Auth Providers](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Server-side Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)