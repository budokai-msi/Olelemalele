const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Go to product page
  const url = 'https://olemale-store-ple56qgzc-danch0.vercel.app/product/0';
  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Look for AR button
  // Based on previous analysis, it might be a button with "View in AR" or similar aria-label
  // Or class containing ARButton

  // Let's try to find it and click it
  const arBtn = page.locator('button:has-text("View in AR"), button[aria-label="View in AR"], button:has-text("AR")').first();

  if (await arBtn.isVisible()) {
    console.log('AR Button found. Clicking...');
    await arBtn.click();
    await page.waitForTimeout(2000); // Wait for modal

    await page.screenshot({ path: path.join(__dirname, 'docs', 'atlas_screenshots', 'arviewer_01_wall_mode_initial.png') });
    console.log('Captured arviewer_01_wall_mode_initial.png');
  } else {
    console.log('AR Button NOT found. Capturing viewport as fallback.');
    await page.screenshot({ path: path.join(__dirname, 'docs', 'atlas_screenshots', 'arviewer_01_wall_mode_initial.png') });
  }

  await browser.close();
})();
