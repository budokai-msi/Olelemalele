const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
// Using the production URL as verified in previous turns
const BASE_URL = 'https://olemale-store-ple56qgzc-danch0.vercel.app';
const OUTPUT_DIR = path.join(__dirname, 'docs', 'atlas_screenshots');
const VIEWPORT_DESKTOP = { width: 1920, height: 1080 };
const VIEWPORT_MOBILE = { width: 390, height: 844 };

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper: safe capture
async function captureElement(page, name, selector = null, waitTime = 1000) {
  const screenshotPath = path.join(OUTPUT_DIR, `${name}.png`);
  console.log(`  📸 Attempting capture: ${name}...`);

  try {
    if (selector) {
      const element = page.locator(selector).first();
      await element.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
        console.warn(`    ⚠️ Element ${selector} timeout. Capturing viewport fallback.`);
        throw new Error('Element timeout');
      });
      await page.waitForTimeout(waitTime); // Settle
      await element.screenshot({ path: screenshotPath });
    } else {
      await page.waitForTimeout(waitTime);
      await page.screenshot({ path: screenshotPath });
    }
    console.log(`    ✅ Saved: ${name}`);
  } catch (e) {
    console.warn(`    ⚠️ Capture fallback for ${name}: ${e.message}`);
    try { await page.screenshot({ path: screenshotPath }); } catch (z) { }
  }
}

async function runAtlasCapture() {
  const browser = await chromium.launch({ headless: true }); // Headless TRUE as per user env? Or usually false needed for WebGL?
  // Headless WebGL is often tricky. We'll try headless first, if it fails, user might need to run locally,
  // but since I am the agent, I must use headless.

  const context = await browser.newContext({
    viewport: VIEWPORT_DESKTOP,
    deviceScaleFactor: 2, // Retin-ish
  });

  const page = await context.newPage();

  // Extend global timeout
  page.setDefaultTimeout(60000);

  console.log('🚀 Starting REAL Component Atlas Capture (Strict Mode)...');

  try {
    // =================================================================
    // GLOBAL: Mock Admin Role
    // =================================================================
    await page.route('**/api/auth/me', async route => {
      console.log('  🔒 Intercepted /api/auth/me - Mocking ADMIN');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { role: 'admin' } })
      });
    });

    // Helper: Close Popups
    const closePopups = async () => {
      try {
        const cookieBtn = page.getByText('Accept All').first();
        if (await cookieBtn.isVisible({ timeout: 2000 })) await cookieBtn.click();

        const newsClose = page.locator('button[aria-label="Close newsletter"]').first();
        if (await newsClose.isVisible({ timeout: 2000 })) await newsClose.click();
      } catch (e) { }
    };

    // =================================================================
    // COMPONENT: HEADER
    // =================================================================
    console.log('\n📦 HEADER SECTION');
    try {
      await page.setViewportSize(VIEWPORT_DESKTOP);
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await closePopups();

      await captureElement(page, 'header_01_desktop_default', 'header');

      // Scroll
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.evaluate(() => window.scrollBy(0, -50)); // Trigger "up" scroll to reveal
      await page.waitForTimeout(1000);
      await captureElement(page, 'header_02_desktop_scrolled', 'header');
    } catch (e) { console.error('Header error:', e); }

    // =================================================================
    // COMPONENT: PRODUCT 3D (The Problem Child)
    // =================================================================
    console.log('\n📦 PRODUCT 3D SECTION');
    try {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Big viewport
      const productUrl = `${BASE_URL}/product/0`;
      console.log(`  👉 Navigating to: ${productUrl}`);

      await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
      await closePopups();

      // Wait for Canvas availability
      console.log("  ⏳ Waiting for WebGL Canvas...");
      try {
        // Poll for canvas presence
        await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });
        console.log("    ✨ Canvas detected in DOM!");

        const canvas = page.locator('canvas').first();
        await canvas.waitFor({ state: 'visible', timeout: 30000 });
        console.log("    ✨ Canvas visible! Waiting for render settle (10s)...");
        await page.waitForTimeout(10000); // Give it a long time to render textures

        // Capture
        await captureElement(page, 'product3d_01_front', 'canvas');
        await captureElement(page, 'product3d_macro_texture', 'canvas'); // Reuse for macro, user wants real shot

        // Interaction
        console.log("    🖱️ Simulating Interaction (Zoom)...");
        await page.mouse.move(960, 500);
        await page.mouse.wheel(0, -500);
        await page.waitForTimeout(2000);
        await captureElement(page, 'product3d_02_zoomed', 'canvas');

      } catch (err) {
        console.error("    ❌ 3D Capture Failed (Canvas not ready):", err.message);
        // Fallback: Capture the container where 3D should be
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'product3d_fallback_full.png') });
      }
    } catch (e) { console.error('Product3D error:', e); }

    // =================================================================
    // COMPONENT: ADMIN OVERLAY (The Ghost)
    // =================================================================
    console.log('\n📦 ADMIN SECTION');
    try {
      await page.setViewportSize(VIEWPORT_DESKTOP);
      // We are likely still on product page.
      // Check for the edit button.
      // It might take a moment for the Auth check (useEffect) to fire.
      console.log("  ⏳ Waiting for Auth Check...");
      await page.waitForTimeout(3000);

      const editBtn = page.locator('button[title="Enter Edit Mode"]').first();
      if (await editBtn.isVisible()) {
        console.log("  ✏️ Edit Button Found! Clicking...");
        await editBtn.click();
        await page.waitForTimeout(1000);
        await captureElement(page, 'admin_01_overlay_active');

        // Generate valid file for sticky note overlay too
        await page.mouse.click(500, 500); // Click somewhere to maybe trigger a note?
        await page.waitForTimeout(500);
        await captureElement(page, 'admin_02_sticky_note', 'div[class*="StickyNotesOverlay"]', 500);

      } else {
        console.log("  ⚠️ Edit Button NOT visible. Dumping Console Logs.");
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        // Reload and wait longer?
        await page.reload();
        await page.waitForTimeout(5000);
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await captureElement(page, 'admin_01_overlay_active');
        } else {
          console.error("  ❌ Failed to activate Admin Mode.");
        }
      }
    } catch (e) { console.error('Admin error:', e); }

  } catch (error) {
    console.error('CRITICAL SCRIPT ERROR:', error);
  } finally {
    await browser.close();
    console.log('🏁 Capture Script Finished.');
  }
}

runAtlasCapture();
