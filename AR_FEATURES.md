# AR (Augmented Reality) Features

## Overview
OleMale now includes AR functionality that allows customers to visualize canvas art on their walls before purchasing. Similar to Kave Home's implementation, users can place artwork in their space using native AR technologies.

## Features

### 1. Multi-Platform AR Support
- **iOS (AR Quick Look)**: Uses Apple's native AR technology via USDZ files
- **Android (Scene Viewer)**: Uses Google's native AR via GLB files
- **Web Fallback**: Camera-based AR preview for unsupported devices
- **Desktop**: QR code generation to transfer to mobile device

### 2. AR Components

#### ARButton
Main call-to-action button on product pages that launches the AR experience.
- Located on product detail page
- Shows "View in Your Space"
- Gradient styling to stand out

#### ARViewer
Full AR modal with platform-specific options:
- Device detection (iOS/Android/Desktop)
- Platform-appropriate AR launch
- Camera-based fallback AR
- QR code generation for desktop users
- Product dimensions display
- Usage instructions

### 3. AR API (`/api/ar`)

#### GET /api/ar
Returns AR configuration for a product:
```json
{
  "productId": "string",
  "frameStyle": "black|white|natural|walnut|gold",
  "size": "24x36",
  "dimensions": { "width": 0.610, "height": 0.914 },
  "models": {
    "usdz": "url-to-usdz-file",
    "glb": "url-to-glb-file"
  },
  "imageUrl": "product-image-url",
  "fallback": { "type": "image", ... }
}
```

### 4. Size Support
All canvas sizes supported with accurate real-world dimensions:
- 12×16, 16×20, 20×24
- 24×30, 24×36 (most popular)
- 30×40, 36×48
- 40×50, 48×60, 50×60, 60×72
- A3, A2

### 5. Frame Styles
All frame styles available in AR:
- Classic Black
- Modern White
- Natural Oak
- Dark Walnut
- Gold Accent

## How It Works

### For iOS Users:
1. Tap "View in Your Space" button
2. Select "AR View" option
3. iOS AR Quick Look opens
4. Point camera at wall
5. Tap to place canvas
6. Pinch to resize, drag to reposition

### For Android Users:
1. Tap "View in Your Space" button
2. Select "AR View" option
3. Google Scene Viewer opens
4. Follow on-screen instructions

### For Desktop Users:
1. Tap "View in Your Space" button
2. Generate QR code
3. Scan with mobile device
4. Continue AR experience on mobile

### Camera AR (Fallback):
1. Tap "Camera" option
2. Allow camera access
3. Point at wall
4. Canvas preview overlays on camera feed
5. Capture to save preview

## Technical Implementation

### File Structure:
```
src/
├── components/
│   ├── ARButton.tsx      # AR launch button
│   ├── ARViewer.tsx      # Main AR modal
│   └── Product3D.tsx     # 3D viewer component
├── app/
│   ├── api/
│   │   └── ar/
│   │       └── route.ts  # AR configuration API
│   └── product/[id]/
│       └── page.tsx      # Product page with AR
```

### Dependencies:
- No additional dependencies required
- Uses native Web APIs:
  - WebXR (for supported browsers)
  - getUserMedia (for camera access)
  - iOS AR Quick Look (native)
  - Android Scene Viewer (native)

## Production Considerations

### 3D Models Required:
For full AR functionality, you need to generate:

1. **USDZ files** (for iOS):
   - One per frame style
   - Can use Apple's Reality Composer or usdzconvert
   - Or generate dynamically using @usdz/usdz-generator

2. **GLB files** (for Android):
   - One per frame style
   - Can use Blender + glTF exporter
   - Or generate from USDZ using conversion tools

### CDN Setup:
Update the AR model URLs in `/api/ar/route.ts`:
```typescript
const AR_MODELS = {
  usdz: {
    black: 'https://your-cdn.com/ar/canvas-black.usdz',
    // ... other styles
  },
  glb: {
    black: 'https://your-cdn.com/ar/canvas-black.glb',
    // ... other styles
  }
}
```

### Dynamic Texture Generation:
To show the actual artwork in AR (not just a placeholder), you would:
1. Generate USDZ/GLB with artwork texture applied
2. Use a service like Vectary, Modelry, or custom pipeline
3. Or apply textures at runtime using WebXR

## Future Enhancements

1. **Persistent Placement**: Save AR placement for later viewing
2. **Multi-Art Preview**: View multiple pieces together
3. **Room Scanning**: Automatic wall detection
4. **Lighting Adaptation**: Match room lighting to artwork
5. **Social Sharing**: Share AR screenshots
6. **Measurements**: Show actual size indicators

## Browser Support

| Feature | iOS Safari | Android Chrome | Desktop |
|---------|------------|----------------|---------|
| Native AR | ✅ iOS 12+ | ✅ ARCore | ❌ |
| Camera AR | ✅ | ✅ | N/A |
| WebXR | ✅ iOS 15+ | ✅ | Limited |
| QR Code | ✅ | ✅ | ✅ |

## Notes

- Camera AR fallback works on all devices with camera access
- Native AR requires iOS 12+ or Android with ARCore
- Desktop users are guided to mobile via QR codes
- All AR experiences respect user privacy (camera data not stored)
