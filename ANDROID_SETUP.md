# Android app setup (one time)

Copy these into the ROOT of your project (next to `src/`), merging with what's there:
- `package.json` (replace yours; only the Capacitor lines and two scripts were added)
- `capacitor.config.json`
- `android/` (the whole folder)
- `.github/workflows/android-release.yml`

Requires Node 22+ locally (Capacitor 8). Then run `npm install` and commit everything, including `android/`.

## 1. Create the signing key (keep this file safe, forever)
    keytool -genkeypair -v -keystore etiquette-release.jks -alias etiquette -keyalg RSA -keysize 2048 -validity 10000

Back the file up somewhere other than your laptop. If you lose it, nobody can update
the app over an existing install; they'd have to uninstall first. Never commit it
(add `*.jks` to .gitignore).

Turn it into text for GitHub:
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("etiquette-release.jks"))`
- Mac/Linux: `base64 -w0 etiquette-release.jks`

## 2. Add repository secrets (GitHub repo > Settings > Secrets and variables > Actions)
    ANDROID_KEYSTORE_BASE64      the long text from above
    ANDROID_KEYSTORE_PASSWORD    password you chose in keytool
    ANDROID_KEY_ALIAS            etiquette
    ANDROID_KEY_PASSWORD         key password you chose in keytool
    VITE_FIREBASE_API_KEY
    VITE_FIREBASE_AUTH_DOMAIN
    VITE_FIREBASE_PROJECT_ID
    VITE_FIREBASE_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID
    VITE_FIREBASE_APP_ID
    VITE_ADMIN_UID               same values as your local .env

## 3. Build a release
    git tag v1.0.0
    git push origin v1.0.0

The APK appears under the repo's Releases. A link that always serves the newest one:
    https://github.com/<owner>/<repo>/releases/latest/download/etiquette.apk

(Actions tab > "Build Android APK" > Run workflow builds one without a release; download it from the run's Artifacts.)

## Before your first public release
- App ID is `com.etiquette.cv` (capacitor.config.json, android/app/build.gradle). It can never
  change after people install, so decide now.
- Replace the default Capacitor launcher icon and splash screen with your own.
