# Custom Art Upload Feature

## Overview
Customers can now upload their own images/artwork and have them printed as museum-quality canvas prints - similar to WhiteWall's custom print service.

## Features

### 1. Upload Interface (`/upload`)
- **Drag & Drop**: Intuitive file drop zone
- **Click to Browse**: Traditional file picker
- **Real-time Preview**: See your image with selected frame
- **Visual Feedback**: Upload progress indicator

### 2. Customization Options
- **8 Canvas Sizes**: From 12×16" to 40×60"
- **5 Frame Styles**: Black, White, Natural Oak, Dark Walnut, Gold
- **Custom Naming**: Name your creation
- **Live Preview**: See frame applied to your image

### 3. Pricing (Same as regular products)
| Size | Price |
|------|-------|
| 12×16" | $18 |
| 16×20" | $24 |
| 20×24" | $32 |
| 24×30" | $42 |
| 24×36" | $52 |
| 30×40" | $68 |
| 36×48" | $89 |
| 40×60" | $120 |

### 4. Cart Integration
- Custom items marked with "Custom Upload" badge
- Size and frame displayed clearly
- Same checkout flow as regular products
- Custom images preserved in cart

## Design Consistency

The upload page maintains OleMale's luxury aesthetic:
- **Dark theme**: Black background (#000000)
- **Glassmorphism**: Frosted glass effects
- **Typography**: Same font weights and tracking
- **Colors**: Indigo/violet accents
- **Spacing**: Consistent with other pages
- **Animations**: Framer Motion entrance effects

## File Structure
```
src/
├── app/
│   └── upload/
│       └── page.tsx       # Custom upload page
├── components/
│   ├── Header.tsx         # Updated with nav link
│   ├── MobileNav.tsx      # Updated with nav link
│   └── Cart.tsx           # Updated for custom items
└── lib/
    └── cartContext.tsx    # Updated interface
```

## Technical Implementation

### Image Handling
- **Client-side only**: Images stored as Data URLs
- **No server upload required**: Works immediately
- **10MB limit**: Prevents performance issues
- **Formats**: JPEG, PNG, WebP supported

### Cart Item Structure
```typescript
{
  id: `custom-${timestamp}`,
  name: "Customer's Art Name",
  price: 5200,  // in cents
  quantity: 1,
  variant: "24x36-black",  // size-frame
  image: "data:image/jpeg;base64,...",  // Data URL
  isCustom: true
}
```

## User Flow

1. **Navigate**: Click "Custom Print" in navigation
2. **Upload**: Drag/drop or select image file
3. **Configure**: Choose size and frame style
4. **Preview**: See live preview with frame overlay
5. **Name**: Optional custom title
6. **Add to Cart**: Standard cart integration
7. **Checkout**: Same flow as regular products

## Security & Privacy

- **Client-side processing**: Images never leave browser until order
- **Data URLs**: No external image hosting required
- **Size limits**: Prevents abuse
- **Type validation**: Only images accepted

## Future Enhancements

1. **Image Validation**: Check resolution/DPI before upload
2. **Crop Tool**: Allow users to crop/position image
3. **Filters**: Basic adjustments (brightness, contrast)
4. **Multiple Images**: Upload and compare options
5. **Save Drafts**: Return to custom orders later
6. **Reorder**: Easy reorder of past custom prints

## Notes

- Custom items are marked with "Custom Upload" badge in cart
- Frame preview shown as overlay on upload
- Same quality promise as regular products
- Professional review before printing (mentioned in UI)
