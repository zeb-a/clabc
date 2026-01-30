# Splash Screen Generator

Generate beautiful splash screens for Android and iOS from your logo.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install --save-dev sharp
   ```

2. **Generate splash screens:**
   ```bash
   npm run assets:generate
   ```

3. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

## What It Creates

The generator creates multiple splash screen sizes in `./resources/splash/`:

### Android
- Landscape: hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi
- Portrait: hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi

### iOS
- Universal (iPhone): @2x, @3x for various devices

## Customization

Edit `./scripts/generate-splash.js` to customize:

```javascript
const CONFIG = {
  // Your logo path (SVG or PNG)
  logoPath: './public/classabc-favicon.svg',
  
  // Output directory
  outputDir: './resources/splash',
  
  // Background color (hex code)
  backgroundColor: '#6366F1',
  
  // Logo size (0.25 = 25% of screen)
  logoSizeRatio: 0.25,
};
```

### Popular Colors

- `#6366F1` - Indigo (default)
- `#4CAF50` - Green
- `#2196F3` - Blue
- `#FF5722` - Orange
- `#9C27B0` - Purple
- `#000000` - Black
- `#FFFFFF` - White

### Logo Sizes

- `0.20` - Small (20%)
- `0.25` - Medium (25%, default)
- `0.35` - Large (35%)
- `0.50` - Extra Large (50%)

## Usage After Generation

### 1. Preview Generated Splash Screens
```bash
# Open in file explorer
open ./resources/splash
```

### 2. Sync with Capacitor Projects
```bash
# Apply to Android
npx cap sync android

# Apply to iOS
npx cap sync ios

# Or both at once
npx cap sync
```

### 3. Test on Device
```bash
# Android
npx cap open android

# iOS
npx cap open ios
```

## How It Works

The script uses [sharp](https://sharp.pixelplumbing.com/) to:

1. ✅ Read your logo (SVG or PNG)
2. ✅ Resize logo to fit splash screen
3. ✅ Create colored background
4. ✅ Center logo on background
5. ✅ Save as PNG for each screen size

## Troubleshooting

### Error: "sharp is not installed"
```bash
npm install --save-dev sharp
```

### Splash screens not updating
1. Delete `./resources/splash` folder
2. Regenerate: `npm run assets:generate`
3. Sync: `npx cap sync`
4. Clean build in Android Studio/Xcode

### Logo looks stretched
- Use SVG logo (better than PNG)
- Or use high-resolution PNG (min 1024x1024)
- Adjust `logoSizeRatio` in CONFIG

### Wrong background color
- Ensure hex code is valid: `#RRGGBB`
- Check case sensitivity

## Manual Alternative (Capacitor Assets)

If you prefer using online generator:

1. Visit: https://capacitorjs.com/docs/guides/splash-screens-and-icons
2. Upload your logo
3. Download generated assets
4. Extract to `./resources/`
5. Run: `npx cap sync`

## Best Practices

- ✅ Use SVG logo for best quality
- ✅ Keep logo simple (no too much detail)
- ✅ Test on real devices (not just simulator)
- ✅ Ensure good contrast between logo and background
- ✅ Regenerate after changing logo or branding

## File Structure After Generation

```
resources/
└── splash/
    ├── splash-land-hdpi.png
    ├── splash-land-mdpi.png
    ├── splash-land-xhdpi.png
    ├── splash-land-xxhdpi.png
    ├── splash-land-xxxhdpi.png
    ├── splash-port-hdpi.png
    ├── splash-port-mdpi.png
    ├── splash-port-xhdpi.png
    ├── splash-port-xxhdpi.png
    ├── splash-port-xxxhdpi.png
    ├── Default@2x~universal~anyany.png
    ├── Default@2x~universal~comany.png
    ├── Default@3x~universal~anyany.png
    └── Default@3x~universal~comany.png
```

## Next Steps

After generating splash screens:

1. Review in `./resources/splash/`
2. Adjust colors/sizes if needed
3. Run `npx cap sync`
4. Build and test on device
5. Deploy to app stores!
