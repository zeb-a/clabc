# 📱 ClassABC Mobile Quick Start

## ✅ Setup Status

Your project is **ready for mobile development!**

- ✅ Android platform added
- ✅ iOS platform added
- ✅ Capacitor platforms installed
- ✅ Web assets built
- ✅ Assets synced to platforms
- ✅ Kotlin dependency conflict fixed
- ✅ Railway URL configured (`https://classabc.up.railway.app`)

---

## 🚀 Next Steps (On Your Local Machine)

### 1. Prerequisites

**Install these on your local machine:**

- **Node.js 18+** - [nodejs.org](https://nodejs.org/)
- **Java JDK 17** - [adoptium.net](https://adoptium.net/)
- **Android Studio** - [developer.android.com/studio](https://developer.android.com/studio)
- For iOS (Mac only): **Xcode** - Mac App Store

### 2. Install Dependencies

```bash
npm install
npm install @capacitor/android @capacitor/ios
```

### 3. Setup Mobile Platforms (Recommended - Includes Kotlin Fix)

```bash
# This command adds Android/iOS, applies Kotlin fix, builds, and syncs
npm run cap:setup
```

**OR Manual Setup:**

```bash
# Add platforms
npx cap add android
npx cap add ios

# Fix Kotlin dependency conflict
./fix-kotlin.sh

# Build and sync
npm run build
npx cap sync android
npx cap sync ios
```

### 4. Open & Build

**For Android:**
```bash
# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Click the green Play button ▶
# 3. Select emulator/device
# 4. App will install and launch
```

**For iOS (Mac only):**
```bash
# Open Xcode
npx cap open ios

# In Xcode:
# 1. Select simulator/device
# 2. Click Play button ▶
# 3. App will install and launch
```

---

## 🔄 Development Workflow

After making code changes:

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# (Optional) Sync to iOS
npx cap sync ios
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build web assets |
| `npm run cap:sync` | Build and sync to both platforms |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode (Mac) |
| `npm run cap:build:android` | Build debug APK |

---

## 🔧 Configuration

**Production URL:** `https://classabc.up.railway.app`

This is configured in:
- `capacitor.config.ts` (line 13)
- `src/services/api.js` (line 9)

**To change the domain:**
1. Update both files with your new domain
2. Run `npm run build && npx cap sync android`

---

## 📱 Building for Production

### Android (Play Store)

**Debug APK (Testing):**
```bash
npx cap open android
# In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Release AAB (Play Store):**
```bash
cd android
./gradlew bundleRelease
# Upload android/app/build/outputs/bundle/release/app-release.aab to Play Console
```

### iOS (App Store)

```bash
npx cap open ios
# In Xcode: Product → Archive
# Follow App Store upload process
```

---

## ⚠️ Important Notes

1. **Run setup on your local machine** - Android Studio/Xcode cannot run in this environment
2. **Install Java 17** - Required for Android builds
3. **Keep your keystore safe** - You can't update Play Store app without it
4. **Test thoroughly** before submitting to app stores

---

## 📚 Documentation

- **Full Guide:** [MOBILE_DEVELOPMENT.md](./MOBILE_DEVELOPMENT.md)
- **Capacitor Docs:** [capacitorjs.com](https://capacitorjs.com/)

---

## 🆘 Troubleshooting

**Kotlin dependency error:**
- Already fixed in `android/app/build.gradle`
- If you see it again, run: `cd android && ./gradlew clean && cd .. && npx cap sync android`

**JAVA_HOME not set:**
```bash
# macOS/Linux:
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

# Windows:
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
```

**App not connecting to API:**
- Verify Railway URL in `capacitor.config.ts` and `src/services/api.js`
- Rebuild: `npm run build && npx cap sync android`

---

## ✨ You're Ready!

Your ClassABC app is configured and ready to be built for Android and iOS. Just:

1. Install prerequisites on your local machine
2. Run `npx cap open android` or `npx cap open ios`
3. Build and run!

**Good luck! 🚀**
