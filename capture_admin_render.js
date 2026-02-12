const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const fileUrl = 'file://' + path.join(__dirname, 'docs', 'admin_render.html');
  console.log(`Navigating to ${fileUrl}`);
  await page.goto(fileUrl);

  // Capture
  await page.screenshot({ path: path.join(__dirname, 'docs', 'atlas_screenshots', 'admin_01_overlay_active.png') });
  console.log('Captured admin_01_overlay_active.png');

  await browser.close();
})();
