# Google Authentication Setup Guide for SHEild

**Note: This app now uses OpenStreetMap (free, no API key required) instead of Google Maps.**

## Google Authentication Setup

### 1. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Click "Create Credentials" → "OAuth client ID"
4. Configure OAuth consent screen if prompted (select "External" for testing)

### 2. Create OAuth Client IDs

#### For Android Development (Expo Go)

1. Application type: Android
2. Package name: `com.youraccount.sheild`
3. SHA-1 fingerprint: Get from debug keystore (see below)
4. Copy the Client ID (format: `XXXXX.apps.googleusercontent.com`)

#### For iOS Development (Expo Go)

1. Application type: iOS
2. Bundle ID: `com.youraccount.sheild`
3. Copy the Client ID

#### For Web/Expo Development

1. Application type: Web application
2. Authorized redirect URIs (IMPORTANT - must match exactly):
   - `exp://10.134.141.86:8081/--/` (replace with your actual IP and port)
   - `exp://10.134.141.86:8081/--/oauth2redirect`
   - `exp://127.0.0.1:19000/--/`
   - `exp://127.0.0.1:19000/--/oauth2redirect`
3. Copy the Client ID

### 3. Get SHA-1 Fingerprint

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 4. Update RegistrationScreen.js

Replace the placeholder client IDs in `components/RegistrationScreen.js`:

```javascript
const ANDROID_CLIENT_ID = 'YOUR_ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com';
const EXPO_CLIENT_ID = 'YOUR_ACTUAL_EXPO_CLIENT_ID.apps.googleusercontent.com';
```

Or set environment variables:
```bash
ANDROID_CLIENT_ID=your_client_id.apps.googleusercontent.com
IOS_CLIENT_ID=your_client_id.apps.googleusercontent.com
EXPO_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 5. For Production Builds

When building for production, you'll need to:

1. **Android**: Get release SHA-1 fingerprint
   ```bash
   keytool -list -v -keystore your-release.keystore -alias your-key-alias
   ```
2. Add this SHA-1 to Google Cloud Console
3. Update package name if different from development

### 6. Test Authentication

After configuration:
1. Clear Metro bundler cache: `npx expo start --clear`
2. Test on Android emulator
3. Test on physical device
4. Verify user data is stored correctly

## Common Issues

### Cross-Site Verification Failed Error
This error occurs when:
- Redirect URIs don't match exactly in Google Cloud Console
- Using placeholder client IDs instead of actual ones
- OAuth consent screen not configured

**Solution:**
1. Ensure redirect URIs match your actual Expo server URL (check terminal for the URL)
2. Replace placeholder client IDs with actual ones from Google Cloud Console
3. Configure OAuth consent screen in Google Cloud Console

### Authentication 400 Error
- Verify redirect URIs match exactly
- Check client IDs are correct
- Ensure OAuth consent screen is configured
- Verify package name/bundle ID matches

### Location Permission Denied
- Check permissions in app.json
- Ensure location plugin is configured
- Verify device location services are enabled

## Important Notes

- **Manual registration works without Google OAuth**: Users can still register using the manual form below the Google button
- **Google OAuth is optional**: The app functions fully without Google Sign-In
- **Current status**: Google Sign-In is disabled until proper OAuth credentials are configured
