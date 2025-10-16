# GiveawayConnect - Admin Setup Guide

## Admin Access

Your admin account is configured with the following credentials:
- **Email:** pattnaiknikhilesh@gmail.com  
- **Password:** Roh@n@222

## Setup Steps

### 1. Sign Up as Admin

1. Visit the application homepage
2. Click on "Sign Up" or "Login"
3. Create an account using:
   - Email: `pattnaiknikhilesh@gmail.com`
   - Password: `Roh@n@222`
4. You will automatically be granted admin access

### 2. Configure Firebase Authentication

Once logged in as admin:

1. Go to **Admin Settings** (accessible from the admin panel)
2. Find the **Firebase Configuration** section
3. Enter your Firebase credentials:
   - **Firebase API Key**: Get this from your Firebase Console
   - **Firebase Project ID**: Your Firebase project ID
   - **Firebase App ID**: Your Firebase app ID

#### How to Get Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing one)
3. Add a Web app to your project
4. In Firebase Console > Project Settings > General > Your apps section
5. Copy the configuration values:
   ```
   apiKey: "AIza..."
   projectId: "your-project-id"
   appId: "1:123456789:web:..."
   ```

#### Firebase Authentication Setup:

1. In Firebase Console, go to **Authentication** section
2. Enable **Email/Password** sign-in method
3. Enable **Google** sign-in method (optional)
4. Add authorized domain: Add your Replit app domain to authorized domains

### 3. Configure PayU Payment Gateway

In the Admin Settings page:

1. Find the **PayU Configuration** section
2. Enter your PayU credentials:
   - **Merchant ID**: Your PayU merchant ID
   - **Merchant Key**: Your PayU merchant key
   - **Merchant Salt**: Your PayU merchant salt
   - **Environment**: Select "Test" for testing or "Production" for live

#### How to Get PayU Credentials:

1. Sign up for a PayU merchant account at [PayU](https://payu.in/)
2. Complete the KYC process
3. Once approved, you'll receive:
   - Merchant ID (Key)
   - Merchant Key
   - Merchant Salt
4. For testing, PayU provides test credentials

### 4. Important Notes

#### Firebase Integration
- Firebase credentials are also stored as environment variables for the app to work
- After entering credentials in admin panel, you need to set them as environment variables:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Contact your developer to help set these environment variables in Replit

#### Data Storage
- The app currently uses **in-memory storage** (data resets on server restart)
- For production, consider migrating to the PostgreSQL database
- The database schema is already set up and ready to use

#### Admin Features Available

As admin, you can:
- View platform statistics and analytics
- Manage all giveaways (create, edit, delete)
- View all users
- View all donations
- Manually select winners for giveaways
- Configure platform settings
- Configure Firebase and PayU integration

## Troubleshooting

### Firebase Not Working
1. Verify you've entered the correct credentials in admin settings
2. Check that environment variables are set in Replit
3. Ensure Firebase Authentication is enabled in Firebase Console
4. Add Replit domain to Firebase authorized domains

### PayU Not Working
1. Verify merchant credentials are correct
2. For testing, use PayU test credentials
3. Ensure webhook URLs are configured in PayU dashboard

### Admin Access Issues
1. Make sure you signed up with exactly: pattnaiknikhilesh@gmail.com
2. Try logging out and logging back in
3. Check browser console for any errors

## Support

For technical issues or questions, contact your development team.
