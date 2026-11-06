import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to app...');
  // Navigate to app
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // 1. Capture early entrance dive
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/entrance_dive_phase1.png' });
  console.log('Captured entrance dive phase 1');

  // 2. Capture mid-dive warp
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/entrance_dive_phase2.png' });
  console.log('Captured entrance dive phase 2');

  // 3. Wait for entrance to complete and globe/hero to settle
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/entrance_dive_complete.png' });
  console.log('Captured fully entered app state');

  // 4. Test clicking replay dive button
  const replayBtn = page.locator('button[aria-label="Replay Entrance Dive"]');
  if (await replayBtn.isVisible()) {
    console.log('Clicking replay dive button...');
    await replayBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/Asus/.gemini/antigravity/brain/b8310f8d-33f0-424e-8985-4843cd121752/entrance_dive_replayed.png' });
    console.log('Captured replayed dive');
  } else {
    console.log('Replay button not visible');
  }

  await browser.close();
  console.log('Verification completed successfully');
}

run().catch(console.error);
